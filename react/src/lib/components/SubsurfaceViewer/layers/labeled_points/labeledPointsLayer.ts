import { CompositeLayer, UpdateParameters } from "@deck.gl/core/typed";
import { ScatterplotLayer } from "@deck.gl/layers/typed";
import { isEqual } from "lodash";

import {
    ExtendedLayerProps,
    invertZCoordinate,
    defineBoundingBox,
} from "../utils/layerTools";

export interface LabeledPointsLayerProps<D> extends ExtendedLayerProps<D> {
    /**
     * Point positions as [x, y, z, x, y, z....].
     */
    pointsData: number[];

    /**
     * Point color defined as RGB or RGBA array. Each component is in 0-255 range.
     */
    color: [number, number, number] | [number, number, number, number];

    /**
     * The units of the point radius, one of `'meters'`, `'common'`, and `'pixels'`.
     */
    radiusUnits: "meters" | "common" | "pixels";

    /**
     * Point radius defined in radius units.
     */
    pointRadius: number;

    /**  If true means that input z values are interpreted as depths.
     * For example depth of z = 1000 corresponds to -1000 on the z axis. Default true.
     */
    ZIncreasingDownwards: boolean;

    // Non public properties:
    setReportedBoundingBox?: React.Dispatch<
        React.SetStateAction<[number, number, number, number, number, number]>
    >;
}

const defaultProps = {
    "@@type": "LabeledPointsLayer",
    name: "LabeledPointsLayer",
    id: "labeled-points-layer",
    color: [125, 0, 0, 255],
    radiusUnits: "pixels",
    pointRadius: 5,
    pickable: true,
    visible: true,
    ZIncreasingDownwards: true,
};

interface IDataAttributes {
    length: number;
    attributes: {
        getPosition: {
            value: Float32Array;
            size: number;
        };
    };
}

export default class LabeledPointsLayer extends CompositeLayer<
    LabeledPointsLayerProps<unknown>
> {
    renderLayers(): [ScatterplotLayer?] {
        const layer = new ScatterplotLayer(
            this.getSubLayerProps({
                id: "points-layer",
                pickable: this.props.pickable,
                billboard: true,
                data: this.state["dataAttributes"],
                _pathType: "open",
                getFillColor: () => this.props.color,
                getRadius: () => this.props.pointRadius,
                radiusUnits: this.props.radiusUnits,

                updateTriggers: {
                    getFillColor: [this.props.color],
                    getRadius: [this.props.pointRadius],
                },
            })
        );
        return [layer];
    }

    initializeState(): void {
        const dataAttributes = this.rebuildDataAttributes(true);
        this.setState({ dataAttributes });
    }

    updateState({
        props,
        oldProps,
    }: UpdateParameters<LabeledPointsLayer>): void {
        const needs_reload =
            !isEqual(props.pointsData, oldProps.pointsData) ||
            !isEqual(props.ZIncreasingDownwards, oldProps.ZIncreasingDownwards);

        if (needs_reload) {
            const dataAttributes = this.rebuildDataAttributes(false);
            this.setState({ dataAttributes });
        }
    }

    private rebuildDataAttributes(
        reportBoundingBox: boolean
    ): IDataAttributes | null {
        const dataArray = this.loadData();
        if (!dataArray) {
            return null;
        }
        if (this.props.ZIncreasingDownwards) {
            invertZCoordinate(dataArray);
        }
        if (
            typeof this.props.setReportedBoundingBox === "function" &&
            reportBoundingBox
        ) {
            const boundingBox = defineBoundingBox(dataArray);
            this.props.setReportedBoundingBox(boundingBox);
        }

        return {
            length: dataArray.length / 3,
            attributes: {
                getPosition: {
                    value: dataArray,
                    size: 3,
                },
            },
        };
    }

    private loadData(): Float32Array | null {
        if (Array.isArray(this.props.pointsData)) {
            return new Float32Array(this.props.pointsData);
        }
        return new Float32Array();
    }
}

LabeledPointsLayer.layerName = "LabeledPointsLayer";
LabeledPointsLayer.defaultProps = defaultProps;
