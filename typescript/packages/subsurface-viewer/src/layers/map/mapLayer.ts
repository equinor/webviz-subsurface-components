import { isEqual } from "lodash";
import type React from "react";

import type {
    Color,
    CompositeLayerProps,
    Layer,
    Material,
    UpdateParameters,
} from "@deck.gl/core";
import { CompositeLayer } from "@deck.gl/core";
import type { Matrix4 } from "math.gl";

import type {
    ReportBoundingBoxAction,
    ExtendedLayerProps,
} from "../utils/layerTools";
import { getModelMatrix } from "../utils/layerTools";
import type { ColormapFunctionType } from "../utils/colormapTools";
import config from "../../SubsurfaceConfig.json";
import { findConfig } from "../../utils/configTools";
import { loadDataArray } from "../../utils/serialize";
import PrivateMapLayer from "./privateMapLayer";
import { rotate } from "./utils";
import { makeFullMesh } from "./webworker";

import workerpool from "workerpool";

// init workerpool
const workerPoolConfig = findConfig(
    config,
    "config/workerpool",
    "config/layer/MapLayer/workerpool"
);

const pool = workerpool.pool({
    ...{
        maxWorkers: 10,
        workerType: "web",
    },
    ...workerPoolConfig,
});

function onTerminateWorker() {
    const stats = pool.stats();
    if (stats.busyWorkers === 0 && stats.pendingTasks === 0) {
        pool.terminate();
    }
}

// This type describes the mesh' extent in the horizontal plane.
type Frame = {
    /** mesh origin
     */
    origin: [number, number];

    /** cells size in each direction.
     */
    increment: [number, number];

    /** number of nodes in each direction.
     */
    count: [number, number];

    /** Rotates map counterclockwise in degrees around 'rotPoint' specified below.
     */
    rotDeg?: number;

    /** Point to rotate around using 'rotDeg'. Defaults to mesh origin.
     */
    rotPoint?: [number, number];
};

export type Params = [
    meshData: Float32Array | null,
    propertiesData: Float32Array | null,
    isMesh: boolean,
    frame: Frame,
    smoothShading: boolean,
    gridLines: boolean,
];

/**
 * Will load data for the mesh and the properties. Both of which may be given as arrays (javascript or typed)
 * or as a URL to the data in binary format.
 * Return value: A promise with the data given as typed arrays.
 */
async function loadMeshAndProperties(
    meshData: string | number[] | Float32Array,
    propertiesData: string | number[] | Float32Array
) {
    // Keep
    //const t0 = performance.now();

    const mesh = await loadDataArray(meshData, Float32Array);
    const properties = await loadDataArray(propertiesData, Float32Array);

    // if (!isMesh && !isProperties) {
    //     console.error("Error. One or both of texture and mesh must be given!");
    // }

    // Keep this.
    // const t1 = performance.now();
    // console.debug(`Task loading took ${(t1 - t0) * 0.001}  seconds.`);

    return Promise.all([mesh, properties]);
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
    frame: Frame;

    /**  Url to the properties (ex, poro or perm values).
     * If the number of property values equals the number of depth values
     * the property values will be placed at the nodes and the cell (4 neighboring nodes)
     * color will be linearly interpolated over the cell.
     * If the number of property values equals one less than the depth values in
     * each direction then the property values will be pr cell and the cell will be constant
     * colored.
     */
    propertiesUrl: string; // Deprecated
    propertiesData: string | number[] | Float32Array;

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

    /**  Surface material properties.
     * material: true  = default material, coloring depends on surface orientation and lighting.
     *           false = no material,  coloring is independent on surface orientation and lighting.
     *           or full spec:
     *      material: {
     *           ambient: 0.35,
     *           diffuse: 0.6,
     *           shininess: 32,
     *           specularColor: [255, 255, 255],
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
    bounds: { type: "object", value: null, false: true, compare: true },
    colorMapRange: { type: "array" },
    contours: [-1.0, -1.0],
    // If contour lines should follow depth or properties.
    isContoursDepth: true,
    gridLines: false,
    smoothShading: true,
    material: true,
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

    rebuildData(reportBoundingBox: boolean): void {
        if (typeof this.props.meshUrl !== "undefined") {
            console.warn('"meshUrl" is deprecated. Use "meshData"');
        }

        if (typeof this.props.propertiesUrl !== "undefined") {
            console.warn('"propertiesUrl" is deprecated. Use "propertiesData"');
        }

        const meshData = this.props.meshData ?? this.props.meshUrl;
        const propertiesData =
            this.props.propertiesData ?? this.props.propertiesUrl;

        const p = loadMeshAndProperties(meshData, propertiesData);

        p.then(([meshData, propertiesData]) => {
            // Using inline web worker for calculating the triangle mesh from
            // loaded input data so not to halt the GUI thread.

            const webworkerParams = this.getWebworkerParams(
                meshData,
                propertiesData
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
                        typeof this.props.reportBoundingBox !== "undefined" &&
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
                        const [x0, y0] = rotate(
                            xMin,
                            yMin,
                            center[0],
                            center[1],
                            rotRad
                        ); // eslint-disable-line
                        const [x1, y1] = rotate(
                            xMax,
                            yMin,
                            center[0],
                            center[1],
                            rotRad
                        ); // eslint-disable-line
                        const [x2, y2] = rotate(
                            xMax,
                            yMax,
                            center[0],
                            center[1],
                            rotRad
                        ); // eslint-disable-line
                        const [x3, y3] = rotate(
                            xMin,
                            yMax,
                            center[0],
                            center[1],
                            rotRad
                        ); // eslint-disable-line

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
            (typeof this.props.meshUrl !== "undefined" &&
                this.props.meshUrl !== "") ||
            (typeof this.props.meshData !== "undefined" &&
                this.props.meshData !== "");

        const isModelMatrix =
            typeof this.props.modelMatrix !== "undefined" &&
            this.props.modelMatrix !== null;

        if (isModelMatrix) {
            rotatingModelMatrix.multiplyRight(
                this.props.modelMatrix as Matrix4
            );
        }

        const enableLighting: boolean = !(this.props.material === false);
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
                colormapFunction: this.props.colorMapFunction,
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
        propertiesData: Float32Array | null
    ): { params: Params; transferrables?: Transferable[] } {
        if (!meshData && !propertiesData) {
            throw new Error(
                "Either mesh or properties or the both must be defined"
            );
        }

        const params: Params = [
            meshData,
            propertiesData,
            !!meshData,
            this.props.frame,
            this.props.smoothShading,
            this.props.gridLines,
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
}

MapLayer.layerName = "MapLayer";
MapLayer.defaultProps = defaultProps;
