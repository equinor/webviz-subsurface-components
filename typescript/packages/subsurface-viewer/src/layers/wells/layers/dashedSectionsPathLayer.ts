import type {
    Accessor,
    Layer,
    LayerData,
    LayersList,
    UpdateParameters,
} from "@deck.gl/core";
import { CompositeLayer } from "@deck.gl/core";
import { PathStyleExtension } from "@deck.gl/extensions";
import type { PathLayerProps } from "@deck.gl/layers";
import { PathLayer } from "@deck.gl/layers";
import type { PathGeometry } from "@deck.gl/layers/dist/path-layer/path";
import { getFromAccessor } from "../../utils/layerTools";

type PathSection = {
    id: string;
    type: "dashed" | "normal";
    path: PathGeometry;
};

type _DashedSectionsPathLayerProps<TData = unknown> = {
    getDashArray: Accessor<TData, [number, number]>;
    getDashedPathSection: Accessor<TData, PathGeometry[]>;
    getNormalPathSection: Accessor<TData, PathGeometry[]>;
};

export type DashedSectionsPathLayerProps<TData = unknown> = Omit<
    PathLayerProps<TData>,
    "getPath"
> &
    _DashedSectionsPathLayerProps<TData>;

export class DashedSectionsPathLayer<TData = unknown> extends CompositeLayer<
    DashedSectionsPathLayerProps<TData>
> {
    static layerName = "DashedSectionsPathLayer";
    static defaultProps = {
        ...PathLayer.defaultProps,
        getPath: undefined, // We're explicitly omitting the standard getPath
        getDashArray: PathStyleExtension.defaultProps.getDashArray,

        getDashedPathSection: {
            type: "accessor",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value: (object: any) => object.dashedPath,
        },

        getNormalPathSection: {
            type: "accessor",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value: (object: any) => object.normalPath,
        },
    };

    state!: {
        dashedPathSubLayerData: PathSection[];
        normalPathSubLayerData: PathSection[];
    };

    updateState({ changeFlags }: UpdateParameters<this>): void {
        if (!this.isLoaded) return;

        const data = this.props.data as LayerData<TData>;
        const { getDashedPathSection, getNormalPathSection } = this.props;

        if (!Array.isArray(data))
            throw Error(
                `Expected loaded data to be a list, instead got ${typeof data}`
            );

        const dashedPathComputeChange =
            changeFlags.updateTriggersChanged &&
            changeFlags.updateTriggersChanged["getDashedPathSection"];

        const normalPathComputeChange =
            changeFlags.updateTriggersChanged &&
            changeFlags.updateTriggersChanged["getNormalPathSection"];

        if (
            changeFlags.dataChanged ||
            dashedPathComputeChange ||
            normalPathComputeChange
        ) {
            // Each path will need to be split into two data sets based on whether the section is dashed or not.
            const dashedPathSubLayerData: PathSection[] = [];
            const normalPathSubLayerData: PathSection[] = [];

            for (let index = 0; index < data.length; index++) {
                const datum = data[index];
                //
                const itemContext = { data, index, target: [] };

                getFromAccessor(
                    getDashedPathSection,
                    datum,
                    itemContext
                )?.forEach((pathSection, i) => {
                    const sectionRow: PathSection = {
                        id: `path-${index}-dashed-section-${i}`,
                        type: "dashed",
                        path: pathSection,
                    };
                    dashedPathSubLayerData.push(
                        this.getSubLayerRow(sectionRow, datum, index)
                    );
                });

                getFromAccessor(
                    getNormalPathSection,
                    datum,
                    itemContext
                )?.forEach((pathSection, i) => {
                    const sectionRow: PathSection = {
                        id: `path-${index}-normal-section-${i}`,
                        type: "normal",
                        path: pathSection,
                    };
                    normalPathSubLayerData.push(
                        this.getSubLayerRow(sectionRow, datum, index)
                    );
                });
            }

            this.setState({ dashedPathSubLayerData, normalPathSubLayerData });
        }
    }

    renderLayers(): Layer | null | LayersList {
        return [
            new PathLayer({
                ...this.getSubLayerProps({ ...this.props, id: "dashed-paths" }),
                data: this.state.dashedPathSubLayerData,

                extensions: [
                    new PathStyleExtension({
                        dash: true,
                        highPrecisionDash: true,
                    }),
                ],
                getDashArray: this.props.getDashArray,
                dashGapPickable: true,
            }),

            new PathLayer({
                ...this.getSubLayerProps({ ...this.props, id: "solid-paths" }),
                data: this.state.normalPathSubLayerData,
            }),
        ];
    }
}
