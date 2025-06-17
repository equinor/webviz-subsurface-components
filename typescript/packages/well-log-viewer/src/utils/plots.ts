/**
 * Utilities for configuring and creating plots for well log visualization.
 */
import type { GraphTrack, Plot } from "@equinor/videx-wellog";
import {
    LinePlot,
    AreaPlot,
    DotPlot,
    DifferentialPlot,
    LineStepPlot,
} from "@equinor/videx-wellog";
import type { PlotConfig } from "@equinor/videx-wellog/dist/tracks/graph/interfaces";
import type { DataAccessorFunction } from "@equinor/videx-wellog/dist/plots/interfaces";
import type { LegendInfo } from "@equinor/videx-wellog/dist/plots/legend/interfaces";
import { type AreaData } from "@equinor/videx-wellog";

import type {
    TemplatePlot,
    TemplatePlotType,
    TemplateTrack,
} from "../components/WellLogTemplateTypes";
import type {
    WellLogCurve,
    WellLogDataRow,
    WellLogSet,
} from "../components/WellLogTypes";

import { type AxesInfo } from "./axes";
import type { ColorMapFunction } from "./color-function";
import { getColormapFunction } from "./color-function";

import GradientFillPlot, {
    type GradientFillPlotOptions,
} from "./gradientfill-plot";
import { checkMinMaxValue, roundLogMinMax, roundMinMax } from "./minmax";
import {
    type DiscreteMeta,
    getDiscreteColorAndName,
    findSetAndCurveIndex,
    getAxisIndices,
} from "./well-log";

export const DEFAULT_SCALE = "linear";
export const DEFAULT_PLOT_TYPE = "line";

/**
 * Extension of videx plot options, to expose legendInfo() function.
 */
export interface ExtPlotOptions
    extends GradientFillPlotOptions /*|DifferentialPlotOptions|AreaPlotOptions*/ {
    legendInfo: () => LegendInfo;
}

/**
 * Worker object containing all necessary information to create a plot.
 */
export type PlotSetup = {
    iCurve: number;
    iSet: number;
    sourceLogSet: WellLogSet;
    curve: WellLogCurve;
    plotData: PlotData;
    minmax: [number, number];
    templatePlot: TemplatePlot;
    isSecondary: boolean;
};

/**
 * Data-class used when translating JSON well-log data to videx-data
 */
export class PlotData {
    minmax: [number, number];
    minmaxPrimaryAxis: [number, number];
    data: [number | null, number | string | null][];

    constructor() {
        this.data = [];
        this.minmax = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
        this.minmaxPrimaryAxis = [
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
        ];
    }
}

/**
 * Prepares plot data from well log data rows.
 *
 * @param data - An row of data from a JSON Well-log.
 * @param iCurve - The index of the curve to be plotted.
 * @param iPrimaryAxis - The index of the primary axis. If negative, the index will be used as the primary axis.
 * @returns A PlotData object containing the prepared plot data.
 */
export function preparePlotData(
    data: WellLogDataRow[],
    iCurve: number,
    iPrimaryAxis: number
): PlotData {
    const plot = new PlotData();
    let i = 0;
    for (const row of data) {
        let value = row[iCurve];
        if (typeof value === "number") checkMinMaxValue(plot.minmax, value);
        const primary: number =
            iPrimaryAxis >= 0 ? (row[iPrimaryAxis] as number) : i++;
        if (primary === null)
            // videx library do not like such data
            value = null; // force a gap in the graph
        checkMinMaxValue(plot.minmaxPrimaryAxis, primary);
        plot.data.push([primary, value]);
    }

    return plot;
}

/**
 * Maps a videx plot type to their respective plot-template option
 * `LinePlot` - linear line graph
 * `LineStepPlot` - linear stepladder graph
 * `AreaPlot` - area graph
 * `DotPlot` - discrete points graph
 * `DifferentialPlot` - differential graph, for correlation of two data series.
 */
export function getPlotType(plot: Plot): TemplatePlotType {
    if (plot instanceof GradientFillPlot) return "gradientfill";
    if (plot instanceof LinePlot) return "line";
    if (plot instanceof AreaPlot) return "area";
    if (plot instanceof DotPlot) return "dot";
    if (plot instanceof DifferentialPlot) return "differential";
    if (plot instanceof LineStepPlot) return "linestep";
    return "";
}

function getScaledDomain(
    templatePlot: TemplatePlot,
    scale: string,
    minmax: [number, number]
): [number, number] {
    if (templatePlot.domain) return templatePlot.domain;
    if (scale === "log") return roundLogMinMax(minmax);
    if (
        templatePlot.type === "gradientfill" &&
        templatePlot.colorScale === "log"
    )
        return roundLogMinMax(minmax);

    return roundMinMax(minmax);
}

function makeLegendInfoFunc(
    curve1: WellLogCurve,
    curve2?: WellLogCurve
): () => LegendInfo {
    return () => ({
        label: curve1.name,
        unit: curve1.unit ?? "",

        // DifferentialPlotLegendInfo,
        serie1: {
            show: true,
            label: curve1.name,
            unit: curve1.unit ?? "",
        },
        serie2: {
            show: true,
            label: curve2?.name ?? "",
            unit: curve2?.unit ?? "",
        },
    });
}
class DataAccessor {
    iData: number;
    iData2?: number;

    /**
     * Utility class to handle data access in Videx plots
     * @param iData the index to access the main data on
     * @param iData2 the index to access second curve data on. Leave undefined if you only have a single plot
     */
    constructor(iData: number, iData2?: number) {
        this.iData = iData;
        this.iData2 = iData2;
    }

    access(data: number[][]): number[] | [number[], number[]] {
        if (this.iData2 != null) {
            return [data[this.iData], data[this.iData2]];
        } else {
            return data[this.iData];
        }
    }
}

function makeDataAccessorFunc(
    iData: number,
    iData2?: number
): DataAccessorFunction {
    const _dataAccessor = new DataAccessor(iData, iData2);
    return _dataAccessor.access.bind(_dataAccessor);
}

/**
 * Builds a valid videx configuration for a plot, based on setups and templates
 *
 * @param plotSetup - The setup information for the primary plot.
 * @param plotSetup2 - The setup information for the secondary plot, if any.
 * @param trackTemplate - The template for the track.
 * @param colormapFunctions - An array of color map functions, for coloring the plot.
 * @param iData - The index of the parent track's data array that corresponds to the primary plot.
 * @param iData2 - The index for the secondary curve, if any.
 * @returns The configuration for the plot.
 */
export function buildPlotConfig(
    plotSetup: PlotSetup,
    plotSetup2: PlotSetup | null,
    trackTemplate: TemplateTrack,
    colormapFunctions: ColorMapFunction[] | undefined,
    iData: number,
    iData2: number
): PlotConfig {
    const { iCurve, iSet, templatePlot } = plotSetup;

    return {
        id: `${iSet}-${iCurve}`,
        type: templatePlot.type ?? DEFAULT_PLOT_TYPE,
        options: buildPlotOptions(
            plotSetup,
            plotSetup2,
            trackTemplate,
            colormapFunctions,
            iData,
            iData2
        ),
    };
}

function buildPlotOptions(
    plotSetup: PlotSetup,
    plotSetup2: PlotSetup | null,
    trackTemplate: TemplateTrack,
    colormapFunctions: ColorMapFunction[] | undefined,
    iData: number,
    iData2: number
): ExtPlotOptions {
    const { minmax, templatePlot } = plotSetup;
    const scale = templatePlot.scale || trackTemplate.scale || DEFAULT_SCALE;

    const domain = getScaledDomain(templatePlot, scale, minmax);

    const colormapFunction = getColormapFunction(
        templatePlot.colorMapFunctionName,
        colormapFunctions
    );
    const inverseColormapFunction = getColormapFunction(
        templatePlot.inverseColorMapFunctionName,
        colormapFunctions
    );

    const dataAccessorFunc = makeDataAccessorFunc(
        iData,
        plotSetup2 ? iData2 : undefined
    );

    const legendInfoFunc = makeLegendInfoFunc(
        plotSetup.curve,
        plotSetup2?.curve
    );

    const fillOpacity = templatePlot.fillOpacity ?? 0.25;

    return {
        dataAccessor: dataAccessorFunc,
        legendInfo: legendInfoFunc,

        scale,
        domain,

        color: templatePlot.color,
        inverseColor: templatePlot.inverseColor,
        fill: templatePlot.fill, // for 'area'!
        fillOpacity, // for 'area' and 'gradientfill'!
        useMinAsBase: true, // for 'area' and 'gradientfill'!

        // keep colorMap in returned structure: it is an external API
        colorMapFunction: colormapFunction,
        inverseColorMapFunction: inverseColormapFunction,
        colorScale: templatePlot.colorScale,
        inverseColorScale: templatePlot.inverseColorScale,

        // @ts-expect-error Somethings wrong with the typing here,
        serie1: {
            scale: scale, //"linear" or "log"
            domain: domain,
            color: templatePlot.color,
            fill: templatePlot.fill,
        },
        serie2: {
            // ? =scale2, =domain2 ?
            scale: scale,
            domain: domain,
            color: templatePlot.color2,
            fill: templatePlot.fill2,
        },
    };
}

function createAreaData(
    from: number,
    to: number,
    value: number | string,
    colormapFunction: ColorMapFunction | undefined,
    meta?: DiscreteMeta | null
): AreaData | null {
    const { color, name } = getDiscreteColorAndName(
        value,
        colormapFunction,
        meta
    );
    return {
        from: from,
        to: to,
        name: name,
        color: {
            r: color[0],
            g: color[1],
            b: color[2],
            //, a: color[3]!==undefined? color[3]: 1.0
        },
    };
}

/**
 * Creates an array of `AreaData` objects that together form a discrete stacked graph.
 *
 * @param data - An array of key-value tuple rows.
 * @param colormapFunction - A function that maps values to colors. Can be undefined.
 * @param meta - Metadata defining how a value is represented (i.e label and color).
 *
 * @returns A promise that resolves to an array of `AreaData` objects.
 */
export async function createStackData(
    data: [number | null, number | string | null][],
    colormapFunction: ColorMapFunction | undefined,
    meta: DiscreteMeta | undefined | null
): Promise<AreaData[]> {
    const arr: AreaData[] = new Array<AreaData>();
    let prev: [number | null, string | number | null] | null = null;
    let area: AreaData | null = null;
    for (const p of data) {
        let boundary = p[0];
        if (boundary === null) {
            // do the same work as at the end of data
            if (area) {
                // store the area
                arr.push(area);
                area = null;
            }
            continue;
        }
        if (prev) {
            /* move area boundary to the middle of the last interval
            const d = boundary - prev[0];
            boundary = prev[0] + d * 0.5;
            */
            // move area boundary to the beginnig of the last interval
            boundary = prev[0];
            if (boundary === null) continue;
        }
        // extend current area
        if (area) area.to = boundary; // null is already processed

        const value = p[1]; // current value
        if (prev) {
            if (value !== prev[1]) {
                // new value encountered
                if (area) {
                    // store the area
                    arr.push(area);
                    area = null; // wait for a new non-null value
                }
            }
        }
        if (!area && value !== null && value !== undefined && p[0] !== null) {
            // new value is not null
            // create new interval colored and labeled for the value
            area = createAreaData(
                boundary,
                p[0],
                value,
                colormapFunction,
                meta
            );
        }
        prev = p;
    }
    if (area)
        // store the area
        arr.push(area);
    return arr;
}

/**
 * Sets up the plot configuration for a given well log set and template plot.
 *
 * @param wellLog - A JSON well-log set to source data from.
 * @param templatePlot - The template plot configuration.
 * @param axesInfo - Information about the log's axes.
 * @param useSecondCurve - Optional flag to indicate that the "name2" curve should be used
 * @returns A PlotSetup object containing the plot configuration, or null if the setup is invalid.
 */
export function setupPlot(
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

/**
 * Generates setup objects for all relevant plots in a given template (aka, curve 1 and sometimes 2)
 * @param templatePlot A template config for a plot
 * @param wellLogSets A JSON Well-Log data set to source from
 * @param axesInfo Information about the axes to be used
 * @returns An array of all successfully created plot setups
 */
export function setupTrackPlot(
    templatePlot: TemplatePlot,
    wellLogSets: WellLogSet[],
    axesInfo: AxesInfo
): PlotSetup[] {
    const retArr: PlotSetup[] = [];

    const plotSetup = setupPlot(wellLogSets, templatePlot, axesInfo);
    const plotSetup2 = setupPlot(wellLogSets, templatePlot, axesInfo, true);

    if (plotSetup) retArr.push(plotSetup);
    if (plotSetup2) retArr.push(plotSetup2);

    return retArr;
}

/**
 * Builds a graph plot using internals from an existing track
 *
 * @param plotConfig - The configuration for the plot to be created.
 * @param track - The graph track containing options and scale information.
 * @returns The created plot.
 */
// Somewhat hacky approach to generate a valid plot instance, for when you're adding a plot to an existing track
export function buildGraphPlotFromTrackOptions(
    plotConfig: PlotConfig,
    track: GraphTrack
): Plot {
    const factory = track.options.plotFactory;
    const scale = track.scale;

    if (!factory) {
        throw Error(`No plot factory found in track!`);
    }
    if (!factory[plotConfig.type]) {
        throw Error(
            `No factory function for creating '${plotConfig.type}'-plot!`
        );
    }

    return factory[plotConfig.type](plotConfig, scale);
}
