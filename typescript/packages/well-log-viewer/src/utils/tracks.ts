import type { Track } from "@equinor/videx-wellog";
import {
    ScaleTrack,
    DualScaleTrack,
    GraphTrack,
    StackedTrack,
} from "@equinor/videx-wellog";

import type { TrackOptions } from "@equinor/videx-wellog/dist/tracks/interfaces";
import type { GraphTrackOptions } from "@equinor/videx-wellog/dist/tracks/graph/interfaces";
import type { StackedTrackOptions } from "@equinor/videx-wellog/dist/tracks/stack/interfaces";
import type { AreaData } from "@equinor/videx-wellog/dist/tracks/stack/interfaces";

import type { LegendInfo } from "@equinor/videx-wellog/dist/plots/legend/interfaces";

import type { DifferentialPlotOptions } from "@equinor/videx-wellog/dist/plots/interfaces";
import type { GradientFillPlotOptions } from "./gradientfill-plot";
export interface ExtPlotOptions
    extends GradientFillPlotOptions /*|DifferentialPlotOptions|AreaPlotOptions*/ {
    legendInfo: () => LegendInfo;
}

import type WellLogView from "../components/WellLogView";

import type { PlotConfig } from "@equinor/videx-wellog/dist/tracks/graph/interfaces";
import type { PlotFactory } from "@equinor/videx-wellog/dist/tracks/graph/interfaces";
import { graphLegendConfig } from "@equinor/videx-wellog";
import { stackLegendConfig } from "./stack/stack-legend";
import { scaleLegendConfig } from "./stack/scale-legend"; // This is fixed implementation of scaleLegendConfig from "@equinor/videx-wellog";
import { getInterpolatedColor } from "./color-table";

// missed! import { createScale } from "@equinor/videx-wellog/dist/tracks/graph/interfaces";
import { createScale } from "./graph/factory";

import type {
    TemplatePlotTypes,
    TemplatePlotProps,
    TemplateTrack,
    TemplatePlot,
    TemplateStyle,
} from "../components/WellLogTemplateTypes";
import type {
    WellLogCollection,
    WellLogSet,
    WellLogCurve,
    WellLogDataRow,
    WellLogMetadataDiscreteObjects,
} from "../components/WellLogTypes";

import {
    checkMinMaxValue,
    checkMinMax,
    roundMinMax,
    roundLogMinMax,
} from "./minmax";

import { updateLegendRows } from "./log-viewer";

import { deepCopy } from "./deepcopy";

import { createPlotType } from "@equinor/videx-wellog";
import { defaultPlotFactory } from "@equinor/videx-wellog";
import type { AxisIndices } from "./well-log";
import {
    getAxisIndices,
    getDiscreteMetaDataByName,
    getAllWellLogCurves,
    findSetAndCurveIndex,
} from "./well-log";

export function indexOfElementByName(array: Named[], name: string): number {
    if (array && name) {
        const nameUpper = name.toUpperCase();
        let i = 0;
        for (const element of array) {
            if (element.name && element.name.toUpperCase() == nameUpper) {
                return i;
            }
            i++;
        }
    }
    return -1;
}

function indexOfElementByNames(array: Named[], names: string[]): number {
    if (array && names) {
        /* names should be already in upper case */
        let i = 0;
        for (const element of array) {
            if (element.name && names.indexOf(element.name.toUpperCase()) >= 0)
                return i;
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
    data: [number | null, number | string | null][];

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
        let value = row[iCurve];
        if (typeof value == "number") checkMinMaxValue(plot.minmax, value);
        const primary: number =
            iPrimaryAxis >= 0 ? (row[iPrimaryAxis] as number) : i++;
        if (primary == null)
            // videx library do not like such data
            value = null; // force a gap in the graph
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
    curves: WellLogCurve[],
    templateTrack: TemplateTrack
): string {
    if (templateTrack.title) return templateTrack.title;

    const templatePlots = templateTrack.plots;
    if (templatePlots && templatePlots[0]) {
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
    welllog: WellLogCollection,
    axisMnemos: Record<string, string[]>
): string[] {
    const result: string[] = [];
    const curves = getAllWellLogCurves(welllog);

    for (const key in axisMnemos) {
        const i = indexOfElementByNames(curves, axisMnemos[key]);
        if (i >= 0) result.push(key);
    }

    return result;
}

import type { Plot } from "@equinor/videx-wellog";
import {
    LinePlot,
    AreaPlot,
    DotPlot,
    DifferentialPlot,
    LineStepPlot,
} from "@equinor/videx-wellog";
import GradientFillPlot from "../utils/gradientfill-plot";
export function getPlotType(plot: Plot): TemplatePlotTypes {
    if (plot instanceof GradientFillPlot) return "gradientfill";
    if (plot instanceof LinePlot) return "line";
    if (plot instanceof AreaPlot) return "area";
    if (plot instanceof DotPlot) return "dot";
    if (plot instanceof DifferentialPlot) return "differential";
    if (plot instanceof LineStepPlot) return "linestep";
    return "";
}

function isValidPlotType(plotType: string): boolean {
    return (
        [
            "line",
            "linestep",
            "dot",
            "area",
            "differential",
            "gradientfill",

            "stacked",
        ].indexOf(plotType) >= 0
    );
}

function getTemplatePlotProps(
    templatePlot: TemplatePlot,
    templateStyles?: TemplateStyle[]
): TemplatePlotProps {
    const iStyle =
        templatePlot.style && templateStyles
            ? indexOfElementByName(templateStyles, templatePlot.style)
            : -1;
    const options =
        iStyle >= 0 && templateStyles
            ? { ...templateStyles[iStyle], ...templatePlot }
            : { ...templatePlot };
    if (!options.type) options.type = defPlotType;
    if (!isValidPlotType(options.type)) {
        console.error(
            "unknown plot type '" +
                options.type +
                "': use default type '" +
                defPlotType +
                "'"
        );
        options.type = defPlotType;
    }
    if (options.type !== "stacked") {
        if (!options.color) options.color = generateColor();
    }

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

import type { ColorTable } from "../components/ColorTableTypes";

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
    id: string | ((v: number) => [number, number, number]) | undefined,
    colorTables?: ColorTable[]
): ColorTable | ((v: number) => [number, number, number]) | undefined {
    if (id && typeof id === "function") {
        return id;
    }
    if (id && typeof id !== "string") {
        console.log("colorTable id='" + id + "' is not string");
        return defColorTable;
    }
    if (id && colorTables) {
        const colorTable = colorTables.find((value) => value.name === id);
        if (colorTable) return colorTable;
        console.error(
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
    trackScale: string | undefined, // track scale
    minmax: [number, number],
    curve: WellLogCurve,
    iPlot: number,
    curve2: WellLogCurve | undefined, //"differential" plot
    iPlot2: number, //"differential" plot
    colorTables?: ColorTable[] //"gradientfill" plot
): ExtPlotOptions {
    const scale = templatePlotProps.scale || trackScale || "linear"; //"linear" or "log"
    const domain = (
        scale === "log" ||
            (templatePlotProps.type === "gradientfill" &&
                templatePlotProps.colorScale === "log")
            ? roundLogMinMax
            : roundMinMax
    )(minmax);

    const options: ExtPlotOptions = {
        dataAccessor: curve2
            ? makeDataAccessor2(iPlot, iPlot2)
            : makeDataAccessor(iPlot),

        scale: scale,
        domain: templatePlotProps.domain || domain,

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
        colorScale: templatePlotProps.colorScale,
        inverseColorScale: templatePlotProps.inverseColorScale,

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

    (options as DifferentialPlotOptions).serie1 = {
        scale: scale, //"linear" or "log"
        domain: domain,
        color: templatePlotProps.color,
        fill: templatePlotProps.fill,
    };
    (options as DifferentialPlotOptions).serie2 = {
        // ? =scale2, =domain2 ?
        scale: scale,
        domain: domain,
        color: templatePlotProps.color2,
        fill: templatePlotProps.fill2,
    };

    return options;
}

function getPlotConfig(
    id: string | number,
    templatePlotProps: TemplatePlotProps,
    trackScale: string | undefined, // track scale
    minmax: [number, number],
    curve: WellLogCurve,
    iPlot: number,
    curve2: WellLogCurve | undefined,
    iPlot2: number,
    colorTables?: ColorTable[]
): PlotConfig {
    return {
        id: id,
        type: templatePlotProps.type,
        options: getPlotOptions(
            templatePlotProps,
            trackScale,
            minmax,
            curve,
            iPlot,
            curve2,
            iPlot2,
            colorTables
        ),
    };
}

import type { Domain } from "@equinor/videx-wellog/dist/common/interfaces";
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
        console.log("Empty track.options.domain!");
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
    const welllog = wellLogView.welllogCollection;
    const colorTables = wellLogView.props.colorTables;
    const plotDatas = track.options.data;
    const plots = track.plots;

    if (plotFactory && welllog.length) {
        const plotSetup = setupPlot(welllog, templatePlot.name, axes);

        if (!plotSetup) return minmaxPrimaryAxis;

        const { plotData, curve, iCurve, minmax, iSet } = plotSetup;
        const plotSetup2 = maybeSetupPlot2(welllog, templatePlot, axes);

        checkSetupMinMax(plotSetup, plotSetup2, minmaxPrimaryAxis);

        // Make full props
        const templatePlotProps = getTemplatePlotProps(
            templatePlot,
            /*templateStyles*/ []
        );
        const p = getPlotConfig(
            `${iSet}-${iCurve}`,
            templatePlotProps,
            templateTrack.scale,
            minmax,
            curve,
            plotDatas.length,
            plotSetup2?.curve,
            plotDatas.length + 1,
            colorTables
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
            templateTrack.plots.push(templatePlot);
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
    const welllog = wellLogView.welllogCollection;
    const plotDatas = track.options.data;
    const plots = track.plots;

    if (plotFactory && welllog.length) {
        const plotSetup = setupPlot(welllog, templatePlot.name, axes);

        if (!plotSetup) return minmaxPrimaryAxis;

        const { plotData, curve, iCurve, iSet, minmax } = plotSetup;
        const plotSetup2 = maybeSetupPlot2(welllog, templatePlot, axes);

        checkSetupMinMax(plotSetup, plotSetup2, minmaxPrimaryAxis);

        const colorTables = wellLogView.props.colorTables;

        // Make full props
        const templatePlotProps = getTemplatePlotProps(
            templatePlot,
            /*templateStyles*/ []
        );
        const p = getPlotConfig(
            `${iSet}-${iCurve}`,
            templatePlotProps,
            templateTrack.scale,
            minmax,
            curve,
            plotDatas.length,
            plotSetup2?.curve,
            plotDatas.length + 1,
            colorTables
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
                templateTrack.plots[iPlot] = templatePlot;
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

//////////////////
interface DiscreteMeta {
    iCode: number;
    iColor: number;
    objects: WellLogMetadataDiscreteObjects;
}

let iStringToNum = 0;
const mapStringToNum = new Map();

export function getDiscreteColorAndName(
    value: number | string | null,
    colorTable: ColorTable | undefined,
    meta?: DiscreteMeta | null
): { color: number[]; name: string } {
    let color: number[];
    let name: string;
    if (value == null) value = Number.NaN;
    if (meta) {
        // use discrete metadata from WellLog JSON file
        const { objects, iColor, iCode } = meta;
        let object: [] | undefined = undefined;
        if (typeof value == "string") {
            // value is key
            name = value;
            object = objects[value];
        } else {
            // usual discrete log
            name = value.toString();
            for (const t in objects) {
                const obj = objects[t];
                if (value === obj[iCode]) {
                    // value is code
                    name = t;
                    object = obj;
                    break;
                }
            }
        }
        /*if(object)*/ {
            if (colorTable) {
                // get color from the table
                color = getInterpolatedColor(
                    colorTable,
                    !object
                        ? Number.NaN
                        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          parseFloat((object[iCode] as any).toString()) // parseInt for discrete log
                );
            } else {
                // get color from the meta (obsolete?)
                color = object ? object[iColor] : [255, 25, 25];
            }
        }
    } else {
        name = value.toString();
        if (colorTable) {
            // get color from the table
            if (typeof value == "string") {
                let v: number;
                if (mapStringToNum.has(value)) {
                    v = mapStringToNum.get(value);
                } else {
                    mapStringToNum.set(value, iStringToNum);
                    v = iStringToNum;
                    iStringToNum++;
                }
                color = getInterpolatedColor(colorTable, v);
            } else {
                color = getInterpolatedColor(
                    colorTable,
                    parseInt(value.toString())
                );
            }
        } else {
            // get default color
            color = [224, 224, 224];
        }
    }
    return { color, name };
}

function createAreaData(
    from: number,
    to: number,
    value: number | string,
    colorTable: ColorTable | undefined,
    meta?: DiscreteMeta | null
): AreaData | null {
    const { color, name } = getDiscreteColorAndName(value, colorTable, meta);
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

async function createStackData(
    data: [number | null, number | string | null][],
    colorTable: ColorTable | undefined,
    meta: DiscreteMeta | undefined | null
) {
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
            area = createAreaData(boundary, p[0], value, colorTable, meta);
        }
        prev = p;
    }
    if (area)
        // store the area
        arr.push(area);
    return arr;
}

function newStackedTrack(options: StackedTrackOptions): StackedTrack {
    return new StackedTrack(undefined as unknown as number, options);
}

export function getDiscreteMeta(
    welllogSet: WellLogSet,
    name: string
): DiscreteMeta | null {
    const metadataTable = getDiscreteMetaDataByName(welllogSet, name);

    if (metadataTable) {
        // there is a metadata for given log name
        const attributes = metadataTable.attributes; // ["color", "code"]
        if (attributes) {
            const iCode = attributes.indexOf("code");
            const iColor = attributes.indexOf("color");
            if (iColor >= 0 && iCode >= 0)
                // all values are OK
                return {
                    iCode: iCode,
                    iColor: iColor,
                    objects: metadataTable.objects, // [attr1,attr2]                ,
                };
        }
    }

    return null; // something went wrong
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
    __template: TemplateTrack;
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

export interface AxesInfo {
    primaryAxis: string;
    secondaryAxis: string;
    titles: Record<string, string>; // language dependent strings
    mnemos: Record<string, string[]>;
}

function getAxisTitle(axes: AxesInfo, axisName: string): string {
    return axes.titles ? axes.titles[axisName] : axisName;
}

function addScaleTracks(
    info: TracksInfo,
    axesInfo: AxesInfo,
    wellLog: WellLogCollection
): void {
    // All sets is  assumed to include the main axis curve, so we just look at the first curve well-log set here
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

type PlotSetup = {
    iCurve: number;
    iSet: number;
    sourceLogSet: WellLogSet;
    curve: WellLogCurve;
    plotData: PlotData;
    minmax: [number, number];
};

function setupPlot(
    welllog: WellLogCollection,
    plotName: string,
    axesInfo: AxesInfo
): PlotSetup | null {
    const { iCurve, iSet } = findSetAndCurveIndex(welllog, plotName);

    if (iCurve < 0) return null;

    const sourceLogSet = welllog[iSet];
    const data = sourceLogSet.data;
    const curves = sourceLogSet.curves;
    const curve = curves[iCurve];
    const dimensions = curve.dimensions ?? 1;

    if (dimensions !== 1) return null;
    if (curve.valueType === "string") return null;

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
    };
}

function maybeSetupPlot2(
    welllog: WellLogCollection,
    templatePlot: TemplatePlot,
    axesInfo: AxesInfo
): PlotSetup | null {
    if (templatePlot.type !== "differential") return null;
    else return setupPlot(welllog, templatePlot.name2 as string, axesInfo);
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
    welllog: WellLogCollection,
    axesInfo: AxesInfo,
    templateTrack: TemplateTrack,
    templateStyles?: TemplateStyle[],
    colorTables?: ColorTable[]
): void {
    const plotDatas: [number | null, number | string | null][][] = [];
    const plots: PlotConfig[] = [];
    // Saving the curves so it can be used for title generation
    const curvesUsed: WellLogCurve[] = [];

    if (templateTrack.plots)
        for (const templatePlot of templateTrack.plots) {
            const plotSetup = setupPlot(welllog, templatePlot.name, axesInfo);

            if (!plotSetup) continue; // Plot couldnt be set up, skip adding this track
            const { plotData, curve, minmax, iCurve, iSet } = plotSetup;

            const plotSetup2 = maybeSetupPlot2(welllog, templatePlot, axesInfo);

            // Apply min-max index values to entire track
            checkSetupMinMax(plotSetup, plotSetup2, info.minmaxPrimaryAxis);

            // make full props
            const templatePlotProps = getTemplatePlotProps(
                templatePlot,
                templateStyles
            );

            const p = getPlotConfig(
                `${iSet}-${iCurve}`,
                templatePlotProps,
                templateTrack.scale,
                minmax,
                curve,
                plotDatas.length,
                plotSetup2?.curve,
                plotDatas.length + 1,
                colorTables
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
    welllog: WellLogCollection,
    axesInfo: AxesInfo,
    templateTrack: TemplateTrack,
    templateStyles?: TemplateStyle[],
    colorTables?: ColorTable[]
): void {
    const templatePlot = templateTrack.plots[0];
    const name = templatePlot.name;
    const plotSetup = setupPlot(welllog, name, axesInfo);

    if (!plotSetup) return;
    const { plotData, curve, sourceLogSet } = plotSetup;

    // make full props
    const templatePlotProps = getTemplatePlotProps(
        templatePlot,
        templateStyles
    );
    const templateTrackFullPlot = deepCopy(templateTrack);
    const label = makeTrackHeader([curve], templateTrack);
    const meta = getDiscreteMeta(sourceLogSet, name);

    templateTrackFullPlot.title = label;
    templateTrackFullPlot.plots[0].type = templatePlotProps.type;

    // curve.valueType could be "integer", "string"

    if (!meta && curve.valueType == "integer")
        console.log(
            "Discrete meta information for '" +
                name +
                "' not found. Use default"
        );

    const logColor = templatePlotProps.colorTable;
    let colorTable: ColorTable | undefined = undefined;
    if (logColor) {
        if (colorTables) {
            colorTable = colorTables.find(
                (colorTable) => colorTable.name == logColor
            );
            if (!colorTable)
                console.error("Missed '" + logColor + "' color table");
        } else {
            console.error(
                "No color tables file given for '" + logColor + "' color table"
            );
        }
    } else {
        if (!meta)
            // see https://github.com/equinor/webviz-subsurface-components/issues/1613
            console.error("No color table given in template plot props");
    }

    const plot = templateTrackFullPlot.plots[0];
    if (plot) {
        plot.showLabels = templatePlotProps.showLabels;
        plot.showLines = templatePlotProps.showLines;
        plot.labelRotation = templatePlotProps.labelRotation ?? 0;
    }

    const options: StackedTrackOptions = {
        abbr: name, // name of the only plot
        legendConfig: stackLegendConfig,
        data: createStackData.bind(null, plotData.data, colorTable, meta),
    };
    setStackedTrackOptionsFromTemplate(options, templateTrackFullPlot);
    const track = newStackedTrack(options);
    updateStackedTrackScale(track);

    checkMinMax(info.minmaxPrimaryAxis, plotData.minmaxPrimaryAxis);
    info.tracks.push(track);
}

export function createTracks(
    welllog: WellLogCollection,
    axes: AxesInfo,
    templateTracks: TemplateTrack[], // Part of JSON
    templateStyles?: TemplateStyle[], // Part of JSON
    colorTables?: ColorTable[] // JSON
): TracksInfo {
    if (!welllog?.length) return new TracksInfo();

    const info = new TracksInfo();

    addScaleTracks(info, axes, welllog);

    for (const templateTrack of templateTracks) {
        if (isStackedTrack(templateTrack, templateStyles)) {
            addStackedTrack(
                info,
                welllog,
                axes,
                templateTrack,
                templateStyles,
                colorTables
            );
        } else {
            addGraphTrack(
                info,
                welllog,
                axes,
                templateTrack,
                templateStyles,
                colorTables
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
            if (trackCurrent == track) {
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
    const welllog = wellLogView.welllogCollection;
    const templatePlot = templateTrack.plots[0];

    if (!welllog || !templatePlot) return null;

    const name = templatePlot.name;
    const templateStyles = props.template.styles;
    // make full props
    const templatePlotProps = getTemplatePlotProps(
        templatePlot,
        templateStyles
    );

    const colorTable = props.colorTables.find(
        (colorTable) => colorTable.name == templatePlotProps.colorTable
    );

    const { iCurve, iSet } = findSetAndCurveIndex(welllog, name);

    if (iCurve < 0) return null; // curve not found

    const sourceLogSet = welllog[iSet];
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
        colorTable,
        meta
    );
    if (track) {
        // edit existing track
        {
            // force to clear stacked areas
            track.data = null; // workarond for videx welllog component to force redraw areas with new options (showLines, ...)
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

export function toggleId(
    trackIds: (string | number)[],
    trackId: string | number
): void {
    const i = trackIds.indexOf(trackId);
    if (i < 0) trackIds.push(trackId);
    else trackIds.splice(i, 1);
}
