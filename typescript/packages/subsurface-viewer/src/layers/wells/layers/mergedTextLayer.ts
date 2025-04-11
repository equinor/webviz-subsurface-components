import type {
    AccessorContext,
    Color,
    DefaultProps,
    Position,
    UpdateParameters,
} from "@deck.gl/core";
import { createIterable } from "@deck.gl/core";
import type { TextLayerProps } from "@deck.gl/layers";
import { TextLayer } from "@deck.gl/layers";
import createKdTree from "static-kdtree";
import type { Position3D } from "../../utils/layerTools";
import _ from "lodash";

export type MergedTextLayerProps<DataT = unknown> = TextLayerProps<DataT> & {
    /**
     * Merge well names that are near each other.
     * @default true
     */
    mergeLabels?: boolean;

    /**
     * The radius in measurement units to merge well names.
     * @default 20
     */
    mergeRadius?: number;
};

const DEFAULT_PROPS: DefaultProps<MergedTextLayerProps> = {
    mergeRadius: 100,
    mergeLabels: true,
};

export class MergedTextLayer<
    DataT,
    PropsT extends MergedTextLayerProps<DataT>,
> extends TextLayer<DataT, PropsT> {
    static defaultProps = DEFAULT_PROPS;
    static layerName = "MergedTextLayer";

    state!: {
        clusters: Map<Position, string[]>;
        labelPositions: Map<string, Position>;
        positionToText: Map<Position, string[]>;
    } & TextLayer<DataT, MergedTextLayerProps>["state"];

    public override shouldUpdateState(params: UpdateParameters<this>): boolean {
        if (params.changeFlags.propsOrDataChanged) {
            return true;
        }
        if (params.changeFlags.updateTriggersChanged) {
            return true;
        }
        return super.shouldUpdateState(params);
    }

    public override updateState(params: UpdateParameters<this>) {
        super.updateState(params);

        if (params.changeFlags.dataChanged) {
            this.updateLabelPositions();
        }

        if (params.changeFlags.propsOrDataChanged) {
            this.updateLabelClusters();
            this.updateInstanceState();
            this.setState({
                getText: _.bind(this.getText, this),
            });
        }
    }

    protected override getSubLayerProps(sublayerProps?: {
        id?: string;
        updateTriggers?: Record<string, unknown[]>;
        [propName: string]: unknown;
    }) {
        const newProps = {
            ...sublayerProps,
            getColor: _.bind(this.getColor, this),
            getFillColor: _.bind(this.getBackgroundColor, this),
            getLineColor: _.bind(this.getColor, this),
            updateTriggers: {
                ...sublayerProps?.updateTriggers,
                all: [this.props.mergeRadius, this.props.mergeLabels],
            },
        };

        return super.getSubLayerProps(newProps);
    }

    protected updateLabelPositions() {
        const { data, getText } = this.props;

        const { getPosition } = this.getSubLayerProps();

        const labelPositions = new Map<string, Position>();
        const positionToText = new Map<Position, string[]>();
        const { iterable, objectInfo } = createIterable(data);

        for (const object of iterable) {
            const text = getText(object, objectInfo);
            const position =
                typeof getPosition === "function"
                    ? getPosition(object, objectInfo)
                    : getPosition;

            if (_.isUndefined(position)) {
                continue;
            }

            labelPositions.set(text, position);

            if (positionToText.has(position)) {
                positionToText.get(position)?.push(text);
            } else {
                positionToText.set(position, [text]);
            }
        }
        this.setState({
            labelPositions,
            positionToText,
        });
    }

    protected updateInstanceState() {
        const { data } = this.props;
        let numInstances = 0;
        const startIndices = [0];

        const { iterable, objectInfo } = createIterable(data);

        for (const object of iterable) {
            const text = Array.from(this.getText(object, objectInfo));
            numInstances += text.length;
            startIndices.push(numInstances);
        }

        this.setState({
            numInstances,
            startIndices,
        });
    }

    protected updateLabelClusters() {
        const positions: Position[] = [...this.state.labelPositions.values()];

        if (positions.length === 0) {
            return;
        }

        const positionTree = createKdTree<3>(positions as Position3D[]);
        const clusters = new Map<Position, string[]>();

        for (const position of positions) {
            const neighbors: number[] = [];

            const visitor = (id: number) => {
                neighbors.push(id);
            };

            positionTree.rnn(
                position as Position3D,
                this.props.mergeRadius ?? 10,
                visitor
            );

            const text = this.state.positionToText.get(position);
            if (_.isUndefined(text)) {
                continue;
            }

            neighbors.sort();

            for (const id of neighbors) {
                const text = this.state.positionToText.get(positions[id]);
                if (_.isUndefined(text)) {
                    continue;
                }

                const cluster = clusters.get(position) ?? [];

                clusters.set(position, [...cluster, ...text]);
            }
        }

        this.setState({
            clusters,
        });
    }

    protected getText(object: DataT, objectInfo: AccessorContext<DataT>) {
        const { getText, mergeLabels } = this.props;
        const text = getText(object, objectInfo);

        if (!mergeLabels) {
            return text;
        }

        const position = this.state.labelPositions.get(text);

        if (_.isUndefined(position)) {
            return text;
        }

        const cluster = this.state.clusters.get(position);
        if (_.isUndefined(cluster)) {
            return text;
        }

        if (text === cluster[0] && cluster.length > 1) {
            return text + " ...";
        }

        return text;
    }

    protected getColor(
        object: DataT,
        objectInfo: AccessorContext<DataT>
    ): Color {
        const { getText, getColor, mergeLabels } = this.props;
        const text = getText(object, objectInfo);

        if (!mergeLabels) {
            return typeof getColor === "function"
                ? getColor(object, objectInfo)
                : getColor;
        }

        const position = this.state.labelPositions.get(text);

        if (_.isUndefined(position)) {
            return [255, 100, 100, 255];
        }

        const cluster = this.state.clusters.get(position);
        if (_.isUndefined(cluster)) {
            return [255, 100, 100, 255];
        }

        if (cluster[0] === text) {
            return typeof getColor === "function"
                ? getColor(object, objectInfo)
                : getColor;
        }

        return [0, 0, 0, 0];
    }

    protected getBackgroundColor(
        object: DataT,
        objectInfo: AccessorContext<DataT>
    ): Color {
        const { getText, getBackgroundColor, mergeLabels } = this.props;
        const text = getText(object, objectInfo);

        if (!mergeLabels) {
            return typeof getBackgroundColor === "function"
                ? getBackgroundColor(object, objectInfo)
                : getBackgroundColor;
        }

        const position = this.state.labelPositions.get(text);

        if (_.isUndefined(position)) {
            return [255, 255, 255, 255];
        }

        const cluster = this.state.clusters.get(position);
        if (_.isUndefined(cluster)) {
            return [0, 0, 0, 0];
        }

        if (cluster[0] === text) {
            return typeof getBackgroundColor === "function"
                ? getBackgroundColor(object, objectInfo)
                : getBackgroundColor;
        }

        return [0, 0, 0, 0];
    }
}
