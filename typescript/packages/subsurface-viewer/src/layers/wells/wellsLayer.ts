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
import type { DataFilterExtensionProps } from "@deck.gl/extensions";
import { DataFilterExtension, PathStyleExtension } from "@deck.gl/extensions";
import type { GeoJsonLayerProps } from "@deck.gl/layers";
import { GeoJsonLayer, PathLayer } from "@deck.gl/layers";
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

import type {
    ContinuousLegendDataType,
    DiscreteLegendDataType,
} from "../../components/ColorLegend";
import { scaleArray } from "../../utils/arrays";
import { isClose } from "../../utils/measurement";
import { SectionViewport } from "../../viewports";
import type { NumberPair } from "../types";
import { DashedSectionsPathLayer } from "./layers/dashedSectionsPathLayer";
import type { LogCurveLayerProps } from "./layers/logCurveLayer";
import { LogCurveLayer } from "./layers/logCurveLayer";
import type {
    MarkerData,
    TrajectoryMarker,
} from "./layers/trajectoryMarkerLayer";
import { TrajectoryMarkersLayer } from "./layers/trajectoryMarkerLayer";
import type { WellLabelLayerProps } from "./layers/wellLabelLayer";
import { WellLabelLayer } from "./layers/wellLabelLayer";
import type {
    AbscissaTransform,
    ColorAccessor,
    DashAccessor,
    DashedSectionsLayerPickInfo,
    LineStyleAccessor,
    LogCurveDataType,
    PerforationProperties,
    WellFeature,
    WellFeatureCollection,
    WellHeadStyleAccessor,
    WellsPickInfo,
} from "./types";
import { abscissaTransform } from "./utils/abscissaTransform";
import { DEFAULT_LINE_WIDTH, getSize, LINE, POINT } from "./utils/features";
import { getLegendData, getLogProperty } from "./utils/log";
import { createPerforationReadout, createScreenReadout } from "./utils/readout";
import {
    checkWells,
    coarsenWells,
    GetBoundingBox,
    invertPath,
    splineRefine,
} from "./utils/spline";
import {
    getColor,
    getMd,
    getTrajectory,
    getTvd,
    injectMdPoints,
} from "./utils/trajectory";
import {
    getWellMds,
    getWellObjectByName,
    getWellObjectsByName,
} from "./utils/wells";

const DEFAULT_DASH = [5, 5] as NumberPair;

interface SourcedSubLayerData {
    __source: {
        object: WellFeature;
        index: number;
    };
}

export enum SubLayerId {
    COLORS = "colors",
    SIMPLE = "simple",
    OUTLINE = "outline",
    HIGHLIGHT = "highlight",
    HIGHLIGHT_2 = "highlight2",
    LOG_CURVE = "log_curve",
    SELECTION = "selection",
    LABELS = "labels",
    MARKERS = "markers",
    WELL_HEADS = "well_head",
    SCREEN_TRAJECTORY = "screen_trajectory",
    SCREEN_TRAJECTORY_OUTLINE = "screen_trajectory_outline",
    TRAJECTORY_FILTER_GHOST = "trajectory_filter_ghost",
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

    /* --- Screens and perforations --- --- --- --- ---*/
    /**
     * Renders screen sections of the trajectory as dashed segments.
     *
     * **Note: If enabled, the COLORS sub-layer will be replaced by the SCREEN_TRAJECTORY sub-layer**
     */
    showScreenTrajectory: boolean;
    /** Specifies the dash factor for screen sections. */
    getScreenDashFactor: DashAccessor;

    /** Enables simple line markers at the start and end of screen sections.
     *
     * **Note:** These markers are currently only designed for 2D, so they are not guaranteed to look nice in 3D
     */
    showScreenMarkers: boolean;
    /** Enables visualization of trajectory perforations.
     *
     * **Note:** These markers are currently only designed for 2D, so they are not guaranteed to look nice in 3D
     */
    showPerforationsMarkers: boolean;

    /* --- Filtering -- --- --- --- --- --- --- --- --- */
    /** Enables well filtering  */
    enableFilters: boolean;
    /** Filter wells by measured depth (MD).
     * - Return [min, max] to show only the portion of the well between these MD values
     * - Return [max, min] (inverted) to show everything OUTSIDE this range
     * - Return undefined or [-1, -1] to show the entire well
     * Multiple ranges are additive
     *
     * **Note:** To make sure trajectories paths disappear at the correct point, each
     * range value will inject a point into the path array; meaning layers will recompute
     * each time this is changed
     */
    mdFilterRange: [number, number] | [number, number][];

    /** Filters wells based on name */
    wellNameFilter: string[];

    /**
     * Filters trajectory paths to formation sections
     */
    formationFilter: string[];

    /** Shows a simple trajectory in place of filtered sections. If color is not specified, a light gray will be used */
    showFilterTrajectoryGhost: boolean | Color;
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

    getScreenDashFactor: { type: "accessor", value: [5, 5] },
    mdFilterRange: [],
    formationFilter: [],
    wellNameFilter: [],
    enableFilters: false,

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

        if (this.props.enableFilters) {
            transformedData = injectMdPointsForFilter(
                transformedData,
                this.props.mdFilterRange
            );
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
            !isEqual(props.refine, oldProps.refine) ||
            !isEqual(props.enableFilters, oldProps.enableFilters) ||
            !isEqual(props.mdFilterRange, oldProps.mdFilterRange) ||
            !isEqual(props.formationFilter, oldProps.formationFilter);

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
        selection?: [number | undefined, number | undefined]
    ): void {
        if (!this.internalState) return;

        if (!well || !selection) {
            this.setState({
                logDomainSelection: undefined,
            });
        } else {
            this.setState({
                logDomainSelection: { well, selection },
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
        const log_layers = getLayersById(sub_layers, "wells-layer-log_curve");
        return (log_layers as LogCurveLayer[])?.[0]?.getCurveLayer();
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
        const isDashed = !!this.props.lineStyle?.dash;

        if (!data || !data?.features.length) {
            return [];
        }

        const sanitizedFilterBands = makeSanitizedFilterBands(
            this.props.mdFilterRange
        );

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
            positionFormat: this.props.positionFormat ?? "XYZ",
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
            filterEnabled: false,
        } as Partial<GeoJsonLayerProps>;

        // Map GeoJsonLayer properties to match PathLayerProps
        const colorsLayerProps = this.getSubLayerProps({
            ...defaultLayerProps,
            // Whenever _subLayerProps.linestrings.type changes, we need to ensure an entirely new
            // layer instance is created to avoid state errors, which is why we modify the ID.
            id: this.props.showScreenTrajectory
                ? SubLayerId.SCREEN_TRAJECTORY
                : SubLayerId.COLORS,
            pickable: true,

            extensions: [
                ...extensions,
                new DataFilterExtension({
                    filterSize: 1,
                }),
            ],
            getDashArray: getDashFactor(
                this.props.lineStyle?.dash,
                getSize(LINE, this.props.lineStyle?.width),
                -1
            ),
            visible: !fastDrawing,
            getLineColor: getColor(this.props.lineStyle?.color),
            getFillColor: getColor(this.props.wellHeadStyle?.color),

            filterEnabled: this.props.enableFilters,

            // ? I should be able to use filterCategories: [1] and `getFilterCategory`, but it's not working for path section filtering
            filterRange: [1, 1],
            getFilterValue: (d) =>
                getTrajectoryFilterCategory(
                    d,
                    sanitizedFilterBands,
                    this.props.formationFilter,
                    this.props.wellNameFilter
                ),
            updateTriggers: {
                getFilterValue: [
                    this.props.formationFilter,
                    this.props.wellNameFilter,
                    ...sanitizedFilterBands,
                ],
            },

            // Override path layer to use opt-in screen dashes
            _subLayerProps: {
                linestrings: {
                    type: this.props.showScreenTrajectory
                        ? DashedSectionsPathLayer
                        : PathLayer,
                    getScreenDashArray: getDashFactor(
                        this.props.getScreenDashFactor,
                        getSize(LINE, this.props.lineStyle?.width),
                        -1
                    ),
                    getCumulativePathDistance: (d: SourcedSubLayerData) =>
                        d.__source.object.properties.md[0],
                    getDashedSectionsAlongPath: (d: SourcedSubLayerData) => {
                        const feature = d.__source.object as WellFeature;

                        const maxMd = feature.properties.md[0]?.at(-1);
                        if (maxMd === undefined) return undefined;

                        return feature.properties.screens?.map((screen) => [
                            screen.mdStart / maxMd,
                            screen.mdEnd / maxMd,
                        ]);
                    },
                },
            },
        } as Partial<GeoJsonLayerProps<WellFeature>> &
            Partial<DataFilterExtensionProps<WellFeature>>);

        const fastLayerProps = this.getSubLayerProps({
            ...defaultLayerProps,
            id: SubLayerId.SIMPLE,
            getLineColor: getColor(this.props.lineStyle?.color),
            getFillColor: getColor(this.props.wellHeadStyle?.color),
        });

        const filterGhostLayerProps = this.getSubLayerProps({
            ...defaultLayerProps,
            extensions: [
                new DataFilterExtension({
                    filterSize: 1,
                }),
            ],

            id: SubLayerId.TRAJECTORY_FILTER_GHOST,

            filterEnabled: this.props.enableFilters,

            getFillColor: Array.isArray(this.props.showFilterTrajectoryGhost)
                ? this.props.showFilterTrajectoryGhost
                : [225, 225, 225],
            getLineColor: Array.isArray(this.props.showFilterTrajectoryGhost)
                ? this.props.showFilterTrajectoryGhost
                : [225, 225, 225],

            // ? I should be able to use filterCategories: [1] and `getFilterCategory`, but it's not working for path section filtering
            filterRange: [1, 1],
            getFilterValue: (d: WellFeature) => {
                const includeFilter = getTrajectoryFilterCategory(
                    d,
                    sanitizedFilterBands,
                    this.props.formationFilter,
                    this.props.wellNameFilter
                );

                if (!Array.isArray(includeFilter)) return 1 - includeFilter;

                return includeFilter.map((n) => 1 - n);
            },
            getDashArray: getDashFactor(this.props.lineStyle?.dash),
            visible:
                !fastDrawing &&
                this.props.enableFilters &&
                this.props.showFilterTrajectoryGhost,

            parameters: {
                ...parameters,
                [GL.POLYGON_OFFSET_FACTOR]: 1,
                [GL.POLYGON_OFFSET_UNITS]: 1,
            },
            updateTriggers: {
                getFilterValue: [
                    this.props.formationFilter,
                    this.props.wellNameFilter,
                    ...sanitizedFilterBands,
                ],
            },
        } as GeoJsonLayerProps);

        const outlineLayerProps = this.getSubLayerProps({
            ...defaultLayerProps,
            // Whenever _subLayerProps.linestrings.type changes, we need to ensure an entirely new
            // layer instance is created to avoid state errors, which is why we modify the ID.
            id: this.props.showScreenTrajectory
                ? SubLayerId.SCREEN_TRAJECTORY_OUTLINE
                : SubLayerId.OUTLINE,
            getLineWidth: getSize(LINE, this.props.lineStyle?.width),
            getPointRadius: getSize(POINT, this.props.wellHeadStyle?.size),
            extensions: [
                ...extensions,
                new DataFilterExtension({
                    filterSize: 1,
                }),
            ],
            filterEnabled: this.props.enableFilters,
            // ? I should be able to use filterCategories: [1] and `getFilterCategory`, but it's not working for path section filtering
            filterRange: [1, 1],
            getFilterValue: (d: WellFeature) =>
                getTrajectoryFilterCategory(
                    d,
                    sanitizedFilterBands,
                    this.props.formationFilter,
                    this.props.wellNameFilter
                ),
            getDashArray: getDashFactor(this.props.lineStyle?.dash),
            visible: this.props.outline && !fastDrawing,
            parameters: {
                ...parameters,
                [GL.POLYGON_OFFSET_FACTOR]: 1,
                [GL.POLYGON_OFFSET_UNITS]: 1,
            },

            updateTriggers: {
                getFilterValue: [
                    this.props.formationFilter,
                    this.props.wellNameFilter,
                    ...sanitizedFilterBands,
                ],
            },

            // Override path layer to use opt-in screen dashes
            _subLayerProps: {
                linestrings: {
                    type: this.props.showScreenTrajectory
                        ? DashedSectionsPathLayer
                        : PathLayer,
                    // Props for DashedSectionsPathLayer
                    getScreenDashArray: getDashFactor(
                        this.props.getScreenDashFactor,
                        getSize(LINE, this.props.lineStyle?.width)
                    ),
                    getCumulativePathDistance: (d: SourcedSubLayerData) =>
                        d.__source.object.properties.md[0],
                    getDashedSectionsAlongPath: (d: SourcedSubLayerData) => {
                        const feature = d.__source.object as WellFeature;

                        const maxMd = feature.properties.md[0]?.at(-1);
                        if (maxMd === undefined) return undefined;

                        return feature.properties.screens?.map((screen) => [
                            screen.mdStart / maxMd,
                            screen.mdEnd / maxMd,
                        ]);
                    },
                },
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
        const filterGhostLayer = new GeoJsonLayer(filterGhostLayerProps);

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

                positionFormat: this.props.positionFormat,
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

        const markerLayer = new TrajectoryMarkersLayer(
            this.getSubLayerProps({
                ...defaultLayerProps,
                visible: !fastDrawing,
                pickable: true,
                id: SubLayerId.MARKERS,
                data: data.features,
                outline: this.props.outline,
                getLineColor: getColor(this.props.lineStyle?.color),
                // We can also specify the color per marker
                // getMarkerColor: (marker: TrajectoryMarker) => ...
                updateTriggers: {
                    getMarkers: [
                        this.props.showScreenMarkers,
                        this.props.showPerforationsMarkers,
                    ],
                    getFilterValue: [
                        this.props.formationFilter,
                        this.props.wellNameFilter,
                        ...sanitizedFilterBands,
                    ],
                },

                extensions: [new DataFilterExtension({ filterSize: 1 })],
                filterEnabled: this.props.enableFilters,
                filterRange: [1, 1],

                getFilterValue: (d: WellFeature) =>
                    getTrajectoryFilterCategory(
                        d,
                        sanitizedFilterBands,
                        this.props.formationFilter,
                        this.props.wellNameFilter
                    ),
                getCumulativePathDistance: (d: WellFeature) =>
                    d.properties.md[0],
                getTrajectoryPath: (d: WellFeature) =>
                    getTrajectory(d, this.props.lineStyle?.color),
                getMarkers: (d: WellFeature) => {
                    const maxMd = d.properties.md[0]?.at(-1);
                    const { perforations = [], screens = [] } = d.properties;

                    if (maxMd === undefined || maxMd === 0) return [];

                    const markers: TrajectoryMarker[] = [];

                    if (this.props.showScreenMarkers) {
                        markers.push(
                            ...screens.flatMap<TrajectoryMarker>((s) => [
                                {
                                    type: "screen-start",
                                    positionAlongPath: s.mdStart / maxMd,
                                },
                                {
                                    type: "screen-end",
                                    positionAlongPath: s.mdEnd / maxMd,
                                },
                            ])
                        );
                    }

                    if (this.props.showPerforationsMarkers) {
                        markers.push(
                            ...perforations.map<TrajectoryMarker>((p) => ({
                                type: "perforation",
                                positionAlongPath: p.md / maxMd,
                                properties: p,
                            }))
                        );
                    }

                    return markers;
                },
            })
        );

        const namesLayer = this.createWellLabelLayer(data.features);

        const layers = [
            outlineLayer,
            colorsLayer,
            highlightLayer,
            highlightMultiWellsLayer,
            namesLayer,
            logLayer,
            markerLayer,
            filterGhostLayer,
        ];
        if (fastDrawing) {
            layers.push(fastLayer);
        }
        return layers;
    }

    private getSubLayerId(id: SubLayerId): string {
        return this.getSubLayerProps({ id }).id;
    }

    private getSubLayerById(id: SubLayerId) {
        return this.getSubLayers().find((l) => l.id === this.getSubLayerId(id));
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
        let coordinate: Position = info.coordinate || [0, 0, 0];

        const zScale = this.props.modelMatrix ? this.props.modelMatrix[10] : 1;
        if (typeof coordinate[2] !== "undefined") {
            coordinate[2] /= Math.max(0.001, zScale);
        }

        let wellName: string | undefined = undefined;

        let md_property: PropertyDataType | null = null;
        let tvd_property: PropertyDataType | null = null;
        let log_property: PropertyDataType | null = null;
        let screen_property: PropertyDataType | null = null;
        let perforation_property: PropertyDataType | null = null;

        if (
            info.sourceLayer?.id ===
            this.getSubLayerId(SubLayerId.SCREEN_TRAJECTORY)
        ) {
            const screenIndex = (info as DashedSectionsLayerPickInfo)
                .dashedSectionIndex;
            const data = info.object as WellFeature;

            if (screenIndex !== undefined && screenIndex !== -1) {
                const hoveredScreen = data.properties?.screens?.at(screenIndex);
                screen_property = createScreenReadout(hoveredScreen, data);
            }
        }

        if (info.sourceLayer?.id === this.getSubLayerId(SubLayerId.MARKERS)) {
            const markerData = info.object as MarkerData<WellFeature>;
            const wellData = info.object?.sourceObject as WellFeature;
            const sourceIndex = markerData.sourceIndex;

            // Re-compute index and color to make autohighlight apply to the *trajectory*, instead of the individual marker
            info.index = sourceIndex;
            info.color = new Uint8Array(
                this.getSubLayerById(
                    SubLayerId.SCREEN_TRAJECTORY
                )!.encodePickingColor(markerData.sourceIndex)
            );

            if (markerData.type === "perforation") {
                const properties =
                    markerData.properties as PerforationProperties;

                wellName = wellData.properties?.name;
                perforation_property = createPerforationReadout(
                    properties,
                    wellData
                );

                // We also include the MD readout here, based on the marker position
                coordinate = markerData.position;
                if (typeof coordinate[2] !== "undefined") {
                    coordinate[2] /= Math.max(0.001, zScale);
                }

                md_property = getMdProperty(
                    coordinate,
                    wellData,
                    this.props.lineStyle?.color,
                    "lines"
                );
                tvd_property = getTvdProperty(
                    coordinate,
                    wellData,
                    this.props.lineStyle?.color,
                    "lines"
                );
            }
        }

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
        } else if (
            info.sourceLayer?.id ===
                this.getSubLayerProps({ id: SubLayerId.COLORS }).id ||
            info.sourceLayer?.id ===
                this.getSubLayerProps({ id: SubLayerId.SCREEN_TRAJECTORY }).id
        ) {
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
        if (screen_property) layer_properties.push(screen_property);
        if (perforation_property) layer_properties.push(perforation_property);

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

// Injects MD points that will be required for cutting trajectories at the correct points
function injectMdPointsForFilter(
    data: WellFeatureCollection,
    mdFilterRange: WellsLayerProps["mdFilterRange"]
): WellFeatureCollection {
    const globalRequiredMds = mdFilterRange.flat().filter((i) => i !== -1);

    return {
        ...data,
        features: data.features.map((feature) => {
            const { formations } = feature.properties;

            const formationMds =
                formations?.flatMap((f) => [f.mdEnter, f.mdExit]) ?? [];

            const allRequiredMds = _.chain([
                ...formationMds,
                ...globalRequiredMds,
            ])
                .sort((a, b) => a - b)
                .uniq()
                .value();

            const newFeature = injectMdPoints(feature, ...allRequiredMds);

            return newFeature;
        }),
    };
}

function getTrajectoryFilterCategory(
    feature: WellFeature,
    sanitizedMdFilterBands: [number, number][],
    formationFilter: string[],
    wellNameFilter: string[]
): number | number[] {
    if (
        !formationFilter.length &&
        !wellNameFilter.length &&
        !sanitizedMdFilterBands.length
    )
        return 1;
    const {
        formations,
        md: [mdArr],
    } = feature.properties;

    const nameIsValid =
        !wellNameFilter.length ||
        wellNameFilter.includes(feature.properties.name);

    if (!nameIsValid) return 0;

    // No per vertex filters
    if (!formationFilter.length && !sanitizedMdFilterBands.length) return 1;

    return mdArr.map((md) => {
        const mdIsValid =
            !sanitizedMdFilterBands.length ||
            sanitizedMdFilterBands.some((band) => {
                if (isClose(md, band[0])) return true;
                if (isClose(md, band[1])) return false;
                return md >= band[0] && md < band[1];
            });

        const formation = formations?.find(
            (seg) => seg.mdEnter <= md && seg.mdExit > md
        );

        const formationIsValid =
            !formationFilter?.length ||
            formationFilter.includes(formation?.name ?? "");

        return Number(mdIsValid && formationIsValid);
    });
}

function makeSanitizedFilterBands(
    mdFilter: WellsLayerProps["mdFilterRange"]
): [number, number][] {
    if (!mdFilter) return [];

    if (!(mdFilter.every(Number.isFinite) || mdFilter.every(Array.isArray))) {
        throw Error(
            "MD filter should either only be numbers, or lists of numbers"
        );
    }

    if (Array.isArray(mdFilter[0])) {
        return (mdFilter as [number, number][]).flatMap(
            makeSanitizedFilterBands
        );
    }

    let [rangeStart = -1, rangeEnd = -1] = mdFilter as [number, number];

    if (rangeStart === -1 && rangeEnd === -1) return [];
    if (rangeStart === -1) rangeStart = Number.NEGATIVE_INFINITY;
    if (rangeEnd === -1) rangeEnd = Number.POSITIVE_INFINITY;

    if (rangeStart > rangeEnd) {
        return [
            [Number.NEGATIVE_INFINITY, rangeEnd],
            [rangeStart, Number.POSITIVE_INFINITY],
        ];
    }

    return [[rangeStart, rangeEnd]];
}
