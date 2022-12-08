import { CompositeLayer, Color } from "@deck.gl/core/typed";
import privateLayer, { Material } from "./privateLayer";
import { ExtendedLayerProps, colorMapFunctionType } from "../utils/layerTools";
import { makeFullMesh } from "./webworker";
import { isEqual } from "lodash";
import { load, JSONLoader } from "@loaders.gl/core";

export type WebWorkerParams = {
    points: number[];
    polys: number[];
    properties: number[];
};

function GetBBox(
    points: number[]
): [number, number, number, number, number, number] {
    let xmax = -99999999;
    let ymax = -99999999;
    let zmax = -99999999;

    let xmin = 99999999;
    let ymin = 99999999;
    let zmin = 99999999;

    for (let i = 0; i < points.length / 3; i++) {
        xmax = points[3 * i + 0] > xmax ? points[3 * i + 0] : xmax;
        xmin = points[3 * i + 0] < xmin ? points[3 * i + 0] : xmin;

        ymax = points[3 * i + 1] > ymax ? points[3 * i + 1] : ymax;
        ymin = points[3 * i + 1] < ymin ? points[3 * i + 1] : ymin;

        zmax = points[3 * i + 2] > zmax ? points[3 * i + 2] : zmax;
        zmin = points[3 * i + 2] < zmin ? points[3 * i + 2] : zmin;
    }
    return [xmin, ymin, zmin, xmax, ymax, zmax];
}

async function load_data(
    pointsUrl: string,
    polysUrl: string,
    propertiesUrl: string
) {
    // FULL GRID
    const points = await load(pointsUrl, JSONLoader);
    const polys = await load(polysUrl, JSONLoader);
    const properties = await load(propertiesUrl, JSONLoader);

    return Promise.all([points, polys, properties]);
}

export interface Grid3DLayerProps<D> extends ExtendedLayerProps<D> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setReportedBoundingBox?: any;

    pointsUrl: string;
    polysUrl: string;
    propertiesUrl: string;

    // Name of color map. E.g "PORO"
    colorMapName: string;

    // Use color map in this range.
    colorMapRange?: [number, number];

    // Clamp colormap to this color at ends.
    // Given as array of three values (r,g,b) e.g: [255, 0, 0]
    // If not set or set to true, it will clamp to color map min and max values.
    // If set to false the clamp color will be completely transparent.
    colorMapClampColor: Color | undefined | boolean;

    // Optional function property.
    // If defined this function will override the color map.
    // Takes a value in the range [0,1] and returns a color.
    // E.g. (x) => [x * 255, x * 255, x * 255]
    colorMapFunction?: colorMapFunctionType | false;

    // Surface material properties.
    // material: true  = default material, coloring depends on surface orientation and lighting.
    //           false = no material,  coloring is independent on surface orientation and lighting.
    //           or full spec:
    //      material: {
    //           ambient: 0.35,
    //           diffuse: 0.6,
    //           shininess: 32,
    //           specularColor: [255, 255, 255],
    //       }
    material: Material;

    // Enable/disable depth testing when rendering layer. Default true.
    depthTest: boolean;
}

const defaultProps = {
    colorMapName: "",
    propertyValueRange: [0.0, 1.0],
};

export default class Grid3DLayer extends CompositeLayer<
    Grid3DLayerProps<unknown>
> {
    rebuildData(reportBoundingBox: boolean): void {
        const p = load_data(
            this.props.pointsUrl,
            this.props.polysUrl,
            this.props.propertiesUrl
        );

        p.then(([points, polys, properties]) => {
            const bbox = GetBBox(points);

            // Using inline web worker for calculating the triangle mesh from
            // loaded input data so not to halt the GUI thread.
            const blob = new Blob(
                ["self.onmessage = ", makeFullMesh.toString()],
                { type: "text/javascript" }
            );
            const url = URL.createObjectURL(blob);
            const webWorker = new Worker(url);

            const webworkerParams = {
                points,
                polys,
                properties,
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
            };
        });
    }

    initializeState(): void {
        const reportBoundingBox = true;
        this.rebuildData(reportBoundingBox);
    }

    updateState({
        props,
        oldProps,
    }: {
        props: Grid3DLayerProps<unknown>;
        oldProps: Grid3DLayerProps<unknown>;
    }): void {
        const needs_reload =
            !isEqual(props.pointsUrl, oldProps.pointsUrl) ||
            !isEqual(props.polysUrl, oldProps.polysUrl) ||
            !isEqual(props.propertiesUrl, oldProps.propertiesUrl);

        if (needs_reload) {
            const reportBoundingBox = false;
            this.rebuildData(reportBoundingBox);
        }
    }

    renderLayers(): [privateLayer?] {
        if (Object.keys(this.state).length === 0) {
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
Grid3DLayer.defaultProps = defaultProps as unknown as Grid3DLayerProps<unknown>;
