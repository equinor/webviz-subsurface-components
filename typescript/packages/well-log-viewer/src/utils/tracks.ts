/**
 * Utilities for creating, editing, and managing videx-wellog tracks.
 *
 * The module supports two different track types:
 * - GraphTrack: For displaying curve data
 * - StackedTrack: For displaying discrete/category data
 *
 */

import type { Track, Plot, StackedTrackOptions } from "@equinor/videx-wellog";
import type { TrackOptions } from "@equinor/videx-wellog/dist/tracks/interfaces";
import type { Domain } from "@equinor/videx-wellog/dist/common/interfaces";
import type {
    GraphTrackOptions,
    PlotConfig,
} from "@equinor/videx-wellog/dist/tracks/graph/interfaces";
import {
    ScaleTrack,
    DualScaleTrack,
    GraphTrack,
    StackedTrack,
} from "@equinor/videx-wellog";

import { getColormapFunction, type ColormapFunction } from "./color-function";
import type {
    TemplateTrack,
    TemplatePlot,
} from "../components/WellLogTemplateTypes";
import type { WellLogSet, WellLogCurve } from "../components/WellLogTypes";

import { createScale } from "./graph/factory";
import { stackLegendConfig } from "./stack/stack-legend";
import { type AxesInfo, getAxisTitle } from "./axes";

import { checkMinMax } from "./minmax";
import { getAxisIndices, getDiscreteMeta } from "./well-log";
import {
    type PlotSetup,
    type PlotData,
    getPlotType,
    buildPlotConfig,
    createStackData,
    buildGraphPlotFromTrackOptions,
    setupTrackPlot,
} from "./plots";
import {
    newStackedTrack,
    newGraphTrack,
    newDualScaleTrack,
    newScaleTrack,
} from "./trackFactory";
import { isStackedTrackTemplate } from "./template";
import { makeTrackHeader } from "./template";

// Extended track options interface that includes template and index range properties. Used interally in other
interface ExtTrackOptions extends TrackOptions {
    __indexMinMax: [number, number];
    __template: TemplateTrack;
}

// Data class utility for createTracks return object
class TracksInfo {
    tracks: Track[] = [];
    minmaxPrimaryAxis: [number, number] = [
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
    ];
    // ? Doesn't seem to be used anywhere? (@anders2303)
    minmaxSecondaryAxis: [number, number] = [
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
    ];

    expandDomainToTrack(track: Track) {
        const trackRange = getTrackIndexRange(track);
        checkMinMax(this.minmaxPrimaryAxis, trackRange);
    }
}

/**
 * Update Graph-Track Scale according to the first plot
 */
function updateGraphTrackScale(track: GraphTrack): void {
    const templateTrack = getTrackTemplate(track);

    if (templateTrack) {
        if (templateTrack.plots.length) {
            const plotTemplate = templateTrack.plots[0];
            track.options.scale = plotTemplate.scale;
            track.options.domain = plotTemplate.domain;

            if (!track.options.label) track.options.label = plotTemplate.name;
        }
        if (templateTrack.scale) {
            track.options.scale = templateTrack.scale;
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
// ? The comment here have here a while, are they okay to just remove? (@anders2303)
function updateStackedTrackScale(track: StackedTrack): void {
    const track_options = track.options as ExtTrackOptions;
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
    //    // could be on required track with missed data
    //    console.log("Empty track.options.domain!");
    //    track.options.domain =
    //        track.options.scale === "log" ? [1, 100] : [0, 100];
    //}

    //if (!track.options.scale) throw Error("Invalid track.options.scale!");
    //track.trackScale = createScale(track.options.scale, track.options.domain);
    // track.xscale;
}

/**
 * Builds a list of videx well-log track objects based on on a set of JSON well-logs.
 * @param wellLog A Well-log JSON set
 * @param axes The axes to match data to
 * @param templateTracks Templates describing individual tracks
 * @param templateStyles Global styles/options for track plots
 * @param colormapFunctions Overview of methods used to color rendered plots
 * @returns An object containing videx tracks and related meta-info
 */
export function createWellLogTracks(
    wellLog: WellLogSet[],
    axes: AxesInfo,
    templateTracks: TemplateTrack[], // Part of JSON
    colormapFunctions: ColormapFunction[] // JS code or JSON color table
): TracksInfo {
    if (!wellLog?.length) return new TracksInfo();

    const info = new TracksInfo();
    const scaleTracks = setUpScaleTracks(axes, wellLog);

    info.tracks.push(...scaleTracks);

    for (const templateTrack of templateTracks) {
        const track = createTrack(
            wellLog,
            axes,
            templateTrack,
            colormapFunctions
        );

        if (!track) {
            console.warn("Could not build track", templateTrack);
        } else {
            info.expandDomainToTrack(track);
            info.tracks.push(track);
        }
    }

    // If no bounds have been defined (for example, if no tracks were added),
    // we default to using the axis curve's min/max as bounds
    if (!isFinite(info.minmaxPrimaryAxis[0])) {
        const curves = wellLog[0].curves;
        const data = wellLog[0].data;
        const { primary } = getAxisIndices(curves, axes);

        const firstAxisValue = data[0]?.[primary];
        if (typeof firstAxisValue === "number")
            info.minmaxPrimaryAxis[0] = firstAxisValue;
    }

    if (!isFinite(info.minmaxPrimaryAxis[1])) {
        const curves = wellLog[0].curves;
        const data = wellLog[0].data;
        const { primary } = getAxisIndices(curves, axes);

        const lastAxisValue = data[data.length - 1]?.[primary];
        if (typeof lastAxisValue === "number")
            info.minmaxPrimaryAxis[1] = lastAxisValue;
    }

    return info;
}

// Generates setup objects for each plot used by the track
function setupTrackPlots(
    wellLog: WellLogSet[],
    templateTrack: TemplateTrack,
    axesInfo: AxesInfo
): PlotSetup[] {
    // ! For stacked curves, we only care about the first curve
    const plots = isStackedTrackTemplate(templateTrack)
        ? templateTrack.plots.slice(0, 1)
        : templateTrack.plots;

    const plotSetups: PlotSetup[] = [];

    for (const plotTemplate of plots) {
        plotSetups.push(...setupTrackPlot(plotTemplate, wellLog, axesInfo));
    }

    return plotSetups;
}

// Modify setup domains to ensure there's room for a secondary curve
function applySetupMinMax(
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

// Sometimes we need the next setup, since it might be for a secondary curve (e.g. differential curves)
function maybeGetSecondaryPlotSetup(
    plotSetups: PlotSetup[],
    currIndex: number
): PlotSetup | null {
    const setup1 = plotSetups[currIndex];
    const setup2 = plotSetups[currIndex + 1] ?? null;

    if (!setup2?.isSecondary) return null;
    // It's expected that both setups came from the same template object (name, and name2)
    if (setup2 && setup1.templatePlot !== setup2.templatePlot) {
        throw new Error(
            "Expected secondary plot to have the same template-plot"
        );
    }
    return setup2;
}

function makeGraphTrackOptions(
    plotSetups: PlotSetup[],
    templateTrack: TemplateTrack,
    colormapFunctions?: ColormapFunction[],
    existingOptions: Partial<ExtTrackOptions> = {}
): GraphTrackOptions & ExtTrackOptions {
    // Only returns a non-required tracks if there's any plot-setups available
    const trackData: PlotData["data"][] = [];
    const trackPlots: PlotConfig[] = [];

    // Map the curves, used for track-header generation later
    const curvesUsed: WellLogCurve[] = [];

    // Store tracks index range
    const indexMinMax: [number, number] = [
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
    ];

    for (let index = 0; index < plotSetups.length; index++) {
        const plotSetup = plotSetups[index];
        const plotSetup2 = maybeGetSecondaryPlotSetup(plotSetups, index);

        applySetupMinMax(plotSetup, plotSetup2, indexMinMax);

        const plotConfig = buildPlotConfig(
            plotSetup,
            plotSetup2,
            templateTrack,
            colormapFunctions,
            trackData.length,
            trackData.length + 1
        );

        trackPlots.push(plotConfig);
        curvesUsed.push(plotSetup.curve);
        trackData.push(plotSetup.plotData.data);

        if (plotSetup2) {
            // The "next" setup is already consumed, increment an extra step
            index++;
            curvesUsed.push(plotSetup2.curve);
            trackData.push(plotSetup2.plotData.data);
        }
    }

    return {
        ...createTrackOptionsFromTemplate(templateTrack, existingOptions),
        __indexMinMax: indexMinMax,
        label: makeTrackHeader(curvesUsed, templateTrack),
        data: trackData,
        plots: trackPlots,
    };
}

function makeStackedTrackOptions(
    plotSetups: PlotSetup[],
    templateTrack: TemplateTrack,
    colormapFunctions?: ColormapFunction[],
    existingOptions: Partial<ExtTrackOptions> = {}
): StackedTrackOptions & ExtTrackOptions {
    // ? Why do we not care about "required" here? (@anders2303)
    if (!plotSetups.length) throw new Error("Unexpected empty plot list");

    const { curve, plotData, sourceLogSet, templatePlot } = plotSetups[0];
    const meta = getDiscreteMeta(sourceLogSet, curve.name);
    const colorFunc = getColormapFunction(
        templatePlot.colorMapFunctionName ?? "",
        colormapFunctions
    );
    const trackHeader = makeTrackHeader([curve], templateTrack);

    if (!meta && curve.valueType === "integer") {
        console.warn(
            `Discrete meta information for '${curve.name}' not found. Using default`
        );
    }

    if (!meta && !colorFunc) {
        // see https://github.com/equinor/webviz-subsurface-components/issues/1613
        console.error(
            "No color function/table or metadata given in template plot props"
        );
    }

    return {
        ...createTrackOptionsFromTemplate(templateTrack, existingOptions),
        __indexMinMax: plotData.minmaxPrimaryAxis,
        legendConfig: stackLegendConfig,
        abbr: curve.name,
        label: trackHeader,
        // ? Why is this one using a bound method, whereas GraphTrack does not? (@anders2303)
        data: createStackData.bind(null, plotData.data, colorFunc, meta),
    };
}

/**
 * Creates a single well-log viewer track from a template object.
 * @param wellLog Well log data set
 * @param axesInfo Information about data axes to use
 * @param templateTrack Track setup template
 * @param colormapFunctions Optional - Functions for coloring the plot
 * @returns A videx well-log track, if the template was valid. Otherwise null
 */
export function createTrack(
    wellLog: WellLogSet[],
    axesInfo: AxesInfo,
    templateTrack: TemplateTrack,
    colormapFunctions?: ColormapFunction[]
): Track | null {
    const plotSetups = setupTrackPlots(wellLog, templateTrack, axesInfo);

    // ! Stacked tracks require one plot to initialize
    if (isStackedTrackTemplate(templateTrack) && plotSetups.length) {
        const stackedOptions = makeStackedTrackOptions(
            plotSetups,
            templateTrack,
            colormapFunctions
        );

        const track = newStackedTrack(stackedOptions);
        updateStackedTrackScale(track);

        return track;
    } else if (plotSetups.length || templateTrack.required) {
        const graphOptions = makeGraphTrackOptions(
            plotSetups,
            templateTrack,
            colormapFunctions
        );

        const track = newGraphTrack(graphOptions);
        updateGraphTrackScale(track);

        return track;
    }

    return null;
}
/**
 * Edits a videx track to match a new template.
 * **NOTE:** Mutates the track!
 * @param existingTrack The track to edit
 * @param newTemplateTrack The new template to apply
 * @param wellLogSets JSON Well-log containing curve data
 * @param axisInfo Description of the axes to plot data against
 * @param colormapFunctions Methods used when coloring the plot
 * @returns The edited track
 */
export function editTrack(
    existingTrack: Track,
    newTemplateTrack: TemplateTrack,
    wellLogSets: WellLogSet[],
    axisInfo: AxesInfo,
    colormapFunctions: ColormapFunction[]
): Track {
    const newPlotSetups = setupTrackPlots(
        wellLogSets,
        newTemplateTrack,
        axisInfo
    );

    if (existingTrack instanceof StackedTrack) {
        // ! Hack to force to clear stacked areas
        existingTrack.data = null;

        const newTrackOptions = makeStackedTrackOptions(
            newPlotSetups,
            newTemplateTrack,
            colormapFunctions,
            existingTrack.options
        );

        existingTrack.options = newTrackOptions;
        existingTrack.data = newTrackOptions.data;

        updateStackedTrackScale(existingTrack as StackedTrack);
    } else if (existingTrack instanceof GraphTrack) {
        // TODO: Deal with new plots being added here. Pass to attachPlotToTrack?
        const newOptions = makeGraphTrackOptions(
            newPlotSetups,
            newTemplateTrack,
            colormapFunctions,
            existingTrack.options
        );
        existingTrack.options = newOptions;
        existingTrack.data = newOptions.data;

        existingTrack.refresh();
        updateGraphTrackScale(existingTrack as GraphTrack);
    }

    return existingTrack;
}

/**
 * Adds a new plot to a videx track.
 * **NOTE:** Mutates the track
 * @param track A videx track. **Note:** Currently only supports graph tracks
 * @param templatePlot Template object for the new plot,
 * @param wellLogSets JSON Well-log sets to source data from
 * @param axesInfo
 * @param colormapFunctions
 */
export function addPlotToTrack(
    track: Track,
    templatePlot: TemplatePlot,
    wellLogSets: WellLogSet[],
    axesInfo: AxesInfo,
    colormapFunctions: ColormapFunction[]
) {
    // ! Currently only supporting graph tracks, but keeping the function ambiguous for now
    if (!(track instanceof GraphTrack))
        throw Error("Can only add tracks to GraphTracks");

    const existingPlots = track.plots;
    const trackDataPoints = track.options.data;
    const existingTemplate = getTrackTemplate(track);
    const existingIndexRange = getTrackIndexRange(track);

    const [setup1, setup2] = setupTrackPlot(
        templatePlot,
        wellLogSets,
        axesInfo
    );

    // Guard
    if (!setup1) {
        throw Error("Invalid plot setup");
    }

    applySetupMinMax(setup1, setup2, existingIndexRange);

    const newPlotConfig = buildPlotConfig(
        setup1,
        setup2,
        existingTemplate,
        colormapFunctions,
        trackDataPoints.length,
        trackDataPoints.length + 1
    );

    const newPlot = buildGraphPlotFromTrackOptions(newPlotConfig, track);

    existingPlots.push(newPlot);
    existingTemplate.plots.push(templatePlot);

    trackDataPoints.push(setup1.plotData.data);
    if (setup2) trackDataPoints.push(setup2.plotData.data);

    updateGraphTrackScale(track);
    track.prepareData();
}

/**
 * Modifies one of the plots in a videx track.
 * **NOTE:** Mutates the track!
 * @param track A videx track
 * @param oldPlot The plot that's being edited
 * @param templatePlot The new template to apply
 * @param wellLogSets JSON Well-log sets to source data from
 * @param axesInfo Description of the axes to plot data against
 * @param colormapFunctions Methods used when coloring the plot
 */
export function editTrackPlot(
    track: Track,
    oldPlot: Plot,
    templatePlot: TemplatePlot,
    wellLogSets: WellLogSet[],
    axesInfo: AxesInfo,
    colormapFunctions: ColormapFunction[]
) {
    if (!(track instanceof GraphTrack))
        throw Error("Can only add tracks to GraphTracks");

    const existingPlots = track.plots;
    const iOldPlot = existingPlots.indexOf(oldPlot);
    const trackDataPoints = track.options.data;
    const existingTemplate = getTrackTemplate(track);
    const existingIndexRange = getTrackIndexRange(track);

    // Guard
    if (iOldPlot < 0) {
        throw Error("Plot not in track!");
    }

    const [setup1, setup2] = setupTrackPlot(
        templatePlot,
        wellLogSets,
        axesInfo
    );

    // Guard
    if (!setup1) {
        throw Error("Invalid plot setup");
    }

    applySetupMinMax(setup1, setup2, existingIndexRange);

    const newPlotConfig = buildPlotConfig(
        setup1,
        setup2,
        existingTemplate,
        colormapFunctions,
        trackDataPoints.length,
        trackDataPoints.length + 1
    );

    const newPlot = buildGraphPlotFromTrackOptions(newPlotConfig, track);

    existingPlots[iOldPlot] = newPlot; // replace existing plot
    existingTemplate.plots[iOldPlot] = templatePlot;

    trackDataPoints.push(setup1.plotData.data);
    if (setup2) trackDataPoints.push(setup2.plotData.data);

    updateGraphTrackScale(track);
    track.prepareData();
}

/**
 * Removes a plot from a videx track.
 * **NOTE:** Mutates the track!
 * @param track A videx track
 * @param plot The plot that should be removed
 */
export function removeTrackPlot(track: Track, plot: Plot) {
    if (!(track instanceof GraphTrack)) {
        throw new Error("Plots can only be removed from Graph tracks track");
    }

    const existingTemplate = getTrackTemplate(track);
    const existingPlots = track.plots;
    const iOldPlot = existingPlots.findIndex((p) => p === plot);

    // Guard
    if (iOldPlot === -1) {
        throw Error("Plot not found in track!");
    }

    existingPlots.splice(iOldPlot, 1);
    existingTemplate.plots.splice(iOldPlot, 1);

    // Last track was removed, set as required so track stays visible
    if (!existingPlots.length) existingTemplate.required = true;

    updateGraphTrackScale(track);
    track.prepareData();
}

/**
 * Gets the index range (along the primary axis) that a track's plots have valid data in
 * @param track A videx track
 * @returns A number tuple, with the lower and upper axis values
 */
export function getTrackIndexRange(track: Track): [number, number] {
    const options = track.options as ExtTrackOptions;
    if (options.__indexMinMax) {
        return options.__indexMinMax;
    } else {
        console.error("No __indexMinMax given in track!");
        return [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
    }
}

/**
 * Gets the template object that was used when a track was created.
 * @param track A videx track
 * @returns The template object associated with the track
 */
export function getTrackTemplate(track: Track): TemplateTrack {
    const options = track.options as ExtTrackOptions;
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

/**
 * Determines if a track is a scale track.
 * @param track - The track to check.
 * @returns True if the track is an instance of ScaleTrack or DualScaleTrack, false otherwise.
 */
export function isScaleTrack(track: Track): boolean {
    if (track instanceof ScaleTrack) return true;
    if (track instanceof DualScaleTrack) return true;
    return false;
}

/**
 * Counts the number of scale tracks in the given array of tracks.
 * @param tracks - The array of tracks to count scale tracks from.
 * @returns The number of scale tracks found.
 */
export function getScaleTrackNum(tracks: Track[]): number {
    let n = 0;
    for (const track of tracks) {
        if (isScaleTrack(track)) n++;
    }
    return n;
}

function setUpScaleTracks(
    axesInfo: AxesInfo,
    wellLog: WellLogSet[]
): ScaleTrack[] {
    // All sets is  assumed to include the main axis curve, so we just look at the first curve well log set here
    const curves = wellLog[0].curves;
    const axisIndices = getAxisIndices(curves, axesInfo);

    // Axis curves are missing, return early
    if (axisIndices.primary < 0) return [];

    const titlePrimary = getAxisTitle(axesInfo, axesInfo.primaryAxis);
    const curvePrimary = curves[axisIndices.primary];
    const titleSecondary = getAxisTitle(axesInfo, axesInfo.secondaryAxis);
    const curveSecondary = curves[axisIndices.secondary];

    if (axisIndices.secondary > -1) {
        return [
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
            ),
        ];
    }

    return [newScaleTrack(titlePrimary, curvePrimary.name, curvePrimary.unit)];
}

// Base for Graph and Stacked Options
function setTrackOptionsFromTemplate(
    options: TrackOptions,
    templateTrack: TemplateTrack
): void {
    options.label = templateTrack.title;
    options.tooltip = templateTrack.titleTooltip;
    if (templateTrack.width !== undefined) options.width = templateTrack.width;

    (options as ExtTrackOptions).__template = templateTrack;
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
}

function createTrackOptionsFromTemplate(
    templateTrack: TemplateTrack,
    existingOptions: Partial<ExtTrackOptions> = {}
): ExtTrackOptions {
    const options = { ...existingOptions };

    // Apply type-specific options
    if (isStackedTrackTemplate(templateTrack)) {
        setStackedTrackOptionsFromTemplate(options, templateTrack);
    } else {
        setGraphTrackOptionsFromTemplate(options, templateTrack);
    }

    // Apply generic options
    setTrackOptionsFromTemplate(options, templateTrack);

    return options as ExtTrackOptions;
}

/**
 * Determines if a given track contains a differential plot.
 * @param track - The graph track to check for differential plots.
 * @returns True if the track contains at least one differential plot, false otherwise.
 */
export function hasDifferentialPlot(track: GraphTrack): boolean {
    for (const plot of track.plots) {
        const type = getPlotType(plot);
        if (type === "differential") return true;
    }
    return false;
}
