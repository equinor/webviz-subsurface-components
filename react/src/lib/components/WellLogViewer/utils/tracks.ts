import {
    Track,
    ScaleTrack,
    DualScaleTrack,
    GraphTrack,
} from "@equinor/videx-wellog";

import { AreaPlotOptions } from "@equinor/videx-wellog/dist/plots/interfaces";

import { GraphTrackOptions } from "@equinor/videx-wellog/dist/tracks/graph/interfaces";

import WellLogView from "../components/WellLogView";

export interface ExtPlotOptions extends AreaPlotOptions {
    legendInfo: () => {
        label: string;
        unit: string;
    };
}

import { PlotConfig } from "@equinor/videx-wellog/dist/tracks/graph/interfaces";

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
    WellLogCurve,
    WellLogDataRow,
} from "../components/WellLogTypes";

import { checkMinMaxValue, checkMinMax, roundMinMax } from "./minmax";

function indexOfElementByName(array: Named[], name: string): number {
    if (name) {
        const nameUpper = name.toUpperCase();
        let i = 0;
        for (const element of array) {
            if (element.name.toUpperCase() == nameUpper) {
                return i;
            }
            i++;
        }
    }
    return -1;
}

function indexOfElementByNames(array: Named[], names: string[]): number {
    if (names) {
        /* should be already in upper case */
        let i = 0;
        for (const element of array) {
            if (names.indexOf(element.name.toUpperCase()) >= 0) return i;
            i++;
        }
    }
    return -1;
}

const __colors = [
    "red",
    "blue",
    "orange",
    "green",
    "red",
    "magenta",
    "gray",
    "brown",
];
let __iPlotColor = 0;
function generateColor(): string {
    return __colors[__iPlotColor++ % __colors.length];
}

/*
 * `LinePlot` - linear line graph
 * `LineStepPlot` - linear stepladder graph
 * `AreaPlot` - area graph
 * `DotPlot` - discrete points graph
 * `DifferentialPlot` - differential graph, for correlation of two data series.
 */
const defPlotType = "line";

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

function makeTrackHeader(
    welllog: WellLog,
    templateTrack: TemplateTrack
): string {
    if (templateTrack.title) return templateTrack.title;

    const templatePlots = templateTrack.plots;
    if (templatePlots && templatePlots[0]) {
        const curves = welllog[0].curves;
        // get the first curve name
        const templatePlot = templatePlots[0];
        const iCurve = indexOfElementByName(curves, templatePlot.name);
        if (iCurve < 0)
            // something went wrong
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

function getTemplatePlotProps(
    templatePlot: TemplatePlot,
    templateStyles: TemplateStyle[]
): TemplatePlotProps {
    const iStyle = templatePlot.style
        ? indexOfElementByName(templateStyles, templatePlot.style)
        : -1;
    const options =
        iStyle >= 0
            ? { ...templateStyles[iStyle], ...templatePlot }
            : { ...templatePlot };
    if (!isValidPlotType(options.type)) options.type = defPlotType;
    if (!options.color) options.color = generateColor();
    return options;
}

class __dataAccessor {
    iPlot: number;

    constructor(iPlot: number) {
        this.iPlot = iPlot;
    }

    dataAccessor(d: number[][]): number[] {
        return d[this.iPlot];
    }
}
function makeDataAccessor(iPlot: number) {
    const _dataAccessor = new __dataAccessor(iPlot);
    return _dataAccessor.dataAccessor.bind(_dataAccessor);
}

function getPlotOptions(
    curve: WellLogCurve,
    templateOptions: TemplatePlotProps,
    domain: [number, number],
    iPlot: number
): ExtPlotOptions {
    return {
        scale: "linear", // or "log"
        domain: domain,
        color: templateOptions.color,
        // for 'area'!  fill: 'red',
        // for 'area'! inverseColor: "red",
        fillOpacity: 0.3, // for 'area'!
        useMinAsBase: true, // for 'area'!
        dataAccessor: makeDataAccessor(iPlot),
        legendInfo: () => ({
            label: curve.name,
            unit: curve.unit ? curve.unit : "",
        }),
    };
}

function getPlotConfig(
    id: string | number,
    curve: WellLogCurve,
    templateOptions: TemplatePlotProps,
    domain: [number, number],
    iPlot: number
): PlotConfig {
    return {
        id: id,
        type: templateOptions.type,
        options: getPlotOptions(curve, templateOptions, domain, iPlot),
    };
}

export function addTrackPlot(
    wellLogView: WellLogView,
    track: GraphTrack,
    name: string,
    type: string
): void {
    const axes = wellLogView.getAxesInfo();
    const plotFactory = (track.options as GraphTrackOptions).plotFactory;
    if (plotFactory) {
        const welllog = wellLogView.props.welllog;
        if (welllog && welllog[0]) {
            const data = welllog[0].data;
            const curves = welllog[0].curves;

            const iPrimaryAxis = indexOfElementByNames(
                curves,
                axes.mnemos[axes.primaryAxis]
            );

            const iCurve = indexOfElementByName(curves, name);

            const plotData = preparePlotData(data, iCurve, iPrimaryAxis);
            const curve = curves[iCurve];

            const templatePlot: TemplatePlot = {
                name: name,
                style: "",
                color: "",
                type: type,
            };
            const plotDatas = track.options.data;
            const plots = (track as GraphTrack).plots;

            const templateOptions = getTemplatePlotProps(
                templatePlot,
                /*templateStyles*/ []
            );
            const p = getPlotConfig(
                iCurve,
                curve,
                templateOptions,
                roundMinMax(plotData.minmax),
                plotDatas.length
            );

            //checkMinMax(info.minmaxPrimaryAxis, plotData.minmaxPrimaryAxis);
            plotDatas.push(plotData.data);

            // GraphTrack
            const createPlot = plotFactory[p.type];
            if (!createPlot)
                throw Error(
                    `No factory function for creating '${p.type}'-plot!`
                );
            const plot = createPlot(p, (track as GraphTrack).trackScale);
            if (plot) {
                //if (Array.isArray(plots))
                plots.push(plot);

                (track as GraphTrack).prepareData(); //

                if (wellLogView.logController) {
                    wellLogView.logController.updateTracks();
                }
                //(track as GraphTrack).plot();
            }
        }
    }
}

export function removeTrackPlot(
    wellLogView: WellLogView,
    track: GraphTrack,
    name: string
): void {
    {
        const welllog = wellLogView.props.welllog;
        if (welllog && welllog[0]) {
            const curves = welllog[0].curves;
            const iCurve = indexOfElementByName(curves, name);

            //let plotDatas = track.options.data
            const plots = (track as GraphTrack).plots;

            let index = 0;
            for (const plot of plots) {
                if ((plot.id as number) === iCurve) {
                    //plotDatas.splice(index, 1)
                    plots.splice(index, 1);
                    break;
                }
                index++;
            }

            (track as GraphTrack).prepareData(); //

            if (wellLogView.logController) {
                wellLogView.logController.updateTracks();
            }
            //(track as GraphTrack).plot();
        }
    }
}

function newDualScaleTrack(
    mode: number,
    title: string,
    abbr: string,
    units: string
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

function newScaleTrack(title: string, abbr: string, units: string): ScaleTrack {
    return new ScaleTrack(undefined as unknown as number, {
        maxWidth: 50,
        width: 2,
        label: title,
        abbr: abbr ? abbr : title,
        units: units ? units : "",
        legendConfig: scaleLegendConfig,
    });
}

export function newGraphTrack(
    title: string,
    data: [number, number][][],
    plots: PlotConfig[]
): GraphTrack {
    return new GraphTrack(undefined as unknown as number, {
        label: title,
        legendConfig: graphLegendConfig,
        data: data,
        plots: plots,
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

export function createTracks(
    welllog: WellLog,
    axes: AxesInfo,
    templateTracks: TemplateTrack[], // Part of JSON
    templateStyles: TemplateStyle[] // Part of JSON
): TracksInfo {
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
                        //info.tracks.length,
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
                        //info.tracks.length,
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
                        //info.tracks.length,
                        titlePrimaryAxis,
                        curvePrimaryAxis.name,
                        curvePrimaryAxis.unit
                    )
                );
            }
        }

        for (const templateTrack of templateTracks) {
            const plotDatas: [number, number][][] = [];
            const plots: PlotConfig[] = [];
            for (const templatePlot of templateTrack.plots) {
                const iCurve = indexOfElementByName(curves, templatePlot.name);
                if (iCurve < 0) continue;
                const curve = curves[iCurve];

                if (curve.dimensions !== 1) continue;
                if (curve.valueType === "string") continue; //??

                const plotData = preparePlotData(data, iCurve, iPrimaryAxis);
                checkMinMax(info.minmaxPrimaryAxis, plotData.minmaxPrimaryAxis);

                const templateOptions = getTemplatePlotProps(
                    templatePlot,
                    templateStyles
                );
                const p = getPlotConfig(
                    iCurve,
                    curve,
                    templateOptions,
                    roundMinMax(plotData.minmax),
                    plotDatas.length
                );

                plotDatas.push(plotData.data);
                plots.push(p);
            }
            if (plots.length || templateTrack.required) {
                info.tracks.push(
                    newGraphTrack(
                        makeTrackHeader(welllog, templateTrack),
                        plotDatas,
                        plots
                    )
                );
            }
        }
    }
    return info;
}
