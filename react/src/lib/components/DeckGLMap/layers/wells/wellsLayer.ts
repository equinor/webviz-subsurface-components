import { CompositeLayer } from "@deck.gl/core";
import { CompositeLayerProps } from "@deck.gl/core/lib/composite-layer";
import { GeoJsonLayer, PathLayer } from "@deck.gl/layers";
import { RGBAColor } from "@deck.gl/core/utils/color";
import { subtract, distance, dot } from "mathjs";
import { interpolateRgbBasis } from "d3-interpolate";
import { color } from "d3-color";
import {
    Feature,
    GeometryCollection,
    LineString,
    Position,
    FeatureCollection,
} from "geojson";
import { LayerPickInfo, PropertyDataType } from "../utils/layerTools";
import { patchLayerProps } from "../utils/layerTools";
import { splineRefine, convertTo2D } from "./utils/spline";
import { interpolateNumberArray } from "d3";
import { Position2D } from "@deck.gl/core/utils/positions";

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
    refine: boolean;
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
    FeatureCollection,
    WellsLayerProps<FeatureCollection>
> {
    onClick(info: WellsPickInfo): boolean {
        if (!this.props.selectionEnabled) {
            return false;
        }

        patchLayerProps<FeatureCollection>(this, {
            ...this.props,
            selectedFeature: info.object,
        } as WellsLayerProps<FeatureCollection>);
        return true;
    }

    renderLayers(): (GeoJsonLayer<Feature> | PathLayer<LogCurveDataType>)[] {
        if (!(this.props.data as FeatureCollection).features) {
            return [];
        }

        const refine = this.props.refine;
        let data = refine
            ? splineRefine(this.props.data as FeatureCollection) // smooth well paths.
            : (this.props.data as FeatureCollection);

        data = convertTo2D(data);

        const outline = new GeoJsonLayer<Feature>(
            this.getSubLayerProps<Feature>({
                id: "outline",
                data,
                pickable: false,
                stroked: false,
                pointRadiusUnits: "pixels",
                lineWidthUnits: "pixels",
                pointRadiusScale: this.props.pointRadiusScale,
                lineWidthScale: this.props.lineWidthScale,
            })
        );

        const getColor = (d: Feature): RGBAColor => d?.properties?.["color"];
        const colors = new GeoJsonLayer<Feature>(
            this.getSubLayerProps<Feature>({
                id: "colors",
                data,
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
            this.getSubLayerProps<Feature>({
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
            this.getSubLayerProps<LogCurveDataType>({
                id: "log_curve",
                data: this.props.logData,
                positionFormat: "XY",
                pickable: true,
                widthScale: 10,
                widthMinPixels: 1,
                miterLimit: 100,
                getPath: (d: LogCurveDataType): Position[] =>
                    getLogPath(data.features, d, this.props.logrunName),
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

    // For now, use `any` for the picking types because this function should
    // recieve PickInfo<FeatureCollection>, but it recieves PickInfo<Feature>.
    //eslint-disable-next-line
    getPickingInfo({ info }: { info: any }): any {
        if (!info.object) return info;

        const md_property = getMdProperty(info.coordinate, info.object);
        const log_property = getLogProperty(
            info.coordinate,
            (this.props.data as FeatureCollection).features,
            info.object,
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

function getColumn<D>(data: D[][], col: number): D[] {
    const column = [];
    for (let i = 0; i < data.length; i++) {
        column.push(data[i][col]);
    }
    return column;
}

function getLogMd(d: LogCurveDataType, logrun_name: string): number[] {
    if (!isSelectedLogRun(d, logrun_name)) return [];

    const names_md = ["DEPTH", "DEPT", "MD", "TDEP"]; // aliases for MD
    const log_id = getLogIndexByNames(d, names_md);
    return log_id >= 0 ? getColumn(d.data, log_id) : [];
}

function getLogValues(
    d: LogCurveDataType,
    logrun_name: string,
    log_name: string
): number[] {
    if (!isSelectedLogRun(d, logrun_name)) return [];

    const log_id = getLogIndexByName(d, log_name);
    return log_id >= 0 ? getColumn(d.data, log_id) : [];
}

function getLogInfo(
    d: LogCurveDataType,
    logrun_name: string,
    log_name: string
): { name: string; description: string } | undefined {
    if (!isSelectedLogRun(d, logrun_name)) return undefined;

    const log_id = getLogIndexByName(d, log_name);
    return d.curves[log_id];
}

function getDiscreteLogMetadata(d: LogCurveDataType, log_name: string) {
    return d?.metadata_discrete[log_name];
}

function isSelectedLogRun(d: LogCurveDataType, logrun_name: string): boolean {
    return d.header.name.toLowerCase() === logrun_name.toLowerCase();
}

function getWellObjectByName(
    wells_data: Feature[],
    name: string
): Feature | undefined {
    return wells_data?.find(
        (item) =>
            item.properties?.["name"].toLowerCase() === name?.toLowerCase()
    );
}

function getWellCoordinates(well_object: Feature): Position[] {
    return (
        (well_object.geometry as GeometryCollection)?.geometries.find(
            (item) => item.type == "LineString"
        ) as LineString
    )?.coordinates;
}

function getWellMds(well_object: Feature): number[] {
    return well_object.properties?.["md"][0];
}

function getNeighboringMdIndices(mds: number[], md: number): number[] {
    const idx = mds.findIndex((x) => x >= md);
    return idx === 0 ? [idx, idx + 1] : [idx - 1, idx];
}

function getLogPath(
    wells_data: Feature[],
    d: LogCurveDataType,
    logrun_name: string
): Position[] {
    const well_object = getWellObjectByName(wells_data, d.header.well);
    if (well_object == undefined) return [];

    const well_xyz = getWellCoordinates(well_object);
    const well_mds = getWellMds(well_object);
    if (well_xyz.length == 0 || well_mds.length == 0) return [];

    const log_xyz: Position[] = [];
    const log_mds = getLogMd(d, logrun_name);
    log_mds.forEach((md) => {
        const [l_idx, h_idx] = getNeighboringMdIndices(well_mds, md);
        const md_normalized =
            (md - well_mds[l_idx]) / (well_mds[h_idx] - well_mds[l_idx]);
        const xyz = interpolateNumberArray(
            well_xyz[l_idx],
            well_xyz[h_idx]
        )(md_normalized);
        log_xyz.push(xyz);
    });
    return log_xyz;
}

function getLogIndexByName(d: LogCurveDataType, log_name: string): number {
    return d.curves.findIndex(
        (item) => item.name.toLowerCase() === log_name.toLowerCase()
    );
}

function getLogIndexByNames(d: LogCurveDataType, names: string[]): number {
    for (const name of names) {
        const index = d.curves.findIndex(
            (item) => item.name.toLowerCase() === name.toLowerCase()
        );
        if (index >= 0) return index;
    }
    return -1;
}

const color_interp = interpolateRgbBasis(["red", "yellow", "green", "blue"]);
function getLogColor(
    d: LogCurveDataType,
    logrun_name: string,
    log_name: string
): RGBAColor[] {
    const log_data = getLogValues(d, logrun_name, log_name);
    const log_info = getLogInfo(d, logrun_name, log_name);
    if (log_data.length == 0 || log_info == undefined) return [];

    const log_color: RGBAColor[] = [];
    if (log_info.description == "continuous") {
        const min = Math.min(...log_data);
        const max = Math.max(...log_data);
        const max_delta = max - min;
        log_data.forEach((value) => {
            const rgb = color(color_interp((value - min) / max_delta))?.rgb();
            if (rgb != undefined) {
                log_color.push([rgb.r, rgb.g, rgb.b]);
            }
        });
    } else {
        const log_attributes = getDiscreteLogMetadata(d, log_name)?.objects;
        log_data.forEach((log_value) => {
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
    return getLogValues(d, logrun_name, log_name);
}

function squared_distance(a: Position, b: Position): number {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return dx * dx + dy * dy;
}

// Return distance between line segment vw and point p
function distToSegmentSquared(v: Position, w: Position, p: Position): number {
    const l2 = squared_distance(v, w);
    if (l2 == 0) return squared_distance(p, v);
    let t =
        ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
    t = Math.max(0, Math.min(1, t));
    return squared_distance(p, [
        v[0] + t * (w[0] - v[0]),
        v[1] + t * (w[1] - v[1]),
    ]);
}

function getMd(coord: Position2D, feature: Feature): number | null {
    if (!feature.properties || !feature.geometry) return null;

    const measured_depths = feature.properties["md"][0];

    const gc = feature.geometry as GeometryCollection;
    const trajectory = (gc.geometries[1] as LineString).coordinates;

    // Identify closest well path leg to coord.
    let min_d = Number.MAX_VALUE;
    let segment_index = 0;
    for (let i = 0; i < trajectory?.length - 1; i++) {
        const d = distToSegmentSquared(trajectory[i], trajectory[i + 1], coord);

        if (d > min_d) continue;

        segment_index = i;
        min_d = d;
    }

    const index0 = segment_index;
    const index1 = index0 + 1;

    // Get the nearest MD values.
    const md0 = measured_depths[index0];
    const md1 = measured_depths[index1];

    // Get the nearest survey points.
    const survey0 = trajectory[index0];
    const survey1 = trajectory[index1];

    const dv = distance(survey0, survey1) as number;
    if (dv === 0) {
        return -1;
    }

    // Calculate the scalar projection onto segment.
    const v0 = subtract(coord, survey0);
    const v1 = subtract(survey1, survey0);

    // scalar_projection in interval [0,1]
    const scalar_projection: number =
        dot(v0 as number[], v1 as number[]) / (dv * dv);

    // Interpolate MD value.
    return md0 * (1.0 - scalar_projection) + md1 * scalar_projection;
}

function getMdProperty(
    coord: Position2D,
    feature: Feature
): PropertyDataType | null {
    const md = getMd(coord, feature);
    if (md != null) {
        const prop_name = "MD " + feature.properties?.["name"];
        return { name: prop_name, value: md };
    }
    return null;
}

// Returns segment index of discrete logs
function getLogSegmentIndex(
    coord: Position2D,
    wells_data: Feature[],
    log_data: LogCurveDataType,
    logrun_name: string
): number {
    const trajectory = getLogPath(wells_data, log_data, logrun_name);

    let min_d = Number.MAX_VALUE;
    let segment_index = 0;
    for (let i = 0; i < trajectory?.length; i++) {
        const d = squared_distance(trajectory[i], coord);
        if (d > min_d) continue;

        segment_index = i;
        min_d = d;
    }
    return segment_index;
}

function getLogProperty(
    coord: Position2D,
    wells_data: Feature[],
    log_data: LogCurveDataType,
    logrun_name: string,
    log_name: string
): PropertyDataType | null {
    if (!log_data.data) return null;

    const segment_index = getLogSegmentIndex(
        coord,
        wells_data,
        log_data,
        logrun_name
    );
    let log_value: number | string = getLogValues(
        log_data,
        logrun_name,
        log_name
    )[segment_index];

    let dl_attrs: [string, [RGBAColor, number]] | undefined = undefined;
    const dl_metadata = getDiscreteLogMetadata(log_data, log_name)?.objects;
    if (dl_metadata) {
        dl_attrs = Object.entries(dl_metadata).find(
            ([, value]) => value[1] == log_value
        );
    }

    const log = getLogInfo(log_data, logrun_name, log_name)?.name;
    const prop_name = log + " " + log_data.header.well;
    log_value = dl_attrs ? dl_attrs[0] + " (" + log_value + ")" : log_value;

    if (log_value) return { name: prop_name, value: log_value };
    else return null;
}
