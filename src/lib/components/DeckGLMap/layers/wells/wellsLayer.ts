import { CompositeLayer } from "@deck.gl/core";
import { CompositeLayerProps } from "@deck.gl/core/lib/composite-layer";
import { RGBAColor } from "@deck.gl/core/utils/color";
import { GeoJsonLayer } from "@deck.gl/layers";
import { PickInfo } from "deck.gl";
import { subtract, distance, dot } from 'mathjs'

import { Feature } from "geojson";

import { patchLayerProps } from "../utils/layerTools";

export interface WellsLayerProps<D> extends CompositeLayerProps<D> {
    pointRadiusScale: number;
    lineWidthScale: number;
    outline: boolean;
    selectedFeature: Feature;
    selectionEnabled: boolean;
}

const defaultProps = {
    autoHighlight: true,
    selectionEnabled: true,
};

function squared_distance(a, b) {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return dx * dx + dy * dy;
}

export default class WellsLayer extends CompositeLayer<
    Feature,
    WellsLayerProps<Feature>
> {
    onClick(info: PickInfo<Feature>): boolean {
        if (!this.props.selectionEnabled) {
            return false;
        }

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

    getPickingInfo({ info }) {
        if (info.object == null)
            return info;

        const measured_depths = info.object.properties.md[0];
        const trajectory = info.object.geometry.geometries[1].coordinates;

        const d2 = trajectory.map((element, index) => squared_distance(element, info.coordinate));

        // Enumerate squared distances.
        let index = Array.from(d2.entries());

        // Sort by squared distance.
        index = index.sort((a, b) => a[1] - b[1]);

        // Get the nearest indexes.
        const index0 = index[0][0];
        const index1 = index[1][0];

        // Get the nearest MD values.
        const md0 = measured_depths[index0];
        const md1 = measured_depths[index1];

        // Get the nearest survey points.
        const survey0 = trajectory[index0];
        const survey1 = trajectory[index1];

        const dv = distance(survey0, survey1);

        // Calculate the scalar projection onto segment.
        const v0 = subtract(info.coordinate, survey0);
        const v1 = subtract(survey1, survey0);
        const scalar_projection = dot(v0, v1) / dv;

        // Interpolate MD value.
        const c0 = scalar_projection / dv;
        const c1 = dv - c0;
        const md = (md0 * c1 + md1 * c0) / dv;
        
        return {
            ...info,
            propertyValue: md,
        };
    }
}

WellsLayer.layerName = "WellsLayer";
WellsLayer.defaultProps = defaultProps;
