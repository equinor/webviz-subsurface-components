import { CompositeLayer } from "@deck.gl/core";
import { CompositeLayerProps } from "@deck.gl/core/lib/composite-layer";
import { GeoJsonLayer, PathLayer } from "@deck.gl/layers";
import { RGBAColor } from "@deck.gl/core/utils/color";
import { PickInfo } from "deck.gl";
import { subtract, distance, dot } from "mathjs";
import { interpolateRgbBasis } from "d3-interpolate";
import { color } from "d3-color";

import { Feature } from "geojson";

import { LayerPickInfo, PropertyDataType } from "../utils/layerTools";
import { patchLayerProps } from "../utils/layerTools";

export interface WellsLayerProps<D> extends CompositeLayerProps<D> {
    pointRadiusScale: number;
    lineWidthScale: number;
    outline: boolean;
    selectedFeature: Feature;
    selectionEnabled: boolean;
    logData: string | LogCurveDataType;
    logName: string;
    logrunName: string;
    logRadius: number;
    logCurves: boolean;
}

const defaultProps = {
    autoHighlight: true,
    selectionEnabled: true,
};

export interface LogCurveDataType {
    header: {
        name: string;
        well: string;
    };
    curves: {
        name: string;
        description: string;
    }[];
    data: number[][];
    metadata_discrete: Record<
        string,
        {
            attributes: unknown;
            objects: Record<string, [RGBAColor, number]>;
        }
    >;
}

export interface WellsPickInfo extends LayerPickInfo {
    logName?: string;
}

export default class WellsLayer extends CompositeLayer<
    unknown,
    WellsLayerProps<Feature>
> {
    onClick(info: WellsPickInfo): boolean {
        if (!this.props.selectionEnabled) {
            return false;
        }

        patchLayerProps(this, {
            ...this.props,
            selectedFeature: info.object,
        });
        return true;
    }

    renderLayers(): (GeoJsonLayer<Feature> | PathLayer<LogCurveDataType>)[] {
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

        const log_layer = new PathLayer<LogCurveDataType>(
            this.getSubLayerProps({
                id: "log_curve",
                data: this.props.logData,
                pickable: true,
                widthScale: 10,
                widthMinPixels: 1,
                miterLimit: 100,
                getPath: (d: LogCurveDataType): number[] =>
                    getLogPath(d, this.props.logrunName),
                getColor: (d: LogCurveDataType): RGBAColor[] =>
                    getLogColor(d, this.props.logrunName, this.props.logName),
                getWidth: (d: LogCurveDataType): number | number[] =>
                    this.props.logRadius ||
                    getLogWidth(d, this.props.logrunName, this.props.logName),
                updateTriggers: {
                    getColor: [this.props.logName],
                    getWidth: [this.props.logName, this.props.logRadius],
                },
            })
        );

        const layers: (GeoJsonLayer<Feature> | PathLayer<LogCurveDataType>)[] =
            [colors, highlight];
        if (this.props.outline) {
            layers.splice(0, 0, outline);
        }
        if (this.props.logCurves) {
            layers.splice(1, 0, log_layer);
        }
        return layers;
    }

    getPickingInfo({
        info,
    }: {
        info: PickInfo<unknown>;
    }): WellsPickInfo | PickInfo<unknown> {
        if (!info.object) return info;

        const md_property = getMdProperty(info);
        const log_property = getLogProperty(
            info,
            this.props.logrunName,
            this.props.logName
        );

        let layer_property: PropertyDataType | null = null;
        if (md_property) layer_property = md_property;
        if (log_property) layer_property = log_property;

        return {
            ...info,
            property: layer_property,
            logName: layer_property?.name,
        };
    }
}

WellsLayer.layerName = "WellsLayer";
WellsLayer.defaultProps = defaultProps;

//================= Local help functions. ==================

function isLogRunSelected(d: LogCurveDataType, logrun_name: string): boolean {
    return d.header.name.toLowerCase() === logrun_name.toLowerCase();
}

function getLogPath(d: LogCurveDataType, logrun_name: string): number[] {
    if (isLogRunSelected(d, logrun_name)) {
        if (d?.data) {
            return d.data[0];
        }
    }
    return [];
}

function getLogIDByName(
    d: LogCurveDataType,
    logrun_name: string,
    log_name: string
): number {
    if (isLogRunSelected(d, logrun_name)) {
        return d?.curves?.findIndex(
            (item) => item.name.toLowerCase() === log_name.toLowerCase()
        );
    }
    return -1;
}

const color_interp = interpolateRgbBasis(["red", "yellow", "green", "blue"]);
function getLogColor(
    d: LogCurveDataType,
    logrun_name: string,
    log_name: string
): RGBAColor[] {
    const log_id = getLogIDByName(d, logrun_name, log_name);
    if (!d?.curves?.[log_id]) {
        return [];
    }

    const log_color: RGBAColor[] = [];
    if (d?.curves[log_id]?.description == "continuous") {
        const min = Math.min(...d?.data[log_id]);
        const max = Math.max(...d?.data[log_id]);
        const max_delta = max - min;
        d.data[log_id].forEach((value) => {
            const rgb = color(color_interp((value - min) / max_delta))?.rgb();
            if (rgb != undefined) {
                log_color.push([rgb.r, rgb.g, rgb.b]);
            }
        });
    } else {
        const log_attributes = d.metadata_discrete[log_name]?.objects;
        d.data[log_id].forEach((log_value) => {
            const dl_attrs = Object.entries(log_attributes).find(
                ([, value]) => value[1] == log_value
            )?.[1];
            dl_attrs
                ? log_color.push(dl_attrs[0])
                : log_color.push([0, 0, 0, 0]);
        });
    }
    return log_color;
}

function getLogWidth(
    d: LogCurveDataType,
    logrun_name: string,
    log_name: string
): number[] {
    const log_id = getLogIDByName(d, logrun_name, log_name);
    return d?.data?.[log_id];
}

function squared_distance(a, b): number {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return dx * dx + dy * dy;
}

function getMd(pickInfo): number | null {
    if (!pickInfo.object.properties || !pickInfo.object.geometry) return null;

    const measured_depths = pickInfo.object.properties.md[0];
    const trajectory = pickInfo.object.geometry.geometries[1].coordinates;

    // Get squared distance from survey point to picked point.
    const d2 = trajectory.map((element) =>
        squared_distance(element, pickInfo.coordinate)
    );

    // Enumerate squared distances.
    let index: number[] = Array.from(d2.entries());

    // Sort by squared distance.
    index = index.sort((a: number, b: number) => a[1] - b[1]);

    // Get the nearest indexes.
    const index0 = index[0][0];
    const index1 = index[1][0];

    // Get the nearest MD values.
    const md0 = measured_depths[index0];
    const md1 = measured_depths[index1];

    // Get the nearest survey points.
    const survey0 = trajectory[index0];
    const survey1 = trajectory[index1];

    const dv = distance(survey0, survey1) as number;

    // Calculate the scalar projection onto segment.
    const v0 = subtract(pickInfo.coordinate, survey0);
    const v1 = subtract(survey1, survey0);
    const scalar_projection: number = dot(v0 as number[], v1 as number[]) / dv;

    // Interpolate MD value.
    const c0 = scalar_projection / dv;
    const c1 = dv - c0;
    return (md0 * c1 + md1 * c0) / dv;
}

function getMdProperty(info): PropertyDataType | null {
    const md = getMd(info);
    if (md != null) {
        const prop_name = "MD " + (info.object as Feature)?.properties?.name;
        return { name: prop_name, value: md };
    }
    return null;
}

// Returns segment index of discrete logs
function getDiscLogSegmentIndex(info): number {
    const trajectory = (info.object as LogCurveDataType)?.data[0];

    let min_d = Number.MAX_VALUE;
    let segment_index = 0;
    for (let i = 0; i < trajectory?.length; i++) {
        const d = squared_distance(trajectory[i], info.coordinate);
        if (d > min_d) continue;

        segment_index = i;
        min_d = d;
    }
    return segment_index;
}

function getLogProperty(
    info,
    logrun_name: string,
    log_name: string
): PropertyDataType | null {
    const info_object = info.object as LogCurveDataType;
    if (!info_object?.data) return null;

    const log_id = getLogIDByName(info_object, logrun_name, log_name);
    const log = info_object.curves?.[log_id].name;

    const data_objects = info_object.metadata_discrete[log]?.objects;

    const segment_index = getDiscLogSegmentIndex(info);
    let log_value: number | string = info_object.data[log_id][segment_index];
    const dl_attrs = Object.entries(data_objects).find(
        ([, value]) => value[1] == log_value
    );

    const prop_name = log + " " + info_object.header.well;
    log_value = dl_attrs ? dl_attrs[0] + " (" + log_value + ")" : log_value;

    if (log_value) return { name: prop_name, value: log_value };
    else return null;
}
