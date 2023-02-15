import { CompositeLayer, Color, UpdateParameters } from "@deck.gl/core/typed";
import privateMapLayer, { Material } from "./privateMapLayer";
import { ExtendedLayerProps, colorMapFunctionType } from "../utils/layerTools";
import { getModelMatrix } from "../utils/layerTools";
import { isEqual } from "lodash";
import * as png from "@vivaxy/png";
import { makeFullMesh } from "./webworker";
import { Matrix4 } from "math.gl";

// These two types both describes the mesh' extent in the horizontal plane.
type Frame = {
    /** mesh origin
     */
    origin: [number, number];

    /** cells size in each direction.
     */
    increment: [number, number];

    /** no cells in each direction.
     */
    count: [number, number];

    /** Rotates map counterclockwise in degrees around 'rotPoint' specified below.
     */
    rotDeg?: number;

    /** Point to rotate around using 'rotDeg'. Defaults to mesh origin.
     */
    rotPoint?: [number, number];
};

export type Params = {
    meshData: Float32Array;
    propertiesData: Float32Array;
    isMesh: boolean;
    frame: Frame;
    smoothShading: boolean;
};

async function load_mesh_and_properties(
    meshData: string | number[],
    propertiesData: string | number[],
    ZIncreasingDownwards: boolean
) {
    // Keep
    //const t0 = performance.now();

    const isMesh = typeof meshData !== "undefined";
    const isProperties = typeof propertiesData !== "undefined";

    if (!isMesh && !isProperties) {
        console.error("Error. One or both of texture and mesh must be given!");
    }

    if (isMesh && !isProperties) {
        propertiesData = meshData;
    }

    //-- PROPERTIES. --
    let properties: Float32Array;
    if (Array.isArray(propertiesData)) {
        // Input data is native javascript array.
        properties = new Float32Array(propertiesData);
    } else {
        // Input data is an URL.
        const response = await fetch(propertiesData);
        if (!response.ok) {
            console.error("Could not load ", propertiesData);
        }

        const blob = await response.blob();
        const contentType = response.headers.get("content-type");
        const isPng = contentType === "image/png";
        if (isPng) {
            // Load as Png  with abolute float values.
            properties = await new Promise((resolve) => {
                const fileReader = new FileReader();
                fileReader.readAsArrayBuffer(blob);
                fileReader.onload = () => {
                    const arrayBuffer = fileReader.result;
                    const imgData = png.decode(arrayBuffer as ArrayBuffer);
                    const data = imgData.data; // array of int's

                    const n = data.length;
                    const buffer = new ArrayBuffer(n);
                    const view = new DataView(buffer);
                    for (let i = 0; i < n; i++) {
                        view.setUint8(i, data[i]);
                    }

                    const floatArray = new Float32Array(buffer);
                    resolve(floatArray);
                };
            });
        } else {
            // Load as binary array of floats.
            const buffer = await blob.arrayBuffer();
            properties = new Float32Array(buffer);
        }
    }

    //-- MESH --
    let mesh: Float32Array = new Float32Array();
    if (isMesh) {
        if (Array.isArray(meshData)) {
            // Input data is native javascript array.
            mesh = new Float32Array(meshData);
        } else {
            // Input data is an URL.
            const response_mesh = await fetch(meshData);
            if (!response_mesh.ok) {
                console.error("Could not load mesh");
            }

            const blob_mesh = await response_mesh.blob();
            const contentType_mesh = response_mesh.headers.get("content-type");
            const isPng_mesh = contentType_mesh === "image/png";
            if (isPng_mesh) {
                // Load as Png  with abolute float values.
                mesh = await new Promise((resolve) => {
                    const fileReader = new FileReader();
                    fileReader.readAsArrayBuffer(blob_mesh);
                    fileReader.onload = () => {
                        const arrayBuffer = fileReader.result;
                        const imgData = png.decode(arrayBuffer as ArrayBuffer);
                        const data = imgData.data; // array of int's

                        const n = data.length;
                        const buffer = new ArrayBuffer(n);
                        const view = new DataView(buffer);
                        for (let i = 0; i < n; i++) {
                            view.setUint8(i, data[i]);
                        }

                        const floatArray = new Float32Array(buffer);
                        resolve(floatArray);
                    };
                });
            } else {
                // Load as binary array of floats.
                const buffer = await blob_mesh.arrayBuffer();
                mesh = new Float32Array(buffer);
            }
        }
    }

    if (!ZIncreasingDownwards) {
        for (let i = 0; i < meshData.length; i++) {
            mesh[i] *= -1;
        }
    }

    //const t1 = performance.now();
    // Keep this.
    //console.log(`Task loading took ${(t1 - t0) * 0.001}  seconds.`);

    return Promise.all([isMesh, mesh, properties]);
}

export interface MapLayerProps<D> extends ExtendedLayerProps<D> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setReportedBoundingBox?: any;

    /**  Url to the height (z values) mesh.
     */
    meshUrl: string; // Deprecated
    meshData: string | number[];

    /**  Horizontal extent of the terrain mesh. Format:
     {
         origin: [number, number];     // mesh origin in x, y
         increment: [number, number];  // cell size dx, dy
         count: [number, number];      // number of cells in both directions.
     }
     */
    frame: Frame;

    /**  Url to the properties (ex, poro or perm values).
     * If the number of property values equals the number of depth values
     * the property values will be placed at the nodes and the cell (4 neigboring nodes)
     * color will be linearly interpolated over the cell.
     * If the number of property values equals one less than the depth values in
     * each direction then the property values will be pr cell and the cell will be constant
     * colored.
     */
    propertiesUrl: string; // Deprecated
    propertiesData: string | number[];

    /**  Contourlines reference point and interval.
     * A value of [-1.0, -1.0] will disable contour lines.
     * Contour lines will also not be activated if cells are constant colored
     * and "isContoursDepth" is set to false. I.e. constant properties within cells and contourlines
     * to be calculated for properties and not depths.
     * default value: [-1.0, -1.0]
     */
    contours: [number, number];

    /**  Contourlines may be calculated either on depth/z-value or on property value
     * If this is set to false, lines will follow properties instead of depth.
     * In 2D mode this is always the case regardless.
     * default: true
     */
    isContoursDepth: boolean;

    /**  Enable gridlines.
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
    colorMapFunction?: colorMapFunctionType;

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

export default class MapLayer extends CompositeLayer<MapLayerProps<unknown>> {
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

        const p = load_mesh_and_properties(
            meshData,
            propertiesData,
            this.props.ZIncreasingDownwards
        );

        p.then(([isMesh, meshData, propertiesData]) => {
            // Using inline web worker for calculating the triangle mesh from
            // loaded input data so not to halt the GUI thread.
            const blob = new Blob(
                ["self.onmessage = ", makeFullMesh.toString()],
                { type: "text/javascript" }
            );
            const url = URL.createObjectURL(blob);
            const webWorker = new Worker(url);

            const webworkerParams = {
                meshData,
                propertiesData,
                isMesh,
                frame: this.props.frame,
                smoothShading: this.props.smoothShading,
            };

            webWorker.postMessage(webworkerParams);
            webWorker.onmessage = (e) => {
                const [mesh, mesh_lines, meshZValueRange, propertyValueRange] =
                    e.data;

                this.setState({
                    mesh,
                    mesh_lines,
                    propertyValueRange,
                });

                if (
                    typeof this.props.setReportedBoundingBox !== "undefined" &&
                    reportBoundingBox
                ) {
                    const xinc = this.props.frame?.increment?.[0] ?? 0;
                    const yinc = this.props.frame?.increment?.[1] ?? 0;

                    const xcount = this.props.frame?.count?.[0] ?? 1;
                    const ycount = this.props.frame?.count?.[1] ?? 1;

                    const xMin = this.props.frame?.origin?.[0] ?? 0;
                    const yMin = this.props.frame?.origin?.[1] ?? 0;
                    const zMin = -meshZValueRange[0];
                    const xMax = xMin + xinc * xcount;
                    const yMax = yMin + yinc * ycount;
                    const zMax = -meshZValueRange[0];

                    this.props.setReportedBoundingBox([
                        xMin,
                        yMin,
                        zMin,
                        xMax,
                        yMax,
                        zMax,
                    ]);
                }

                webWorker.terminate();
            };
        });
    }

    initializeState(): void {
        const reportBoundingBox = true;
        this.rebuildData(reportBoundingBox);
    }

    updateState({ props, oldProps }: UpdateParameters<MapLayer>): void {
        const needs_reload =
            !isEqual(props.meshUrl, oldProps.meshUrl) ||
            !isEqual(props.propertiesUrl, oldProps.propertiesUrl) ||
            !isEqual(props.meshData, oldProps.meshData) ||
            !isEqual(props.propertiesData, oldProps.propertiesData) ||
            !isEqual(props.frame, oldProps.frame) ||
            !isEqual(props.gridLines, oldProps.gridLines);

        if (needs_reload) {
            const reportBoundingBox = false;
            this.rebuildData(reportBoundingBox);
        }
    }

    renderLayers(): [privateMapLayer?] {
        if (Object.keys(this.state).length === 0) {
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
            typeof this.props.meshUrl !== "undefined" &&
            this.props.meshUrl !== "";

        const isModelMatrix =
            typeof this.props.modelMatrix !== "undefined" &&
            this.props.modelMatrix !== null;

        if (isModelMatrix) {
            rotatingModelMatrix.multiplyRight(
                this.props.modelMatrix as Matrix4
            );
        }

        const layer = new privateMapLayer(
            this.getSubLayerProps({
                mesh: this.state["mesh"],
                meshLines: this.state["mesh_lines"],
                pickable: this.props.pickable,
                modelMatrix: rotatingModelMatrix,
                contours: this.props.contours,
                gridLines: this.props.gridLines,
                isContoursDepth: !isMesh ? false : this.props.isContoursDepth,
                colorMapName: this.props.colorMapName,
                colorMapRange: this.props.colorMapRange,
                colorMapClampColor: this.props.colorMapClampColor,
                colorMapFunction: this.props.colorMapFunction,
                propertyValueRange: this.state["propertyValueRange"],
                material: this.props.material,
                smoothShading: this.props.smoothShading,
                depthTest: this.props.depthTest,
            })
        );
        return [layer];
    }
}

MapLayer.layerName = "MapLayer";
MapLayer.defaultProps = defaultProps;
