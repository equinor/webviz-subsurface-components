import { CompositeLayer } from "@deck.gl/core";
import { GeoJsonLayer } from "@deck.gl/layers";

import { CompositeLayerProps } from "@deck.gl/core/lib/composite-layer";
import { RGBAColor } from "@deck.gl/core/utils/color";

import { Feature } from "geojson";

// TODO : organize imports (see all files)
import { patchLayerProps } from "../utils/layerTools";

export interface WellsLayerProps<D> extends CompositeLayerProps<D> {
    pointRadiusScale: number;
    lineWidthScale: number;
    outline: boolean;
    selectedFeature: Feature;
}

const defaultProps = {
    autoHighlight: true,
};

export default class WellsLayer extends CompositeLayer<
    Feature,
    WellsLayerProps<Feature>
> {
    // TODO: types EVERYWHERE!
    onClick(info: any): any {
        patchLayerProps(this, {
            ...this.props,
            selectedFeature: info.object,
        });
        return true;
    }

    renderLayers(): GeoJsonLayer<Feature>[] {
        const outline = new GeoJsonLayer<Feature>(
            this.getSubLayerProps({
                id: "outline",
                data: this.props.data,
                pickable: false,
                stroked: false,
                pointRadiusUnits: "pixels",
                lineWidthUnits: "pixels",
                pointRadiusScale: this.props.pointRadiusScale,
                lineWidthScale: this.props.lineWidthScale,
            })
        );

        const getColor = (d: Feature): RGBAColor => d?.properties?.color;
        const colors = new GeoJsonLayer<Feature>(
            this.getSubLayerProps({
                id: "colors",
                data: this.props.data,
                pickable: true,
                stroked: false,
                pointRadiusUnits: "pixels",
                lineWidthUnits: "pixels",
                pointRadiusScale: this.props.pointRadiusScale - 1,
                lineWidthScale: this.props.lineWidthScale - 1,
                getFillColor: getColor,
                getLineColor: getColor,
            })
        );

        // Highlight the selected well.
        const highlight = new GeoJsonLayer<Feature>(
            this.getSubLayerProps({
                id: "highlight",
                data: this.props.selectedFeature,
                pickable: false,
                stroked: false,
                pointRadiusUnits: "pixels",
                lineWidthUnits: "pixels",
                pointRadiusScale: this.props.pointRadiusScale + 2,
                lineWidthScale: this.props.lineWidthScale + 2,
                getFillColor: getColor,
                getLineColor: getColor,
            })
        );

        if (this.props.outline) return [outline, colors, highlight];
        else return [colors, highlight];
    }
}

WellsLayer.layerName = "WellsLayer";
WellsLayer.defaultProps = defaultProps;
