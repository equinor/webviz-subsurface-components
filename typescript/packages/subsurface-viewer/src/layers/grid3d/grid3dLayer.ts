import { CompositeLayer, Color } from "@deck.gl/core/typed";
import privateLayer, { Material } from "./privateLayer";
import { ExtendedLayerProps, colorMapFunctionType } from "../utils/layerTools";
import { makeFullMesh } from "./webworker";
import { isEqual } from "lodash";
import { load, JSONLoader } from "@loaders.gl/core";
import { default as earcut } from "./earcut";

export type WebWorkerParams = {
    points: number[];
    polys: number[];
    properties: number[];
    isZIncreasingDownwards: boolean;
    triangulateFunc: string;
    triangulateParamName: string;
};

function GetBBox(
    points: number[],
    isZIncreasingDownwards: boolean
): [number, number, number, number, number, number] {
    let xmax = -99999999;
    let ymax = -99999999;
    let zmax = -99999999;

    let xmin = 99999999;
    let ymin = 99999999;
    let zmin = 99999999;

    const z_sign = isZIncreasingDownwards ? -1 : 1;

    for (let i = 0; i < points.length / 3; i++) {
        xmax = points[3 * i + 0] > xmax ? points[3 * i + 0] : xmax;
        xmin = points[3 * i + 0] < xmin ? points[3 * i + 0] : xmin;

        ymax = points[3 * i + 1] > ymax ? points[3 * i + 1] : ymax;
        ymin = points[3 * i + 1] < ymin ? points[3 * i + 1] : ymin;

        zmax = points[3 * i + 2] > zmax ? points[3 * i + 2] : zmax;
        zmin = points[3 * i + 2] < zmin ? points[3 * i + 2] : zmin;
    }
    return [xmin, ymin, zmin * z_sign, xmax, ymax, zmax * z_sign];
}

async function load_data(
    pointsData: string | number[],
    polysData: string | number[],
    propertiesData: string | number[]
) {
    const points = Array.isArray(pointsData)
        ? pointsData
        : await load(pointsData as string, JSONLoader);

    const polys = Array.isArray(polysData)
        ? polysData
        : await load(polysData as string, JSONLoader);

    const properties = Array.isArray(propertiesData)
        ? propertiesData
        : await load(propertiesData as string, JSONLoader);

    return Promise.all([points, polys, properties]);
}

export interface Grid3DLayerProps extends ExtendedLayerProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setReportedBoundingBox?: any;

    /**  Url or native javascript array. Set of points.
     * [x1, y1, z1, x2, y2, z2, ...]
     */
    pointsData: string | number[];

    /**  Url or native javascript array.
     * For each polygon ["number of points in poly", p1, , p2 ... ]
     * Example One polygn ith 4 poitns and one with 3 points.
     * [4, 3, 1, 9, 77, 3, 6, 44, 23]
     */
    polysData: string | number[];

    /**  Url or native javascript array..
     *  A scalar property for each polygon.
     * [0.23, 0.11. 0.98, ...]
     */
    propertiesData: string | number[];

    /**  Name of color map. E.g "PORO"
     */
    colorMapName: string;

    /**  Use color map in this range.
     */
    colorMapRange?: [number, number];

    /** Clamp colormap to this color at ends.
     *   Given as array of three values (r,g,b) e.g: [255, 0, 0]
     *   If not set or set to true, it will clamp to color map min and max values.
     *   If set to false the clamp color will be completely transparent.
     */
    colorMapClampColor: Color | undefined | boolean;

    /**  Optional function property.
     * If defined this function will override the color map.
     * Takes a value in the range [0,1] and returns a color.
     * E.g. (x) => [x * 255, x * 255, x * 255]
     */
    colorMapFunction?: colorMapFunctionType | false;

    /** Surface material properties.
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

    /** Enable/disable depth testing when rendering layer. Default true.
     */
    depthTest: boolean;

    /** If true means that input z values are interpreted as depths.
     *   For example depth of z = 1000 corresponds to -1000 on the z axis. Default true.
     */
    ZIncreasingDownwards: boolean;
}

const defaultProps = {
    "@@type": "Grid3DLayer",
    name: "Grid 3D",
    id: "grid-3d-layer",
    visible: true,
    material: true,
    colorMapName: "",
    propertyValueRange: [0.0, 1.0],
    depthTest: true,
    ZIncreasingDownwards: true,
};

export default class Grid3DLayer extends CompositeLayer<Grid3DLayerProps> {
    get isLoaded(): boolean {
        const subLayers = this.getSubLayers();
        const isLoaded =
            super.isLoaded &&
            subLayers.length > 0 &&
            subLayers.every((layer) => layer.isLoaded);

        const isFinished = this.state?.["isFinishedLoading"] ?? false;
        return isLoaded && isFinished;
    }

    rebuildData(reportBoundingBox: boolean): void {
        const p = load_data(
            this.props.pointsData,
            this.props.polysData,
            this.props.propertiesData
        );

        p.then(([points, polys, properties]) => {
            const bbox = GetBBox(points, this.props.ZIncreasingDownwards);

            // Using inline web worker for calculating the triangle mesh from
            // loaded input data so not to halt the GUI thread.
            const blob = new Blob(
                ["self.onmessage = ", makeFullMesh.toString()],
                { type: "text/javascript" }
            );
            const url = URL.createObjectURL(blob);
            const webWorker = new Worker(url);

            const webworkerParams: WebWorkerParams = {
                points,
                polys,
                properties,
                isZIncreasingDownwards: this.props.ZIncreasingDownwards,
                triangulateFunc: `return earcut(points);\n${earcut.toString()}`,
                triangulateParamName: "points",
            };

            webWorker.postMessage(webworkerParams);
            webWorker.onmessage = (e) => {
                const [mesh, mesh_lines, propertyValueRange] = e.data;
                const legend = {
                    discrete: false,
                    valueRange: this.props.colorMapRange ?? propertyValueRange,
                    colorName: this.props.colorMapName,
                    title: "MapLayer",
                    colorMapFunction: this.props.colorMapFunction,
                };

                this.setState({
                    mesh,
                    mesh_lines,
                    propertyValueRange,
                    legend,
                });

                if (
                    typeof this.props.setReportedBoundingBox !== "undefined" &&
                    reportBoundingBox
                ) {
                    this.props.setReportedBoundingBox(bbox);
                }

                webWorker.terminate();

                this.setState({
                    ...this.state,
                    isFinishedLoading: true,
                });
            };
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
    }: {
        props: Grid3DLayerProps;
        oldProps: Grid3DLayerProps;
    }): void {
        const needs_reload =
            !isEqual(props.pointsData, oldProps.pointsData) ||
            !isEqual(props.polysData, oldProps.polysData) ||
            !isEqual(props.propertiesData, oldProps.propertiesData) ||
            !isEqual(props.ZIncreasingDownwards, oldProps.ZIncreasingDownwards);

        if (needs_reload) {
            this.setState({
                ...this.state,
                isFinishedLoading: false,
            });
            const reportBoundingBox = false;
            this.rebuildData(reportBoundingBox);
        }
    }

    renderLayers(): [privateLayer?] {
        if (Object.keys(this.state).length === 1) {
            // isFinishedLoading only in state
            return [];
        }

        const layer = new privateLayer(
            this.getSubLayerProps({
                mesh: this.state["mesh"],
                meshLines: this.state["mesh_lines"],
                pickable: true,
                colorMapName: this.props.colorMapName,
                colorMapRange: this.props.colorMapRange,
                colorMapClampColor: this.props.colorMapClampColor,
                colorMapFunction: this.props.colorMapFunction,
                propertyValueRange: this.state["propertyValueRange"],
                material: this.props.material,
                depthTest: this.props.depthTest,
            })
        );
        return [layer];
    }
}

Grid3DLayer.layerName = "Grid3DLayer";
Grid3DLayer.defaultProps = defaultProps as unknown as Grid3DLayerProps;
