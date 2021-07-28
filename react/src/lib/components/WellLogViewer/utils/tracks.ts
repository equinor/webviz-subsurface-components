import {
    Track,
    ScaleTrack,
    DualScaleTrack,
    GraphTrack,
} from "@equinor/videx-wellog";
import { graphLegendConfig, scaleLegendConfig } from "@equinor/videx-wellog";

import { checkMinMaxValue, checkMinMax, roundMinMax } from "./minmax";

function indexOfElementByName(array: { name: string }[], name: string): number {
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

function indexOfElementByNames(
    array: { name: string }[],
    names: string[]
): number {
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

function preparePlotData(data, iCurve, iPrimaryAxis): PlotData {
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

function shortDescription(description) {
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

function makeTrackHeader(templateTrack) {
    if (templateTrack.title) return templateTrack.title;

    const plots = templateTrack.plots;
    if (plots && plots[0]) {
        // get the first curve name
        const curve = plots[0];
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

export type WellLog = Record<string, any>[]; // JSON object from a file

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

function isValidPlotType(plotType) {
    return ["line", "linestep", "dot", "area"].indexOf(plotType) >= 0;
}

function fillPlotOptions(templatePlot, styles, iPlot: number) {
    const iStyle = indexOfElementByName(styles, templatePlot.style);
    const options =
        iStyle >= 0
            ? { ...templatePlot, ...styles[iStyle] }
            : { ...templatePlot };
    if (!isValidPlotType(options.type))
        options.type = plotTypes[iPlot % plotTypes.length];
    if (!options.color) options.color = colors[iPlot % colors.length];
    return options;
}

function _dataAccessor(d: number[][]): number[] {
    const iPlot = this as number;
    return d[iPlot];
}

function newDualScaleTrack(
    id: number,
    mode: number,
    title: string,
    abbr: string,
    units: string
) {
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

function newScaleTrack(id: number, title: string, abbr: string, units: string) {
    return new ScaleTrack(id, {
        maxWidth: 50,
        width: 2,
        label: title,
        abbr: abbr ? abbr : title,
        units: units ? units : "",
        legendConfig: scaleLegendConfig,
    });
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
    tracks: Record<string, any>[], // Part of JSON
    styles: Record<string, any>[] // Part of JSON
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
        for (const templateTrack of tracks) {
            const plotDatas: any[][] = [];
            const plots: any[] = [];
            for (const templatePlot of templateTrack.plots) {
                const iCurve = indexOfElementByName(curves, templatePlot.name);
                if (iCurve < 0) continue;
                const curve = curves[iCurve];

                if (curve.dimensions !== 1) continue;
                if (curve.valueType === "string") continue; //??

                const options = fillPlotOptions(templatePlot, styles, iPlot);

                const plot = preparePlotData(data, iCurve, iPrimaryAxis);
                checkMinMax(info.minmaxPrimaryAxis, plot.minmaxPrimaryAxis);
                plotDatas.push(plot.data);
                plots.push({
                    id: iCurve, // set some id
                    type: options.type,
                    options: {
                        scale: "linear",
                        domain: roundMinMax(plot.minmax),
                        color: options.color,
                        // for 'area'!  fill: 'red',
                        fillOpacity: 0.3, // for 'area'!
                        dataAccessor: _dataAccessor.bind(plots.length),
                        legendInfo: () => ({
                            label: curve.name,
                            unit: curve.unit ? curve.unit : "",
                        }),
                    },
                });
                iPlot++;
            }
            if (plots.length || templateTrack.required)
                info.tracks.push(
                    new GraphTrack(info.tracks.length, {
                        label: makeTrackHeader(templateTrack),
                        legendConfig: graphLegendConfig,
                        data: plotDatas,
                        plots: plots,
                    })
                );
        }
    }
    return info;
};
