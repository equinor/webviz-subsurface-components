import { CompositeLayer } from "@deck.gl/core";
import { GeoJsonLayer, GeoJsonLayerProps } from "@deck.gl/layers";

import { CompositeLayerProps } from "@deck.gl/core/lib/composite-layer";
import { RGBAColor } from "@deck.gl/core/utils/color";

export interface WellsLayerProps<D> extends CompositeLayerProps<D> {
    pointRadiusScale: number;
    lineWidthScale: number;
    outline: boolean;
}

export interface WellDataType {
    type: string;
    geometry: Record<string, unknown>;
    properties: {
        name: string;
        color: RGBAColor;
    };
}

function handleClick(event) {
    this.setLayerProps("wells-layer", {selectedFeature: event.object});
    return true;
}

const defaultProps = {
    onClick: handleClick,
    autoHighlight: true,
};

export default class WellsLayer extends CompositeLayer<
    WellDataType,
    WellsLayerProps<WellDataType>
> {
    renderLayers(): GeoJsonLayer<WellDataType>[] {
        const properties: GeoJsonLayerProps<WellDataType> = {
            id: "outline",
            data: this.props.data,
            pickable: true,
            pointRadiusUnits: "pixels",
            lineWidthUnits: "pixels",
            pointRadiusScale: this.props.pointRadiusScale,
            lineWidthScale: this.props.lineWidthScale,
        };

        const outline = new GeoJsonLayer<WellDataType>(
            this.getSubLayerProps(properties)
        );

        properties.id = "colors";
        properties.getFillColor = (d: WellDataType): RGBAColor =>
            d.properties.color;
        properties.getLineColor = properties.getFillColor;
        properties.pointRadiusScale = (properties.pointRadiusScale || 8) - 1;
        properties.lineWidthScale = (properties.lineWidthScale || 5) - 1;

        const colors = new GeoJsonLayer<WellDataType>(
            this.getSubLayerProps(properties)
        );

        // Highlight the selected well.
        properties.data = this.props.selectedFeature;
        properties.pointRadiusScale = properties.pointRadiusScale + 2;
        properties.lineWidthScale = properties.lineWidthScale + 2;
        const highlight = new GeoJsonLayer<WellDataType>(properties);

        if (this.props.outline) return [outline, colors, highlight];
        else return [colors, highlight];
    }
}

WellsLayer.layerName = "WellsLayer";
WellsLayer.defaultProps = defaultProps;
