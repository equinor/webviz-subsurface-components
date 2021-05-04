import { CompositeLayer } from "@deck.gl/core";
import { GeoJsonLayer, GeoJsonLayerProps } from "@deck.gl/layers";

import { CompositeLayerProps } from "@deck.gl/core/lib/composite-layer";
import { RGBAColor } from "@deck.gl/core/utils/color";

import { Feature } from "geojson";

export interface WellsLayerProps<D> extends CompositeLayerProps<D> {
    pointRadiusScale: number;
    lineWidthScale: number;
    outline: boolean;
    selectedFeature: Feature;
}

function handleClick(event) {
    this.setLayerProps("wells-layer", { selectedFeature: event.object });
    return true;
}

const defaultProps = {
    onClick: handleClick,
    autoHighlight: true,
};

export default class WellsLayer extends CompositeLayer<
    Feature,
    WellsLayerProps<Feature>
> {
    renderLayers(): GeoJsonLayer<Feature>[] {
        const properties: GeoJsonLayerProps<Feature> = {
            id: "outline",
            data: this.props.data,
            pickable: true,
            pointRadiusUnits: "pixels",
            lineWidthUnits: "pixels",
            pointRadiusScale: this.props.pointRadiusScale,
            lineWidthScale: this.props.lineWidthScale,
        };

        const outline = new GeoJsonLayer<Feature>(
            this.getSubLayerProps(properties)
        );

        properties.id = "colors";
        properties.getFillColor = (d: Feature): RGBAColor =>
            d?.properties?.color;
        properties.getLineColor = properties.getFillColor;
        properties.pointRadiusScale = (properties.pointRadiusScale || 8) - 1;
        properties.lineWidthScale = (properties.lineWidthScale || 5) - 1;

        const colors = new GeoJsonLayer<Feature>(
            this.getSubLayerProps(properties)
        );

        // Highlight the selected well.
        properties.data = this.props.selectedFeature;
        properties.pointRadiusScale = properties.pointRadiusScale + 2;
        properties.lineWidthScale = properties.lineWidthScale + 2;
        const highlight = new GeoJsonLayer<Feature>(
            this.getSubLayerProps(properties)
        );

        if (this.props.outline) return [outline, colors, highlight];
        else return [colors, highlight];
    }
}

WellsLayer.layerName = "WellsLayer";
WellsLayer.defaultProps = defaultProps;
