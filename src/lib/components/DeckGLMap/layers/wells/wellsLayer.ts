import { CompositeLayer } from "@deck.gl/core";
import { CompositeLayerProps } from "@deck.gl/core/lib/composite-layer";
import { GeoJsonLayer, GeoJsonLayerProps } from "@deck.gl/layers";
import { RGBAColor } from "@deck.gl/core/utils/color";

export interface WellsLayerProps<D> extends CompositeLayerProps<D> {
    pointRadiusScale: number;
    lineWidthScale: number;
    outline: boolean;
}

interface WellDataType {
    type: string;
    geometry: Record<string, unknown>;
    properties: {
        name: string;
        color: RGBAColor;
    };
}

function _getFillColor(d): RGBAColor {
    return d.properties.color;
}

export default class WellsLayer extends CompositeLayer<
    unknown,
    WellsLayerProps<unknown>
> {
    renderLayers(): GeoJsonLayer<unknown>[] {
        const properties: GeoJsonLayerProps<unknown> = {
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
        properties.getFillColor = _getFillColor;
        properties.getLineColor = properties.getFillColor;
        properties.pointRadiusScale = (properties.pointRadiusScale || 8) - 1;
        properties.lineWidthScale = (properties.lineWidthScale || 5) - 1;

        const colors = new GeoJsonLayer(this.getSubLayerProps(properties));

        if (this.props.outline) return [outline, colors];
        else return [colors];
    }
}

WellsLayer.layerName = "WellsLayer";
