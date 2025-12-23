import type { Accessor, Layer, LayersList } from "@deck.gl/core";
import { CompositeLayer } from "@deck.gl/core";
import { PathStyleExtension } from "@deck.gl/extensions";
import type { PathLayerProps } from "@deck.gl/layers";
import { PathLayer } from "@deck.gl/layers";
import type { PathGeometry } from "@deck.gl/layers/dist/path-layer/path";

type _DashedSectionsPathLayerProps<TData = unknown> = {
    getDashArray: Accessor<TData, [number, number]>;
    getDashedPathSection: Accessor<TData, PathGeometry>;
    getNormalPathSection: Accessor<TData, PathGeometry>;
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
            value: (object: any) => object.path,
        },
    };

    renderLayers(): Layer | null | LayersList {
        return [
            new PathLayer({
                ...this.getSubLayerProps({ id: "dashed-paths" }),
                ...this.props,

                data: this.props.data,
                getPath: this.props.getDashedPathSection,

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
                ...this.getSubLayerProps({ id: "solid-paths" }),
                ...this.props,
                data: this.props.data,
                getPath: this.props.getNormalPathSection,
            }),
        ];
    }
}
