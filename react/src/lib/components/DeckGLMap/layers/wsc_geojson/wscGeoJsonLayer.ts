import { GeoJsonLayer } from "@deck.gl/layers";
import { FeatureCollection } from "geojson";
import { PickInfo } from "deck.gl";

export default class WscGeoJsonLayer extends GeoJsonLayer<FeatureCollection> {
    onClick(info: PickInfo<FeatureCollection>): boolean {
        // Disable selection when drawing is enabled
        const drawing_layer = this.context.layerManager.getLayers({
            layerIds: ["drawing-layer"],
        })?.[0];
        const is_drawing_enabled =
            drawing_layer && drawing_layer.props.mode != "view";
        if (is_drawing_enabled) return false;

        console.log(info.object);
        return true;
    }
}

WscGeoJsonLayer.layerName = "WscGeoJsonLayer";
WscGeoJsonLayer.defaultProps = {
    visible: true,
    pickable: true,
};
