import { CompositeLayer } from "@deck.gl/core";

import { CompositeLayerProps } from "@deck.gl/core/lib/composite-layer";
import { RGBAColor } from "@deck.gl/core/utils/color";
import { GeoJsonLayer, PathLayer } from "@deck.gl/layers";
import { PickInfo } from "deck.gl";

import { Feature } from "geojson";

import { patchLayerProps } from "../utils/layerTools";

export interface WellsLayerProps<D> extends CompositeLayerProps<D> {
    pointRadiusScale: number;
    lineWidthScale: number;
    outline: boolean;
    selectedFeature: Feature;
}

export interface LogCurveDataType {
    header: {
        name: string;
    };
    curves: {
        name: string;
        description: string;
    };
    data: [number[]];
}

let COLOR_MAP = [ 
    [28, 255, 12, 200],
    [196, 255, 7, 200],
    [148, 129, 255, 200],
    [118, 90, 254, 200],
    [78, 254, 17, 200],
    [19, 242, 255, 200],
    [26, 70, 255, 200],
    [255, 171, 156, 200],
    [138, 83, 255, 200]
]

/*
function transpose(mat) {
    for (var i = 0; i < mat.length; i++) {
        for (var j = 0; j < i; j++) {
            const tmp = mat[i][j];
            mat[i][j] = mat[j][i];
            mat[j][i] = tmp;
        }
    }
}

function getLogPath(d: WellDataType, lc_idx: number) {
    if (d.properties != undefined) {
        let found = LOG_DATA.find(item => item.header.well == d.properties.name)
        if (found != undefined) {
            //transpose(found.data)
            return found.data[lc_idx];
        }    
    }
    return [];
}
*/

function getLogColor(d: LogCurveDataType, lc_idx: number) {
    //console.log(d.curves[lc_idx].name)
    if (d.curves[lc_idx] == undefined ||
        d.curves[lc_idx].description == "continuous") {
        return []
    }
    let color: number[][] = [];
    d.data[lc_idx].forEach(value => {               
        color.push(COLOR_MAP[value]);
    }); 
    return color;
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


        // PathLayer properties
        const lc_layer = new PathLayer<Feature>(
            this.getSubLayerProps({
                id: "log_curve",
                data: this.props.logData,
                pickable: false,
                widthScale: 10,
                widthMinPixels: 1,
                miterLimit: 1000,
                getPath: (d: LogCurveDataType): number[] => d.data[0],
                getColor: (d:LogCurveDataType): RGBAColor => 
                            getLogColor(d, this.props.logIndex),
                getWidth: (d:LogCurveDataType): number | number[] => 
                            (this.props.logRadius || d.data[this.props.logIndex]),
                updateTriggers: {
                    getColor: [this.props.logIndex],
                    getWidth: [this.props.logIndex, this.props.logRadius]
                }
            }) 
        );

        //PathLayer ends
        let layers = [colors]
        if (this.props.outline) {
            layers.splice(0, 0, outline)
        }
        if (this.props.logCurves) {
            layers.splice(1,0,lc_layer)
        }
        return layers;
    }
}

WellsLayer.layerName = "WellsLayer";
WellsLayer.defaultProps = defaultProps;
