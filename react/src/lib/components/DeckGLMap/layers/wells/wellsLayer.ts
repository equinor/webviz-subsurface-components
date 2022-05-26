import { CompositeLayer } from "@deck.gl/core";
import { ExtendedLayerProps, isDrawingEnabled } from "../utils/layerTools";
import { GeoJsonLayer, PathLayer, TextLayer } from "@deck.gl/layers";
import { RGBAColor } from "@deck.gl/core/utils/color";
import { PathStyleExtension } from "@deck.gl/extensions";
import { subtract, distance, dot } from "mathjs";
import {
    rgbValues,
    colorTablesArray,
    colorsArray,
} from "@emerson-eps/color-tables/";
import {
    Feature,
    GeometryCollection,
    LineString,
    Point,
    Position,
    FeatureCollection,
    GeoJsonProperties,
    Geometry,
} from "geojson";
import {
    LayerPickInfo,
    PropertyDataType,
    createPropertyData,
} from "../utils/layerTools";
import { splineRefine } from "./utils/spline";
import { interpolateNumberArray } from "d3";
import { Position2D } from "@deck.gl/core/utils/positions";
import { layersDefaultProps } from "../layersDefaultProps";
import { UpdateStateInfo } from "@deck.gl/core/lib/layer";
import { DeckGLLayerContext } from "../../components/Map";

type StyleAccessorFunction = (
    object: Feature,
    objectInfo?: Record<string, unknown>
) => LineStyle;

type NumberPair = [number, number];
type DashAccessor = boolean | NumberPair | StyleAccessorFunction | undefined;
type ColorAccessor = RGBAColor | StyleAccessorFunction | undefined;
type WidthAccessor = number | StyleAccessor | undefined;
type LineStyle = NumberPair | RGBAColor | number;

type StyleAccessor = {
    color?: ColorAccessor;
    dash?: DashAccessor;
    width?: WidthAccessor;
};

export interface WellsLayerProps<D> extends ExtendedLayerProps<D> {
    pointRadiusScale: number;
    lineWidthScale: number;
    outline: boolean;
    selectedWell: string;
    logData: string | LogCurveDataType;
    logName: string;
    logColor: string;
    logrunName: string;
    logRadius: number;
    logCurves: boolean;
    refine: boolean;
    lineStyle: StyleAccessor;
    wellNameVisible: boolean;
    wellNameAtTop: boolean;
    wellNameSize: number;
    wellNameColor: RGBAColor;
}

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
    logName: string;
}

function multiply(pair: [number, number], factor: number): [number, number] {
    return [pair[0] * factor, pair[1] * factor];
}

const DEFAULT_LINE_WIDTH = 5;
const DEFAULT_DASH = [5, 5] as NumberPair;

function getDashFactor(
    accessor: DashAccessor,
    width_accessor?: number | ((object: Feature) => number),
    offset = 0
) {
    return (
        object: Feature,
        objectInfo: Record<string, unknown>
    ): NumberPair => {
        let width = DEFAULT_LINE_WIDTH;
        if (typeof width_accessor == "function") {
            width = (width_accessor as StyleAccessorFunction)(object) as number;
        } else if (width_accessor as number) {
            width = width_accessor as number;
        }
        const factor = width / (width + offset);

        let dash: NumberPair = [0, 0];
        if (typeof accessor == "function") {
            dash = (accessor as StyleAccessorFunction)(
                object,
                objectInfo
            ) as NumberPair;
        } else if (accessor as NumberPair) dash = accessor as NumberPair;
        else if (accessor) dash = DEFAULT_DASH;
        if (dash.length == 2) {
            return multiply(dash, factor);
        } else {
            return multiply(DEFAULT_DASH, factor);
        }
    };
}

function getLineColor(accessor: ColorAccessor) {
    if (accessor as RGBAColor) {
        return accessor as RGBAColor;
    }

    return (
        object: Feature,
        objectInfo?: Record<string, unknown>
    ): RGBAColor => {
        if (typeof accessor === "function") {
            const color = (accessor as StyleAccessorFunction)(
                object,
                objectInfo
            ) as RGBAColor;
            if (color) {
                return color;
            }
        }
        return object.properties?.["color"] as RGBAColor;
    };
}

function getLineWidth(
    accessor: WidthAccessor,
    offset = 0
): number | ((object: Feature) => number) {
    if (typeof accessor == "function") {
        return (object: Feature): number => {
            return (
                ((accessor as StyleAccessorFunction)(object) as number) + offset
            );
        };
    }

    if (accessor as number) return (accessor as number) + offset;

    return DEFAULT_LINE_WIDTH + offset;
}

export default class WellsLayer extends CompositeLayer<
    FeatureCollection,
    WellsLayerProps<FeatureCollection>
> {
    onClick(info: WellsPickInfo): boolean {
        // Make selection only when drawing is disabled
        if (isDrawingEnabled(this.context.layerManager)) {
            return false;
        } else {
            (this.context as DeckGLLayerContext).userData.setEditedData({
                selectedWell: (info.object as Feature).properties?.["name"],
            });
            return true;
        }
    }

    shouldUpdateState({
        changeFlags,
    }: UpdateStateInfo<
        WellsLayerProps<FeatureCollection<Geometry, GeoJsonProperties>>
    >): boolean | string | null {
        return (
            changeFlags.viewportChanged ||
            changeFlags.propsOrDataChanged ||
            changeFlags.updateTriggersChanged
        );
    }

    renderLayers(): (
        | GeoJsonLayer<Feature>
        | PathLayer<LogCurveDataType>
        | TextLayer<Feature>
    )[] {
        if (!(this.props.data as FeatureCollection).features) {
            return [];
        }

        const refine = this.props.refine;
        const data = refine
            ? splineRefine(this.props.data as FeatureCollection) // smooth well paths.
            : (this.props.data as FeatureCollection);

        const is3d = this.context.viewport.constructor.name === "OrbitViewport";
        const positionFormat = is3d ? "XYZ" : "XY";

        const isDashed = !!this.props.lineStyle?.dash;

        const extensions = [
            new PathStyleExtension({
                dash: isDashed,
                highPrecisionDash: isDashed,
            }),
        ];

        const outline = new GeoJsonLayer<Feature>(
            this.getSubLayerProps<Feature>({
                id: "outline",
                data,
                pickable: false,
                stroked: false,
                positionFormat,
                pointRadiusUnits: "pixels",
                lineWidthUnits: "pixels",
                visible: this.props.outline,
                pointRadiusScale: this.props.pointRadiusScale,
                lineWidthScale: this.props.lineWidthScale,
                getLineWidth: getLineWidth(this.props.lineStyle?.width),
                extensions: extensions,
                getDashArray: getDashFactor(this.props.lineStyle?.dash),
                lineBillboard: is3d,
                pointBillboard: true,
            })
        );

        const colors = new GeoJsonLayer<Feature>(
            this.getSubLayerProps<Feature>({
                id: "colors",
                data,
                pickable: true,
                stroked: false,
                positionFormat,
                pointRadiusUnits: "pixels",
                lineWidthUnits: "pixels",
                pointRadiusScale: this.props.pointRadiusScale - 1,
                lineWidthScale: this.props.lineWidthScale,
                getLineWidth: getLineWidth(this.props.lineStyle?.width, -1),
                getFillColor: (d: Feature) => d.properties?.["color"],
                getLineColor: getLineColor(this.props.lineStyle?.color),
                extensions: extensions,
                getDashArray: getDashFactor(
                    this.props.lineStyle?.dash,
                    getLineWidth(this.props.lineStyle?.width),
                    -1
                ),
                lineBillboard: is3d,
                pointBillboard: true,
            })
        );

        // Highlight the selected well.
        const highlight = new GeoJsonLayer<Feature>(
            this.getSubLayerProps<Feature>({
                id: "highlight",
                data: getWellObjectByName(
                    data.features,
                    this.props.selectedWell
                ),
                pickable: false,
                stroked: false,
                positionFormat,
                pointRadiusUnits: "pixels",
                lineWidthUnits: "pixels",
                pointRadiusScale: this.props.pointRadiusScale + 2,
                lineWidthScale: this.props.lineWidthScale,
                getLineWidth: getLineWidth(this.props.lineStyle?.width, 2),
                getFillColor: (d: Feature) => d.properties?.["color"],
                getLineColor: getLineColor(this.props.lineStyle?.color),
            })
        );

        const log_layer = new PathLayer<LogCurveDataType>(
            this.getSubLayerProps<LogCurveDataType>({
                id: "log_curve",
                data: this.props.logData,
                positionFormat,
                pickable: true,
                widthScale: 10,
                widthMinPixels: 1,
                miterLimit: 100,
                visible: this.props.logCurves,
                getPath: (d: LogCurveDataType): Position[] =>
                    getLogPath(
                        data.features,
                        d,
                        this.props.logrunName,
                        this.props.lineStyle?.color
                    ),
                getColor: (d: LogCurveDataType): RGBAColor[] =>
                    getLogColor(
                        d,
                        this.props.logrunName,
                        this.props.logName,
                        this.props.logColor,
                        (this.context as DeckGLLayerContext).userData
                            .colorTables
                    ),
                getWidth: (d: LogCurveDataType): number | number[] =>
                    this.props.logRadius ||
                    getLogWidth(d, this.props.logrunName, this.props.logName),
                updateTriggers: {
                    getColor: [
                        this.props.logrunName,
                        this.props.logName,
                        (this.context as DeckGLLayerContext).userData
                            .colorTables,
                        this.props.logName,
                        this.props.logColor,
                    ],
                    getWidth: [
                        this.props.logrunName,
                        this.props.logName,
                        this.props.logRadius,
                    ],
                    getPath: [positionFormat],
                },
                onDataLoad: (value: LogCurveDataType[]) => {
                    this.setState({
                        legend: getLegendData(
                            value,
                            this.props.logName,
                            this.props.logColor
                        ),
                    });
                },
            })
        );

        // well name
        const names = new TextLayer<Feature>(
            this.getSubLayerProps<Feature>({
                id: "names",
                data: data.features,
                visible: this.props.wellNameVisible,
                getPosition: (d: Feature) =>
                    getAnnotationPosition(
                        d,
                        this.props.wellNameAtTop,
                        is3d,
                        this.props.lineStyle?.color
                    ),
                getText: (d: Feature) => d.properties?.["name"],
                getColor: this.props.wellNameColor,
                getAnchor: "start",
                getAlignmentBaseline: "bottom",
                getSize: this.props.wellNameSize,
            })
        );

        return [outline, log_layer, colors, highlight, names];
    }

    // For now, use `any` for the picking types because this function should
    // recieve PickInfo<FeatureCollection>, but it recieves PickInfo<Feature>.
    //eslint-disable-next-line
    getPickingInfo({ info }: { info: any }): any {
        if (!info.object) return info;

        const md_property = getMdProperty(
            info.coordinate,
            info.object,
            this.props.lineStyle?.color
        );
        const tvd_property = getTvdProperty(
            info.coordinate,
            info.object,
            this.props.lineStyle?.color
        );
        const log_property = getLogProperty(
            info.coordinate,
            (this.props.data as FeatureCollection).features,
            info.object,
            this.props.logrunName,
            this.props.logName
        );

        // Patch for inverting tvd readout to fix issue #830,
        // should make proper fix when handling z increase direction - issue #842
        const inverted_tvd_property = tvd_property && {
            ...tvd_property,
            value: (tvd_property?.value as number) * -1,
        };

        const layer_properties: PropertyDataType[] = [];
        if (md_property) layer_properties.push(md_property);
        if (inverted_tvd_property) layer_properties.push(inverted_tvd_property);
        if (log_property) layer_properties.push(log_property);

        return {
            ...info,
            properties: layer_properties,
            logName: log_property?.name,
        };
    }
}

WellsLayer.layerName = "WellsLayer";
WellsLayer.defaultProps = layersDefaultProps[
    "WellsLayer"
] as WellsLayerProps<FeatureCollection>;

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

export function getLogValues(
    d: LogCurveDataType,
    logrun_name: string,
    log_name: string
): number[] {
    if (!isSelectedLogRun(d, logrun_name)) return [];

    const log_id = getLogIndexByName(d, log_name);
    return log_id >= 0 ? getColumn(d.data, log_id) : [];
}

export function getLogInfo(
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

// return position for well name and icon
function getAnnotationPosition(
    well_data: Feature,
    name_at_top: boolean,
    view_is_3d: boolean,
    color_accessor: ColorAccessor
): Position | null {
    if (name_at_top) {
        let top;

        // Read top position from Point geometry, if not present, read it from LineString geometry
        const well_head = getWellHeadPosition(well_data);
        if (well_data) top = well_head;
        else {
            const trajectory = getTrajectory(well_data, color_accessor);
            top = trajectory?.at(0);
        }

        // using z=0 for orthographic view to keep label above other other layers
        if (top) return view_is_3d ? top : [top[0], top[1], 0];
    } else {
        let bot;
        // if trajectory is not present, return top position from Point geometry
        const trajectory = getTrajectory(well_data, color_accessor);
        if (trajectory) bot = trajectory?.at(-1);
        else bot = getWellHeadPosition(well_data);

        // using z=0 for orthographic view to keep label above other other layers
        if (bot) return view_is_3d ? bot : [bot[0], bot[1], 0];
    }
    return null;
}

function getWellObjectByName(
    wells_data: Feature[],
    name: string
): Feature | undefined {
    return wells_data?.find(
        (item) =>
            item.properties?.["name"]?.toLowerCase() === name?.toLowerCase()
    );
}

function getPointGeometry(well_object: Feature): Point {
    return (well_object.geometry as GeometryCollection)?.geometries.find(
        (item) => item.type == "Point"
    ) as Point;
}

function getLineStringGeometry(well_object: Feature): LineString {
    return (well_object.geometry as GeometryCollection)?.geometries.find(
        (item) => item.type == "LineString"
    ) as LineString;
}

// Return well head position from Point Geometry
function getWellHeadPosition(well_object: Feature): Position | undefined {
    return getPointGeometry(well_object)?.coordinates;
}

// return trajectory visibility based on alpha of trajectory color
function isTrajectoryVisible(
    well_object: Feature,
    color_accessor: ColorAccessor
): boolean {
    let alpha;
    const accessor = getLineColor(color_accessor);
    if (typeof accessor === "function") {
        alpha = accessor(well_object)?.[3];
    } else {
        alpha = (accessor as RGBAColor)?.[3];
    }
    return alpha !== 0;
}

// Return Trajectory data from LineString Geometry if it's visible (checking trajectory visiblity based on line color)
function getTrajectory(
    well_object: Feature,
    color_accessor: ColorAccessor
): Position[] | undefined {
    if (isTrajectoryVisible(well_object, color_accessor))
        return getLineStringGeometry(well_object)?.coordinates;
    else return undefined;
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
    logrun_name: string,
    trajectory_line_color?: ColorAccessor
): Position[] {
    const well_object = getWellObjectByName(wells_data, d.header.well);
    if (!well_object) return [];

    const well_xyz = getTrajectory(well_object, trajectory_line_color);
    const well_mds = getWellMds(well_object);

    if (
        well_xyz == undefined ||
        well_mds == undefined ||
        well_xyz.length == 0 ||
        well_mds.length == 0
    )
        return [];

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

function getLogColor(
    d: LogCurveDataType,
    logrun_name: string,
    log_name: string,
    logColor: string,
    colorTables: colorTablesArray
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
            const rgb = rgbValues(
                (value - min) / max_delta,
                logColor,
                colorTables
            );
            if (rgb) {
                if (Array.isArray(rgb)) {
                    log_color.push([rgb[0], rgb[1], rgb[2]]);
                } else {
                    log_color.push([rgb.r, rgb.g, rgb.b]);
                }
            } else {
                log_color.push([0, 0, 0, 0]); // push transparent for null/undefined log values
            }
        });
    } else {
        const arrayOfColors: [number, number, number, number][] = colorsArray(
            logColor,
            colorTables
        );

        const log_attributes = getDiscreteLogMetadata(d, log_name)?.objects;
        // eslint-disable-next-line
        const attributesObject: { [key: string]: any } = {};
        Object.keys(log_attributes).forEach((key) => {
            // get the code from log_attributes
            const code = log_attributes[key][1];
            // compare the code and first value from colorsArray(colortable)
            const colorArrays = arrayOfColors.find((value: number[]) => {
                return value[0] == code;
            });
            if (colorArrays)
                attributesObject[key] = [
                    [colorArrays[1], colorArrays[2], colorArrays[3]],
                    code,
                ];
        });
        log_data.forEach((log_value) => {
            const dl_attrs = Object.entries(attributesObject).find(
                ([, value]) => value[1] == log_value
            )?.[1];
            dl_attrs
                ? log_color.push(dl_attrs[0])
                : log_color.push([0, 0, 0, 0]); // use transparent for undefined/null log values
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

// Interpolates point closest to the coords on trajectory
function interpolateDataOnTrajectory(
    coord: Position,
    data: number[],
    trajectory: Position[]
): number {
    // if number of data points in less than 1 or
    // length of data and trajectory are different we cannot interpolate.
    if (data.length <= 1 || data.length != trajectory.length) return -1;

    // Identify closest well path leg to coord.
    const segment_index = getSegmentIndex(coord, trajectory);

    const index0 = segment_index;
    const index1 = index0 + 1;

    // Get the nearest data.
    const data0 = data[index0];
    const data1 = data[index1];

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

    // Interpolate data.
    return data0 * (1.0 - scalar_projection) + data1 * scalar_projection;
}

function getMd(
    coord: Position,
    feature: Feature,
    accessor: ColorAccessor
): number | null {
    if (!feature.properties?.["md"]?.[0] || !feature.geometry) return null;

    const measured_depths = feature.properties["md"][0] as number[];
    const trajectory3D = getTrajectory(feature, accessor);

    if (trajectory3D == undefined) return null;

    let trajectory;
    // In 2D view coord is of type Position2D and in 3D view it's Position3D,
    // so use apropriate trajectory for interpolation
    if (coord.length == 2) {
        const trajectory2D = trajectory3D.map((v) => {
            return v.slice(0, 2);
        }) as Position[];
        trajectory = trajectory2D;
    } else {
        trajectory = trajectory3D;
    }

    return interpolateDataOnTrajectory(coord, measured_depths, trajectory);
}

function getMdProperty(
    coord: Position,
    feature: Feature,
    accessor: ColorAccessor
): PropertyDataType | null {
    const md = getMd(coord, feature, accessor);
    if (md != null) {
        const prop_name = "MD " + feature.properties?.["name"];
        return createPropertyData(prop_name, md, feature.properties?.["color"]);
    }
    return null;
}

function getTvd(
    coord: Position,
    feature: Feature,
    accessor: ColorAccessor
): number | null {
    const trajectory3D = getTrajectory(feature, accessor);

    // if trajectory is not found or if it has a data single point then get tvd from well head
    if (trajectory3D == undefined || trajectory3D?.length <= 1) {
        const wellhead_xyz = getWellHeadPosition(feature);
        return wellhead_xyz?.[2] ?? null;
    }
    let trajectory;
    // For 2D view coord is Position2D and for 3D view it's Position3D
    if (coord.length == 2) {
        const trajectory2D = trajectory3D?.map((v) => {
            return v.slice(0, 2);
        }) as Position[];
        trajectory = trajectory2D;
    } else {
        trajectory = trajectory3D;
    }

    const tvds = trajectory3D.map((v) => {
        return v[2];
    }) as number[];

    return interpolateDataOnTrajectory(coord, tvds, trajectory);
}

function getTvdProperty(
    coord: Position,
    feature: Feature,
    accessor: ColorAccessor
): PropertyDataType | null {
    const tvd = getTvd(coord, feature, accessor);
    if (tvd != null) {
        const prop_name = "TVD " + feature.properties?.["name"];
        return createPropertyData(
            prop_name,
            tvd,
            feature.properties?.["color"]
        );
    }
    return null;
}

// Identify closest path leg to coord.
function getSegmentIndex(coord: Position, path: Position[]): number {
    let min_d = Number.MAX_VALUE;
    let segment_index = 0;
    for (let i = 0; i < path?.length - 1; i++) {
        const d = distToSegmentSquared(path[i], path[i + 1], coord);
        if (d > min_d) continue;

        segment_index = i;
        min_d = d;
    }
    return segment_index;
}

// Returns segment index of discrete logs
function getLogSegmentIndex(
    coord: Position2D,
    wells_data: Feature[],
    log_data: LogCurveDataType,
    logrun_name: string
): number {
    const trajectory = getLogPath(wells_data, log_data, logrun_name);
    return getSegmentIndex(coord, trajectory);
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

    if (log_value) {
        const well_object = getWellObjectByName(
            wells_data,
            log_data.header.well
        );
        return createPropertyData(
            prop_name,
            log_value,
            well_object?.properties?.["color"]
        );
    } else return null;
}

// Return data required to build welllayer legend
function getLegendData(
    logs: LogCurveDataType[],
    logName: string,
    logColor: string
) {
    const logInfo = getLogInfo(logs[0], logs[0].header.name, logName);
    const title = "Wells / " + logName;
    const legendProps = [];
    if (logInfo?.description == "discrete") {
        const meta = logs[0]["metadata_discrete"];
        const metadataDiscrete = meta[logName].objects;
        legendProps.push({
            title: title,
            colorName: logColor,
            discrete: true,
            metadata: metadataDiscrete,
            valueRange: [],
        });
        return legendProps;
    } else {
        const minArray: number[] = [];
        const maxArray: number[] = [];
        logs.forEach(function (log: LogCurveDataType) {
            const logValues = getLogValues(log, log.header.name, logName);
            minArray.push(Math.min(...logValues));
            maxArray.push(Math.max(...logValues));
        });
        legendProps.push({
            title: title,
            name: logName,
            colorName: logColor,
            discrete: false,
            metadata: { objects: {} },
            valueRange: [Math.min(...minArray), Math.max(...maxArray)],
        });
        return legendProps;
    }
}
