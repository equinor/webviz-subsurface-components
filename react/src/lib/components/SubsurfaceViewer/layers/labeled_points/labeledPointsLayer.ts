import { CompositeLayer, UpdateParameters } from "@deck.gl/core/typed";
import { ScatterplotLayer } from "@deck.gl/layers/typed";
import { isEqual } from "lodash";

import { ExtendedLayerProps } from "../utils/layerTools";

export interface LabeledPointsLayerProps<D> extends ExtendedLayerProps<D> {
    pointsData: number[];

    color: [number, number, number];

    radiusUnits: "meters" | "common" | "pixels";

    pointRadius: number;

    depthTest: boolean;
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
    depthTest: true,
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
                depthTest: this.props.depthTest,
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
            this.invertZCoordinate(dataArray);
        }
        if (
            typeof this.props.setReportedBoundingBox === "function" &&
            reportBoundingBox
        ) {
            const boundingBox = this.defineBoundingBox(dataArray);
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

    private invertZCoordinate(dataArray: Float32Array) {
        for (let i = 2; i < dataArray.length; i += 3) {
            dataArray[i] *= -1;
        }
    }

    private defineBoundingBox(
        dataArray: Float32Array
    ): [number, number, number, number, number, number] {
        const length = dataArray.length;
        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let minZ = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;
        let maxZ = Number.NEGATIVE_INFINITY;

        for (let i = 0; i < length; i += 3) {
            const x = dataArray[i];
            const y = dataArray[i + 1];
            const z = dataArray[i + 2];
            minX = x < minX ? x : minX;
            minY = y < minY ? y : minY;
            minZ = z < minZ ? z : minZ;

            maxX = x > maxX ? x : maxX;
            maxY = y > maxY ? y : maxY;
            maxZ = z > maxZ ? z : maxZ;
        }
        return [minX, minY, minZ, maxX, maxY, maxZ];
    }
}

LabeledPointsLayer.layerName = "LabeledPointsLayer";
LabeledPointsLayer.defaultProps = defaultProps;
