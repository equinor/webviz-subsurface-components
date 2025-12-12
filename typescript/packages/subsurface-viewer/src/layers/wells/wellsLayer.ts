import _, { isEmpty, isEqual } from "lodash";

import type {
    Accessor,
    Color,
    Layer,
    LayerData,
    LayersList,
    PickingInfo,
    UpdateParameters,
} from "@deck.gl/core";
import { CompositeLayer } from "@deck.gl/core";
import { PathStyleExtension } from "@deck.gl/extensions";
import type { GeoJsonLayerProps } from "@deck.gl/layers";
import { GeoJsonLayer } from "@deck.gl/layers";
import type { BinaryFeatureCollection } from "@loaders.gl/schema";
import { GL } from "@luma.gl/constants";

import type { Feature, FeatureCollection, Position } from "geojson";

import type { ColormapFunctionType } from "../utils/colormapTools";
import type {
    DeckGLLayerContext,
    ExtendedLayerProps,
    PropertyDataType,
    ReportBoundingBoxAction,
} from "../utils/layerTools";
import {
    createPropertyData,
    getFromAccessor,
    getLayersById,
    isDrawingEnabled,
} from "../utils/layerTools";

import { SectionViewport } from "../../viewports";
import type { NumberPair } from "../types";
import type { WellLabelLayerProps } from "./layers/wellLabelLayer";
import { WellLabelLayer } from "./layers/wellLabelLayer";
import type {
    AbscissaTransform,
    ColorAccessor,
    DashAccessor,
    LineStyleAccessor,
    LogCurveDataType,
    WellFeature,
    WellFeatureCollection,
    WellHeadStyleAccessor,
    WellsPickInfo,
} from "./types";
import { abscissaTransform } from "./utils/abscissaTransform";
import {
    GetBoundingBox,
    checkWells,
    coarsenWells,
    invertPath,
    splineRefine,
} from "./utils/spline";
import { getColor, getMd, getTrajectory, getTvd } from "./utils/trajectory";
import type { LogCurveLayerProps } from "./layers/logCurveLayer";
import { LogCurveLayer } from "./layers/logCurveLayer";
import {
    getWellMds,
    getWellObjectByName,
    getWellObjectsByName,
} from "./utils/wells";
import { getLegendData, getLogProperty } from "./utils/log";
import type {
    ContinuousLegendDataType,
    DiscreteLegendDataType,
} from "../../components/ColorLegend";
import { getSize, LINE, POINT, DEFAULT_LINE_WIDTH } from "./utils/features";
import { scaleArray } from "../../utils/arrays";

const DEFAULT_DASH = [5, 5] as NumberPair;

export enum SubLayerId {
    COLORS = "colors",
    SIMPLE = "simple",
    OUTLINE = "outline",
    HIGHLIGHT = "highlight",
    HIGHLIGHT_2 = "highlight2",
    LOG_CURVE = "log_curve",
    SELECTION = "selection",
    LABELS = "labels",
}

export interface WellsLayerProps extends ExtendedLayerProps {
    /**
     * Well data to render; described as a single GeoJSON feature collection, which each individual well as a distinct feature.
     *
     * Accepted data formats:
     * * A javascript object.
     * * A binary/flat GeoJSON object
     * * A url string pointing to external GeoJSON data.
     * * A promise returning GeoJSON data.
     */
    // String, binary and promise is handled internally in Deck.gl to load external data.
    // The typing here matches the type used in GeoJsonLayer (but with a more strict feature definition)
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
    colorMappingFunction: ColormapFunctionType;
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
    section?: boolean | AbscissaTransform;

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

export default class WellsLayer extends CompositeLayer<WellsLayerProps> {
    state!: {
        data: WellFeatureCollection | undefined;
        logData: LogCurveDataType[] | undefined;
        selectedMultiWells: string[];
        logDomainSelection: { well: string; selection: number[] } | undefined;
        sectionData?: WellFeatureCollection;
    };

    private recomputeDataState() {
        const { data, refine, ZIncreasingDownwards, section } = this.props;

        const doRefine = typeof refine === "number" ? refine > 1 : refine;
        const stepCount = typeof refine === "number" ? refine : 5;

        if (!dataIsReady(data)) {
            return;
        }

        let transformedData = data;

        if (ZIncreasingDownwards) {
            transformedData = invertPath(transformedData);
        }

        // Create a state for the section projection of the data, which by default is
        // identical to the original transformed data.
        let sectionData = transformedData;

        // Mutate data to remove duplicates
        checkWells(transformedData);

        // Apply sectional projection if requested
        if (section) {
            if (typeof section === "function") {
                sectionData = section(transformedData);
            } else if (section === true) {
                sectionData = abscissaTransform(transformedData);
            }
        }

        // Mutate data to remove duplicates
        checkWells(sectionData);

        // Conditionally apply spline interpolation to refine the well path.
        if (doRefine) {
            transformedData = splineRefine(transformedData, stepCount);
            sectionData = splineRefine(sectionData, stepCount);
        }

        this.setState({ data: transformedData, sectionData });
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
            this.recomputeDataState();
        }
    }

    onClick(info: WellsPickInfo): boolean {
        // Make selection only when drawing is disabled
        if (isDrawingEnabled(this.context.layerManager)) {
            return false;
        } else {
            this.context.userData.setEditedData({
                selectedWell: info.wellName,
            });
            return false; // do not return true to allow DeckGL props.onClick to be called
        }
    }

    setSelection(
        well: string | undefined,
        _selection?: [number | undefined, number | undefined]
    ): void {
        if (!this.internalState) return;

        if (!well || !_selection) {
            this.setState({
                logDomainSelection: undefined,
            });
        } else {
            this.setState({
                logDomainSelection: { well: well, selection: _selection },
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
        const { data, sectionData } = this.state;

        if (this.context.viewport.constructor === SectionViewport) {
            return sectionData;
        }

        return data;
    }

    // ? Unused ?
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

    getLogLayer(): Layer | undefined {
        const sub_layers = this.internalState?.subLayers as Layer[];
        const log_layer = getLayersById(sub_layers, "wells-layer-log_curve");
        return (log_layer as LogCurveLayer[])?.[0]?.getCurveLayer();
    }

    getSelectionLayer(): Layer | undefined {
        const sub_layers = this.internalState?.subLayers as Layer[];
        const log_layer = getLayersById(sub_layers, "wells-layer-log_curve");
        return (log_layer as LogCurveLayer[])?.[0]?.getSelectionLayer();
    }

    getLogCurveData(): LogCurveDataType[] | undefined {
        return this.state.logData;
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
            id: SubLayerId.LABELS,
            data,
            pickable: true,
            // Z is always increasing upwards at this stage
            zIncreasingDownwards: false,

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
        } as Partial<GeoJsonLayerProps>;

        const colorsLayerProps = this.getSubLayerProps({
            ...defaultLayerProps,
            id: SubLayerId.COLORS,
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
            id: SubLayerId.SIMPLE,
            positionFormat,
            getLineColor: getColor(this.props.lineStyle?.color),
            getFillColor: getColor(this.props.wellHeadStyle?.color),
        });

        const outlineLayerProps = this.getSubLayerProps({
            ...defaultLayerProps,
            id: SubLayerId.OUTLINE,
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
            id: SubLayerId.HIGHLIGHT,
            data: getWellObjectByName(data.features, this.props.selectedWell),
            getLineWidth: getSize(LINE, this.props.lineStyle?.width, 2),
            getPointRadius: getSize(POINT, this.props.wellHeadStyle?.size, 2),
            getLineColor: getColor(this.props.lineStyle?.color),
            getFillColor: getColor(this.props.wellHeadStyle?.color),
            visible: this.props.logCurves && !fastDrawing,
        });

        const highlightMultiWellsLayerProps = this.getSubLayerProps({
            ...defaultLayerProps,
            id: SubLayerId.HIGHLIGHT_2,
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

        const logLayer = new LogCurveLayer({
            ...this.getSubLayerProps({
                id: SubLayerId.LOG_CURVE,

                visible: this.props.logCurves && !fastDrawing,
                pickable: true,
                parameters,
                positionFormat,

                data: this.props.logData,
                trajectoryData: data,
                domainSelection: this.state.logDomainSelection,
                logWidth: this.props.logRadius || "value",
                activeLog: {
                    logRun: this.props.logrunName,
                    curveName: this.props.logName,
                },

                colorScale: {
                    name: this.props.logColor,
                    isLogarithmic: this.props.isLog,
                    colorTables: (this.context as DeckGLLayerContext).userData
                        .colorTables,
                    mappingFunction: this.props.colorMappingFunction,
                },

                getWellMds: getWellMds,
                getTrajectoryPath: (d: WellFeature) =>
                    getTrajectory(d, this.props.lineStyle?.color),

                onLogDataComputed: (value: LogCurveDataType[]) => {
                    this.setState({ logData: value });
                    this.setLegend(value);
                },

                updateTriggers: {
                    getTrajectoryPath: [this.props.lineStyle],
                },
            } as Partial<LogCurveLayerProps>),
        });

        const namesLayer = this.createWellLabelLayer(data.features);

        const layers = [
            outlineLayer,
            logLayer,
            colorsLayer,
            highlightLayer,
            highlightMultiWellsLayer,
            namesLayer,
        ];
        if (fastDrawing) {
            layers.push(fastLayer);
        }
        return layers;
    }

    getPickingInfo({ info }: { info: PickingInfo }): WellsPickInfo {
        const noLog = {
            properties: [],
            logName: "",
        };

        if (!info.object || info.sourceLayer?.constructor === WellLabelLayer) {
            return { ...info, ...noLog };
        }

        const features = this.getWellDataState()?.features ?? [];
        const coordinate: Position = info.coordinate || [0, 0, 0];

        const zScale = this.props.modelMatrix ? this.props.modelMatrix[10] : 1;
        if (typeof coordinate[2] !== "undefined") {
            coordinate[2] /= Math.max(0.001, zScale);
        }

        let wellName: string | undefined = undefined;

        let md_property: PropertyDataType | null = null;
        let tvd_property: PropertyDataType | null = null;
        let log_property: PropertyDataType | null = null;

        // ! This needs to be updated if we ever change the sub-layer id!
        if (
            info.sourceLayer?.id === `${this.props.id}-${SubLayerId.LOG_CURVE}`
        ) {
            // The user is hovering a well log entry
            const logPick = info as PickingInfo<LogCurveDataType>;

            wellName = logPick.object?.header?.well;

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

            wellName = wellpickInfo.object?.properties?.name;

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
            logName: log_property?.name,
            wellName: wellName,
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

// Create a dash accessor function that scales
function getDashFactor(
    accessor: DashAccessor,
    widthAccessor?: Accessor<Feature, number>,
    offset = 0
): Accessor<Feature, NumberPair> {
    return (object, ctx): NumberPair => {
        const dashValue = getFromAccessor(accessor, object, ctx);
        const width =
            getFromAccessor(widthAccessor, object, ctx) ?? DEFAULT_LINE_WIDTH;

        const factor = width / (width + offset);

        let dashArray: NumberPair = [0, 0];

        if (dashValue && Array.isArray(dashValue)) {
            dashArray = dashValue;
        } else if (dashValue) {
            dashArray = DEFAULT_DASH;
        }

        return scaleArray(dashArray, factor);
    };
}

function dataIsReady(
    layerData: WellsLayerProps["data"]
): layerData is WellFeatureCollection {
    // Deck.gl always shows prop.data as `[]` while external data is being loaded
    return !!layerData && !isEmpty(layerData);
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
