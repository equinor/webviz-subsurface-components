import { CompositeLayer, UpdateParameters } from "@deck.gl/core/typed";
import { PathLayer } from "@deck.gl/layers/typed";
import { isEqual } from "lodash";

import {
    ExtendedLayerProps,
    invertZCoordinate,
    defineBoundingBox,
} from "../utils/layerTools";

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
                data: this.state["dataAttributes"],

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
        };
    }

    private loadData(): {
        linesCount: number;
        startIndices: Uint32Array;
        positions: Float32Array;
    } {
        return {
            linesCount: this.props.startIndices.length,
            positions: new Float32Array(this.props.polylinePoints),
            startIndices: new Uint32Array(this.props.startIndices),
        };
    }
}

PolylinesLayer.layerName = "PolylinesLayer";
PolylinesLayer.defaultProps = defaultProps;
