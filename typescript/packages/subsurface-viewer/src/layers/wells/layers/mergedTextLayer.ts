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
     * @default 100
     */
    mergeRadius?: number;

    /**
     * Format the text for the list of labels in the cluster.
     * @default (texts) => texts[0] + " (+N)"
     */
    getClusterText: (texts: string[]) => string;
};

const DEFAULT_PROPS: DefaultProps<MergedTextLayerProps> = {
    mergeRadius: 100,
    mergeLabels: true,
    getClusterText: (texts: string[]) => {
        if (texts.length > 1) {
            // Elide the text if there are multiple labels in the cluster
            return `${texts[0]} (+${texts.length - 1})`;
        }
        return texts[0];
    },
};

/**
 * MergedTextLayer is a subclass of TextLayer that merges text labels
 * that are near each other.
 */
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
        return super.shouldUpdateState(params);
    }

    public override updateState(params: UpdateParameters<this>) {
        super.updateState(params);

        if (params.changeFlags.propsOrDataChanged) {
            this.updateLabelPositions();
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
        const allUpdateTriggers = sublayerProps?.updateTriggers?.["all"] ?? [];
        const newProps = {
            ...sublayerProps,
            getColor: _.bind(this.getColor, this),
            getFillColor: _.bind(this.getBackgroundColor, this),
            getLineColor: _.bind(this.getBorderColor, this),
            updateTriggers: {
                ...sublayerProps?.updateTriggers,
                all: [
                    ...allUpdateTriggers,
                    this.props.mergeRadius,
                    this.props.mergeLabels,
                    this.props.getPosition,
                ],
            },
        };

        return super.getSubLayerProps(newProps);
    }

    protected updateLabelPositions() {
        const { data, getText } = this.props;

        let { getPosition } = this.getSubLayerProps({ ...this.props });
        if (_.isUndefined(getPosition)) {
            getPosition = this.props.getPosition;
        }

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

    /**
     * `TextLayer` ignores `getText` from derived layers, so we need
     * to override the state here
     */
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

        positionTree.dispose();
    }

    protected getText(object: DataT, objectInfo: AccessorContext<DataT>) {
        const { getText, mergeLabels, getClusterText } = this.props;
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

        if (text === cluster[0]) {
            return getClusterText(cluster);
        }

        // Hide the text if it is not the first label in the cluster
        return "";
    }

    protected getBorderColor(
        object: DataT,
        objectInfo: AccessorContext<DataT>
    ): Color {
        const { getText, getBorderColor, mergeLabels } = this.props;
        const text = getText(object, objectInfo);
        const borderColor =
            typeof getBorderColor === "function"
                ? getBorderColor(object, objectInfo)
                : getBorderColor;

        if (!mergeLabels) {
            return borderColor;
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
            return borderColor;
        }

        return [borderColor[0], borderColor[1], borderColor[2], 0];
    }

    protected getColor(
        object: DataT,
        objectInfo: AccessorContext<DataT>
    ): Color {
        const { getText, getColor, mergeLabels } = this.props;
        const text = getText(object, objectInfo);

        const color =
            typeof getColor === "function"
                ? getColor(object, objectInfo)
                : getColor;

        if (!mergeLabels) {
            return color;
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
            return color;
        }

        // Hide the text if it is not the first label in the cluster, in which case it will be
        // elided
        return [0, 0, 0, 0];
    }

    protected getBackgroundColor(
        object: DataT,
        objectInfo: AccessorContext<DataT>
    ): Color {
        const { getText, getBackgroundColor, mergeLabels } = this.props;
        const text = getText(object, objectInfo);

        const backgroundColor =
            typeof getBackgroundColor === "function"
                ? getBackgroundColor(object, objectInfo)
                : getBackgroundColor;

        if (!mergeLabels) {
            return backgroundColor;
        }

        const position = this.state.labelPositions.get(text);

        if (_.isUndefined(position)) {
            return [255, 100, 100, 255];
        }

        const cluster = this.state.clusters.get(position);
        if (_.isUndefined(cluster)) {
            return [0, 0, 0, 0];
        }

        if (cluster[0] === text) {
            return backgroundColor;
        }

        return [backgroundColor[0], backgroundColor[1], backgroundColor[2], 0];
    }
}
