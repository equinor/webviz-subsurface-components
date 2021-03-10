import { CompositeLayer } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";

export default class WellsLayer extends CompositeLayer {

    renderLayers() {
        const shadow = new GeoJsonLayer({
            id: "well-shadow",
            data: this.props.data,
            pickable: true,
            pointRadiusMinPixels: 9,
            pointRadiusMaxPixels: 15,
            lineWidthMinPixels: 5,
            lineWidthMaxPixels: 6,
        });

        const colored = new GeoJsonLayer({
            data: this.props.data,
            pickable: true,
            pointRadiusMinPixels: 7,
            pointRadiusMaxPixels: 13,
            lineWidthMinPixels: 3,
            lineWidthMaxPixels: 4,
            getFillColor: d => d.properties.color,
            getLineColor: d => d.properties.color,
        });

        return [shadow, colored];
    }
}

WellsLayer.layerName = "WellsLayer";
