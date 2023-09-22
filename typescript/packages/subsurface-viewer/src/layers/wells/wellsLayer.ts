import type {
    Layer,
    LayersList,
    LayerData,
    UpdateParameters,
    PickingInfo,
} from "@deck.gl/core/typed";
import { CompositeLayer, OrbitViewport } from "@deck.gl/core/typed";
import type { ExtendedLayerProps } from "../utils/layerTools";
import { isDrawingEnabled } from "../utils/layerTools";
import { PathLayer, TextLayer } from "@deck.gl/layers/typed";
import type { Color, Position } from "@deck.gl/core/typed";
import { PathStyleExtension } from "@deck.gl/extensions/typed";
import { subtract, distance, dot } from "mathjs";
import type { colorTablesArray } from "@emerson-eps/color-tables/";
import { rgbValues, getColors } from "@emerson-eps/color-tables/";
import type {
    Feature,
    GeometryCollection,
    LineString,
    Point,
    FeatureCollection,
    GeoJsonProperties,
    Geometry,
} from "geojson";
import type { LayerPickInfo, PropertyDataType } from "../utils/layerTools";
import { createPropertyData } from "../utils/layerTools";
import {
    splineRefine,
    coarsenWells,
    invertPath,
    GetBoundingBox,
} from "./utils/spline";
import { interpolateNumberArray } from "d3";
import type { DeckGLLayerContext } from "../../components/Map";
import type {
    ContinuousLegendDataType,
    DiscreteLegendDataType,
} from "../../components/ColorLegend";
import { getLayersById } from "../../layers/utils/layerTools";
import UnfoldedGeoJsonLayer from "../intersection/unfoldedGeoJsonLayer";
import GL from "@luma.gl/constants";
import { isEqual } from "lodash";

type StyleAccessorFunction = (
    object: Feature,
    objectInfo?: Record<string, unknown>
) => StyleData;

type NumberPair = [number, number];
type DashAccessor = boolean | NumberPair | StyleAccessorFunction | undefined;
type ColorAccessor = Color | StyleAccessorFunction | undefined;
type SizeAccessor = number | StyleAccessorFunction | undefined;
type StyleData = NumberPair | Color | number;

type LineStyleAccessor = {
    color?: ColorAccessor;
    dash?: DashAccessor;
    width?: SizeAccessor;
};

type WellHeadStyleAccessor = {
    color?: ColorAccessor;
    size?: SizeAccessor;
};

function onDataLoad(
    data: LayerData<FeatureCollection>,
    context: {
        propName: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        layer: Layer<any>;
    }
): void {
    const bbox = GetBoundingBox(data as unknown as FeatureCollection);
    if (typeof context.layer.props.setReportedBoundingBox !== "undefined") {
        context.layer.props.setReportedBoundingBox(bbox);
    }
}

export interface WellsLayerProps extends ExtendedLayerProps {
    pointRadiusScale: number;
    lineWidthScale: number;
    outline: boolean;
    selectedWell: string;
    logData: string | LogCurveDataType[];
    logName: string;
    logColor: string;
    logrunName: string;
    logRadius: number;
    logCurves: boolean;
    refine: boolean;
    wellHeadStyle: WellHeadStyleAccessor;
    colorMappingFunction: (x: number) => [number, number, number];
    lineStyle: LineStyleAccessor;
    wellNameVisible: boolean;
    wellNameAtTop: boolean;
    wellNameSize: number;
    wellNameColor: Color;
    isLog: boolean;
    depthTest: boolean;
    /**  If true means that input z values are interpreted as depths.
     * For example depth of z = 1000 corresponds to -1000 on the z axis. Default true.
     */
    ZIncreasingDownwards: boolean;
    /**  If true means that a simplified representation of the wells will be drawn.
     *   Useful for example during panning and rotation to gain speed.
     */
    simplifiedRendering: boolean;
}

const defaultProps = {
    "@@type": "WellsLayer",
    name: "Wells",
    id: "wells-layer",
    autoHighlight: true,
    opacity: 1,
    lineWidthScale: 1,
    pointRadiusScale: 1,
    lineStyle: { dash: false },
    outline: true,
    logRadius: 10,
    logCurves: true,
    refine: false,
    visible: true,
    wellNameVisible: false,
    wellNameAtTop: false,
    wellNameSize: 14,
    wellNameColor: [0, 0, 0, 255],
    selectedWell: "@@#editedData.selectedWells", // used to get data from deckgl layer
    depthTest: true,
    ZIncreasingDownwards: true,
    simplifiedRendering: false,
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
            objects: Record<string, [Color, number]>;
        }
    >;
}

export interface WellsPickInfo extends LayerPickInfo {
    featureType?: string;
    logName: string;
}

function multiply(pair: [number, number], factor: number): [number, number] {
    return [pair[0] * factor, pair[1] * factor];
}

const LINE = "line";
const POINT = "point";
const DEFAULT_POINT_SIZE = 8;
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

function getColor(accessor: ColorAccessor) {
    if (accessor as Color) {
        return accessor as Color;
    }

    return (object: Feature, objectInfo?: Record<string, unknown>): Color => {
        if (typeof accessor === "function") {
            const color = (accessor as StyleAccessorFunction)(
                object,
                objectInfo
            ) as Color;
            if (color) {
                return color;
            }
        }
        return object.properties?.["color"] as Color;
    };
}

export function getSize(
    type: string,
    accessor: SizeAccessor,
    offset = 0
): number | ((object: Feature) => number) {
    if (typeof accessor == "function") {
        return (object: Feature): number => {
            return (
                ((accessor as StyleAccessorFunction)(object) as number) + offset
            );
        };
    }

    if ((accessor as number) == 0) return 0;
    if ((accessor as number) > 0) return (accessor as number) + offset;

    if (type == LINE) return DEFAULT_LINE_WIDTH + offset;
    if (type == POINT) return DEFAULT_POINT_SIZE + offset;
    return 0;
}

export default class WellsLayer extends CompositeLayer<WellsLayerProps> {
    initializeState(): void {
        let data = this.props.data as unknown as FeatureCollection;
        if (typeof data !== "undefined" && !isEqual(data, [])) {
            if (!this.props.ZIncreasingDownwards) {
                data = invertPath(data);
            }

            const refine = this.props.refine;
            data = refine
                ? splineRefine(data) // smooth well paths.
                : data;

            const coarseData = coarsenWells(data);

            this.setState({
                ...this.state,
                data,
                coarseData,
            });
        }
    }

    updateState({ props, oldProps }: UpdateParameters<WellsLayer>): void {
        const needs_reload =
            !isEqual(props.data, oldProps.data) ||
            !isEqual(
                props.ZIncreasingDownwards,
                oldProps.ZIncreasingDownwards
            ) ||
            !isEqual(props.refine, oldProps.refine);

        if (needs_reload) {
            this.initializeState();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    onClick(info: WellsPickInfo): boolean {
        // Make selection only when drawing is disabled
        if (isDrawingEnabled(this.context.layerManager)) {
            return false;
        } else {
            this.context.userData.setEditedData({
                selectedWell: (info.object as Feature).properties?.["name"],
            });
            return false; // do not return true to allow DeckGL props.onClick to be called
        }
    }

    setSelection(
        well: string | undefined,
        _selection?: [number | undefined, number | undefined]
    ): void {
        if (this.internalState) {
            this.setState({
                well: well,
                selection: _selection,
            });
        }
    }

    setMultiSelection(wells: string[] | undefined): void {
        if (this.internalState) {
            this.setState({
                selectedMultiWells: wells,
            });
        }
    }

    shouldUpdateState({ changeFlags }: UpdateParameters<this>): boolean {
        return (
            changeFlags.viewportChanged ||
            changeFlags.propsOrDataChanged ||
            typeof changeFlags.updateTriggersChanged === "object"
        );
    }

    getLegendData(
        value: LogCurveDataType[]
    ): ContinuousLegendDataType | DiscreteLegendDataType | null {
        return getLegendData(
            value,
            "",
            this.props.logName,
            this.props.logColor
        );
    }

    setLegend(value: LogCurveDataType[]): void {
        this.setState({
            legend: this.getLegendData(value),
        });
    }

    getLogLayer(): Layer {
        const sub_layers = this.internalState?.subLayers as Layer[];
        const log_layer = getLayersById(sub_layers, "wells-layer-log_curve");
        return (log_layer as Layer[])?.[0];
    }

    getSelectionLayer(): Layer {
        const sub_layers = this.internalState?.subLayers as Layer[];
        const log_layer = getLayersById(sub_layers, "wells-layer-selection");
        return (log_layer as Layer[])?.[0];
    }

    getLogCurveData(): LogCurveDataType[] | undefined {
        const log_layer = this.getLogLayer();
        return log_layer?.props.data as LogCurveDataType[];
    }

    setupLegend(): void {
        const data = this.getLogCurveData();
        if (data) this.setLegend(data);
    }

    renderLayers(): LayersList {
        if (!(this.props.data as unknown as FeatureCollection).features) {
            return [];
        }

        const data = this.state["data"];
        const coarseData = this.state["coarseData"];

        const is3d = this.context.viewport.constructor === OrbitViewport;
        const positionFormat = "XYZ";
        const isDashed = !!this.props.lineStyle?.dash;

        const extensions = [
            new PathStyleExtension({
                dash: isDashed,
                highPrecisionDash: isDashed,
            }),
        ];

        const parameters = {
            [GL.DEPTH_TEST]: this.props.depthTest,
            [GL.POLYGON_OFFSET_FILL]: true,
        };

        // Reduced details when rotating or panning the view if "fastDrawing " is set.
        const fastDrawing = this.props.simplifiedRendering;

        const fastLayer = new UnfoldedGeoJsonLayer(
            this.getSubLayerProps({
                id: "simple",
                data: coarseData,
                pickable: false,
                stroked: false,
                positionFormat,
                pointRadiusUnits: "pixels",
                lineWidthUnits: "pixels",
                pointRadiusScale: this.props.pointRadiusScale,
                lineWidthScale: this.props.lineWidthScale,
                getLineWidth: getSize(LINE, this.props.lineStyle?.width, -1),
                getPointRadius: getSize(
                    POINT,
                    this.props.wellHeadStyle?.size,
                    -1
                ),
                getLineColor: getColor(this.props.lineStyle?.color),
                getFillColor: getColor(this.props.wellHeadStyle?.color),
                lineBillboard: true,
                pointBillboard: true,
                parameters,
                visible: fastDrawing,
            })
        );
        const outlineLayer = new UnfoldedGeoJsonLayer(
            this.getSubLayerProps({
                id: "outline",
                data,
                pickable: false,
                stroked: false,
                positionFormat,
                pointRadiusUnits: "pixels",
                lineWidthUnits: "pixels",
                pointRadiusScale: this.props.pointRadiusScale,
                lineWidthScale: this.props.lineWidthScale,
                getLineWidth: getSize(LINE, this.props.lineStyle?.width),
                getPointRadius: getSize(POINT, this.props.wellHeadStyle?.size),
                extensions: extensions,
                getDashArray: getDashFactor(this.props.lineStyle?.dash),
                lineBillboard: true,
                pointBillboard: true,
                parameters,
                visible: this.props.outline && !fastDrawing,
            })
        );

        const colorsLayer = new UnfoldedGeoJsonLayer(
            this.getSubLayerProps({
                id: "colors",
                data,
                pickable: true,
                stroked: false,
                positionFormat,
                pointRadiusUnits: "pixels",
                lineWidthUnits: "pixels",
                pointRadiusScale: this.props.pointRadiusScale,
                lineWidthScale: this.props.lineWidthScale,
                getLineWidth: getSize(LINE, this.props.lineStyle?.width, -1),
                getPointRadius: getSize(
                    POINT,
                    this.props.wellHeadStyle?.size,
                    -1
                ),
                getFillColor: getColor(this.props.wellHeadStyle?.color),
                getLineColor: getColor(this.props.lineStyle?.color),
                extensions: extensions,
                getDashArray: getDashFactor(
                    this.props.lineStyle?.dash,
                    getSize(LINE, this.props.lineStyle?.width),
                    -1
                ),
                lineBillboard: true,
                pointBillboard: true,
                parameters,
                visible: !fastDrawing,
            })
        );

        // Highlight the selected well.
        const highlightLayer = new UnfoldedGeoJsonLayer(
            this.getSubLayerProps({
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
                pointRadiusScale: this.props.pointRadiusScale,
                lineWidthScale: this.props.lineWidthScale,
                getLineWidth: getSize(LINE, this.props.lineStyle?.width, 2),
                getPointRadius: getSize(
                    POINT,
                    this.props.wellHeadStyle?.size,
                    2
                ),
                getFillColor: getColor(this.props.wellHeadStyle?.color),
                getLineColor: getColor(this.props.lineStyle?.color),
                parameters,
                visible: this.props.logCurves && !fastDrawing,
            })
        );

        // Highlight the multi selected wells.
        const highlightMultiWellsLayer = new UnfoldedGeoJsonLayer(
            this.getSubLayerProps({
                id: "highlight2",
                data: getWellObjectsByName(
                    data.features,
                    this.state["selectedMultiWells"]
                ),
                pickable: false,
                stroked: false,
                positionFormat,
                pointRadiusUnits: "pixels",
                lineWidthUnits: "pixels",
                pointRadiusScale: this.props.pointRadiusScale,
                lineWidthScale: this.props.lineWidthScale,
                getLineWidth: getSize(LINE, this.props.lineStyle?.width, -1),
                getPointRadius: getSize(
                    POINT,
                    this.props.wellHeadStyle?.size,
                    2
                ),
                getFillColor: [255, 140, 0],
                getLineColor: [255, 140, 0],
                parameters,
                visible: this.props.logCurves && !fastDrawing,
            })
        );

        const logLayer = new PathLayer<LogCurveDataType>(
            this.getSubLayerProps({
                id: "log_curve",
                data: this.props.logData,
                positionFormat,
                pickable: true,
                widthScale: 10,
                widthMinPixels: 1,
                miterLimit: 100,
                getPath: (d: LogCurveDataType): Position[] =>
                    getLogPath(
                        data.features,
                        d,
                        this.props.logrunName,
                        this.props.lineStyle?.color
                    ),
                getColor: (d: LogCurveDataType): Color[] =>
                    getLogColor(
                        d,
                        this.props.logrunName,
                        this.props.logName,
                        this.props.logColor,
                        (this.context as DeckGLLayerContext).userData
                            .colorTables,
                        this.props.colorMappingFunction,
                        this.props.isLog
                    ),
                getWidth: (d: LogCurveDataType): number | number[] =>
                    this.props.logRadius ||
                    getLogWidth(d, this.props.logrunName, this.props.logName),
                updateTriggers: {
                    getColor: [
                        this.props.logrunName,
                        this.props.logName,
                        this.props.logColor,
                        (this.context as DeckGLLayerContext).userData
                            .colorTables,
                        this.props.isLog,
                    ],
                    getWidth: [
                        this.props.logrunName,
                        this.props.logName,
                        this.props.logRadius,
                    ],
                    getPath: [positionFormat],
                },
                onDataLoad: (value: LogCurveDataType[]) => {
                    this.setLegend(value);
                },
                parameters,
                visible: this.props.logCurves && !fastDrawing,
            })
        );

        const selectionLayer = new PathLayer<LogCurveDataType>(
            this.getSubLayerProps({
                id: "selection",
                data: this.props.logData,
                positionFormat,
                pickable: false,
                widthScale: 10,
                widthMinPixels: 1,
                miterLimit: 100,
                getPath: (d: LogCurveDataType): Position[] =>
                    getLogPath1(
                        data.features,
                        d,
                        this.state["well"],
                        this.state["selection"],
                        this.props.logrunName,
                        this.props.lineStyle?.color
                    ),
                getColor: (d: LogCurveDataType): Color[] =>
                    getLogColor1(
                        data.features,
                        d,
                        this.state["well"],
                        this.state["selection"],
                        this.props.logrunName
                    ),
                getWidth: (d: LogCurveDataType): number | number[] =>
                    this.props.logRadius * 1.5 ||
                    getLogWidth(d, this.props.logrunName, this.props.logName),
                updateTriggers: {
                    getColor: [
                        this.props.logrunName,
                        this.state["well"],
                        this.state["selection"],
                    ],
                    getWidth: [
                        this.props.logrunName,
                        this.props.logName,
                        this.props.logRadius,
                    ],
                    getPath: [
                        positionFormat,
                        this.props.logrunName,
                        this.state["well"],
                        this.state["selection"],
                    ],
                },
                onDataLoad: (value: LogCurveDataType[]) => {
                    this.setLegend(value);
                },
                parameters,
                visible: this.props.logCurves && !fastDrawing,
            })
        );

        // well name
        const namesLayer = new TextLayer<Feature>(
            this.getSubLayerProps({
                id: "names",
                data: data.features,
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
                parameters,
                visible: this.props.wellNameVisible && !fastDrawing,
            })
        );

        return [
            fastLayer,
            outlineLayer,
            logLayer,
            colorsLayer,
            highlightLayer,
            highlightMultiWellsLayer,
            selectionLayer,
            namesLayer,
        ];
    }

    getPickingInfo({ info }: { info: PickingInfo }): WellsPickInfo {
        if (!info.object) return { ...info, properties: [], logName: "" };

        const coordinate = (info.coordinate || [0, 0, 0]) as Position;

        let md_property = getMdProperty(
            coordinate,
            info.object as Feature,
            this.props.lineStyle?.color,
            (info as WellsPickInfo).featureType
        );
        if (!md_property) {
            md_property = getLogProperty(
                coordinate,
                (this.props.data as unknown as FeatureCollection).features,
                info.object,
                this.props.logrunName,
                "MD"
            );
        }
        let tvd_property = getTvdProperty(
            coordinate,
            info.object as Feature,
            this.props.lineStyle?.color,
            (info as WellsPickInfo).featureType
        );
        if (!tvd_property) {
            tvd_property = getLogProperty(
                coordinate,
                (this.props.data as unknown as FeatureCollection).features,
                info.object,
                this.props.logrunName,
                "TVD"
            );
        }
        const log_property = getLogProperty(
            coordinate,
            (this.props.data as unknown as FeatureCollection).features,
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
            logName: log_property?.name || "",
        };
    }
}

WellsLayer.layerName = "WellsLayer";
WellsLayer.defaultProps = {
    ...defaultProps,
    onDataLoad: (
        data: LayerData<FeatureCollection<Geometry, GeoJsonProperties>>,
        context: {
            propName: string;
            layer: Layer;
        }
    ): void => onDataLoad(data, context),
};

//================= Local help functions. ==================

function getColumn<D>(data: D[][], col: number): D[] {
    const column: D[] = [];
    for (let i = 0; i < data.length; i++) {
        column.push(data[i][col]);
    }
    return column;
}

function getLogMd(d: LogCurveDataType, logrun_name: string): number[] {
    if (!isSelectedLogRun(d, logrun_name)) return [];

    const names_md = ["DEPTH", "DEPT", "MD", "TDEP", "MD_RKB"]; // aliases for MD
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

function getWellObjectsByName(
    wells_data: Feature[],
    name: string[]
): Feature[] | undefined {
    const res: Feature[] = [];
    for (let i = 0; i < name?.length; i++) {
        wells_data?.find((item) => {
            if (
                item.properties?.["name"]?.toLowerCase() ===
                name[i]?.toLowerCase()
            ) {
                res.push(item);
            }
        });
    }
    return res;
}

function getPointGeometry(well_object: Feature): Point {
    return (well_object.geometry as GeometryCollection)?.geometries.find(
        (item: { type: string }) => item.type == "Point"
    ) as Point;
}

function getLineStringGeometry(well_object: Feature): LineString {
    return (well_object.geometry as GeometryCollection)?.geometries.find(
        (item: { type: string }) => item.type == "LineString"
    ) as LineString;
}

// Return well head position from Point Geometry
function getWellHeadPosition(well_object: Feature): Position {
    return getPointGeometry(well_object)?.coordinates as Position;
}

// return trajectory visibility based on alpha of trajectory color
function isTrajectoryVisible(
    well_object: Feature,
    color_accessor: ColorAccessor
): boolean {
    let alpha;
    const accessor = getColor(color_accessor);
    if (typeof accessor === "function") {
        alpha = accessor(well_object)?.[3];
    } else {
        alpha = (accessor as Color)?.[3];
    }
    return alpha !== 0;
}

// Return Trajectory data from LineString Geometry if it's visible (checking trajectory visiblity based on line color)
function getTrajectory(
    well_object: Feature,
    color_accessor: ColorAccessor
): Position[] | undefined {
    if (isTrajectoryVisible(well_object, color_accessor))
        return getLineStringGeometry(well_object)?.coordinates as Position[];
    else return undefined;
}

function getWellMds(well_object: Feature): number[] {
    return well_object.properties?.["md"][0];
}

function getNeighboringMdIndices(mds: number[], md: number): number[] {
    const idx = mds.findIndex((x) => x >= md);
    return idx === 0 ? [idx, idx + 1] : [idx - 1, idx];
}

function getPositionByMD(well_xyz: Position[], well_mds: number[], md: number) {
    const [l_idx, h_idx] = getNeighboringMdIndices(well_mds, md);
    const md_low = well_mds[l_idx];
    const md_normalized = (md - md_low) / (well_mds[h_idx] - md_low);
    return interpolateNumberArray(
        well_xyz[l_idx],
        well_xyz[h_idx]
    )(md_normalized);
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
        const xyz = getPositionByMD(well_xyz, well_mds, md);
        log_xyz.push(xyz);
    });

    return log_xyz;
}

function getLogIndexByName(d: LogCurveDataType, log_name: string): number {
    const name = log_name.toLowerCase();
    return d.curves.findIndex((item) => item.name.toLowerCase() === name);
}

function getLogIndexByNames(d: LogCurveDataType, names: string[]): number {
    for (const name of names) {
        const index = getLogIndexByName(d, name);
        if (index >= 0) return index;
    }
    return -1;
}

function getLogColor(
    d: LogCurveDataType,
    logrun_name: string,
    log_name: string,
    logColor: string,
    colorTables: colorTablesArray,
    // eslint-disable-next-line
    colorMappingFunction: any,
    isLog: boolean
): Color[] {
    const log_data = getLogValues(d, logrun_name, log_name);
    const log_info = getLogInfo(d, logrun_name, log_name);
    if (log_data.length == 0 || log_info == undefined) return [];
    const log_color: Color[] = [];
    if (log_info.description == "continuous") {
        const min = Math.min(...log_data);
        const max = Math.max(...log_data);
        const max_delta = max - min;
        log_data.forEach((value) => {
            const rgb = colorMappingFunction
                ? colorMappingFunction((value - min) / max_delta)
                : rgbValues((value - min) / max_delta, logColor, colorTables);
            rgbValues(value - min / max_delta, logColor, colorTables, isLog);

            if (rgb) {
                if (Array.isArray(rgb)) {
                    log_color.push([rgb[0], rgb[1], rgb[2]]);
                } else {
                    log_color.push([rgb?.r, rgb?.g, rgb?.b]);
                }
            } else {
                log_color.push([0, 0, 0, 0]); // push transparent for null/undefined log values
            }
        });
    } else {
        // well log data set for ex : H1: Array(2)0: (4) [255, 26, 202, 255] 1: 13
        const log_attributes = getDiscreteLogMetadata(d, log_name)?.objects;
        const logLength = Object.keys(log_attributes).length;

        // eslint-disable-next-line
        const attributesObject: { [key: string]: any } = {};
        const categorial = true;

        Object.keys(log_attributes).forEach((key) => {
            // get the point from log_attributes
            const point = log_attributes[key][1];
            const categorialMin = 0;
            const categorialMax = logLength - 1;

            let rgb;
            if (colorMappingFunction) {
                rgb = colorMappingFunction(
                    point,
                    categorial,
                    categorialMin,
                    categorialMax
                );
            } else {
                // if colormap function is not defined
                const arrayOfColors: [number, number, number, number][] =
                    getColors(logColor, colorTables, point);
                if (!arrayOfColors.length)
                    console.error(
                        "Empty or missed '" + logColor + "' color table"
                    );
                rgb = arrayOfColors;
            }

            if (rgb) {
                if (Array.isArray(rgb)) {
                    if (rgb.length === 3) {
                        attributesObject[key] = [
                            [rgb[0], rgb[1], rgb[2]],
                            point,
                        ];
                    } else {
                        attributesObject[key] = [
                            [rgb[1], rgb[2], rgb[3]],
                            point,
                        ];
                    }
                } else {
                    attributesObject[key] = [[rgb.r, rgb.g, rgb.b], point];
                }
            }
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

function getLogPath1(
    wells_data: Feature[],
    d: LogCurveDataType,
    selectedWell: string | undefined,
    selection: [number | undefined, number | undefined] | undefined,
    logrun_name: string,
    trajectory_line_color?: ColorAccessor
): Position[] {
    if (!selection || selectedWell !== d.header.well) return [];
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

    const log_mds = getLogMd(d, logrun_name);
    if (!log_mds) return [];

    const log_xyz: Position[] = [];

    let md0 = selection[0] as number;
    if (md0 !== undefined) {
        let md1 = selection[1];
        if (md1 == md0) md1 = undefined;
        const mdFirst = well_mds[0];
        const mdLast = well_mds[well_mds.length - 1];

        if (md1 !== undefined) {
            if (md0 > md1) {
                const tmp: number = md0;
                md0 = md1;
                md1 = tmp;
            }
        }

        const delta = 2;
        if (md0 - delta > mdFirst) {
            let xyz = getPositionByMD(well_xyz, well_mds, md0 - delta);
            log_xyz.push(xyz);
            xyz = getPositionByMD(well_xyz, well_mds, md0);
            log_xyz.push(xyz);
        }
        if (md1 !== undefined) {
            const _md1 = md1 as number;
            let index = 0;
            well_mds.forEach((md) => {
                if (md0 <= md && md <= _md1) {
                    const xyz = well_xyz[index];
                    log_xyz.push(xyz);
                }
                index++;
            });
            if (_md1 + delta < mdLast) {
                let xyz = getPositionByMD(well_xyz, well_mds, _md1);
                log_xyz.push(xyz);
                xyz = getPositionByMD(well_xyz, well_mds, _md1 + delta);
                log_xyz.push(xyz);
            }
        }
    }
    return log_xyz;
}

function getLogColor1(
    wells_data: Feature[],
    d: LogCurveDataType,
    selectedWell: string | undefined,
    selection: [number | undefined, number | undefined] | undefined,
    logrun_name: string
): Color[] {
    if (!selection || selectedWell !== d.header.well) return [];
    const well_object = getWellObjectByName(wells_data, d.header.well);
    if (!well_object) return [];

    const well_mds = getWellMds(well_object);

    const log_mds = getLogMd(d, logrun_name);
    if (!log_mds || log_mds.length === 0) return [];

    const log_color: Color[] = [];

    let md0 = selection[0] as number;
    if (md0 !== undefined) {
        const mdFirst = well_mds[0];
        const mdLast = well_mds[well_mds.length - 1];
        let md1 = selection[1];
        if (md1 == md0) md1 = undefined;
        let swap = false;
        if (md1 !== undefined) {
            if (md0 > md1) {
                const tmp: number = md0;
                md0 = md1;
                md1 = tmp;
                swap = true;
            }
        }
        const delta = 2;
        if (md0 - delta > mdFirst)
            log_color.push(swap ? [0, 255, 0, 128] : [255, 0, 0, 128]);

        if (md1 !== undefined) {
            const _md1 = md1 as number;
            log_color.push([128, 128, 128, 128]);
            well_mds.forEach((md) => {
                if (md0 <= md && md <= _md1) {
                    log_color.push([128, 128, 128, 128]);
                }
            });

            if (_md1 + delta < mdLast)
                log_color.push(swap ? [255, 0, 0, 128] : [0, 255, 0, 128]);
        }
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
    const v0 = subtract(coord as number[], survey0 as number[]);
    const v1 = subtract(survey1 as number[], survey0 as number[]);

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
    accessor: ColorAccessor,
    featureType: string | undefined
): PropertyDataType | null {
    if (featureType === "points") {
        return null;
    }
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
    accessor: ColorAccessor,
    featureType: string | undefined
): PropertyDataType | null {
    if (featureType === "points") {
        return null;
    }
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
    coord: Position,
    wells_data: Feature[],
    log_data: LogCurveDataType,
    logrun_name: string
): number {
    const trajectory = getLogPath(wells_data, log_data, logrun_name);
    return getSegmentIndex(coord, trajectory);
}

function getLogProperty(
    coord: Position,
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

    let dl_attrs: [string, [Color, number]] | undefined = undefined;
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
    wellName: string,
    logName: string,
    logColor: string
): ContinuousLegendDataType | DiscreteLegendDataType | null {
    if (!logs) return null;
    const log = wellName
        ? logs.find((log) => log.header.well == wellName)
        : logs[0];
    const logInfo = !log
        ? undefined
        : getLogInfo(log, log.header.name, logName);
    const title = "Wells / " + logName;
    if (log && logInfo?.description == "discrete") {
        const meta = log["metadata_discrete"];
        const metadataDiscrete = meta[logName].objects;
        return {
            title: title,
            colorName: logColor,
            discrete: true,
            metadata: metadataDiscrete,
        };
    } else {
        const minArray: number[] = [];
        const maxArray: number[] = [];
        logs.forEach(function (log: LogCurveDataType) {
            const logValues = getLogValues(log, log.header.name, logName);
            minArray.push(Math.min(...logValues));
            maxArray.push(Math.max(...logValues));
        });
        return {
            title: title,
            colorName: logColor,
            discrete: false,
            valueRange: [Math.min(...minArray), Math.max(...maxArray)],
        };
    }
}
