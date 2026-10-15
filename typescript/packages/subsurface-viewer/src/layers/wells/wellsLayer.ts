import _, { isEmpty, isEqual } from "lodash";

import type {
    Accessor,
    AccessorContext,
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
import { GL } from "@luma.gl/constants";
import { interpolateNumber } from "d3-interpolate";
import type { Feature, FeatureCollection } from "geojson";

import type {
    ContinuousLegendDataType,
    DiscreteLegendDataType,
} from "../../components/typeDefs";
import { scaleArray } from "../../utils/arrays";
import { isClose } from "../../utils/measurement";
import { SectionViewport } from "../../viewports";
import type { NumberPair } from "../typeDefs";

import type {
    DeckGLLayerContext,
    PropertyDataType,
} from "../utils/deckglTools";
import {
    createPropertyData,
    getFromAccessor,
    getLayersById,
} from "../utils/deckglTools";
import { isDrawingEnabled } from "../drawing/drawingLayerHelper";
import { DashedSectionsPathLayer } from "./layers/dashedSectionsPathLayer";
import type { MarkerData, WellMarker } from "./layers/flatWellMarkersLayer";
import { FlatWellMarkersLayer } from "./layers/flatWellMarkersLayer";
import type { LogCurveLayerProps } from "./layers/logCurveLayer";
import { LogCurveLayer } from "./layers/logCurveLayer";

import { WellLabelLayer } from "./layers/wellLabelLayer";
import type {
    DashAccessor,
    DashedSectionsLayerPickInfo,
    LogCurveDataType,
    PerforationProperties,
    ScreenProperties,
    WellFeature,
    WellFeatureCollection,
    WellsLayerProps,
    WellsPickInfo,
} from "./typeDefs";
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
    getFractionAlongSegmentForCoord,
    getSegmentIndicesForCoord,
    getTrajectory,
    injectMdPoints,
    isTrajectoryTransparent,
    unScaledPosition,
} from "./utils/trajectory";
import {
    getWellMds,
    getWellObjectByName,
    getWellObjectsByName,
} from "./utils/wells";

const DEFAULT_DASH = [5, 5] as NumberPair;
const DEFAULT_SCREEN_DASH = [5, 5] as NumberPair;

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

    mdFilterRange: [],
    formationFilter: [],
    wellNameFilter: [],
    enableFilters: false,

    // Deprecated props
    wellNameColor: [0, 0, 0, 255],
    wellNameSize: 10,
};

export default class WellsLayer extends CompositeLayer<WellsLayerProps> {
    declare state: {
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
        // To support outlines for the dashed section, we will manage it's default dash size here
        const screenDashAccessor =
            this.props.markers?.getScreenDashArray ?? DEFAULT_SCREEN_DASH;

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
            id: this.props.markers?.showScreenTrajectoryAsDash
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
            getFilterValue: (d, ctx) =>
                getTrajectoryFilterCategory(
                    d,
                    this.props.mdFilterRange,
                    this.props.formationFilter,
                    this.props.wellNameFilter,
                    ctx
                ),
            updateTriggers: {
                getFilterValue: [
                    this.props.wellNameFilter,
                    ...(this.props.updateTriggers["mdFilterRange"] ?? []),
                    ...(this.props.updateTriggers["formationFilter"] ?? []),
                ],
            },

            // Override path layer to use opt-in screen dashes
            _subLayerProps: {
                linestrings: {
                    type: this.props.markers?.showScreenTrajectoryAsDash
                        ? DashedSectionsPathLayer
                        : PathLayer,

                    getSectionDashArray: getDashFactor(
                        screenDashAccessor,
                        getSize(LINE, this.props.lineStyle?.width),
                        -1
                    ),
                    getCumulativePathDistance: (d: SourcedSubLayerData) =>
                        d.__source.object.properties.md[0],
                    getDashedSectionsAlongPath: (d: SourcedSubLayerData) => {
                        const feature = d.__source.object;

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
            getFilterValue: (
                d: WellFeature,
                ctx: AccessorContext<WellFeature>
            ) => {
                const includeFilter = getTrajectoryFilterCategory(
                    d,
                    this.props.mdFilterRange,
                    this.props.formationFilter,
                    this.props.wellNameFilter,
                    ctx
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
                    this.props.wellNameFilter,
                    ...(this.props.updateTriggers["mdFilterRange"] ?? []),
                    ...(this.props.updateTriggers["formationFilter"] ?? []),
                ],
            },
        } as GeoJsonLayerProps);

        const outlineLayerProps = this.getSubLayerProps({
            ...defaultLayerProps,
            // Whenever _subLayerProps.linestrings.type changes, we need to ensure an entirely new
            // layer instance is created to avoid state errors, which is why we modify the ID.
            id: this.props.markers?.showScreenTrajectoryAsDash
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
            getFilterValue: (
                d: WellFeature,
                ctx: AccessorContext<WellFeature>
            ) =>
                getTrajectoryFilterCategory(
                    d,
                    this.props.mdFilterRange,
                    this.props.formationFilter,
                    this.props.wellNameFilter,
                    ctx
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
                    this.props.wellNameFilter,
                    ...(this.props.updateTriggers["mdFilterRange"] ?? []),
                    ...(this.props.updateTriggers["formationFilter"] ?? []),
                ],
            },

            // Override path layer to use opt-in screen dashes
            _subLayerProps: {
                linestrings: {
                    type: this.props.markers?.showScreenTrajectoryAsDash
                        ? DashedSectionsPathLayer
                        : PathLayer,
                    // Props for DashedSectionsPathLayer
                    getSectionDashArray: getDashFactor(
                        screenDashAccessor,
                        getSize(LINE, this.props.lineStyle?.width)
                    ),
                    getCumulativePathDistance: (d: SourcedSubLayerData) =>
                        d.__source.object.properties.md[0],
                    getDashedSectionsAlongPath: (d: SourcedSubLayerData) => {
                        const feature = d.__source.object;

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

        const markerLayer = new FlatWellMarkersLayer(
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
                        this.props.markers?.showScreens,
                        this.props.markers?.showPerforations,
                    ],
                    getFilterValue: [
                        this.props.wellNameFilter,
                        ...(this.props.updateTriggers["mdFilterRange"] ?? []),
                        ...(this.props.updateTriggers["formationFilter"] ?? []),
                    ],
                },

                extensions: [new DataFilterExtension({ filterSize: 1 })],
                filterEnabled: this.props.enableFilters,
                filterRange: [1, 1],

                getFilterValue: (
                    d: WellFeature,
                    ctx: AccessorContext<WellFeature>
                ) =>
                    getTrajectoryFilterCategory(
                        d,
                        this.props.mdFilterRange,
                        this.props.formationFilter,
                        this.props.wellNameFilter,
                        ctx
                    ),
                getCumulativePathDistance: (d: WellFeature) =>
                    d.properties.md[0],
                getTrajectoryPath: (d: WellFeature) =>
                    getTrajectory(d, this.props.lineStyle?.color),
                getMarkerColor: this.props.markers?.getMarkerColor,
                getMarkers: (d: WellFeature) => {
                    const maxMd = d.properties.md[0]?.at(-1);
                    const { perforations = [], screens = [] } = d.properties;

                    if (maxMd === undefined || maxMd === 0) return [];

                    const markers: WellMarker[] = [];

                    if (this.props.markers?.showScreens) {
                        markers.push(
                            ...screens.flatMap<WellMarker>((s) => [
                                {
                                    type: "screen-start",
                                    positionAlongPath: s.mdStart / maxMd,
                                    properties: s,
                                },
                                {
                                    type: "screen-end",
                                    positionAlongPath: s.mdEnd / maxMd,
                                    properties: s,
                                },
                            ])
                        );
                    }

                    if (this.props.markers?.showPerforations) {
                        markers.push(
                            ...perforations.map<WellMarker>((p) => ({
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
        const sourceId = info.sourceLayer!.id;
        // Create readouts for any data found
        const accessorCtx = {
            data: this.state.data as unknown as LayerData<WellFeature>,
            index: info.index,
            target: [],
        };

        const zScale = this.props.modelMatrix ? this.props.modelMatrix[10] : 1;
        const scaleFactor = { z: zScale };

        // When scaling is applied, the picking coordinate will no longer match world-space coordinates
        // Unscale so we're dealing with world-space coords
        let coordinate = unScaledPosition(
            info.coordinate ?? [0, 0, 0],
            scaleFactor
        );

        // --- Sub-layer pick data
        let wellFeature: WellFeature | null = null;
        let screen: ScreenProperties | null = null;
        let marker: MarkerData<WellFeature> | null = null;
        let wellLog: LogCurveDataType | null = null;

        // When hovering the well head, we don't want to also read trajectory info
        let readWellHeadOnly = false;

        if (sourceId === this.getSubLayerId(SubLayerId.SCREEN_TRAJECTORY)) {
            const screenInfo = info as DashedSectionsLayerPickInfo;
            wellFeature = screenInfo.object!;

            const screenIndex = screenInfo.dashedSectionIndex ?? -1;

            if (screenIndex !== -1) {
                screen =
                    wellFeature.properties?.screens?.at(screenIndex) ?? null;
            }
        }

        if (sourceId === this.getSubLayerId(SubLayerId.MARKERS)) {
            const markerInfo = info as PickingInfo<MarkerData<WellFeature>>;
            wellFeature = markerInfo.object!.sourceObject;
            marker = markerInfo.object!;

            // Re-compute index and color to make autoHighlight apply to the *trajectory*, instead of the individual marker
            const screenLayer =
                // One of these two are guaranteed to exist
                this.getSubLayerById(SubLayerId.COLORS) ||
                this.getSubLayerById(SubLayerId.SCREEN_TRAJECTORY);

            const newPickColor = screenLayer!.encodePickingColor(
                marker.sourceIndex
            );

            info.index = marker.sourceIndex;
            info.color = new Uint8Array(newPickColor);
            accessorCtx.index = marker.sourceIndex;

            if (marker.type === "perforation") {
                // When hovering a perforation, we'll lock to it's position, so related data (MD and TVD) stays with it
                coordinate = marker.position;
            }
        }
        if (info.sourceLayer?.id === this.getSubLayerId(SubLayerId.COLORS)) {
            const wellpickInfo = info as WellsPickInfo;
            wellFeature = wellpickInfo.object!;
            readWellHeadOnly = wellpickInfo.featureType === "points";
        }

        if (info.sourceLayer?.id === this.getSubLayerId(SubLayerId.LOG_CURVE)) {
            const logLayerInfo = info as PickingInfo<LogCurveDataType>;
            wellLog = logLayerInfo.object ?? null;

            if (wellLog && !wellFeature) {
                wellFeature =
                    features.find(
                        (f) => f.properties.name === wellLog!.header.well
                    ) ?? null;
            }
        }

        // ! Color settings **might** have made well invisible. If so, we wont return any picking info
        if (
            !wellFeature ||
            isTrajectoryTransparent(wellFeature, this.props.lineStyle?.color)
        ) {
            return { ...info, ...noLog };
        }

        // Based on what data objects we found above, we'll make these info properties
        let wellName: string | undefined = undefined;
        let wellColor: Color | undefined = undefined;

        let md_property: PropertyDataType | null = null;
        let tvd_property: PropertyDataType | null = null;
        let log_property: PropertyDataType | null = null;
        let screen_property: PropertyDataType | null = null;
        let perforation_property: PropertyDataType | null = null;

        if (screen && wellFeature) {
            screen_property = createScreenReadout(screen, wellFeature);
        }

        if (wellFeature && marker && marker.type === "perforation") {
            const properties = marker.properties as PerforationProperties;

            perforation_property = createPerforationReadout(
                properties,
                wellFeature
            );
        }

        if (wellFeature) {
            const lineStyleAccessor = this.props.lineStyle?.color;

            wellName = wellFeature.properties.name;
            wellColor = lineStyleAccessor
                ? getFromAccessor(lineStyleAccessor, wellFeature, accessorCtx)
                : wellFeature.properties.color;
        }

        if (wellLog) {
            log_property = getLogProperty(
                coordinate,
                features,
                info.object,
                this.props.logrunName,
                this.props.logName,
                scaleFactor
            );
        }

        if (wellFeature && !readWellHeadOnly) {
            const wellTrajectory = getTrajectory(
                wellFeature,
                this.props.lineStyle.color
            );

            if (wellTrajectory) {
                const wellMd = wellFeature.properties.md[0];

                const [segmentStartIdx, segmentEndIdx] =
                    getSegmentIndicesForCoord(
                        coordinate,
                        wellTrajectory,
                        scaleFactor
                    );

                const lengthAlongSegment = getFractionAlongSegmentForCoord(
                    coordinate,
                    wellTrajectory[segmentStartIdx],
                    wellTrajectory[segmentEndIdx],
                    scaleFactor
                );

                const interpolatedMd = interpolateNumber(
                    wellMd[segmentStartIdx],
                    wellMd[segmentEndIdx]
                )(lengthAlongSegment);

                const interpolatedTvd = interpolateNumber(
                    wellTrajectory[segmentStartIdx][2],
                    wellTrajectory[segmentEndIdx][2]
                )(lengthAlongSegment);

                md_property = createPropertyData(
                    "MD " + wellName,
                    interpolatedMd,
                    wellColor
                );

                tvd_property = createPropertyData(
                    "TVD " + wellName,
                    interpolatedTvd,
                    wellColor
                );
            }
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
            wellName: wellFeature?.properties.name,
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
    if (context.layer.props.reportBoundingBox !== undefined) {
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

// Injects MD points that will be required for cutting trajectories at the correct points
function injectMdPointsForFilter(
    data: WellFeatureCollection,
    mdFilterRange: WellsLayerProps["mdFilterRange"]
): WellFeatureCollection {
    return {
        ...data,
        features: data.features.map((feature, index) => {
            const { formations } = feature.properties;
            const itemInfo: AccessorContext<WellFeature> = {
                data: data.features,
                target: [],
                index,
            };

            const rangeMds = getFromAccessor(mdFilterRange, feature, itemInfo)
                .flat()
                .filter((i) => i !== -1);

            const formationMds =
                formations?.flatMap((f) => [f.mdEnter, f.mdExit]) ?? [];

            const allRequiredMds = _.chain([...formationMds, ...rangeMds])
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
    mdFilterRangeAccessor: WellsLayerProps["mdFilterRange"],
    formationFilterAccessor: WellsLayerProps["formationFilter"],
    wellNameFilter: WellsLayerProps["wellNameFilter"],
    itemInfo: AccessorContext<WellFeature>
): number | number[] {
    const mdFilterRange = getFromAccessor(
        mdFilterRangeAccessor,
        feature,
        itemInfo
    );
    const formationFilter = getFromAccessor(
        formationFilterAccessor,
        feature,
        itemInfo
    );

    const sanitizedMdFilterBands = makeSanitizedFilterBands(mdFilterRange);

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
    mdFilter: [number, number] | [number, number][]
): [number, number][] {
    if (!mdFilter) return [];

    if (!(mdFilter.every(Number.isFinite) || mdFilter.every(Array.isArray))) {
        throw new Error(
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
