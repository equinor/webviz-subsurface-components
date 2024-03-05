import type { PickingInfo, UpdateParameters } from "@deck.gl/core/typed";
import { CompositeLayer } from "@deck.gl/core/typed";
import { isEqual } from "lodash";

import type {
    PropertyDataType,
    ExtendedLayerProps,
    LayerPickInfo,
} from "../utils/layerTools";
import type { ReportBoundingBoxAction } from "../../components/Map";
import { createPropertyData, defineBoundingBox } from "../utils/layerTools";

import { PrivatePolylinesLayer } from "./privatePolylinesLayer";

type IsPolylineClosedFunc = (index: number) => boolean;

/**
 * _pathType is Deck.GL PathLayer prop. If all the polylines are "open" or are "loop" some checks are skipped for better performance.
 * If this prop is not set or null PathLayer checks closeness by comparing coordinates and decides how to draw the polylines.
 */
type PathType = "open" | "loop" | null;

export interface PolylinesLayerProps extends ExtendedLayerProps {
    /**
     * Polyline vertices as [x, y, z, x, y, z....].
     */
    polylinePoints: number[] | Float32Array;

    /**
      Start indices of the polylines counted in vertex indices.
      For example, if there are 3 polulines of 2, 3, and 4 vertices each, startIndices should be [0, 2, 5].
     */
    startIndices: number[] | Uint32Array;

    /** Array of boolean flags or a single value indicating whether the polylines are closed.
     *  The polylines are considered to be open if not set.
     */
    polylinesClosed?: boolean | boolean[];
    /**
     * Line color defined as RGB or RGBA array. Each component is in 0-255 range.
     */
    color: [number, number, number] | [number, number, number, number];

    /**
     * The units of the line width, one of `'meters'`, `'common'`, and `'pixels'`.
     */
    widthUnits: "meters" | "common" | "pixels";

    /**
     * Line width defined in width units.
     */
    linesWidth: number;

    /** Enable/disable depth testing when rendering layer. Default true.
     */
    depthTest?: boolean;

    /**
     * If true means that input z values are interpreted as depths.
     * For example depth of z = 1000 corresponds to -1000 on the z axis. Default true.
     */
    ZIncreasingDownwards: boolean;

    // Non public properties:
    reportBoundingBox?: React.Dispatch<ReportBoundingBoxAction>;
}

const defaultProps = {
    "@@type": "PolylinesLayer",
    name: "PolylinesLayer",
    id: "polylines-layer",
    widthUnits: "pixels",
    linesWidth: 5,
    color: [0, 0, 200, 255],
    pickable: true,
    visible: true,
    depthTest: true,
    ZIncreasingDownwards: true,
};

interface IDataAttributes {
    length: number;
    startIndices: Uint32Array;
    attributes: {
        getPath: {
            value: Float32Array;
            size: number;
        };
    };
    pathType: PathType;
}

export default class PolylinesLayer extends CompositeLayer<PolylinesLayerProps> {
    renderLayers(): [PrivatePolylinesLayer?] {
        const layer = new PrivatePolylinesLayer(
            this.getSubLayerProps({
                id: "polylines-layer",
                widthUnits: this.props.widthUnits,
                pickable: this.props.pickable,
                billboard: true,
                jointRounded: true,
                capRounded: true,
                data: this.state["dataAttributes"],
                _pathType: this.state["dataAttributes"].pathType,
                getColor: () => this.props.color,
                getWidth: () => this.props.linesWidth,

                updateTriggers: {
                    getColor: [this.props.color],
                    getWidth: [this.props.linesWidth],
                },
                depthTest: this.props.depthTest,
                ZIncreasingDownwards: this.props.ZIncreasingDownwards,
            })
        );
        return [layer];
    }

    initializeState(): void {
        const dataAttributes = this.rebuildDataAttributes(true);
        this.setState({ dataAttributes });
    }

    updateState({ props, oldProps }: UpdateParameters<PolylinesLayer>): void {
        const needs_reload =
            !isEqual(props.polylinePoints, oldProps.polylinePoints) ||
            !isEqual(props.startIndices, oldProps.startIndices) ||
            !isEqual(props.polylinesClosed, oldProps.polylinesClosed) ||
            !isEqual(props.ZIncreasingDownwards, oldProps.ZIncreasingDownwards);

        if (needs_reload) {
            const dataAttributes = this.rebuildDataAttributes(false);
            this.setState({ dataAttributes });
        }
    }

    private rebuildDataAttributes(
        reportBoundingBox: boolean
    ): IDataAttributes | null {
        const dataArrays = this.loadData();
        if (
            typeof this.props.reportBoundingBox === "function" &&
            reportBoundingBox
        ) {
            const boundingBox = defineBoundingBox(dataArrays.positions);
            this.props.reportBoundingBox({ layerBoundingBox: boundingBox });
        }

        return {
            length: dataArrays.linesCount,
            startIndices: dataArrays.startIndices,
            attributes: {
                getPath: {
                    value: dataArrays.positions,
                    size: 3,
                },
            },
            pathType: dataArrays.pathType,
        };
    }

    getPickingInfo({ info }: { info: PickingInfo }): LayerPickInfo {
        if (!info.color) {
            return info;
        }

        const layer_properties: PropertyDataType[] = [];

        if (typeof info.coordinate?.[2] !== "undefined") {
            const depth = this.props.ZIncreasingDownwards
                ? -info.coordinate[2]
                : info.coordinate[2];
            layer_properties.push(createPropertyData("Depth", depth));
        }

        return {
            ...info,
            properties: layer_properties,
        };
    }

    private loadData(): {
        linesCount: number;
        startIndices: Uint32Array;
        positions: Float32Array;
        pathType: PathType;
    } {
        // The input arrays can be used as deck.gl binary inputs.
        // Explicit pathType prevents deck.gl from addtional computations.
        if (
            this.props.polylinePoints instanceof Float32Array &&
            this.props.startIndices instanceof Uint32Array &&
            !this.props.polylinesClosed
        ) {
            return {
                linesCount: this.props.startIndices.length - 1,
                positions: this.props.polylinePoints as Float32Array,
                startIndices: this.props.startIndices as Uint32Array,
                pathType: "open",
            };
        }
        const data = this.closePolylines();

        return {
            linesCount: data.startIndices.length,
            positions: new Float32Array(data.polylinePoints),
            startIndices: new Uint32Array(data.startIndices),
            pathType: data.pathType,
        };
    }

    private toArray<T extends ArrayLike<number>>(data: number[] | T): number[] {
        if (Array.isArray(data)) {
            return data;
        }
        return Array.from(data);
    }

    private closePolylines(): {
        polylinePoints: number[];
        startIndices: number[];
        pathType: PathType;
    } {
        const points = this.toArray<Float32Array>(this.props.polylinePoints);
        const startIndices = this.toArray<Uint32Array>(this.props.startIndices);

        this.normalizeStartIndices(startIndices, points.length / 3);

        const isClosedFunc = this.createIsClosedFunc();
        if (!isClosedFunc.func) {
            return {
                polylinePoints: points,
                startIndices: startIndices,
                pathType: isClosedFunc.pathType,
            };
        }
        let startIndexShift = 0;
        const closedPoints: number[] = [];
        const closedStartIndices: number[] = [];
        const linesCount = this.props.startIndices.length - 1;
        for (let i = 0; i < linesCount; ++i) {
            const isClosed = isClosedFunc.func(i);
            closedStartIndices.push(
                this.props.startIndices[i] + startIndexShift
            );
            if (isClosed) {
                this.closePolyline(points, startIndices, i, closedPoints);
                ++startIndexShift;
            } else {
                this.copyPolyline(points, startIndices, i, closedPoints);
            }
        }
        return {
            polylinePoints: closedPoints,
            startIndices: closedStartIndices,
            pathType: isClosedFunc.pathType,
        };
    }

    private normalizeStartIndices(startIndices: number[], pointsCount: number) {
        const lastIndex = startIndices.slice(-1)[0];
        if (lastIndex < pointsCount) {
            startIndices.push(pointsCount);
        }
    }

    private copyPolyline(
        points: number[],
        startIndices: number[],
        lineIndex: number,
        outPoints: number[]
    ) {
        const startPoint = startIndices[lineIndex];
        const endPoint = startIndices[lineIndex + 1];
        for (let idx = startPoint; idx < endPoint; ++idx) {
            outPoints.push(...this.getPolylinePoint(points, idx));
        }
    }

    private closePolyline(
        points: number[],
        startIndices: number[],
        lineIndex: number,
        outPoints: number[]
    ) {
        this.copyPolyline(points, startIndices, lineIndex, outPoints);
        const startPoint = startIndices[lineIndex];
        outPoints.push(...this.getPolylinePoint(points, startPoint));
    }

    private getPolylinePoint(points: number[], index: number): number[] {
        return points.slice(3 * index, 3 * (index + 1));
    }

    private createIsClosedFunc(): {
        func: IsPolylineClosedFunc | null;
        pathType: PathType;
    } {
        if (this.props.polylinesClosed === true) {
            return {
                func: () => true,
                pathType: "loop",
            };
        }
        if (Array.isArray(this.props.polylinesClosed)) {
            return {
                func: (lineIndex: number) => {
                    return (this.props.polylinesClosed as boolean[])[lineIndex];
                },
                pathType: null,
            };
        }
        return {
            func: null,
            pathType: "open",
        };
    }
}

PolylinesLayer.layerName = "PolylinesLayer";
PolylinesLayer.defaultProps = defaultProps;
