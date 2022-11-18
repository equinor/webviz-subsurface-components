import {
    CompositeLayer,
    PickingInfo,
    LayerContext,
    LayersList,
} from "@deck.gl/core/typed";
import { ExtendedLayerProps } from "../utils/layerTools";
import { FeatureCollection } from "@nebula.gl/edit-modes";
import { layersDefaultProps } from "../layersDefaultProps";
import { SelectionLayer } from "@nebula.gl/layers";
export interface LassoLayerProps<D> extends ExtendedLayerProps<D> {
    mode: string; // One of modes in MODE_MAP
    selectedFeatureIndexes: number[];
}

// Composite layer that contains an EditableGeoJsonLayer from nebula.gl
// See https://nebula.gl/docs/api-reference/layers/editable-geojson-layer
export default class LassoLayer extends CompositeLayer<
    LassoLayerProps<FeatureCollection>
> {
    initializeState(context: LayerContext): void {
        super.initializeState(context);

        this.setState({
            data: this.props.data,
            selectedFeatureIndexes: this.props.selectedFeatureIndexes,
        });
    }

    renderLayers(): LayersList {
        if (this.props.visible == false) {
            return [];
        }
        const sub_layer_props = this.getSubLayerProps({
            id: "selection",
            selectionType: "rectangle",
            onSelect: (pickingInfos: PickingInfo[]) => {
                console.log(pickingInfos);
            },
            layerIds: ["wells-layer"],

            getTentativeFillColor: () => [255, 0, 255, 100],
            getTentativeLineColor: () => [0, 0, 255, 255],
            getTentativeLineDashArray: () => [0, 0],
            lineWidthMinPixels: 3,
        });

        // @ts-expect-error: EditableGeoJsonLayer from nebula.gl has no typing
        return [new SelectionLayer(sub_layer_props)];
    }
}

LassoLayer.layerName = "LassoLayer";
LassoLayer.defaultProps = layersDefaultProps[
    "LassoLayer"
] as LassoLayerProps<FeatureCollection>;
