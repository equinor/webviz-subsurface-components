/* eslint-disable */

import {
    Track,
    ScaleTrack,
    DualScaleTrack,
    GraphTrack,
} from "@equinor/videx-wellog";



//import { Plot } from "@equinor/videx-wellog";

//import { PlotOptions } from "../../../../../node_modules/@equinor/videx-wellog/plots/interfaces"
import { AreaPlotOptions } from "../../../../../node_modules/@equinor/videx-wellog/dist/plots/interfaces"

export interface ExtPlotOptions extends AreaPlotOptions {
    legendInfo: () => {
        label: string,
        unit: string
    };
}

import { PlotConfig } from "../../../../../node_modules/@equinor/videx-wellog/dist/tracks/graph/interfaces"


//import { GraphTrackOptions } from "@equinor/videx-wellog";

import { graphLegendConfig, scaleLegendConfig } from "@equinor/videx-wellog";

import {
    TemplatePlotProps,
    TemplateTrack,
    TemplatePlot,
    TemplateStyle,
} from "../components/WellLogTemplateTypes";
import {
    WellLog,
    WellLogDataRow
} from "../components/WellLogTypes";

import { checkMinMaxValue, checkMinMax, roundMinMax } from "./minmax";

function indexOfElementByName(array: Named[], name: string): number {
    if (name) {
        let i = 0;
        for (const element of array) {
            if (element.name.toUpperCase() == name) {
                return i;
            }
            i++;
        }
    }
    return -1;
}

function indexOfElementByNames(array: Named[], names: string[]): number {
    if (names) {
        let i = 0;
        for (const element of array) {
            if (names.indexOf(element.name.toUpperCase()) >= 0) return i;
            i++;
        }
    }
    return -1;
}

const colors = [
    "red",
    "blue",
    "orange",
    "green",
    "red",
    "magenta",
    "gray",
    "brown",
];
/*
 * `LinePlot` - linear line graph
 * `LineStepPlot` - linear stepladder graph
 * `AreaPlot` - area graph
 * `DotPlot` - discrete points graph
 * `DifferentialPlot` - differential graph, for correlation of two data series.
 */
const plotTypes = [
    "line",
    "line",
    "line",
    "linestep",
    "linestep",
    "dot",
    "area",
    "dot",
    "linestep" /*, 'differential'*/,
];

class PlotData {
    minmax: [number, number];
    minmaxPrimaryAxis: [number, number];
    data: [number, number][];

    constructor() {
        this.minmax = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
        this.minmaxPrimaryAxis = [
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
        ];
        this.data = [];
    }
}

function preparePlotData(
    data: WellLogDataRow[],
    iCurve: number,
    iPrimaryAxis: number
): PlotData {
    const plot = new PlotData();
    let i = 0;
    for (const row of data) {
        const value: number = row[iCurve];
        checkMinMaxValue(plot.minmax, value);
        const primary: number = iPrimaryAxis >= 0 ? row[iPrimaryAxis] : i++;
        checkMinMaxValue(plot.minmaxPrimaryAxis, primary);
        plot.data.push([primary, value]);
    }

    return plot;
}

function shortDescription(description: string): string {
    // sometimes description contains the track number
    //"0  Depth",
    //"1  BVW:CPI:rC:0001:v1",
    //"02 DRAW DOWN PRESSURE",
    if ("0" <= description[0] && description[0] <= "9") {
        if (description[1] == " ") return description.substring(2);
        else if ("0" <= description[1] && description[2] <= "9")
            if (description[2] == " ") return description.substring(3);
    }
    return description;
}

function makeTrackHeader(welllog: WellLog, templateTrack: TemplateTrack) : string {
    if (templateTrack.title) return templateTrack.title;

    const templatePlots = templateTrack.plots;
    if (templatePlots && templatePlots[0]) {
        const curves = welllog[0].curves;
        // get the first curve name
        const templatePlot = templatePlots[0];
        const iCurve = indexOfElementByName(curves, templatePlot.name);
        if (iCurve < 0) // something went wrong
            return templatePlot.name;
        const curve = curves[iCurve];
        return curve.description
            ? shortDescription(curve.description)
            : curve.name;
    }

    return "";
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

type Named = {
    name: string;
};


export function getAvailableAxes(
    welllog: WellLog,
    axisMnemos: Record<string, string[]>
): string[] {
    const result: string[] = [];
    if (welllog && welllog[0]) {
        const curves = welllog[0].curves;

        for (const key in axisMnemos) {
            const i = indexOfElementByNames(curves, axisMnemos[key]);
            if (i >= 0) result.push(key);
        }
    }

    return result;
}

function isValidPlotType(plotType: string) {
    return ["line", "linestep", "dot", "area"].indexOf(plotType) >= 0;
}

function fillPlotOptions(
    templatePlot: TemplatePlot,
    templateStyles: TemplateStyle[],
    iPlot: number
): TemplatePlotProps {
    const iStyle = indexOfElementByName(templateStyles, templatePlot.style);
    const options =
        iStyle >= 0
            ? { ...templateStyles[iStyle], ...templatePlot }
            : { ...templatePlot };
    if (!isValidPlotType(options.type))
        options.type = plotTypes[iPlot % plotTypes.length];
    if (!options.color) options.color = colors[iPlot % colors.length];
    return options;
}

class __dataAccessor {
    iPlot: number;

    constructor(iPlot: number) {
        this.iPlot = iPlot
    }

    dataAccessor(d: number[][]): number[] {
        return d[this.iPlot];
    }
}
function makeDataAccessor(iPlot: number) {
    let _dataAccessor = new __dataAccessor(iPlot)
    return _dataAccessor.dataAccessor.bind(_dataAccessor)
}



function newDualScaleTrack(
    id: number,
    mode: number,
    title: string,
    abbr: string,
    units: string
): DualScaleTrack {
    return new DualScaleTrack(id, {
        mode: mode,
        maxWidth: 50,
        width: 2,
        label: title,
        abbr: abbr ? abbr : title,
        units: units ? units : "",
        legendConfig: scaleLegendConfig,
    });
}

function newScaleTrack(id: number, title: string, abbr: string, units: string) : ScaleTrack {
    return new ScaleTrack(id, {
        maxWidth: 50,
        width: 2,
        label: title,
        abbr: abbr ? abbr : title,
        units: units ? units : "",
        legendConfig: scaleLegendConfig,
    });
}

export function isScaleTrack(track: Track): boolean {
    if ((track as ScaleTrack).xscale) return true;
    //if ((track as DualScaleTrack).xscale) return true;
    return false;
}
export function getScaleTrackNum(tracks: Track[]): number {
    let n = 0;
    for (const track of tracks) {
        if (isScaleTrack(track)) n++;
    }
    return n;
}

export interface AxesInfo {
    primaryAxis: string;
    secondaryAxis: string;
    titles: Record<string, string>; // language dependent strings
    mnemos: Record<string, string[]>;
}

export default (
    welllog: WellLog,
    axes: AxesInfo,
    templateTracks: TemplateTrack[], // Part of JSON
    templateStyles: TemplateStyle[] // Part of JSON
): TracksInfo => {
    const info = new TracksInfo();

    if (welllog && welllog[0]) {
        const data = welllog[0].data;
        const curves = welllog[0].curves;

        const iPrimaryAxis = indexOfElementByNames(
            curves,
            axes.mnemos[axes.primaryAxis]
        );
        if (iPrimaryAxis >= 0) {
            const titlePrimaryAxis = axes.titles[axes.primaryAxis];
            const curvePrimaryAxis = curves[iPrimaryAxis];
            const iSecondaryAxis = indexOfElementByNames(
                curves,
                axes.mnemos[axes.secondaryAxis]
            );

            if (iSecondaryAxis >= 0) {
                info.tracks.push(
                    newDualScaleTrack(
                        info.tracks.length,
                        0,
                        titlePrimaryAxis,
                        curvePrimaryAxis.name,
                        curvePrimaryAxis.unit
                    )
                );

                const titleSecondaryAxis = axes.titles[axes.secondaryAxis];
                const curveSecondaryAxis = curves[iSecondaryAxis];
                info.tracks.push(
                    newDualScaleTrack(
                        info.tracks.length,
                        1,
                        titleSecondaryAxis,
                        curveSecondaryAxis.name,
                        curveSecondaryAxis.unit
                    )
                );

                info.primaries = new Float32Array(data.length); // 32 bits should be enough
                info.secondaries = new Float32Array(data.length);
                {
                    let count = 0;
                    for (const row of data) {
                        //if (row[iSecondaryAxis] !== null) // DEBUG: make TVD more non-linear
                        //    row[iSecondaryAxis] += 150 * Math.sin((row[iSecondaryAxis] - data[0][iSecondaryAxis])*0.01)

                        const secondary: number = row[iSecondaryAxis];
                        checkMinMaxValue(info.minmaxSecondaryAxis, secondary);

                        if (secondary !== null) {
                            const primary: number = row[iPrimaryAxis];
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
            } else {
                info.tracks.push(
                    newScaleTrack(
                        info.tracks.length,
                        titlePrimaryAxis,
                        curvePrimaryAxis.name,
                        curvePrimaryAxis.unit
                    )
                );
            }
        }
        let iPlot = 0;
        for (const templateTrack of templateTracks) {
            const plotDatas: [number, number][][] = [];
            const plots: PlotConfig[] = [];
            for (const templatePlot of templateTrack.plots) {
                const iCurve = indexOfElementByName(curves, templatePlot.name);
                if (iCurve < 0) continue;
                const curve = curves[iCurve];

                if (curve.dimensions !== 1) continue;
                if (curve.valueType === "string") continue; //??

                const options = fillPlotOptions(
                    templatePlot,
                    templateStyles,
                    iPlot
                );

                const plotData = preparePlotData(data, iCurve, iPrimaryAxis);
                checkMinMax(info.minmaxPrimaryAxis, plotData.minmaxPrimaryAxis);
                plotDatas.push(plotData.data);
                let plotOptions: ExtPlotOptions = {
                    scale: "linear",
                    domain: roundMinMax(plotData.minmax),
                    color: options.color,
                    // for 'area'!  fill: 'red',
                    fillOpacity: 0.3, // for 'area'!
                    dataAccessor: makeDataAccessor(plots.length),
                    legendInfo: () => ({
                        label: curve.name,
                        unit: curve.unit ? curve.unit : "",
                    }),
                }
                plots.push({
                    id: iCurve, // set some id
                    type: options.type,
                    options: plotOptions
                });

                iPlot++;
            }
            if (plots.length || templateTrack.required)
                info.tracks.push(
                    new GraphTrack(info.tracks.length, {
                        label: makeTrackHeader(welllog, templateTrack),
                        legendConfig: graphLegendConfig,
                        data: plotDatas,
                        plots: plots,
                    })
                );
        }
    }
    return info;
};
