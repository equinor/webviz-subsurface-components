import type {
    Color,
    Layer,
    LayerData,
    LayersList,
    PickingInfo,
    UpdateParameters,
} from "@deck.gl/core";
import { CompositeLayer } from "@deck.gl/core";
import type { BinaryFeatureCollection } from "@loaders.gl/schema";
import type {
    ColorMapFunctionType,
    ExtendedLayerProps,
    PropertyDataType,
} from "../utils/layerTools";

import { createPropertyData, isDrawingEnabled } from "../utils/layerTools";

import { PathStyleExtension } from "@deck.gl/extensions";
import { GeoJsonLayer, PathLayer } from "@deck.gl/layers";
import type { colorTablesArray } from "@emerson-eps/color-tables/";
import { getColors, rgbValues } from "@emerson-eps/color-tables/";
import type { Feature, FeatureCollection, Point, Position } from "geojson";
import { distance, dot, subtract } from "mathjs";

import { GL } from "@luma.gl/constants";
import { interpolateNumberArray } from "d3";
import _, { isEmpty, isEqual } from "lodash";
import type {
    ContinuousLegendDataType,
    DiscreteLegendDataType,
} from "../../components/ColorLegend";
import type {
    DeckGLLayerContext,
    ReportBoundingBoxAction,
} from "../../components/Map";
import { getLayersById } from "../../layers/utils/layerTools";
import type { NumberPair, StyleAccessorFunction } from "../types";
import type { WellLabelLayerProps } from "./layers/wellLabelLayer";
import { WellLabelLayer } from "./layers/wellLabelLayer";
import { abscissaTransform } from "./utils/abscissaTransform";
import {
    GetBoundingBox,
    checkWells,
    coarsenWells,
    invertPath,
    splineRefine,
} from "./utils/spline";
import { getColor, getTrajectory } from "./utils/trajectory";
import type {
    WellFeatureCollection,
    WellsPickInfo,
    WellFeature,
    WellHeadStyleAccessor,
    LineStyleAccessor,
    DashAccessor,
    SizeAccessor,
    ColorAccessor,
    LogCurveDataType,
} from "./types";

export interface WellsLayerProps extends ExtendedLayerProps {
    // String, binary and promise is handled internally in Deck.gl to load external data.
    // It's expected that a correctly structured GeoJSON is loaded
    // The typing here is intended to match the data typing for GeoJsonLayers, but we limit
    // the feature type to a single feature collection
    data:
        | string
        | WellFeatureCollection
        | BinaryFeatureCollection
        | Promise<WellFeatureCollection | BinaryFeatureCollection>;

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
    /** Control to refine the well path by super sampling it using a spline interpolation.
     * The well path between each pair of original vertices is split into sub-segments along the spline
     * interpolation.
     * The number of new sub-segments between each pair of original vertices is specified by refine
     * and defaults to 5 if refine is true.
     */
    refine: boolean | number;
    wellHeadStyle: WellHeadStyleAccessor;
    colorMappingFunction: ColorMapFunctionType;
    lineStyle: LineStyleAccessor;

    /**
     * @deprecated use wellLabel instead
     */
    wellNameVisible?: boolean;

    /**
     * @deprecated use wellLabel instead
     * It true place name at top, if false at bottom.
     * If given as a number between 0 and 100,  will place name at this percentage of trajectory from top.
     */
    wellNameAtTop?: boolean | number;

    /**
     * @deprecated use wellLabel instead
     */
    wellNameSize?: number;

    /**
     * @deprecated use wellLabel instead
     */
    wellNameColor?: Color;
    /**
     * If true will prevent well name cluttering by not displaying overlapping names.
     * default false.
     * @deprecated use wellLabel instead
     */
    hideOverlappingWellNames?: boolean;

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

    /** Sectional projection of data */
    section?: boolean;

    // Non public properties:
    reportBoundingBox?: React.Dispatch<ReportBoundingBoxAction>;

    wellLabel?: Partial<WellLabelLayerProps>;
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
    selectedWell: "@@#editedData.selectedWells", // used to get data from deckgl layer
    depthTest: true,
    ZIncreasingDownwards: true,
    simplifiedRendering: false,
    section: false,
    dataTransform: coarsenWells,

    // Deprecated props
    wellNameColor: [0, 0, 0, 255],
    wellNameSize: 10,
};

const LINE = "line";
const POINT = "point";
const DEFAULT_POINT_SIZE = 8;
const DEFAULT_LINE_WIDTH = 5;
const DEFAULT_DASH = [5, 5] as NumberPair;

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
    state!: {
        data: WellFeatureCollection | undefined;
        well: string;
        selectedMultiWells: string[];
        selection: [number, number];
    };

    initializeState(): void {
        const data = this.props.data;
        const refine = this.props.refine;
        const doRefine = typeof refine === "number" ? refine > 1 : refine;
        const stepCount = typeof refine === "number" ? refine : 5;

        if (!dataIsReady(data)) {
            return;
        }

        let transformedData = data;

        if (this.props.ZIncreasingDownwards) {
            transformedData = invertPath(transformedData);
        }

        if (this.props.section) {
            transformedData = abscissaTransform(transformedData);
        }

        // Mutate data to remove duplicates
        checkWells(transformedData);

        // Conditionally apply spline interpolation to refine the well path.
        if (doRefine) {
            transformedData = splineRefine(transformedData, stepCount);
        }

        this.setState({ data: transformedData });
    }

    shouldUpdateState({ changeFlags }: UpdateParameters<this>): boolean {
        return (
            changeFlags.viewportChanged ||
            changeFlags.propsOrDataChanged ||
            typeof changeFlags.updateTriggersChanged === "object"
        );
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
            // ? Why are we looping back to initializeState here? Deck.gl life-cycle intends for
            // ? this to only be called *once*, so this is a confusing choice. (@anders2303)
            this.initializeState();
        }
    }

    onClick(info: WellsPickInfo): boolean {
        // Make selection only when drawing is disabled
        if (isDrawingEnabled(this.context.layerManager)) {
            return false;
        } else {
            this.context.userData.setEditedData({
                selectedWell: info.object?.properties.name,
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

    getWellDataState(): WellFeatureCollection | undefined {
        return this.state.data;
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

    protected getWellLabelPosition() {
        if (this.props.wellLabel?.getPositionAlongPath) {
            return this.props.wellLabel.getPositionAlongPath;
        } else if (!_.isUndefined(this.props.wellNameAtTop)) {
            // Backwards compatibility for `wellNameAtTop` prop.
            if (typeof this.props.wellNameAtTop === "boolean") {
                if (this.props.wellNameAtTop) {
                    return 0;
                }

                // if wellNameAtTop is false, then place name at bottom.
                return 1;
            }

            // `wellNameAtTop` can also be a number [0, 100] indicating the
            // percentage along the trajectory from the top.
            return this.props.wellNameAtTop / 100;
        }
        return 0;
    }

    protected createWellLabelLayer(data: WellFeature[]): WellLabelLayer | null {
        if (!this.props.wellLabel && !this.props.wellNameVisible) {
            return null;
        }

        const parameters = {
            [GL.DEPTH_TEST]: this.props.depthTest,
            [GL.POLYGON_OFFSET_FILL]: true,
        };

        const fastDrawing = this.props.simplifiedRendering;

        const wellLabelProps = this.getSubLayerProps({
            ...this.props.wellLabel,
            data,
            zIncreasingDownwards: this.props.ZIncreasingDownwards,
            getPositionAlongPath: this.getWellLabelPosition(),
            getColor:
                this.props.wellLabel?.getColor ?? this.props.wellNameColor,
            getAnchor: "start",
            getSize: this.props.wellLabel?.getSize ?? this.props.wellNameSize,
            parameters,
            visible: !fastDrawing,
            background:
                this.props.wellLabel?.background ||
                this.props.hideOverlappingWellNames,
        });

        return new WellLabelLayer(wellLabelProps);
    }
    renderLayers(): LayersList {
        const data = this.getWellDataState();
        const positionFormat = "XYZ";
        const isDashed = !!this.props.lineStyle?.dash;

        if (!data || !data?.features.length) {
            return [];
        }

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

        const defaultLayerProps = {
            data,
            pickable: false,
            stroked: false,
            positionFormat,
            pointRadiusUnits: "pixels",
            lineWidthUnits: "pixels",
            pointRadiusScale: this.props.pointRadiusScale,
            lineWidthScale: this.props.lineWidthScale,
            getLineWidth: getSize(LINE, this.props.lineStyle?.width, -1),
            getPointRadius: getSize(POINT, this.props.wellHeadStyle?.size, -1),
            lineBillboard: true,
            pointBillboard: true,
            parameters,
            visible: fastDrawing,
        };

        const colorsLayerProps = this.getSubLayerProps({
            ...defaultLayerProps,
            id: "colors",
            pickable: true,
            extensions,
            getDashArray: getDashFactor(
                this.props.lineStyle?.dash,
                getSize(LINE, this.props.lineStyle?.width),
                -1
            ),
            visible: !fastDrawing,
            getLineColor: getColor(this.props.lineStyle?.color),
            getFillColor: getColor(this.props.wellHeadStyle?.color),
        });

        const fastLayerProps = this.getSubLayerProps({
            ...defaultLayerProps,
            id: "simple",
            positionFormat,
            getLineColor: getColor(this.props.lineStyle?.color),
            getFillColor: getColor(this.props.wellHeadStyle?.color),
        });

        const outlineLayerProps = this.getSubLayerProps({
            ...defaultLayerProps,
            id: "outline",
            getLineWidth: getSize(LINE, this.props.lineStyle?.width),
            getPointRadius: getSize(POINT, this.props.wellHeadStyle?.size),
            extensions,
            getDashArray: getDashFactor(this.props.lineStyle?.dash),
            visible: this.props.outline && !fastDrawing,
            parameters: {
                ...parameters,
                [GL.POLYGON_OFFSET_FACTOR]: 1,
                [GL.POLYGON_OFFSET_UNITS]: 1,
            },
        });

        const highlightLayerProps = this.getSubLayerProps({
            ...defaultLayerProps,
            id: "highlight",
            data: getWellObjectByName(data.features, this.props.selectedWell),
            getLineWidth: getSize(LINE, this.props.lineStyle?.width, 2),
            getPointRadius: getSize(POINT, this.props.wellHeadStyle?.size, 2),
            getLineColor: getColor(this.props.lineStyle?.color),
            getFillColor: getColor(this.props.wellHeadStyle?.color),
            visible: this.props.logCurves && !fastDrawing,
        });

        const highlightMultiWellsLayerProps = this.getSubLayerProps({
            ...defaultLayerProps,
            id: "highlight2",
            data: getWellObjectsByName(
                data.features,
                this.state.selectedMultiWells
            ),
            getPointRadius: getSize(POINT, this.props.wellHeadStyle?.size, 2),
            getFillColor: [255, 140, 0],
            getLineColor: [255, 140, 0],
            visible: this.props.logCurves && !fastDrawing,
        });

        const fastLayer = new GeoJsonLayer(fastLayerProps);
        const outlineLayer = new GeoJsonLayer(outlineLayerProps);
        const colorsLayer = new GeoJsonLayer(colorsLayerProps);

        // Highlight the selected well.
        const highlightLayer = new GeoJsonLayer(highlightLayerProps);

        // Highlight the multi selected wells.
        const highlightMultiWellsLayer = new GeoJsonLayer(
            highlightMultiWellsLayerProps
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
                        this.state.well,
                        this.state.selection,
                        this.props.logrunName,
                        this.props.lineStyle?.color
                    ),
                getColor: (d: LogCurveDataType): Color[] =>
                    getLogColor1(
                        data.features,
                        d,
                        this.state.well,
                        this.state.selection,
                        this.props.logrunName
                    ),
                getWidth: (d: LogCurveDataType): number | number[] =>
                    this.props.logRadius * 1.5 ||
                    getLogWidth(d, this.props.logrunName, this.props.logName),
                updateTriggers: {
                    getColor: [
                        this.props.logrunName,
                        this.state.well,
                        this.state.selection,
                    ],
                    getWidth: [
                        this.props.logrunName,
                        this.props.logName,
                        this.props.logRadius,
                    ],
                    getPath: [
                        positionFormat,
                        this.props.logrunName,
                        this.state.well,
                        this.state.selection,
                    ],
                },
                onDataLoad: (value: LogCurveDataType[]) => {
                    this.setLegend(value);
                },
                parameters,
                visible: this.props.logCurves && !fastDrawing,
            })
        );

        const namesLayer = this.createWellLabelLayer(data.features);

        const layers = [
            outlineLayer,
            logLayer,
            colorsLayer,
            highlightLayer,
            highlightMultiWellsLayer,
            selectionLayer,
            namesLayer,
        ];
        if (fastDrawing) {
            layers.push(fastLayer);
        }
        return layers;
    }

    getPickingInfo({ info }: { info: PickingInfo }): WellsPickInfo {
        if (!info.object) return { ...info, properties: [], logName: "" };

        const features = this.getWellDataState()?.features ?? [];
        const coordinate: Position = info.coordinate || [0, 0, 0];

        const zScale = this.props.modelMatrix ? this.props.modelMatrix[10] : 1;
        if (typeof coordinate[2] !== "undefined") {
            coordinate[2] /= Math.max(0.001, zScale);
        }

        let md_property: PropertyDataType | null = null;
        let tvd_property: PropertyDataType | null = null;
        let log_property: PropertyDataType | null = null;

        // ! This needs to be updated if we ever change the sub-layer id!
        if (info.sourceLayer?.id === `${this.props.id}-log_curve`) {
            // The user is hovering a well log entry
            const logPick = info as PickingInfo<LogCurveDataType>;

            md_property = getLogProperty(
                coordinate,
                features,
                logPick.object!,
                this.props.logrunName,
                "MD"
            );

            tvd_property = getLogProperty(
                coordinate,
                features,
                logPick.object!,
                this.props.logrunName,
                "TVD"
            );

            log_property = getLogProperty(
                coordinate,
                features,
                info.object,
                this.props.logrunName,
                this.props.logName
            );
        } else {
            // User is hovering a wellbore path
            const wellpickInfo = info as PickingInfo<WellFeature>;

            md_property = getMdProperty(
                coordinate,
                wellpickInfo.object!,
                this.props.lineStyle?.color,
                (info as WellsPickInfo).featureType
            );
            tvd_property = getTvdProperty(
                coordinate,
                info.object,
                this.props.lineStyle?.color,
                (info as WellsPickInfo).featureType
            );
        }

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
        data: LayerData<WellFeatureCollection>,
        context: {
            propName: string;
            layer: Layer;
        }
    ): void => onDataLoad(data, context),
};

//================= Local help functions. ==================
function onDataLoad(
    data: LayerData<FeatureCollection>,
    context: {
        propName: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        layer: Layer<any>;
    }
): void {
    const bbox = GetBoundingBox(data as unknown as FeatureCollection);
    if (typeof context.layer.props.reportBoundingBox !== "undefined") {
        context.layer.props.reportBoundingBox({ layerBoundingBox: bbox });
    }
}

function multiply(pair: [number, number], factor: number): [number, number] {
    return [pair[0] * factor, pair[1] * factor];
}

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

function dataIsReady(
    layerData: WellsLayerProps["data"]
): layerData is WellFeatureCollection {
    // Deck.gl always shows prop.data as `[]` while external data is being loaded
    return !!layerData && !isEmpty(layerData);
}

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

function getWellObjectByName(
    wells_data: WellFeature[],
    name: string
): WellFeature | undefined {
    return wells_data?.find(
        (item) => item.properties?.name?.toLowerCase() === name?.toLowerCase()
    );
}

function getWellObjectsByName(
    wells_data: WellFeature[],
    name: string[]
): WellFeature[] | undefined {
    const res: WellFeature[] = [];
    for (let i = 0; i < name?.length; i++) {
        wells_data?.find((item) => {
            if (item.properties?.name?.toLowerCase() === name[i]?.toLowerCase())
                res.push(item);
        });
    }
    return res;
}

function getPointGeometry(well_object: WellFeature): Point | undefined {
    const geometries = well_object.geometry.geometries;
    return geometries.find((item): item is Point => item.type === "Point");
}

// Return well head position from Point Geometry
function getWellHeadPosition(well_object: WellFeature): Position {
    return getPointGeometry(well_object)?.coordinates ?? [-1, -1, -1];
}

function getWellMds(well_object: WellFeature): number[] {
    return well_object.properties.md[0];
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
    wells_data: WellFeature[],
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
    colorMappingFunction: WellsLayerProps["colorMappingFunction"],
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
            const adjustedVal = (value - min) / max_delta;

            const rgb = colorMappingFunction
                ? colorMappingFunction(adjustedVal)
                : rgbValues(adjustedVal, logColor, colorTables, isLog);

            if (rgb) {
                log_color.push([rgb[0], rgb[1], rgb[2]]);
            } else {
                log_color.push([0, 0, 0, 0]); // push transparent for null/undefined log values
            }
        });
    } else {
        // well log data set for ex : H1: Array(2)0: (4) [255, 26, 202, 255] 1: 13
        const log_attributes = getDiscreteLogMetadata(d, log_name)?.objects;
        const logLength = Object.keys(log_attributes).length;

        const attributesObject: { [key: string]: [Color, number] } = {};
        const categorical = true;

        Object.keys(log_attributes).forEach((key) => {
            // get the point from log_attributes
            const point = log_attributes[key][1];
            const categoricalMin = 0;
            const categoricalMax = logLength - 1;

            let rgb;
            if (colorMappingFunction) {
                rgb = colorMappingFunction(
                    point,
                    categorical,
                    categoricalMin,
                    categoricalMax
                );
            } else {
                // if color-map function is not defined
                const arrayOfColors: number[] = getColors(
                    logColor,
                    colorTables,
                    point
                );

                if (!arrayOfColors.length)
                    console.error(`Empty or missed '${logColor}' color table`);
                else {
                    rgb = arrayOfColors;
                }
            }

            if (rgb) {
                if (rgb.length === 3) {
                    attributesObject[key] = [[rgb[0], rgb[1], rgb[2]], point];
                } else {
                    // ? What is the point of this? Why do we offset the index in this case, isn't the fourth value the opacity?
                    // (@anders2303)
                    attributesObject[key] = [[rgb[1], rgb[2], rgb[3]], point];
                }
            }
        });
        log_data.forEach((log_value) => {
            const dl_attrs = Object.entries(attributesObject).find(
                ([, value]) => (value as [Color, number])[1] == log_value
            )?.[1];

            if (dl_attrs) log_color.push(dl_attrs[0]);
            else log_color.push([0, 0, 0, 0]); // use transparent for undefined/null log values
        });
    }
    return log_color;
}

function getLogPath1(
    wells_data: WellFeature[],
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
    wells_data: WellFeature[],
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
    feature: WellFeature,
    accessor: ColorAccessor
): number | null {
    if (!feature.properties?.["md"]?.[0] || !feature.geometry) return null;

    const measured_depths = feature.properties.md[0] as number[];
    const trajectory3D = getTrajectory(feature, accessor);

    if (trajectory3D == undefined) return null;

    let trajectory;
    // In 2D view coord is of type Position2D and in 3D view it's Position3D,
    // so use appropriate trajectory for interpolation
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
    feature: WellFeature,
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
    feature: WellFeature,
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
    feature: WellFeature,
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
    wells_data: WellFeature[],
    log_data: LogCurveDataType,
    logrun_name: string
): number {
    const trajectory = getLogPath(wells_data, log_data, logrun_name);
    return getSegmentIndex(coord, trajectory);
}

function getLogProperty(
    coord: Position,
    wells_data: WellFeature[],
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

// Return data required to build well layer legend
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
