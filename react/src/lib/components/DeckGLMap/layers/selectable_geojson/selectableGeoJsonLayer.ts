import { GeoJsonLayer } from "@deck.gl/layers";
import { FeatureCollection } from "geojson";
import { PickInfo } from "deck.gl";
import { DeckGLLayerContext } from "../../components/Map";
import { isDrawingEnabled } from "../utils/layerTools";

export default class SelectableGeoJsonLayer extends GeoJsonLayer<FeatureCollection> {
    onClick(info: PickInfo<FeatureCollection>): boolean {
        // Make selection only when drawing is disabled
        if (isDrawingEnabled(this.context.layerManager)) {
            return false;
        } else {
            (this.context as DeckGLLayerContext).userData.setEditedData({
                selectedGeoJsonFeature: info.object,
            });
            return true;
        }
    }
}

SelectableGeoJsonLayer.layerName = "SelectableGeoJsonLayer";
SelectableGeoJsonLayer.defaultProps = {
    visible: true,
    pickable: true,
};
