import { CompositeLayer } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";

export default class WellsLayer extends CompositeLayer {
    renderLayers() {
        var properties = {
            id: "wells-shadow",
            data: this.props.data,
            opacity: this.props.opacity,
            pickable: true,
            pointRadiusUnits: "pixels",
            lineWidthUnits: "pixels",
            pointRadiusScale: this.props.pointRadiusScale,
            lineWidthScale: this.props.lineWidthScale,
        };

        const shadow = new GeoJsonLayer(properties);

        properties.id = "wells-color";
        properties.getFillColor = d => d.properties.color;
        properties.getLineColor = properties.getFillColor;
        properties.pointRadiusScale = properties.pointRadiusScale - 1;
        properties.lineWidthScale = properties.lineWidthScale - 1;

        const colors = new GeoJsonLayer(properties);

        return [shadow, colors];
    }
}

WellsLayer.layerName = "WellsLayer";
