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

export type MergedTextLayerProps = TextLayerProps & {
    mergeRadius?: number;
};

const DEFAULT_PROPS: DefaultProps<MergedTextLayerProps> = {
    mergeRadius: 10,
};

export class MergedTextLayer<DataT> extends TextLayer<
    DataT,
    MergedTextLayerProps
> {
    static defaultProps = DEFAULT_PROPS;
    static layerName = "MergedTextLayer";

    state!: {
        clusters: Map<Position, string[]>;
        labelPositions: Map<string, Position>;
        //positionTree: ReturnType<typeof createKdTree<3>>;
        positionToText: Map<Position, string[]>;
    } & TextLayer<DataT, MergedTextLayerProps>["state"];

    public override shouldUpdateState(params: UpdateParameters<this>): boolean {
        if (params.changeFlags.dataChanged) {
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
        const textUpdateTriggers =
            sublayerProps?.updateTriggers?.["getText"] ?? [];

        const colorUpdateTriggers =
            sublayerProps?.updateTriggers?.["getColor"] ?? [];

        const fillUpdateTriggers =
            sublayerProps?.updateTriggers?.["getFillColor"] ?? [];

        const iconUpdateTriggers =
            sublayerProps?.updateTriggers?.["getIcon"] ?? [];

        const newProps = {
            ...sublayerProps,
            getColor: _.bind(this.getColor, this),
            getFillColor: _.bind(this.getBackgroundColor, this),
            getLineColor: _.bind(this.getColor, this),
            updateTriggers: {
                ...sublayerProps?.updateTriggers,
                getIconOffsets: [
                    ...iconUpdateTriggers,
                    this.props.mergeRadius,
                    this.state.numInstances,
                    this.state.startIndices,
                ],
                getIcon: [
                    ...iconUpdateTriggers,
                    this.props.mergeRadius,
                    this.state.numInstances,
                    this.state.startIndices,
                ],
                getColor: [
                    ...colorUpdateTriggers,
                    this.state.clusters,
                    this.props.mergeRadius,
                ],
                getFillColor: [
                    ...fillUpdateTriggers,
                    this.state.clusters,
                    this.props.mergeRadius,
                ],
                getLineColor: [this.state.clusters, this.props.mergeRadius],
                all: [
                    this.state.clusters,
                    this.props.mergeRadius,
                    this.props.numInstances,
                    this.props.startIndices,
                ],
            },
        };

        const tmpProps = super.getSubLayerProps(newProps);

        return tmpProps;
    }

    protected updateLabelPositions() {
        const { data, getText, getPosition } = this.props;
        const labelPositions = new Map<string, Position>();
        const positionToText = new Map<Position, string[]>();
        const { iterable, objectInfo } = createIterable(data);

        for (const object of iterable) {
            const text = getText(object, objectInfo);
            const position =
                typeof getPosition === "function"
                    ? getPosition(object, objectInfo)
                    : getPosition;
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
        console.log("startIndices", startIndices);
        console.log("numInstances", numInstances);

        this.setState({
            numInstances,
            startIndices,
        });
    }

    protected updateLabelClusters() {
        const positions: Position[] = [...this.state.labelPositions.values()];

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

        console.log("clusters", clusters);

        this.setState({
            //positionTree,
            clusters,
        });
    }

    protected getText(object: unknown, objectInfo: AccessorContext<unknown>) {
        const { getText } = this.props;
        const text = getText(object, objectInfo);
        const position = this.state.labelPositions.get(text);

        if (_.isUndefined(position)) {
            return "undef";
        }

        const cluster = this.state.clusters.get(position);
        if (_.isUndefined(cluster)) {
            return "undef";
        }

        if (text === cluster[0] && cluster.length > 1) {
            console.log("text", text + " ...");
            return text + " ...";
        }

        console.log("text", text);
        return text;
    }

    protected getColor(
        object: unknown,
        objectInfo: AccessorContext<unknown>
    ): number[] {
        const { getText } = this.props;
        const text = getText(object, objectInfo);
        const position = this.state.labelPositions.get(text);

        if (_.isUndefined(position)) {
            return [255, 100, 100, 255];
        }

        const cluster = this.state.clusters.get(position);
        if (_.isUndefined(cluster)) {
            return [255, 100, 100, 255];
        }

        if (cluster[0] === text) {
            return [0, 0, 0, 255];
        }

        return [0, 0, 0, 0];
    }

    protected getBackgroundColor(
        object: DataT,
        objectInfo: AccessorContext<DataT>
    ): Color {
        const { getText, getBackgroundColor } = this.props;
        const text = getText(object, objectInfo);
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
