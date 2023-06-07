import { CompositeLayer, UpdateParameters } from "@deck.gl/core/typed";
import { PathLayer } from "@deck.gl/layers/typed";
import { isEqual } from "lodash";

import {
    ExtendedLayerProps,
    invertZCoordinate,
    defineBoundingBox,
} from "../utils/layerTools";

type TIsPolylineClosedFunc = (index: number) => boolean;

/**
 * _pathType is Deck.GL PathLayer prop. If all the polylines are "open" or are "loop" some checks are skept for better performance.
 * If this prop is not set or null PathLayer checks closeness by comparing coordinates and decides how to draw the polylines.
 */
type TPathType = "open" | "loop" | null;

export interface PolylinesLayerProps<D> extends ExtendedLayerProps<D> {
    /**
     * Polyline vertices as [x, y, z, x, y, z....].
     */
    polylinePoints: number[];

    /**
      Start indices of the polylines counted in vertex indices.
      For example, if there are 3 paths of 2, 3, and 4 vertices each, startIndices should be [0, 2, 5].
     */
    startIndices: number[];

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

    /**
     * If true means that input z values are interpreted as depths.
     * For example depth of z = 1000 corresponds to -1000 on the z axis. Default true.
     */
    ZIncreasingDownwards: boolean;

    // Non public properties:
    setReportedBoundingBox?: React.Dispatch<
        React.SetStateAction<[number, number, number, number, number, number]>
    >;
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
    pathType: TPathType;
}

export default class PolylinesLayer extends CompositeLayer<
    PolylinesLayerProps<unknown>
> {
    renderLayers(): [PathLayer?] {
        const layer = new PathLayer(
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
        if (this.props.ZIncreasingDownwards) {
            invertZCoordinate(dataArrays.positions);
        }
        if (
            typeof this.props.setReportedBoundingBox === "function" &&
            reportBoundingBox
        ) {
            const boundingBox = defineBoundingBox(dataArrays.positions);
            this.props.setReportedBoundingBox(boundingBox);
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

    private loadData(): {
        linesCount: number;
        startIndices: Uint32Array;
        positions: Float32Array;
        pathType: TPathType;
    } {
        this.normalizeStartIndices();
        const data = this.closePolylines();

        return {
            linesCount: data.startIndices.length,
            positions: new Float32Array(data.polylinePoints),
            startIndices: new Uint32Array(data.startIndices),
            pathType: data.pathType,
        };
    }

    private closePolylines(): {
        polylinePoints: number[];
        startIndices: number[];
        pathType: TPathType;
    } {
        const isClosedFunc = this.createIsClosedFunc();
        if (!isClosedFunc.func) {
            return {
                polylinePoints: this.props.polylinePoints,
                startIndices: this.props.startIndices,
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
                this.closePolyline(i, closedPoints);
                ++startIndexShift;
            } else {
                this.copyPolyline(i, closedPoints);
            }
        }
        return {
            polylinePoints: closedPoints,
            startIndices: closedStartIndices,
            pathType: isClosedFunc.pathType,
        };
    }

    private normalizeStartIndices() {
        const lastIndex = this.props.startIndices.slice(-1)[0];
        const totalPointsCount = this.props.polylinePoints.length / 3;
        if (lastIndex < totalPointsCount) {
            this.props.startIndices.push(totalPointsCount);
        }
    }

    private copyPolyline(lineIndex: number, outPoints: number[]) {
        const startPoint = this.props.startIndices[lineIndex];
        const endPoint = this.props.startIndices[lineIndex + 1];
        for (let idx = startPoint; idx < endPoint; ++idx) {
            outPoints.push(...this.getPolylinePoint(idx));
        }
    }

    private closePolyline(lineIndex: number, outPoints: number[]) {
        this.copyPolyline(lineIndex, outPoints);
        const startPoint = this.props.startIndices[lineIndex];
        outPoints.push(...this.getPolylinePoint(startPoint));
    }

    private getPolylinePoint(index: number): number[] {
        return this.props.polylinePoints.slice(3 * index, 3 * (index + 1));
    }

    private createIsClosedFunc(): {
        func: TIsPolylineClosedFunc | null;
        pathType: TPathType;
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
