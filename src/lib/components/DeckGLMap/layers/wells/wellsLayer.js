import { CompositeLayer } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";

export default class WellsLayer extends CompositeLayer {
    renderLayers() {
        let properties = {
            id: "outline",
            data: this.props.data,
            pickable: true,
            pointRadiusUnits: "pixels",
            lineWidthUnits: "pixels",
            pointRadiusScale: this.props.pointRadiusScale,
            lineWidthScale: this.props.lineWidthScale,
        };

        const outline = new GeoJsonLayer(this.getSubLayerProps(properties));

        properties.id = "colors";
        properties.getFillColor = d => d.properties.color;
        properties.getLineColor = properties.getFillColor;
        properties.pointRadiusScale = properties.pointRadiusScale - 1;
        properties.lineWidthScale = properties.lineWidthScale - 1;

        const colors = new GeoJsonLayer(this.getSubLayerProps(properties));

        if (this.props.outline) return [outline, colors];
        else return [colors];
    }
}

WellsLayer.layerName = "WellsLayer";
