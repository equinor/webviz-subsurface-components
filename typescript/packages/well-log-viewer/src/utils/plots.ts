import {
    type Plot,
    LinePlot,
    AreaPlot,
    DotPlot,
    DifferentialPlot,
    LineStepPlot,
} from "@equinor/videx-wellog";
import type { PlotConfig } from "@equinor/videx-wellog/dist/tracks/graph/interfaces";
import type {
    DataAccessorFunction,
    DifferentialPlotOptions,
} from "@equinor/videx-wellog/dist/plots/interfaces";
import type { LegendInfo } from "@equinor/videx-wellog/dist/plots/legend/interfaces";
import { type AreaData } from "@equinor/videx-wellog";

import type {
    TemplatePlot,
    TemplatePlotProps,
    TemplatePlotType,
    TemplateStyle,
} from "../components/WellLogTemplateTypes";
import type {
    WellLogCurve,
    WellLogDataRow,
    WellLogSet,
} from "../components/WellLogTypes";
import type { ColorMapFunction } from "./color-function";

import GradientFillPlot, {
    type GradientFillPlotOptions,
} from "./gradientfill-plot";
import { checkMinMaxValue, roundLogMinMax, roundMinMax } from "./minmax";
import { elementByName } from "./arrays";
import { generateColor } from "./generateColor";
import { getColorMapFunction } from "./color-function";
import { type DiscreteMeta, getDiscreteColorAndName } from "./well-log";

export const DEFAULT_PLOT_TYPE = "line";
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

export interface ExtPlotOptions
    extends GradientFillPlotOptions /*|DifferentialPlotOptions|AreaPlotOptions*/ {
    legendInfo: () => LegendInfo;
}

export class PlotData {
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

/*
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

export function isValidPlotType(plotType: string): boolean {
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

function mergePlotAndStyle(
    templatePlot: TemplatePlot,
    templateStyles?: TemplateStyle[]
): TemplatePlot {
    if (!templateStyles || !templatePlot.style) return { ...templatePlot };

    const style = elementByName(templateStyles, templatePlot.style) ?? {};

    return { ...style, ...templatePlot };
}

export function applyTemplateStyle(
    templatePlot: TemplatePlot,
    templateStyles?: TemplateStyle[]
): TemplatePlot {
    const styledTemplate = mergePlotAndStyle(templatePlot, templateStyles);

    if (!styledTemplate.type) styledTemplate.type = DEFAULT_PLOT_TYPE;
    if (!isValidPlotType(styledTemplate.type)) {
        console.error(
            "unknown plot type '" +
                styledTemplate.type +
                "': use default type '" +
                DEFAULT_PLOT_TYPE +
                "'"
        );
        styledTemplate.type = DEFAULT_PLOT_TYPE;
    }
    if (styledTemplate.type !== "stacked") {
        if (!styledTemplate.color) styledTemplate.color = generateColor();
    }

    if (styledTemplate.type === "area") {
        if (!styledTemplate.fill) {
            //styledTemplate.fill = generateColor();
            styledTemplate.fillOpacity = 0.0;
        }
    } else if (styledTemplate.type === "gradientfill") {
        if (!styledTemplate.colorMapFunctionName) {
            //styledTemplate.fill = generateColor();
            styledTemplate.fillOpacity = 0.0;
        }
    } else if (styledTemplate.type === "differential") {
        // "differential" plot
        if (!styledTemplate.fill) styledTemplate.fill = generateColor();
        if (!styledTemplate.color2) styledTemplate.color2 = generateColor();
        if (!styledTemplate.fill2) styledTemplate.fill2 = generateColor();
    }
    return styledTemplate;
}

export function getPlotConfig(
    id: string | number,
    templatePlotProps: TemplatePlotProps,
    trackScale: string | undefined, // track scale
    minmax: [number, number],
    curve: WellLogCurve,
    iPlot: number,
    curve2: WellLogCurve | undefined,
    iPlot2: number,
    colorMapFunctions: ColorMapFunction[] | undefined
): PlotConfig {
    return {
        id: id,
        type: templatePlotProps.type ?? "",
        options: getPlotOptions(
            templatePlotProps,
            trackScale,
            minmax,
            curve,
            iPlot,
            curve2,
            iPlot2,
            colorMapFunctions
        ),
    };
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

export function getPlotOptions(
    templatePlotProps: TemplatePlotProps,
    trackScale: string | undefined, // track scale
    minmax: [number, number],
    curve: WellLogCurve,
    iPlot: number,
    curve2: WellLogCurve | undefined, //"differential" plot
    iPlot2: number, //"differential" plot
    colorMapFunctions?: ColorMapFunction[] //"gradientfill" plot
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
        dataAccessor: makeDataAccessorFunc(iPlot, curve2 ? iPlot2 : undefined),

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
        colorMapFunction: getColorMapFunction(
            templatePlotProps.colorMapFunctionName,
            colorMapFunctions
        ),
        inverseColorMapFunction: getColorMapFunction(
            templatePlotProps.inverseColorMapFunctionName,
            colorMapFunctions
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

function createAreaData(
    from: number,
    to: number,
    value: number | string,
    colorMapFunction: ColorMapFunction | undefined,
    meta?: DiscreteMeta | null
): AreaData | null {
    const { color, name } = getDiscreteColorAndName(
        value,
        colorMapFunction,
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

export async function createStackData(
    data: [number | null, number | string | null][],
    colorMapFunction: ColorMapFunction | undefined,
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
                colorMapFunction,
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
