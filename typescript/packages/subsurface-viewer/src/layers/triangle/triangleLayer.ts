import { isEqual } from "lodash";
import type React from "react";

import type { UpdateParameters } from "@deck.gl/core";
import { CompositeLayer } from "@deck.gl/core";

import workerpool from "workerpool";

import type { ReportBoundingBoxAction } from "../../components/Map";
import type { ExtendedLayerProps } from "../utils/layerTools";
import type { Material } from "./privateTriangleLayer";
import PrivateTriangleLayer from "./privateTriangleLayer";
import { makeFullMesh } from "./webworker";

import config from "../../SubsurfaceConfig.json";
import { findConfig } from "../../utils/configTools";

export type Params = {
    vertexArray: Float32Array;
    indexArray: Uint32Array;
    smoothShading: boolean;
    displayNormals: boolean;
};

// init workerpool
const workerPoolConfig = findConfig(
    config,
    "config/workerpool",
    "config/layer/TriangleLayer/workerpool"
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

async function loadData(
    pointsData: string | number[] | Float32Array,
    triangleData: string | number[] | Uint32Array
) {
    // Keep
    //const t0 = performance.now();

    //-- Vertexes --
    let vertexArray: Float32Array = new Float32Array();
    if (Array.isArray(pointsData)) {
        // Input data is native javascript array.
        vertexArray = new Float32Array(pointsData);
    } else if (pointsData instanceof Float32Array) {
        vertexArray = pointsData;
    } else {
        // Input data is an URL.
        const response_mesh = await fetch(pointsData);
        if (!response_mesh.ok) {
            console.error("Could not load vertex data");
        }

        const blob_mesh = await response_mesh.blob();

        // Load as binary array of floats.
        const buffer = await blob_mesh.arrayBuffer();
        vertexArray = new Float32Array(buffer);
    }

    //-- Triangle indexes --
    let indexArray: Uint32Array;
    if (Array.isArray(triangleData)) {
        // Input data is native javascript array.
        indexArray = new Uint32Array(triangleData);
    } else if (triangleData instanceof Uint32Array) {
        indexArray = triangleData;
    } else {
        // Input data is an URL.
        const response_mesh = await fetch(triangleData);
        if (!response_mesh.ok) {
            console.error("Could not load triangle index data");
        }

        const blob_mesh = await response_mesh.blob();

        // Load as binary array of floats.
        const buffer = await blob_mesh.arrayBuffer();
        indexArray = new Uint32Array(buffer);
    }

    //const t1 = performance.now();
    // Keep this.
    //console.log(`Task loading took ${(t1 - t0) * 0.001}  seconds.`);

    return Promise.all([vertexArray, indexArray]);
}

export interface TriangleLayerProps extends ExtendedLayerProps {
    /** Triangle vertexes.
     * Either an URL or an array of numbers.
     */
    pointsData: string | number[] | Float32Array;

    triangleData: string | number[] | Uint32Array;

    color: [number, number, number];

    /**  Contourlines reference point and interval.
     */
    contours: [number, number];

    /** Enable lines around triangles.
     *  default: false.
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
     *           specularColor: [255, 255, 255],
     *       }
     * Default value: true.
     */
    material: Material;

    /**  Will calculate normals for each vertex and enable phong shading.
     * If not set the shader will calculate constant normal for each triangle.
     * Only has effect if "material" is not set to false.
     */
    smoothShading: boolean;

    /** Enable/disable depth testing when rendering layer. Default true.
     */
    depthTest: boolean;

    /**  If true means that input z values are interpreted as depths.
     * For example depth of z = 1000 corresponds to -1000 on the z axis. Default true.
     */
    ZIncreasingDownwards: boolean;

    /** If true will display normals on all vertex's
     */
    debug: boolean;

    // Non public properties:
    reportBoundingBox?: React.Dispatch<ReportBoundingBoxAction>;
}

const defaultProps = {
    "@@type": "TriangleLayer",
    name: "TriangleLayer",
    id: "triangle-layer",
    pickable: true,
    visible: true,
    contours: [-1.0, -1.0],
    color: [100, 100, 255],
    gridLines: false,
    smoothShading: true,
    material: true,
    depthTest: true,
    ZIncreasingDownwards: true,
    debug: false,
};

export default class TriangleLayer extends CompositeLayer<TriangleLayerProps> {
    get isLoaded(): boolean {
        const subLayers = this.getSubLayers();
        const isLoaded =
            super.isLoaded &&
            subLayers.length > 0 &&
            subLayers.every((layer) => layer.isLoaded);

        const isFinishedLoading = this.state?.["isFinishedLoading"] as boolean;
        const isFinished = isFinishedLoading ?? false;
        //const isFinished = this.state?.["isFinishedLoading"] ?? false;
        return isLoaded && isFinished;
    }

    rebuildData(reportBoundingBox: boolean): void {
        const pointsData = this.props.pointsData;
        const triangleData = this.props.triangleData;

        const p = loadData(pointsData, triangleData);

        p.then(([vertexArray, indexArray]) => {
            // Using inline web worker for calculating the triangle mesh from
            // loaded input data so not to halt the GUI thread.

            const webworkerParams: Params = {
                vertexArray,
                indexArray,
                smoothShading: this.props.smoothShading,
                displayNormals: this.props.debug,
            };

            pool.exec(makeFullMesh, [{ data: webworkerParams }]).then((e) => {
                const [geometryTriangles, geometryLines] = e;

                this.setState({
                    geometryTriangles,
                    geometryLines,
                });

                if (
                    typeof this.props.reportBoundingBox !== "undefined" &&
                    reportBoundingBox
                ) {
                    let xmax = -99999999;
                    let xmin = 99999999;

                    let ymax = -99999999;
                    let ymin = 99999999;

                    let zmax = -99999999;
                    let zmin = 99999999;

                    for (let i = 0; i < vertexArray.length / 3; i++) {
                        xmax = vertexArray[3 * i + 0] > xmax ? vertexArray[3 * i + 0] : xmax; //eslint-disable-line
                        xmin = vertexArray[3 * i + 0] < xmin ? vertexArray[3 * i + 0] : xmin; //eslint-disable-line

                        ymax = vertexArray[3 * i + 1] > ymax ? vertexArray[3 * i + 1] : ymax; //eslint-disable-line
                        ymin = vertexArray[3 * i + 1] < ymin ? vertexArray[3 * i + 1] : ymin; //eslint-disable-line

                        zmax = vertexArray[3 * i + 2] > zmax ? vertexArray[3 * i + 2] : zmax; //eslint-disable-line
                        zmin = vertexArray[3 * i + 2] < zmin ? vertexArray[3 * i + 2] : zmin; //eslint-disable-line
                    }

                    if (this.props.ZIncreasingDownwards) {
                        const tmp = zmin;
                        zmin = zmax;
                        zmax = tmp;
                    }

                    this.props.reportBoundingBox({
                        layerBoundingBox: [xmin, ymin, zmin, xmax, ymax, zmax],
                    });
                }

                this.setState({
                    ...this.state,
                    isFinishedLoading: true,
                });

                onTerminateWorker();
            });
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

    updateState({ props, oldProps }: UpdateParameters<TriangleLayer>): void {
        const needs_reload =
            !isEqual(props.debug, oldProps.debug) ||
            !isEqual(props.pointsData, oldProps.pointsData) ||
            !isEqual(props.triangleData, oldProps.triangleData) ||
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

    renderLayers(): [PrivateTriangleLayer?] {
        if (Object.keys(this.state).length === 1) {
            // isFinishedLoading only in state
            return [];
        }

        const layer = new PrivateTriangleLayer(
            this.getSubLayerProps({
                geometryTriangles: this.state["geometryTriangles"],
                geometryLines: this.state["geometryLines"],
                pickable: this.props.pickable,
                contours: this.props.contours,
                gridLines: this.props.gridLines,
                color: this.props.color,
                material: this.props.material,
                smoothShading: this.props.smoothShading,
                depthTest: this.props.depthTest,
                ZIncreasingDownwards: this.props.ZIncreasingDownwards,
            })
        );
        return [layer];
    }
}

TriangleLayer.layerName = "TriangleLayer";
TriangleLayer.defaultProps = defaultProps;
