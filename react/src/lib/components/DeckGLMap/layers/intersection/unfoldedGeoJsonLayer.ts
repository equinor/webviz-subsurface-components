import { GeoJsonLayer, GeoJsonLayerProps } from "@deck.gl/layers";
import UnfoldedPathLayer from "./unfoldedPathLayer";
import { Feature } from "geojson";

interface UnfoldedGeoJsonLayerProps<D> extends GeoJsonLayerProps<D> {
    isIntersectionView?: boolean;
}

export default class UnfoldedGeoJsonLayer<D = Feature> extends GeoJsonLayer<
    D,
    UnfoldedGeoJsonLayerProps<D>
> {
    renderLayers(): any[] {
        const layers = super.renderLayers();
        // const is_intersection_view =
        //     this.context.viewport.constructor.name === "IntersectionViewport";
        // if (is_intersection_view) {
        const path_layer_id = layers.findIndex(
            (layer) => layer?.[1].constructor.name == "PathLayer"
        );
        if (layers[path_layer_id]) {
            const props = layers[path_layer_id][1].props; //forwardProps(this, this.props);
            layers[path_layer_id][1] = new UnfoldedPathLayer<D>(props);
        }
        // }
        return layers;
    }
}

UnfoldedGeoJsonLayer.layerName = "UnfoldedGeoJsonLayer";
UnfoldedGeoJsonLayer.defaultProps = {
    isIntersectionView: false,
};
