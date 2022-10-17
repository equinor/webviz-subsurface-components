import { GeoJsonLayer } from "@deck.gl/layers/typed";
import { Feature } from "geojson";
import { PickingInfo } from "@deck.gl/core/typed";
import { DeckGLLayerContext } from "../../components/Map";
import { isDrawingEnabled } from "../utils/layerTools";

export default class SelectableGeoJsonLayer extends GeoJsonLayer<Feature> {
    onClick(info: PickingInfo): boolean {
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
