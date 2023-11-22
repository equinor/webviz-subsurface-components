import type { PickingInfo, UpdateParameters } from "@deck.gl/core/typed";
import { CompositeLayer } from "@deck.gl/core/typed";
import { isEqual } from "lodash";

import type {
    PropertyDataType,
    ExtendedLayerProps,
    LayerPickInfo,
} from "../utils/layerTools";
import {
    createPropertyData,
    invertZCoordinate,
    defineBoundingBox,
} from "../utils/layerTools";

import { PrivatePointsLayer } from "./privatePointsLayer";

export interface PointsLayerProps extends ExtendedLayerProps {
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
    "@@type": "PointsLayer",
    name: "PointsLayer",
    id: "points-layer",
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

export default class PointsLayer extends CompositeLayer<PointsLayerProps> {
    renderLayers(): [PrivatePointsLayer?] {
        const layer = new PrivatePointsLayer(
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

    updateState({ props, oldProps }: UpdateParameters<PointsLayer>): void {
        const needs_reload =
            !isEqual(props.pointsData, oldProps.pointsData) ||
            !isEqual(props.ZIncreasingDownwards, oldProps.ZIncreasingDownwards);

        if (needs_reload) {
            const dataAttributes = this.rebuildDataAttributes(false);
            this.setState({ dataAttributes });
        }
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

PointsLayer.layerName = "PointsLayer";
PointsLayer.defaultProps = defaultProps;
