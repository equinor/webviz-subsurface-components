import { CompositeLayer } from "@deck.gl/core";
import { CompositeLayerProps } from "@deck.gl/core/lib/composite-layer";
import { GeoJsonLayer } from "@deck.gl/layers";

export interface WellsLayerProps<D> extends CompositeLayerProps<D> {
    pointRadiusScale: number;
    lineWidthScale: number;
    outline: boolean;
}

function getOutlineColor() {
    return [0, 0, 0, 255];
}

export default class WellsLayer extends CompositeLayer<
    unknown,
    WellsLayerProps<unknown>
> {
    renderLayers() {
        const properties: any = {
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
