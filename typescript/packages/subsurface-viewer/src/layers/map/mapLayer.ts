import { isEqual } from "lodash";
import type React from "react";

import { CompositeLayer } from "@deck.gl/core";
import type {
    CompositeLayerProps,
    Layer,
    UpdateParameters,
} from "@deck.gl/core";
import type { Matrix4 } from "math.gl";

import workerpool from "workerpool";

import type { Material } from "../gpglLayers/typeDefs";
import {
    type IMapDiscretePropertyValueName,
    TMapColoringMode,
    type MapFrame,
} from "./typeDefs";
import { PrivateMapLayer } from "./privateMapLayer";
import { type WebWorkerParams, makeFullMesh } from "./webworker";

import type {
    ReportBoundingBoxAction,
    ExtendedLayerProps,
} from "../utils/deckglTools";
import type { ColormapFunctionType } from "../utils/colormapTools";

import config from "../../SubsurfaceConfig.json";

import type { Color, RGBColor, TConstructor } from "../../utils";
import { findConfig, loadDataArray } from "../../utils";
import { getModelMatrix } from "../utils/deckglTools";
import { rotate } from "./utils";

const DEFAULT_DISCRETE_UNDEFINED_VALUE = 0xffff;

// init workerpool
const workerPoolConfig = findConfig(
    config,
    "config/workerpool",
    "config/layer/MapLayer/workerpool"
);

const pool = workerpool.pool({
    maxWorkers: 10,
    workerType: "web",
    ...workerPoolConfig,
});

function onTerminateWorker() {
    const stats = pool.stats();
    if (stats.busyWorkers === 0 && stats.pendingTasks === 0) {
        pool.terminate();
    }
}

export function resampleMesh(
    frame: MapFrame,
    meshData: Float32Array
): [MapFrame, Float32Array] {
    const resampledFrame = structuredClone(frame);
    resampledFrame.origin[0] = frame.origin[0] - frame.increment[0] / 2;
    resampledFrame.origin[1] = frame.origin[1] - frame.increment[1] / 2;

    resampledFrame.count[0] = frame.count[0] + 1; // number of nodes in x direction
    resampledFrame.count[1] = frame.count[1] + 1;

    const nc_ = frame.count[0]; // original number of nodes in x (col) direction
    const nr_ = frame.count[1]; // original number of nodes in y (row) direction

    const nc = resampledFrame.count[0]; // new number of nodes in x (col) direction
    const nr = resampledFrame.count[1];

    const resampledMesh = new Float32Array(nc * nr);

    function validRange(r: number, c: number): boolean {
        return r < nr_ && r >= 0 && c < nc_ && c >= 0;
    }

    for (let row = 0; row < nr; row++) {
        for (let col = 0; col < nc; col++) {
            const i = row * nc + col; // index in the resampled mesh

            // P1
            let r = row;
            let c = col;
            let valid = validRange(r, c);
            if (valid && Number.isNaN(meshData[r * nc_ + c])) {
                // Undefined mesh data at this location.
                resampledMesh[i] = meshData[r * nc_ + c];
                continue;
            }
            const p1 = valid ? meshData[r * nc_ + c] : 0;
            let divisor = valid ? 1 : 0;

            // P2
            r = row - 1;
            c = col;
            valid = validRange(r, c);
            /* prettier-ignore */
            const p2 = valid && !Number.isNaN(meshData[r * nc_ + c]) ? meshData[r * nc_ + c] : 0;
            divisor += p2 !== 0 && valid ? 1 : 0;

            // P3
            r = row - 1;
            c = col - 1;
            valid = validRange(r, c);
            /* prettier-ignore */
            const p3 = valid && !Number.isNaN(meshData[r * nc_ + c]) ? meshData[r * nc_ + c] : 0;
            divisor += p3 !== 0 && valid ? 1 : 0;

            // P4
            r = row;
            c = col - 1;
            valid = validRange(r, c);
            /* prettier-ignore */
            const p4 = valid && !Number.isNaN(meshData[r * nc_ + c]) ? meshData[r * nc_ + c] : 0;
            divisor += p4 !== 0 && valid ? 1 : 0;

            resampledMesh[i] =
                divisor !== 0 ? (p1 + p2 + p3 + p4) / divisor : 0;
        }
    }

    return [resampledFrame, resampledMesh];
}

export type PropertyInput = string | number[] | Float32Array | Uint16Array;

export function getUndefinedValueProperties(
    propertiesData: PropertyInput | undefined,
    isPropertiesDiscrete: boolean
): number | undefined {
    if (propertiesData instanceof Float32Array) {
        return isPropertiesDiscrete
            ? DEFAULT_DISCRETE_UNDEFINED_VALUE
            : Number.NaN;
    }
    if (propertiesData instanceof Uint16Array || isPropertiesDiscrete) {
        return DEFAULT_DISCRETE_UNDEFINED_VALUE;
    }
    return undefined;
}

export function normalizeDiscreteProperties(
    propertiesData: PropertyInput,
    undefinedPropertyValue: number
): string | number[] | Float32Array | Uint16Array {
    if (
        typeof propertiesData === "string" ||
        propertiesData instanceof Uint16Array
    ) {
        return propertiesData;
    }
    if (propertiesData instanceof Float32Array) {
        return propertiesData;
    }
    return propertiesData.map((value) =>
        !Number.isFinite(value) ? undefinedPropertyValue : value
    );
}

type TTypedArray = Float32Array | Uint32Array | Uint16Array;

async function loadData<T extends TTypedArray>(
    data: string | number[] | TTypedArray,
    type: TConstructor<T>
): Promise<T> {
    const result = await loadDataArray(data, type);
    if (result !== null) {
        return result;
    }
    throw new Error("Grid3DLayer: Unsupported type of input data");
}

async function loadPropertiesData(
    propertiesData: string | number[] | Float32Array | Uint16Array,
    isDiscrete: boolean
): Promise<Float32Array | Uint16Array> {
    const result = isDiscrete
        ? await loadDataArray(propertiesData, Uint16Array)
        : await loadDataArray(propertiesData, Float32Array);
    if (result !== null) {
        return result;
    }
    throw new Error("Grid3DLayer: Unsupported type of input property data");
}

/**
 * Will load data for the mesh and the properties. Both of which may be given as arrays (javascript or typed)
 * or as a URL to the data in binary format.
 * Return value: A promise with the data given as typed arrays.
 */
async function load_data(
    meshData: string | number[] | Float32Array,
    propertiesData: string | number[] | Float32Array | Uint16Array | undefined,
    coloringMode: TMapColoringMode
): Promise<[Float32Array, Float32Array | Uint16Array | undefined]> {
    const mesh = await loadData(meshData, Float32Array);

    if (isGeometricProperty(coloringMode)) {
        return Promise.all([mesh, mesh]);
    }

    const properties = propertiesData
        ? await loadPropertiesData(
              propertiesData,
              isDiscreteProperty(coloringMode)
          )
        : undefined;
    return Promise.all([mesh, properties]);
}

/**
 * Returns true if the coloring mode is geometric, that is based on the Z coordinates
 * of the cell nodes. In that case no explicit property data is required.
 * @param coloringMode coloring mode.
 * @returns true if the coloring mode is geometric.
 */
export function isGeometricProperty(coloringMode: TMapColoringMode): boolean {
    return coloringMode === TMapColoringMode.Z;
}

/**
 * Returns true if the coloring mode is discrete. In that case an explicit property data is required,
 * with integer values ranging from 0 to N, where N is the number of discrete property values.
 * @param coloringMode coloring mode
 * @returns true if the property values are discrete.
 */
export function isDiscreteProperty(coloringMode: TMapColoringMode): boolean {
    return coloringMode === TMapColoringMode.DiscreteProperty;
}

export interface MapLayerProps extends ExtendedLayerProps {
    /**  Url to the height (z values) mesh.
     */
    meshUrl: string; // Deprecated
    meshData: string | number[] | Float32Array;

    /**  Horizontal extent of the terrain mesh. Format:
     {
         origin: [number, number];     // mesh origin in x, y
         increment: [number, number];  // cell size dx, dy
         count: [number, number];      // number of nodes in both directions.
     }
     */
    frame: MapFrame;

    /**  Url to the properties (ex, poro or perm values).
     * If the number of property values equals the number of depth values
     * the property values will be placed at the nodes and the cell (4 neighboring nodes)
     * color will be linearly interpolated over the cell.
     * If the number of property values equals one less than the depth values in
     * each direction then the property values will be pr cell and the cell will be constant
     * colored.
     * Undefined value for discrete Uint16Array input defaults to 0xFFFF.
     * For float input (Float32Array) it is NaN.
     * For number arrays, undefined values are replaced with the configured
     * undefinedPropertyValue, or 0xFFFF by default in discrete mode.
     */
    propertiesUrl: string; // Deprecated
    propertiesData: string | number[] | Float32Array | Uint16Array | undefined;

    /**
     * Array of property discrete codes with  optional name and color.
     */
    discretePropertyValueNames?: IMapDiscretePropertyValueName[];

    /**
     * Defines how the cells are to be colored:
     * by property value or by a coordinate.
     */
    coloringMode?: TMapColoringMode;

    /**  Name of color map. E.g "PORO"
     */
    colorMapName: string;

    /**  Use color map in this range.
     */
    colorMapRange: [number, number];

    /**  Clamp colormap to this color at ends.
     * Given as array of three values (r,g,b) e.g: [255, 0, 0]
     * If not set or set to true, it will clamp to color map min and max values.
     * If set to false the clamp color will be completely transparent.
     */
    colorMapClampColor: Color | undefined | boolean;

    /**  Optional function property.
     * If defined this function will override the color map.
     * Takes a value in the range [0,1] and returns a color.
     * E.g. (x) => [x * 255, x * 255, x * 255]
     * May also be set as constant color:
     * E.g. [255, 0, 0] for constant red surface.
     */
    colorMapFunction?: ColormapFunctionType;

    /**
     * Value in propertiesData indicating that the property is undefined.
     * When propertiesData is Uint16Array the value is index in discretePropertyValueNames if provided.
     * By default, it is assumed to be NaN for Float32 properties data and 0xFFFF for UInt16.
     * Note: in case of floating point properties exact comparison is performed so use the same
     * constant value both in propertiesData array and as undefinedPropertyValue.
     */
    undefinedPropertyValue?: number;

    /**
     * Color for the cells with undefined property value.
     * Is not overridden by and used prior to colorMapFunction.
     * By default, Light gray if not provided.
     */
    undefinedPropertyColor?: RGBColor;

    /**  Contour lines reference point and interval.
     * A value of [-1.0, -1.0] will disable contour lines.
     * Contour lines will also not be activated if cells are constant colored
     * and "isContoursDepth" is set to false. I.e. constant properties within cells and contour lines
     * to be calculated for properties and not depths.
     * default value: [-1.0, -1.0]
     */
    contours: [number, number];

    /**  Contour lines may be calculated either on depth/z-value or on property value
     * If this is set to false, lines will follow properties instead of depth.
     * In 2D mode this is always the case regardless.
     * default: true
     */
    isContoursDepth: boolean;

    /**  Enable grid lines.
     * default: false.
     */
    gridLines: boolean;

    /**  Surface material properties.
     * material: true  = default material, coloring depends on surface orientation and lighting.
     *           false = no material,  coloring is independent on surface orientation and lighting.
     *           or full spec:
     *      material: {
     *           ambient: 0.35,
     *           diffuse: 0.6,
     *           shininess: 32,
     *           specularColor: [38, 38, 38],
     *       }
     */
    material: Material;

    /**  Will calculate normals for each vertex and enable phong shading.
     * If not set the shader will calculate constant normal for each triangle.
     */
    smoothShading: boolean;

    /** Enable/disable depth testing when rendering layer. Default true.
     */
    depthTest: boolean;

    /**  If true means that input z values are interpreted as depths.
     * For example depth of z = 1000 corresponds to -1000 on the z axis. Default true.
     */
    ZIncreasingDownwards: boolean;

    // Non public properties:
    reportBoundingBox?: React.Dispatch<ReportBoundingBoxAction>;
}

const defaultProps = {
    "@@type": "MapLayer",
    name: "Map",
    id: "map3d-layer-float32",
    pickable: true,
    visible: true,
    material: true,
    coloringMode: TMapColoringMode.Property,
    gridLines: false,
    bounds: { type: "object", value: null, false: true, compare: true },
    colorMapRange: { type: "array" },
    contours: [-1.0, -1.0],
    // If contour lines should follow depth or properties.
    isContoursDepth: true,
    smoothShading: true,
    depthTest: true,
    ZIncreasingDownwards: true,
};

export default class MapLayer<
    ExtraProps extends object = object,
> extends CompositeLayer<Required<MapLayerProps> & ExtraProps> {
    get isLoaded(): boolean {
        const subLayers = this.getSubLayers();
        const isLoaded =
            super.isLoaded &&
            subLayers.length > 0 && // Note super version differs only in this. It returns true on empty array.
            subLayers.every((layer) => layer.isLoaded);

        const isFinished =
            (this.state?.["isFinishedLoading"] as boolean) ?? false;
        return isLoaded && isFinished;
    }

    coloringMode(): TMapColoringMode {
        if (this.props.coloringMode !== undefined) {
            return this.props.coloringMode;
        }
        // infer coloring mode based on the available data
        // tests are done only on propertiesData and meshData:
        // propertyUrl and meshUrl are encoded data and do not help
        if (this.props.propertiesData === this.props.meshData) {
            return TMapColoringMode.Z;
        }
        if (
            this.props.propertiesData instanceof Uint16Array ||
            this.props.discretePropertyValueNames !== undefined
        ) {
            return TMapColoringMode.DiscreteProperty;
        }
        return TMapColoringMode.Property;
    }

    rebuildData(reportBoundingBox: boolean): void {
        if (this.props.meshUrl !== undefined) {
            console.warn('"meshUrl" is deprecated. Use "meshData"');
        }

        if (this.props.propertiesUrl !== undefined) {
            console.warn('"propertiesUrl" is deprecated. Use "propertiesData"');
        }

        const meshData = this.props.meshData ?? this.props.meshUrl;
        const propertiesData =
            this.props.propertiesData ?? this.props.propertiesUrl;

        const p = load_data(meshData, propertiesData, this.coloringMode());

        p.then(([meshData, propertiesData]) => {
            // Using inline web worker for calculating the triangle mesh from
            // loaded input data so not to halt the GUI thread.

            const nx = this.props.frame.count[0]; // number of nodes in x direction
            const ny = this.props.frame.count[1];
            const propLength = propertiesData?.length;
            const isNodeCenteredProperties = propLength === nx * ny;

            let frame = structuredClone(this.props.frame);
            const isPropertDiscrete = isDiscreteProperty(this.coloringMode());
            const doResample = isPropertDiscrete && isNodeCenteredProperties;
            if (doResample) {
                console.warn(
                    "Resampling node-centered properties mesh to center coloring on nodes."
                );

                const [resampledFrame, resampledMesh] = resampleMesh(
                    frame,
                    meshData
                );
                meshData = resampledMesh as Float32Array<ArrayBuffer>;
                frame = resampledFrame;
            }

            const webworkerParams = this.getWebworkerParams(
                meshData,
                propertiesData,
                frame
            );

            pool.exec(makeFullMesh, [{ data: webworkerParams.params }]).then(
                (e) => {
                    const [
                        positions,
                        normals,
                        triangleIndices,
                        vertexProperties,
                        lineIndices,
                        meshZValueRange,
                        propertyValueRange,
                    ] = e;

                    this.setState({
                        ...this.state,
                        positions,
                        normals,
                        triangleIndices,
                        vertexProperties,
                        lineIndices,
                        propertyValueRange,
                        isFinishedLoading: true,
                    });

                    if (
                        this.props.reportBoundingBox !== undefined &&
                        reportBoundingBox
                    ) {
                        const xinc = this.props.frame?.increment?.[0] ?? 0;
                        const yinc = this.props.frame?.increment?.[1] ?? 0;

                        const nnodes_x = this.props.frame?.count?.[0] ?? 2; // number of nodes in x direction
                        const nnodes_y = this.props.frame?.count?.[1] ?? 2;

                        const xMin = this.props.frame?.origin?.[0] ?? 0;
                        const yMin = this.props.frame?.origin?.[1] ?? 0;
                        const zMin = -meshZValueRange[0];
                        const xMax = xMin + xinc * (nnodes_x - 1);
                        const yMax = yMin + yinc * (nnodes_y - 1);
                        const zMax = -meshZValueRange[1];

                        // If map is rotated the bounding box must reflect that.
                        const center =
                            this.props.frame.rotPoint ??
                            this.props.frame.origin;
                        const rotDeg = this.props.frame.rotDeg ?? 0;
                        const rotRad = (rotDeg * (2.0 * Math.PI)) / 360.0;

                        // Rotate x,y around "center" "rad" radians
                        /* prettier-ignore */
                        const [x0, y0] = rotate(xMin, yMin, center[0], center[1], rotRad);
                        /* prettier-ignore */
                        const [x1, y1] = rotate(xMax, yMin, center[0], center[1], rotRad);
                        /* prettier-ignore */
                        const [x2, y2] = rotate(xMax, yMax, center[0], center[1], rotRad);
                        /* prettier-ignore */
                        const [x3, y3] = rotate(xMin, yMax, center[0], center[1], rotRad);

                        // Rotated bounds in x/y plane.
                        const x_min = Math.min(x0, x1, x2, x3);
                        const x_max = Math.max(x0, x1, x2, x3);
                        const y_min = Math.min(y0, y1, y2, y3);
                        const y_max = Math.max(y0, y1, y2, y3);

                        this.props.reportBoundingBox({
                            layerBoundingBox: [
                                x_min,
                                y_min,
                                zMin,
                                x_max,
                                y_max,
                                zMax,
                            ],
                        });
                    }
                    onTerminateWorker();
                }
            );
        });
    }

    initializeState(): void {
        this.setState({
            ...this.state,
            isFinishedLoading: false,
        });

        const reportBoundingBox = true;
        this.rebuildData(reportBoundingBox);
    }

    updateState({
        props,
        oldProps,
    }: UpdateParameters<
        MapLayer &
            Layer<
                Required<MapLayerProps> &
                    ExtraProps &
                    Required<CompositeLayerProps>
            >
    >): void {
        const needs_reload =
            !isEqual(props.meshUrl, oldProps.meshUrl) ||
            !isEqual(props.propertiesUrl, oldProps.propertiesUrl) ||
            !isEqual(props.meshData, oldProps.meshData) ||
            !isEqual(props.propertiesData, oldProps.propertiesData) ||
            !isEqual(props.frame, oldProps.frame) ||
            !isEqual(
                props.ZIncreasingDownwards,
                oldProps.ZIncreasingDownwards
            ) ||
            !isEqual(props.gridLines, oldProps.gridLines);

        if (needs_reload) {
            this.setState({
                ...this.state,
                isFinishedLoading: false,
            });
            const reportBoundingBox = false;
            this.rebuildData(reportBoundingBox);
        }
    }

    renderLayers(): [PrivateMapLayer?] {
        if (Object.keys(this.state).length === 1) {
            // isFinishedLoading only in state
            return [];
        }

        const [minX, minY] = this.props.frame.origin;
        const center = this.props.frame.rotPoint ?? [minX, minY];

        const rotatingModelMatrix = getModelMatrix(
            this.props.frame.rotDeg ?? 0,
            center[0],
            center[1]
        );

        const isMesh =
            (this.props.meshUrl !== undefined && this.props.meshUrl !== "") ||
            (this.props.meshData !== undefined && this.props.meshData !== "");

        const isModelMatrix =
            this.props.modelMatrix !== undefined &&
            this.props.modelMatrix !== null;

        if (isModelMatrix) {
            rotatingModelMatrix.multiplyRight(
                this.props.modelMatrix as Matrix4
            );
        }

        const undefinedColor = this.getUndefinedPropertyColor();
        const undefinedValue = this.getUndefinedPropertyValue();

        const enableLighting: boolean = this.props.material !== false;
        const layer = new PrivateMapLayer(
            this.getSubLayerProps({
                positions: this.state["positions"],
                normals: this.state["normals"],
                triangleIndices: this.state["triangleIndices"],
                vertexProperties: this.state["vertexProperties"],
                lineIndices: this.state["lineIndices"],
                pickable: this.props.pickable,
                modelMatrix: rotatingModelMatrix,
                contours: this.props.contours,
                gridLines: this.props.gridLines,
                isContoursDepth: !isMesh ? false : this.props.isContoursDepth,
                colormapName: this.props.colorMapName,
                colormapRange: this.props.colorMapRange,
                colormapClampColor: this.props.colorMapClampColor,
                undefinedPropertyColor: undefinedColor,
                undefinedPropertyValue: undefinedValue,
                colormapFunction: this.props.colorMapFunction,
                discretePropertyValueNames:
                    this.props.discretePropertyValueNames,
                propertyValueRange: this.state["propertyValueRange"],
                material: this.props.material,
                smoothShading: this.props.smoothShading,
                depthTest: this.props.depthTest,
                ZIncreasingDownwards: this.props.ZIncreasingDownwards,
                enableLighting,
            })
        );
        return [layer];
    }

    private getWebworkerParams(
        meshData: Float32Array | null,
        propertiesData: Float32Array | Uint16Array | undefined,
        frame: MapFrame
    ): { params: WebWorkerParams; transferrables?: Transferable[] } {
        if (!meshData && !propertiesData) {
            throw new Error(
                "Either mesh or properties or the both must be defined"
            );
        }

        const undefinedPropertyValue = this.getUndefinedPropertyValue();

        const params: WebWorkerParams = [
            meshData,
            propertiesData,
            !!meshData,
            frame,
            this.props.smoothShading,
            this.props.gridLines,
            undefinedPropertyValue,
        ];
        const transferrables = [
            meshData?.buffer,
            propertiesData?.buffer,
        ].filter((item) => !!item) as ArrayBuffer[];

        if (transferrables.length > 0) {
            return { params, transferrables };
        }
        return { params };
    }

    private getUndefinedPropertyValue(): number {
        const isDiscrete = isDiscreteProperty(this.coloringMode());
        if (typeof this.props.undefinedPropertyValue === "number") {
            // Precision should be reduced to single for correct comparing property values
            // with undefined property value in the webworker.
            return isDiscrete
                ? new Uint16Array([this.props.undefinedPropertyValue])[0]
                : new Float32Array([this.props.undefinedPropertyValue])[0];
        }
        return isDiscrete ? 0xffff : Number.NaN;
    }

    private getUndefinedPropertyColor(): RGBColor {
        const colorFunc = this.props.colorMapFunction;
        if (
            this.props.propertiesData?.length === 0 &&
            this.isColormapFunctionConstantColor(colorFunc)
        ) {
            return [colorFunc[0], colorFunc[1], colorFunc[2]];
        }
        return this.props.undefinedPropertyColor ?? [204, 204, 204];
    }

    private isColormapFunctionConstantColor(
        colorFunc: Uint8Array | ColormapFunctionType | undefined
    ): colorFunc is Uint8Array {
        return (
            (Array.isArray(colorFunc) || colorFunc instanceof Uint8Array) &&
            colorFunc.length >= 3
        );
    }
}

MapLayer.layerName = "MapLayer";
MapLayer.defaultProps = defaultProps;
