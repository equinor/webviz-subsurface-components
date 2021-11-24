import {
    Track,
    ScaleTrack,
    DualScaleTrack,
    GraphTrack,
} from "@equinor/videx-wellog";

import { LegendInfo } from "@equinor/videx-wellog/dist/plots/legend/interfaces";

import { GradientFillPlotOptions } from "./gradientfill-plot";
export interface ExtPlotOptions
    extends GradientFillPlotOptions /*|DifferentialPlotOptions|AreaPlotOptions*/ {
    legendInfo: () => LegendInfo;
}

import WellLogView from "../components/WellLogView";

import { PlotConfig } from "@equinor/videx-wellog/dist/tracks/graph/interfaces";
import { PlotFactory } from "@equinor/videx-wellog/dist/tracks/graph/interfaces";

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

import {
    checkMinMaxValue,
    checkMinMax,
    roundMinMax,
    roundLogMinMax,
} from "./minmax";

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
        /* names should be already in upper case */
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

import {
    Plot,
    LinePlot,
    AreaPlot,
    DotPlot,
    DifferentialPlot,
    LineStepPlot,
} from "@equinor/videx-wellog";
import GradientFillPlot from "../utils/gradientfill-plot";
export function getPlotType(plot: Plot): string {
    if (plot instanceof GradientFillPlot) return "gradientfill";
    if (plot instanceof LinePlot) return "line";
    if (plot instanceof AreaPlot) return "area";
    if (plot instanceof DotPlot) return "dot";
    if (plot instanceof DifferentialPlot) return "differential";
    if (plot instanceof LineStepPlot) return "linestep";
    if (plot instanceof LineStepPlot) return "linestep";
    return "";
}

function isValidPlotType(plotType: string) {
    return (
        [
            "line",
            "linestep",
            "dot",
            "area",
            "differential",
            "gradientfill",
        ].indexOf(plotType) >= 0
    );
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
    if (!options.type) options.type = defPlotType;
    if (!isValidPlotType(options.type)) {
        console.log(
            "unknown plot type '" +
                options.type +
                "': use default type '" +
                defPlotType +
                "'"
        );
        options.type = defPlotType;
    }
    if (!options.color) options.color = generateColor();

    if (options.type === "area") {
        if (!options.fill) {
            //options.fill = generateColor();
            options.fillOpacity = 0.0;
        }
    } else if (options.type === "gradientfill") {
        if (!options.colorTable) {
            //options.fill = generateColor();
            options.fillOpacity = 0.0;
        }
    } else if (options.type === "differential") {
        // "differential" plot
        if (!options.fill) options.fill = generateColor();
        if (!options.color2) options.color2 = generateColor();
        if (!options.fill2) options.fill2 = generateColor();
    }
    return options;
}

class __dataAccessor {
    iData: number;

    constructor(iData: number) {
        this.iData = iData;
    }

    dataAccessor(d: number[][]): number[] {
        return d[this.iData];
    }
}
function makeDataAccessor(iData: number) {
    const _dataAccessor = new __dataAccessor(iData);
    return _dataAccessor.dataAccessor.bind(_dataAccessor);
}

class __dataAccessor2 {
    iData: number;
    iData2: number;

    constructor(iData: number, iData2: number) {
        this.iData = iData;
        this.iData2 = iData2;
    }

    dataAccessor(d: number[][]): [number[], number[]] {
        return [d[this.iData], d[this.iData2]];
    }
}
function makeDataAccessor2(iData: number, iData2: number) {
    const _dataAccessor = new __dataAccessor2(iData, iData2);
    return _dataAccessor.dataAccessor.bind(_dataAccessor);
}

import { ColorTable } from "../components/ColorTableTypes";

const defColorTable: ColorTable = {
    name: "not found",
    discrete: false,
    colors: [
        [0.0, 1.0, 0.0, 0.0],
        [0.5, 0.5, 0.0, 0.0],
        [1.0, 1.0, 0.0, 0.0],
    ],
};

function getColorTable(
    id: string | undefined,
    colorTables: ColorTable[]
): ColorTable | undefined {
    if (id && typeof id !== "string") {
        console.log("colorTable id='" + id + "' is not string");
        return defColorTable;
    }
    if (id && colorTables) {
        for (let i = 0; i < colorTables.length; i++) {
            if (colorTables[i].name == id) return colorTables[i];
        }
        console.log(
            "colorTable id='" + id + "' is not found in getColorTable()"
        );
        return defColorTable;
    }
    if (id && !colorTables)
        console.log("colorTables is not given in getColorTable()");
    return undefined; //defColorTable;
}

function getPlotOptions(
    templatePlotProps: TemplatePlotProps,
    colorTables: ColorTable[], //"gradientfill" plot
    domain: [number, number],
    curve: WellLogCurve,
    iPlot: number,
    curve2: WellLogCurve | undefined, //"differential" plot
    iPlot2: number //"differential" plot
): ExtPlotOptions {
    const options = {
        dataAccessor: curve2
            ? makeDataAccessor2(iPlot, iPlot2)
            : makeDataAccessor(iPlot),

        scale: templatePlotProps.scale || "linear", //"linear" or "log"
        domain: domain,

        color: templatePlotProps.color,
        inverseColor: templatePlotProps.inverseColor,

        fill: templatePlotProps.fill, // for 'area'!
        fillOpacity: templatePlotProps.fillOpacity
            ? templatePlotProps.fillOpacity
            : 0.25, // for 'area' and 'gradientfill'!
        useMinAsBase: true, // for 'area' and 'gradientfill'!

        //GradientFillPlotOptions
        colorTable: getColorTable(templatePlotProps.colorTable, colorTables),
        inverseColorTable: getColorTable(
            templatePlotProps.inverseColorTable,
            colorTables
        ),

        // DifferentialPlotOptions
        serie1: {
            scale: templatePlotProps.scale || "linear", //"linear" or "log"
            domain: domain,
            color: templatePlotProps.color,
            fill: templatePlotProps.fill,
        },
        serie2: {
            // ? =scale2, =domain2 ?
            scale: templatePlotProps.scale || "linear",
            domain: domain,
            color: templatePlotProps.color2,
            fill: templatePlotProps.fill2,
        },

        legendInfo: () => ({
            label: curve.name,
            unit: curve.unit ? curve.unit : "",

            // DifferentialPlotLegendInfo,
            serie1: {
                show: true,
                label: curve.name,
                unit: curve.unit ? curve.unit : "",
            },
            serie2: {
                show: true,
                label: curve2 ? curve2.name : "",
                unit: curve2 && curve2.unit ? curve2.unit : "",
            },
        }),
    };
    return options;
}

function getPlotConfig(
    id: string | number,
    templatePlotProps: TemplatePlotProps,
    colorTables: ColorTable[],
    domain: [number, number],
    curve: WellLogCurve,
    iPlot: number,
    curve2: WellLogCurve | undefined,
    iPlot2: number
): PlotConfig {
    return {
        id: id,
        type: templatePlotProps.type,
        options: getPlotOptions(
            templatePlotProps,
            colorTables,
            domain,
            curve,
            iPlot,
            curve2,
            iPlot2
        ),
    };
}

export function addGraphTrackPlot(
    wellLogView: WellLogView,
    track: GraphTrack,
    templatePlot: TemplatePlot
): [number, number] {
    const minmaxPrimaryAxis: [number, number] = [
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
    ];

    const axes = wellLogView.getAxesInfo();
    const plotFactory = track.options.plotFactory;
    if (plotFactory) {
        const welllog = wellLogView.props.welllog;
        if (welllog && welllog[0]) {
            const data = welllog[0].data;
            const curves = welllog[0].curves;

            const iPrimaryAxis = indexOfElementByNames(
                curves,
                axes.mnemos[axes.primaryAxis]
            );

            const iCurve = indexOfElementByName(curves, templatePlot.name);
            if (iCurve < 0) console.log("iCurve < 0");
            const curve = curves[iCurve];

            if (curve.dimensions !== 1) console.log("curve.dimensions !== 1");
            if (curve.valueType === "string")
                console.log('curve.valueType === "string"');

            const plotData = preparePlotData(data, iCurve, iPrimaryAxis);
            checkMinMax(minmaxPrimaryAxis, plotData.minmaxPrimaryAxis);
            const minmax: [number, number] = [
                plotData.minmax[0],
                plotData.minmax[1],
            ];

            const plotDatas = track.options.data;
            const plots = track.plots;

            const colorTables = wellLogView.props.colorTables;

            let iCurve2 = -1;
            let curve2: WellLogCurve | undefined = undefined;
            let plotData2: PlotData | undefined = undefined;
            if (templatePlot.type === "differential") {
                iCurve2 = templatePlot.name2
                    ? indexOfElementByName(curves, templatePlot.name2)
                    : -1;
                curve2 = iCurve2 >= 0 ? curves[iCurve2] : undefined;
                plotData2 = preparePlotData(data, iCurve2, iPrimaryAxis);
                checkMinMax(minmaxPrimaryAxis, plotData2.minmaxPrimaryAxis);
                checkMinMax(minmax, plotData2.minmax);
            }

            // Make full props
            const templatePlotProps = getTemplatePlotProps(
                templatePlot,
                /*templateStyles*/ []
            );
            const p = getPlotConfig(
                iCurve,
                templatePlotProps,
                colorTables,
                (templatePlotProps.scale === "log"
                    ? roundLogMinMax
                    : roundMinMax)(minmax),
                curve,
                plotDatas.length,
                curve2,
                plotDatas.length + 1
            );

            plotDatas.push(plotData.data);
            if (plotData2) {
                plotDatas.push(plotData2.data);
            }

            // GraphTrack
            const createPlot = plotFactory[p.type];
            if (!createPlot)
                throw Error(
                    `No factory function for creating '${p.type}'-plot!`
                );
            const plot = createPlot(p, track.trackScale);
            if (plot) {
                plots.push(plot);

                track.prepareData();
            }
        }
    }
    return minmaxPrimaryAxis;
}

export function editGraphTrackPlot(
    wellLogView: WellLogView,
    track: GraphTrack,
    plot: Plot,
    templatePlot: TemplatePlot
): [number, number] {
    const minmaxPrimaryAxis: [number, number] = [
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
    ];

    const axes = wellLogView.getAxesInfo();
    const plotFactory = track.options.plotFactory;
    if (plotFactory) {
        const welllog = wellLogView.props.welllog;
        if (welllog && welllog[0]) {
            const data = welllog[0].data;
            const curves = welllog[0].curves;

            const iPrimaryAxis = indexOfElementByNames(
                curves,
                axes.mnemos[axes.primaryAxis]
            );

            const iCurve = indexOfElementByName(curves, templatePlot.name);
            if (iCurve < 0) console.log("iCurve < 0");
            const curve = curves[iCurve];

            if (curve.dimensions !== 1) console.log("curve.dimensions !== 1");
            if (curve.valueType === "string")
                console.log('curve.valueType === "string"');

            const plotData = preparePlotData(data, iCurve, iPrimaryAxis);
            checkMinMax(minmaxPrimaryAxis, plotData.minmaxPrimaryAxis);
            const minmax: [number, number] = [
                plotData.minmax[0],
                plotData.minmax[1],
            ];

            const plotDatas = track.options.data;
            const plots = track.plots;

            const colorTables = wellLogView.props.colorTables;

            let iCurve2 = -1;
            let curve2: WellLogCurve | undefined = undefined;
            let plotData2: PlotData | undefined = undefined;
            if (templatePlot.type === "differential") {
                iCurve2 = templatePlot.name2
                    ? indexOfElementByName(curves, templatePlot.name2)
                    : -1;
                curve2 = iCurve2 >= 0 ? curves[iCurve2] : undefined;
                plotData2 = preparePlotData(data, iCurve2, iPrimaryAxis);
                checkMinMax(minmaxPrimaryAxis, plotData2.minmaxPrimaryAxis);
                checkMinMax(minmax, plotData2.minmax);
            }

            //console.log(typeof plot.data);

            // Make full props
            const templatePlotProps = getTemplatePlotProps(
                templatePlot,
                /*templateStyles*/ []
            );
            const p = getPlotConfig(
                iCurve,
                templatePlotProps,
                colorTables,
                (templatePlotProps.scale === "log"
                    ? roundLogMinMax
                    : roundMinMax)(minmax),
                curve,
                plotDatas.length,
                curve2,
                plotDatas.length + 1
            );

            plotDatas.push(plotData.data);
            if (plotData2) {
                plotDatas.push(plotData2.data);
            }

            // GraphTrack
            const createPlot = plotFactory[p.type];
            if (!createPlot)
                throw Error(
                    `No factory function for creating '${p.type}'-plot!`
                );
            const plotNew = createPlot(p, track.trackScale);
            if (plotNew) {
                let bFound = false;
                for (const i in plots) {
                    if (plot === plots[i]) {
                        bFound = true;
                        plots[i] = plotNew; // replace
                        break;
                    }
                }

                if (!bFound) {
                    console.log("Error!", "Edited plot not found!");
                    plots.push(plot);
                }

                track.prepareData();
            }
        }
    }
    return minmaxPrimaryAxis;
}

export function _removeGraphTrackPlot(track: GraphTrack, _plot: Plot): number {
    const plots = track.plots;

    let index = 0;
    for (const plot of plots) {
        if (plot === _plot) {
            plots.splice(index, 1);
            break;
        }
        index++;
    }
    return index;
}

export function removeGraphTrackPlot(
    _wellLogView: WellLogView,
    track: GraphTrack,
    _plot: Plot
): void {
    const plots = track.plots;

    let index = 0;
    for (const plot of plots) {
        if (plot === _plot) {
            plots.splice(index, 1);
            break;
        }
        index++;
    }

    track.prepareData();
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

import { createPlotType } from "@equinor/videx-wellog";
import { defaultPlotFactory } from "@equinor/videx-wellog";

const plotFactory: PlotFactory = {
    ...defaultPlotFactory,
    gradientfill: createPlotType(GradientFillPlot),
};

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
        plotFactory: plotFactory,
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
    templateStyles: TemplateStyle[], // Part of JSON
    colorTables: ColorTable[] // JSON
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
                if (curve.valueType === "string") continue;

                const plotData = preparePlotData(data, iCurve, iPrimaryAxis);
                checkMinMax(info.minmaxPrimaryAxis, plotData.minmaxPrimaryAxis);
                const minmax: [number, number] = [
                    plotData.minmax[0],
                    plotData.minmax[1],
                ];

                let iCurve2 = -1;
                let curve2: WellLogCurve | undefined = undefined;
                let plotData2: PlotData | undefined = undefined;
                if (templatePlot.type === "differential") {
                    iCurve2 = templatePlot.name2
                        ? indexOfElementByName(curves, templatePlot.name2)
                        : -1;
                    curve2 = iCurve2 >= 0 ? curves[iCurve2] : undefined;
                    plotData2 = preparePlotData(data, iCurve2, iPrimaryAxis);
                    checkMinMax(
                        info.minmaxPrimaryAxis,
                        plotData2.minmaxPrimaryAxis
                    );
                    checkMinMax(minmax, plotData2.minmax);
                }

                // make full props
                const templatePlotProps = getTemplatePlotProps(
                    templatePlot,
                    templateStyles
                );
                const p = getPlotConfig(
                    iCurve,
                    templatePlotProps,
                    colorTables,
                    (templatePlotProps.scale === "log"
                        ? roundLogMinMax
                        : roundMinMax)(minmax),
                    curve,
                    plotDatas.length,
                    curve2,
                    plotDatas.length + 1
                );

                plotDatas.push(plotData.data);
                if (plotData2) {
                    plotDatas.push(plotData2.data);
                }

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
