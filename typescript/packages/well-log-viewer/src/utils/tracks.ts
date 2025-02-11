import {
    type Track,
    type Plot,
    type StackedTrackOptions,
    ScaleTrack,
    DualScaleTrack,
    GraphTrack,
    StackedTrack,
    defaultPlotFactory,
    createPlotType,
    graphLegendConfig,
} from "@equinor/videx-wellog";
import type { TrackOptions } from "@equinor/videx-wellog/dist/tracks/interfaces";
import type { Domain } from "@equinor/videx-wellog/dist/common/interfaces";
import type {
    GraphTrackOptions,
    PlotConfig,
    PlotFactory,
} from "@equinor/videx-wellog/dist/tracks/graph/interfaces";

import type { ColorMapFunction } from "./color-function";
import type WellLogView from "../components/WellLogView";
import type {
    TemplateTrack,
    TemplatePlot,
    TemplateStyle,
} from "../components/WellLogTemplateTypes";
import type {
    WellLogSet,
    WellLogCurve,
    WellLogDataRow,
} from "../components/WellLogTypes";

import { createScale } from "./graph/factory";
import { stackLegendConfig } from "./stack/stack-legend";
import { scaleLegendConfig } from "./stack/scale-legend";
import { type AxesInfo, getAxisTitle } from "./axes";

import GradientFillPlot from "./gradientfill-plot";
import { checkMinMaxValue, checkMinMax } from "./minmax";
import { updateLegendRows } from "./log-viewer";
import {
    type AxisIndices,
    getAxisIndices,
    getDiscreteMeta,
    findSetAndCurveIndex,
} from "./well-log";
import {
    elementByName,
    indexOfElementByName,
    indexOfElementByNames,
} from "./arrays";
import {
    type PlotSetup,
    applyTemplateStyle,
    getPlotConfig,
    getPlotType,
    preparePlotData,
} from "./plots";
import { createStackData } from "./plots";
import { deepCopy } from "./deepcopy";

function shortDescription(description: string): string {
    // sometimes description contains the track number
    //"0  Depth",
    //"1  BVW:CPI:rC:0001:v1",
    //"02 DRAW DOWN PRESSURE",
    if ("0" <= description[0] && description[0] <= "9") {
        if (description[1] === " ") return description.substring(2);
        else if ("0" <= description[1] && description[2] <= "9")
            if (description[2] === " ") return description.substring(3);
    }
    return description;
}

function makeTrackHeader(
    curves: WellLogCurve[],
    templateTrack: TemplateTrack
): string {
    if (templateTrack.title) return templateTrack.title;
    if (!templateTrack.plots[0]) return "";

    const plotTemplate = templateTrack.plots[0];
    const curve = elementByName(curves, plotTemplate.name);

    // Something went wrong
    if (!curve) return plotTemplate.name;
    return curve.description ? shortDescription(curve.description) : curve.name;
}

class TracksInfo {
    tracks: Track[];
    minmaxPrimaryAxis: [number, number];
    minmaxSecondaryAxis: [number, number];
    primaries: Float32Array; // 32 bits should be enough
    secondaries: Float32Array;

    constructor() {
        this.tracks = [];
        this.minmaxPrimaryAxis = [
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
        ];
        this.minmaxSecondaryAxis = [
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
        ];

        this.primaries = new Float32Array(0);
        this.secondaries = new Float32Array(0);
    }
}

function isStackedTrack(
    templateTrack: TemplateTrack,
    templateStyles?: TemplateStyle[]
): boolean {
    // Stacked tracks only render the first plot, so we only care about the first
    const firstTrackPlot = templateTrack.plots[0] ?? {};

    if (firstTrackPlot.type === "stacked") return true;
    if (!firstTrackPlot.style || !templateStyles) return false;

    const iStyle = indexOfElementByName(templateStyles, firstTrackPlot.style);

    if (iStyle < 0) return false;
    return templateStyles[iStyle]?.type === "stacked";
}

/**
 * Update Graph-Track Scale according to the first plot
 */
function updateGraphTrackScale(track: GraphTrack): void {
    const track_options = track.options as TrackOptionsEx;
    const templateTrack = track_options.__template;
    if (templateTrack) {
        if (templateTrack.plots.length) {
            const plotTemplate = templateTrack.plots[0];
            track.options.scale = plotTemplate.scale;
            track.options.domain = plotTemplate.domain;

            if (!track.options.label) track.options.label = plotTemplate.name;
        }
        if (track_options.__template.scale) {
            track.options.scale = track_options.__template.scale;
        }
        if (!track.options.scale) track.options.scale = "linear";
    }

    if (track.plots?.length) {
        const plot = track.plots[0];
        track.options.domain = plot.options.domain as Domain;
    }

    if (!track.options.domain) {
        // could be on reguired track with missed data
        console.warn("Empty track.options.domain!");
        track.options.domain =
            track.options.scale === "log" ? [1, 100] : [0, 100];
    }

    if (track.options.scale === "log" && track.options.domain) {
        if (track.options.domain[0] < 0) {
            // could not show negative data!
            console.error(
                "wrong data range for logarithm scale " + track.options.domain
            );
        }
    }

    if (!track.options.scale) throw Error("Invalid track.options.scale!");
    track.trackScale = createScale(track.options.scale, track.options.domain);
}

/**
 * Update Stacked-Track Scale according to the first plot
 */
function updateStackedTrackScale(track: StackedTrack): void {
    const track_options = track.options as TrackOptionsEx;
    const templateTrack = track_options.__template;
    if (templateTrack) {
        if (templateTrack.plots.length) {
            const plotTemplate = templateTrack.plots[0];
            //track.options.scale = plotTemplate.scale;
            //track.options.domain = plotTemplate.domain;

            if (!track.options.label) track.options.label = plotTemplate.name;
        }
        //if (track_options.__template.scale) {
        //track.options.scale = track_options.__template.scale;
        //}
        //if (!track.options.scale) track.options.scale = "linear";
    }

    //if (track.plots.length) {
    //    const plot = track.plots[0];
    //    track.options.domain = plot.options.domain;
    //}

    //if (!track.options.domain) {
    //    // could be on reguired track with missed data
    //    console.log("Empty track.options.domain!");
    //    track.options.domain =
    //        track.options.scale === "log" ? [1, 100] : [0, 100];
    //}

    //if (!track.options.scale) throw Error("Invalid track.options.scale!");
    //track.trackScale = createScale(track.options.scale, track.options.domain);
    // track.xscale;
}

function addGraphTrackPlot(
    wellLogView: WellLogView,
    track: GraphTrack,
    templatePlot: TemplatePlot
): [number, number] {
    const templateTrack = getTrackTemplate(track);
    const minmaxPrimaryAxis: [number, number] = [
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
    ];

    const axes = wellLogView.getAxesInfo();
    const plotFactory = track.options.plotFactory;
    const wellLog = wellLogView.wellLogSets;
    const colorMapFunctions = wellLogView.props.colorMapFunctions;
    const plotDatas = track.options.data;
    const plots = track.plots;

    if (plotFactory && wellLog.length) {
        // Make full props
        const styledTemplatePlot = applyTemplateStyle(
            templatePlot,
            /*templateStyles*/ []
        );

        const plotSetup = setupPlot(wellLog, styledTemplatePlot, axes);

        if (!plotSetup) return minmaxPrimaryAxis;

        const { plotData, curve, iCurve, minmax, iSet } = plotSetup;
        const plotSetup2 = setupPlot(wellLog, styledTemplatePlot, axes, true);

        checkSetupMinMax(plotSetup, plotSetup2, minmaxPrimaryAxis);

        const p = getPlotConfig(
            `${iSet}-${iCurve}`,
            styledTemplatePlot,
            templateTrack.scale,
            minmax,
            curve,
            plotDatas.length,
            plotSetup2?.curve,
            plotDatas.length + 1,
            colorMapFunctions
        );

        plotDatas.push(plotData.data);
        if (plotSetup2) plotDatas.push(plotSetup2.plotData.data);

        // GraphTrack
        const createPlot = plotFactory[p.type];
        if (!createPlot)
            throw Error(`No factory function for creating '${p.type}'-plot!`);

        const plot = createPlot(p, track.trackScale);
        if (plot) {
            plots.push(plot);
            templateTrack.plots.push(styledTemplatePlot);
            updateGraphTrackScale(track);
            track.prepareData();
        }
    }

    return minmaxPrimaryAxis;
}

function editGraphTrackPlot(
    wellLogView: WellLogView,
    track: GraphTrack,
    plot: Plot,
    templatePlot: TemplatePlot
): [number, number] {
    const templateTrack = getTrackTemplate(track);
    const minmaxPrimaryAxis: [number, number] = [
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
    ];

    const axes = wellLogView.getAxesInfo();
    const plotFactory = track.options.plotFactory;
    const wellLog = wellLogView.wellLogSets;
    const plotDatas = track.options.data;
    const plots = track.plots;

    if (plotFactory && wellLog.length) {
        // Make full props
        const styledTemplatePlot = applyTemplateStyle(
            templatePlot,
            /*templateStyles*/ []
        );

        const plotSetup = setupPlot(wellLog, styledTemplatePlot, axes);

        if (!plotSetup) return minmaxPrimaryAxis;

        const { plotData, curve, iCurve, iSet, minmax } = plotSetup;
        const plotSetup2 = setupPlot(wellLog, styledTemplatePlot, axes, true);

        checkSetupMinMax(plotSetup, plotSetup2, minmaxPrimaryAxis);

        const colorMapFunctions = wellLogView.props.colorMapFunctions;

        const p = getPlotConfig(
            `${iSet}-${iCurve}`,
            styledTemplatePlot,
            templateTrack.scale,
            minmax,
            curve,
            plotDatas.length,
            plotSetup2?.curve,
            plotDatas.length + 1,
            colorMapFunctions
        );

        plotDatas.push(plotData.data);
        if (plotSetup2) plotDatas.push(plotSetup2.plotData.data);

        // GraphTrack
        const createPlot = plotFactory[p.type];
        if (!createPlot)
            throw Error(`No factory function for creating '${p.type}'-plot!`);

        const iPlot = plots.indexOf(plot);
        if (iPlot < 0) {
            console.error("Error!", "Edited plot not found!");
        } else {
            const plotNew = createPlot(p, track.trackScale);
            if (plotNew) {
                plots[iPlot] = plotNew; // replace plot
                templateTrack.plots[iPlot] = styledTemplatePlot;
                updateGraphTrackScale(track);
                track.prepareData();
            }
        }
    }

    return minmaxPrimaryAxis;
}

export function addOrEditGraphTrackPlot(
    wellLogView: WellLogView,
    track: GraphTrack,
    plot: Plot | null,
    templatePlot: TemplatePlot
): void {
    const minmaxPrimaryAxis = plot
        ? editGraphTrackPlot(wellLogView, track, plot, templatePlot)
        : addGraphTrackPlot(wellLogView, track, templatePlot);

    if (wellLogView.logController) {
        {
            const baseDomain =
                wellLogView.logController.scaleHandler.baseDomain();
            // update base domain to take into account new plot data range
            if (baseDomain[0] > minmaxPrimaryAxis[0])
                baseDomain[0] = minmaxPrimaryAxis[0];
            if (baseDomain[1] < minmaxPrimaryAxis[1])
                baseDomain[1] = minmaxPrimaryAxis[1];
            wellLogView.logController.rescale();
        }

        updateLegendRows(wellLogView.logController);
        wellLogView.logController.updateTracks();
    }
}

function _removeGraphTrackPlot(track: GraphTrack, _plot: Plot): number {
    const template = getTrackTemplate(track);

    const plots = track.plots;

    let index = 0;
    for (const plot of plots) {
        if (plot === _plot) {
            plots.splice(index, 1);
            template.plots.splice(index, 1);
            break;
        }
        index++;
    }
    return index;
}

export function removeGraphTrackPlot(
    wellLogView: WellLogView,
    track: GraphTrack,
    plot: Plot
): void {
    _removeGraphTrackPlot(track, plot);
    updateGraphTrackScale(track);

    if (wellLogView.logController) {
        updateLegendRows(wellLogView.logController);
        wellLogView.logController.updateTracks();
    }

    track.prepareData();
}

function newDualScaleTrack(
    mode: number,
    title: string,
    abbr?: string | null,
    units?: string | null
): DualScaleTrack {
    return new DualScaleTrack(undefined as unknown as number, {
        mode: mode,
        maxWidth: 50,
        width: 2,
        label: title,
        abbr: abbr ? abbr : title,
        units: units ? units : "",
        legendConfig: scaleLegendConfig,
    });
}

function newScaleTrack(
    title: string,
    abbr?: string | null,
    units?: string | null
): ScaleTrack {
    return new ScaleTrack(undefined as unknown as number, {
        maxWidth: 50,
        width: 2,
        label: title,
        abbr: abbr ? abbr : title,
        units: units ? units : "",
        legendConfig: scaleLegendConfig,
    });
}

function newStackedTrack(options: StackedTrackOptions): StackedTrack {
    return new StackedTrack(undefined as unknown as number, options);
}

const plotFactory: PlotFactory = {
    ...defaultPlotFactory,
    gradientfill: createPlotType(GradientFillPlot),
};

const defaultOptions: GraphTrackOptions = {
    plotFactory: plotFactory,
    legendConfig: graphLegendConfig,
};

export interface TrackOptionsEx extends TrackOptions {
    __template: Readonly<TemplateTrack>;
}

export function getTrackTemplate(track: Track): TemplateTrack {
    const options = track.options as TrackOptionsEx;
    if (options.__template) return options.__template;
    else {
        console.error("No __template given in track!");
        const options = (track as GraphTrack).options;
        return {
            title: options.label ? options.label : "",
            scale: options.scale === "log" ? "log" : "linear",
            //domain: options.domain,
            plots: [],
        };
    }
}

export function newGraphTrack(
    /* should contains
    title: string,
    data: [number, number][][],
    plots: PlotConfig[]
    */
    options: GraphTrackOptions
): GraphTrack {
    return new GraphTrack(undefined as unknown as number, {
        ...defaultOptions,
        ...options,
    });
}

export function isScaleTrack(track: Track): boolean {
    if (track instanceof ScaleTrack) return true;
    if (track instanceof DualScaleTrack) return true;
    return false;
}
export function getScaleTrackNum(tracks: Track[]): number {
    let n = 0;
    for (const track of tracks) {
        if (isScaleTrack(track)) n++;
    }
    return n;
}

function addScaleTracks(
    info: TracksInfo,
    axesInfo: AxesInfo,
    wellLog: WellLogSet[]
): void {
    // All sets is  assumed to include the main axis curve, so we just look at the first curve well log set here
    const data = wellLog[0].data;
    const curves = wellLog[0].curves;
    const axisIndices = getAxisIndices(curves, axesInfo);

    if (axisIndices.primary < 0) return; // Axis curves are missing

    const idxPrimary = axisIndices.primary;
    const titlePrimary = getAxisTitle(axesInfo, axesInfo.primaryAxis);
    const curvePrimary = curves[idxPrimary];

    if (axisIndices.secondary >= 0) {
        addDualScaleTrack(info, axesInfo, curves, data, axisIndices);
    } else {
        info.tracks.push(
            newScaleTrack(titlePrimary, curvePrimary.name, curvePrimary.unit)
        );
    }
}

function addDualScaleTrack(
    info: TracksInfo,
    axes: AxesInfo,
    curves: WellLogCurve[],
    data: WellLogDataRow[],
    axisIndices: AxisIndices
): void {
    const idxPrimary = axisIndices.primary;
    const idxSecondary = axisIndices.secondary;

    const titlePrimary = getAxisTitle(axes, axes.primaryAxis);
    const titleSecondary = getAxisTitle(axes, axes.secondaryAxis);

    const curvePrimary = curves[idxPrimary];
    const curveSecondary = curves[idxSecondary];

    info.tracks.push(
        newDualScaleTrack(
            0,
            titlePrimary,
            curvePrimary.name,
            curvePrimary.unit
        ),
        newDualScaleTrack(
            1,
            titleSecondary,
            curveSecondary.name,
            curveSecondary.unit
        )
    );

    info.primaries = new Float32Array(data.length); // 32 bits should be enough
    info.secondaries = new Float32Array(data.length);

    {
        let count = 0;
        for (const row of data) {
            const secondary: number = row[idxSecondary] as number;
            checkMinMaxValue(info.minmaxSecondaryAxis, secondary);

            if (secondary !== null) {
                const primary: number = row[idxPrimary] as number;
                if (primary !== null) {
                    info.secondaries[count] = secondary;
                    info.primaries[count] = primary;
                    count++;
                }
            }
        }
        if (count < info.primaries.length) {
            // resize arrays to actual size used
            info.primaries = info.primaries.subarray(0, count);
            info.secondaries = info.secondaries.subarray(0, count);
        }
    }
}

function setupPlot(
    wellLog: WellLogSet[],
    templatePlot: TemplatePlot,
    axesInfo: AxesInfo,
    useSecondCurve?: boolean
): PlotSetup | null {
    const curveName = useSecondCurve ? templatePlot.name2 : templatePlot.name;
    if (useSecondCurve && templatePlot.type !== "differential") return null;
    if (!curveName) return null;

    const { iCurve, iSet } = findSetAndCurveIndex(wellLog, curveName);
    if (iCurve < 0) return null;

    const sourceLogSet = wellLog[iSet];
    const data = sourceLogSet.data;
    const curves = sourceLogSet.curves;
    const curve = curves[iCurve];
    const dimensions = curve.dimensions ?? 1;

    if (dimensions !== 1) return null;
    if (curve.valueType === "string" && templatePlot.type !== "stacked")
        return null;

    const axisIndices = getAxisIndices(sourceLogSet.curves, axesInfo);
    const plotData = preparePlotData(data, iCurve, axisIndices.primary);
    const minmax: [number, number] = [plotData.minmax[0], plotData.minmax[1]];

    return {
        iCurve,
        iSet,
        sourceLogSet,
        curve,
        plotData,
        minmax,
        templatePlot,
        isSecondary: Boolean(useSecondCurve),
    };
}

function checkSetupMinMax(
    setup1: PlotSetup,
    setup2: PlotSetup | null,
    primaryAxisMinMax: [number, number]
) {
    checkMinMax(primaryAxisMinMax, setup1.plotData.minmaxPrimaryAxis);

    if (setup2) {
        checkMinMax(setup1.minmax, setup2.minmax);
        checkMinMax(primaryAxisMinMax, setup2.plotData.minmaxPrimaryAxis);
    }
}

function addGraphTrack(
    info: TracksInfo,
    wellLog: WellLogSet[],
    axesInfo: AxesInfo,
    templateTrack: TemplateTrack,
    templateStyles: TemplateStyle[] | undefined,
    colorMapFunctions: ColorMapFunction[] | undefined
): void {
    const plotDatas: [number | null, number | string | null][][] = [];
    const plots: PlotConfig[] = [];
    // Saving the curves so it can be used for title generation
    const curvesUsed: WellLogCurve[] = [];

    if (templateTrack.plots)
        for (const templatePlot of templateTrack.plots) {
            const styledTemplatePlot = applyTemplateStyle(
                templatePlot,
                templateStyles
            );

            const plotSetup = setupPlot(wellLog, styledTemplatePlot, axesInfo);

            if (!plotSetup) continue; // Plot couldnt be set up, skip adding this track
            const { plotData, curve, minmax, iCurve, iSet } = plotSetup;

            const plotSetup2 = setupPlot(
                wellLog,
                styledTemplatePlot,
                axesInfo,
                true
            );

            // Apply min-max index values to entire track
            checkSetupMinMax(plotSetup, plotSetup2, info.minmaxPrimaryAxis);

            const p = getPlotConfig(
                `${iSet}-${iCurve}`,
                styledTemplatePlot,
                templateTrack.scale,
                minmax,
                curve,
                plotDatas.length,
                plotSetup2?.curve,
                plotDatas.length + 1,
                colorMapFunctions
            );

            plots.push(p);
            curvesUsed.push(curve);
            plotDatas.push(plotData.data);

            if (plotSetup2) {
                curvesUsed.push(plotSetup2.curve);
                plotDatas.push(plotSetup2.plotData.data);
            }
        }

    if (plots.length || templateTrack.required) {
        const label = makeTrackHeader(curvesUsed, templateTrack);
        const options: GraphTrackOptions = {
            data: plotDatas,
            plots: plots,
        };
        setGraphTrackOptionsFromTemplate(options, templateTrack);
        options.label = label;

        const track = newGraphTrack(options);
        updateGraphTrackScale(track);
        info.tracks.push(track);
    }
}
function addStackedTrack(
    info: TracksInfo,
    wellLog: WellLogSet[],
    axesInfo: AxesInfo,
    templateTrack: TemplateTrack,
    templateStyles?: TemplateStyle[],
    colorMapFunctions?: ColorMapFunction[]
): void {
    const templatePlot = templateTrack.plots[0];
    const styledTemplatePlot = applyTemplateStyle(templatePlot, templateStyles);

    const name = styledTemplatePlot.name;

    const plotSetup = setupPlot(wellLog, styledTemplatePlot, axesInfo);

    if (!plotSetup) return;
    const { plotData, curve, sourceLogSet } = plotSetup;

    const templateTrackFullPlot = deepCopy(templateTrack);
    const label = makeTrackHeader([curve], templateTrack);
    const meta = getDiscreteMeta(sourceLogSet, name);

    templateTrackFullPlot.title = label;
    templateTrackFullPlot.plots[0].type = styledTemplatePlot.type;

    // curve.valueType could be "integer", "string"

    if (!meta && curve.valueType === "integer")
        console.log(
            "Discrete meta information for '" +
                name +
                "' not found. Use default"
        );

    let colorMapFunction: ColorMapFunction | undefined = undefined;
    if (styledTemplatePlot.colorMapFunctionName) {
        if (colorMapFunctions) {
            colorMapFunction = colorMapFunctions.find(
                (colorMapFunction) =>
                    colorMapFunction.name ===
                    styledTemplatePlot.colorMapFunctionName
            );
            if (!colorMapFunction)
                console.error(
                    "Missed '" +
                        styledTemplatePlot.colorMapFunctionName +
                        "' color function/table"
                );
        } else {
            console.error(
                "No color function/table array given for '" +
                    styledTemplatePlot.colorMapFunctionName +
                    "' color function"
            );
        }
    } else {
        if (!meta)
            // see https://github.com/equinor/webviz-subsurface-components/issues/1613
            console.error(
                "No color function/table given in template plot props"
            );
    }

    const plot = templateTrackFullPlot.plots[0];
    if (plot) {
        plot.showLabels = styledTemplatePlot.showLabels;
        plot.showLines = styledTemplatePlot.showLines;
        plot.labelRotation = styledTemplatePlot.labelRotation ?? 0;
    }

    const options: StackedTrackOptions = {
        abbr: name, // name of the only plot
        legendConfig: stackLegendConfig,
        data: createStackData.bind(null, plotData.data, colorMapFunction, meta),
    };
    setStackedTrackOptionsFromTemplate(options, templateTrackFullPlot);
    const track = newStackedTrack(options);
    updateStackedTrackScale(track);

    checkMinMax(info.minmaxPrimaryAxis, plotData.minmaxPrimaryAxis);
    info.tracks.push(track);
}

export function createTracks(
    wellLog: WellLogSet[],
    axes: AxesInfo,
    templateTracks: TemplateTrack[], // Part of JSON
    templateStyles: TemplateStyle[] | undefined, // Part of JSON
    colorMapFunctions: ColorMapFunction[] // JS code or JSON color table
): TracksInfo {
    if (!wellLog?.length) return new TracksInfo();

    const info = new TracksInfo();

    addScaleTracks(info, axes, wellLog);

    for (const templateTrack of templateTracks) {
        if (isStackedTrack(templateTrack, templateStyles)) {
            addStackedTrack(
                info,
                wellLog,
                axes,
                templateTrack,
                templateStyles,
                colorMapFunctions
            );
        } else {
            addGraphTrack(
                info,
                wellLog,
                axes,
                templateTrack,
                templateStyles,
                colorMapFunctions
            );
        }
    }

    return info;
}

function addTrack(
    wellLogView: WellLogView,
    trackNew: Track,
    trackCurrent: Track,
    bAfter: boolean
): void {
    if (wellLogView.logController) {
        let order = 0;
        for (const track of wellLogView.logController.tracks) {
            track.order = order++;
            if (trackCurrent === track) {
                if (bAfter) {
                    // add after
                    trackNew.order = order++;
                } else {
                    // insert before current
                    trackNew.order = track.order;
                    track.order = order++;
                }
            }
        }

        wellLogView.logController.addTrack(trackNew);
    }
}

// Base for Graph and Stacked Options
function setTrackOptionsFromTemplate(
    options: TrackOptions,
    templateTrack: TemplateTrack
): void {
    options.label = templateTrack.title;
    if (templateTrack.width !== undefined) options.width = templateTrack.width;

    (options as TrackOptionsEx).__template = deepCopy(templateTrack);
}
function setGraphTrackOptionsFromTemplate(
    options: GraphTrackOptions,
    templateTrack: TemplateTrack
): void {
    {
        if (templateTrack.scale) options.scale = templateTrack.scale;
        else delete options.scale;
    }
    //if (force || templateTrack.domain) options.domain = templateTrack.domain;

    setTrackOptionsFromTemplate(options, templateTrack);
}
function setStackedTrackOptionsFromTemplate(
    options: StackedTrackOptions,
    templateTrack: TemplateTrack
): void {
    const plot = templateTrack.plots[0];
    if (plot) {
        options.showLabels = plot.showLabels;
        options.showLines = plot.showLines;
        options.labelRotation = plot.labelRotation ?? 0;
    }

    setTrackOptionsFromTemplate(options, templateTrack);
}

export function addOrEditGraphTrack(
    wellLogView: WellLogView,
    track: GraphTrack | null,
    templateTrack: TemplateTrack,
    trackCurrent: Track,
    bAfter: boolean
): GraphTrack {
    if (track) {
        // edit existing track
        setGraphTrackOptionsFromTemplate(track.options, templateTrack);
        updateGraphTrackScale(track);
    } else {
        const options: GraphTrackOptions = {
            plots: [],
            data: [],
        };
        setGraphTrackOptionsFromTemplate(options, templateTrack);
        track = newGraphTrack(options);
        addTrack(wellLogView, track, trackCurrent, bAfter);
    }
    if (wellLogView.logController) wellLogView.logController.updateTracks();
    return track;
}

export function addOrEditStackedTrack(
    wellLogView: WellLogView,
    track: StackedTrack | null,
    templateTrack: TemplateTrack,
    trackCurrent: Track,
    bAfter: boolean
): StackedTrack | null {
    const props = wellLogView.props;
    const templateStyles = props.template.styles;
    const wellLog = wellLogView.wellLogSets;
    const templatePlot = templateTrack.plots[0];

    if (!wellLog || !templatePlot) return null;

    const fullTemplatePlot = applyTemplateStyle(templatePlot, templateStyles);
    const name = fullTemplatePlot.name;

    const colorMapFunctionName = props.colorMapFunctions?.find(
        (colorMapFunction) =>
            colorMapFunction.name === fullTemplatePlot.colorMapFunctionName
    );

    const { iCurve, iSet } = findSetAndCurveIndex(wellLog, name);

    if (iCurve < 0) return null; // curve not found

    const sourceLogSet = wellLog[iSet];
    const meta = getDiscreteMeta(sourceLogSet, name);
    const data = sourceLogSet.data;
    const curves = sourceLogSet.curves;
    const axes = wellLogView.getAxesInfo();
    const iPrimaryAxis = indexOfElementByNames(
        curves,
        axes.mnemos[axes.primaryAxis]
    );
    const plotData = preparePlotData(data, iCurve, iPrimaryAxis);
    const stackData = createStackData.bind(
        null,
        plotData.data,
        colorMapFunctionName,
        meta
    );
    if (track) {
        // edit existing track
        {
            // force to clear stacked areas
            track.data = null; // workarond for videx well log component to force redraw areas with new options (showLines, ...)
            if (wellLogView.logController)
                wellLogView.logController.updateTracks();
        }
        track.options.abbr = name; // name of the only plot
        track.options.data = stackData;
        track.data = track.options.data;
        setStackedTrackOptionsFromTemplate(track.options, templateTrack);
        updateStackedTrackScale(track);
        if (wellLogView.logController) wellLogView.logController.refresh();
    } else {
        const options: StackedTrackOptions = {
            abbr: name, // name of the only plot
            data: stackData,
            legendConfig: stackLegendConfig,
        };
        setStackedTrackOptionsFromTemplate(options, templateTrack);
        track = newStackedTrack(options);
        addTrack(wellLogView, track, trackCurrent, bAfter);
    }
    if (wellLogView.logController) wellLogView.logController.updateTracks();
    return track;
}

export function hasDifferentialPlot(track: GraphTrack): boolean {
    for (const plot of track.plots) {
        const type = getPlotType(plot);
        if (type === "differential") return true;
    }
    return false;
}
