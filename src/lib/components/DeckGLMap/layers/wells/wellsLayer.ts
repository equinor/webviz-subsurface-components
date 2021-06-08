import { CompositeLayer } from "@deck.gl/core";

import { CompositeLayerProps } from "@deck.gl/core/lib/composite-layer";
import { GeoJsonLayer, PathLayer } from "@deck.gl/layers";
import { RGBAColor } from "@deck.gl/core/utils/color";
import { PickInfo } from "deck.gl";

import { Feature } from "geojson";

import { patchLayerProps } from "../utils/layerTools";

import { interpolateRgbBasis } from "d3-interpolate";
import { color } from "d3-color";

export interface LogCurveDataType {
    header: {
        name: string;
    };
    curves: {
        name: string;
        description: string;
    }[];
    data: number[][];
}

export interface WellsLayerProps<D> extends CompositeLayerProps<D> {
    pointRadiusScale: number;
    lineWidthScale: number;
    outline: boolean;
    selectedFeature: Feature;
    logData: string;
    logName: string;
    logRadius: number;
    logCurves: boolean;
}

let COLOR_MAP: RGBAColor[] = [
    [0, 0, 0, 255],
    [0, 255, 0, 255],
    [0, 0, 255, 255],
    [255, 255, 0, 255],
    [255, 0, 255, 255],
    [0, 255, 255, 255],
    [125, 125, 255, 255],
    [125, 255, 125, 255],
    [255, 125, 125, 255]
]

function getLogIDByName(d: LogCurveDataType, log_name: string) {
    return d.curves.findIndex(item => item.name.toLowerCase() === log_name.toLowerCase())
}

const color_interp = interpolateRgbBasis(["red", "yellow", "green", "blue"]);
function getLogColor(d: LogCurveDataType, log_name: string): RGBAColor[] {
    const log_id = getLogIDByName(d, log_name)
    if (d.curves[log_id] == undefined) {
        return [];
    }

    let log_color: RGBAColor[] = [];
    if (d.curves[log_id].description == "continuous") {
        const min = Math.min(...d.data[log_id])
        const max = Math.max(...d.data[log_id])
        const max_delta = max-min;
        d.data[log_id].forEach(value => {
            var rgb = color(color_interp((value-min)/max_delta))?.rgb();
            if (rgb != undefined) {
                log_color.push([rgb.r, rgb.g, rgb.b])
            }
        });
    }
    else {
        d.data[log_id].forEach(value => {
            log_color.push(COLOR_MAP[value%10]);
        });
    }
    return log_color;
}

function getLogWidth(d: LogCurveDataType, log_name: string): number[] {
    const log_id = getLogIDByName(d, log_name)
    return d.data[log_id]
}

const defaultProps = {
    autoHighlight: true,
};

export default class WellsLayer extends CompositeLayer<
    Feature,
    WellsLayerProps<Feature>
> {
    onClick(info: PickInfo<Feature>): boolean {
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

        const lc_layer = new PathLayer<LogCurveDataType>(
            this.getSubLayerProps({
                id: "log_curve",
                data: this.props.logData,
                pickable: false,
                widthScale: 10,
                widthMinPixels: 1,
                miterLimit: 100,
                getPath: (d: LogCurveDataType): number[] => d.data[0],
                getColor: (d:LogCurveDataType): RGBAColor[] =>
                            getLogColor(d, this.props.logName),
                getWidth: (d:LogCurveDataType): number | number[] =>
                            (this.props.logRadius || getLogWidth(d, this.props.logName)),
                updateTriggers: {
                    getColor: [this.props.logName],
                    getWidth: [this.props.logName, this.props.logRadius]
                }
            })
        );

        let layers = [colors]
        if (this.props.outline) {
            layers.splice(0, 0, outline)
        }
        if (this.props.logCurves) {
            layers.splice(1, 0, lc_layer)
        }
        return layers;
    }
}

WellsLayer.layerName = "WellsLayer";
WellsLayer.defaultProps = defaultProps;
