import {
    Track,
    ScaleTrack,
    DualScaleTrack,
    GraphTrack,
} from "@equinor/videx-wellog";
import { graphLegendConfig, scaleLegendConfig } from "@equinor/videx-wellog";

/* unused
function indexOfCurveByName(curves, name: string): number {
    let i = 0;
    for (const curve of curves) {
        if (curve.name.toUpperCase() == name) {
            return i;
        }
        i++;
    }
    return -1;
}
*/
function indexOfCurveByNames(curves, names: string[]): number {
    let i = 0;
    for (const curve of curves) {
        if (names.indexOf(curve.name.toUpperCase()) >= 0) return i;
        i++;
    }
    return -1;
}

// names could be case insentitive ("Depth")
const namesMD = ["DEPTH", "DEPT", "MD", "TDEP" /*"Tool Depth"*/]; // depth based logging data
const namesTIME = ["TIME"]; //  time based logging data
const namesTVD = ["TVD", "TVDSS", "DVER" /*"TRUE Vertical depth"*/];

const names = {
    md: namesMD,
    tvd: namesTVD,
    time: namesTIME,
};
const titles = {
    md: "MD",
    tvd: "TVD",
    time: "TIME",
};

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

function checkMinMaxValue(minmax: [number, number], value: number) {
    if (value !== null) {
        if (minmax[0] === Number.POSITIVE_INFINITY)
            minmax[0] = minmax[1] = value;
        else if (minmax[0] > value) minmax[0] = value;
        else if (minmax[1] < value) minmax[1] = value;
    }
}
function checkMinMax(minmax: [number, number], minmaxSrc: [number, number]) {
    if (minmax[0] === Number.POSITIVE_INFINITY) {
        minmax[0] = minmaxSrc[0];
        minmax[1] = minmaxSrc[1];
    } else if (minmax[0] > minmaxSrc[0]) minmax[0] = minmaxSrc[0];
    else if (minmax[1] < minmaxSrc[1]) minmax[1] = minmaxSrc[1];
}

function roundMinMax(minmax: [number, number]): [number, number] {
    //const kmax = 7; const kmin = 5;
    const kmin = 6;
    const kmax = 9;

    if (!isFinite(minmax[0]) || !isFinite(minmax[1]))
        return [minmax[0], minmax[1]];

    if (!minmax[0] && !minmax[1])
        // some special case of absolutly round values (zeroes)
        return [minmax[0], minmax[1]];

    let d = minmax[1] - minmax[0];
    if (d < 0) return [minmax[0], minmax[1]];
    if (!d) d = 1;

    const l0 = Math.floor(Math.log10(d));
    let p = Math.pow(10, l0 + 1);
    let c = (minmax[0] + d * 0.5) / p;
    if (Math.abs(c) > 1e9) c *= p;
    else c = Math.floor(c) * p;
    let q = 0.5;
    let l = l0;

    let k1 = 0,
        k2 = 0;
    let k = k2 - k1;
    for (; l > -20 /*-30*/; l--) {
        p = p * 0.1;
        while (q >= 0.5) {
            d = p * q;
            k2 = Math.floor((minmax[1] - c) / d);
            if (minmax[1] >= c) k2++;
            k1 = Math.floor((minmax[0] - c) / d);
            if (minmax[0] < c) k1--;
            k = k2 - k1;
            if (k >= kmax) break;
            q = q * 0.5;
        }
        if (k >= kmax) break;
        q = 2.0;
    }
    if (k >= kmax) {
        for (; l < l0; l++) {
            while (q <= 2.0) {
                d = p * q;
                k2 = Math.floor((minmax[1] - c) / d);
                if (minmax[1] >= c) k2++;
                k1 = Math.floor((minmax[0] - c) / d);
                if (minmax[0] < c) k1--;
                k = k2 - k1;
                if (k <= kmax) break;
                q = q * 2.0;
            }
            if (k <= kmax) break;
            q = 0.5;
            p = p * 10;
        }
    }
    if (k < kmin) {
        const j = q == 2.0 ? 5 : 2;
        if (k1 >= 0) k = (k1 / j) * j;
        else k = ((k1 - j + 1) / j) * j;
        if (k2 - k > kmin) {
            if (k2 < 0) k = (k2 / j) * j;
            else k = ((k2 + j - 1) / j) * j;
            if (k - k1 > kmin) k2 = (k2 + k1 + kmin) / 2;
            else k2 = k;
        } else {
            k1 = k2 - kmin;
            k2 = k1 + kmin;
        }
        k1 = k;
    }
    const a = k1 * d + c,
        b = k2 * d + c;
    return [parseFloat(a.toPrecision(5)), parseFloat(b.toPrecision(5))];
}

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

function makeTrackHeader(bMultiple, curve) {
    return bMultiple
        ? "Multiple"
        : /*iCurve === iSecondaryAxis ? titleSecondaryAxis : DEBUG*/
        curve.description
        ? shortDescription(curve.description)
        : curve.name;
}

class TrackInfo {
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

export function getAvailableAxes(welllog: Record<string, any>[]): string[] {
    if (welllog && welllog[0]) {
        const curves = welllog[0].curves;

        const iMD = indexOfCurveByNames(curves, namesMD);
        const iTVD = indexOfCurveByNames(curves, namesTVD);
        const iTIME = indexOfCurveByNames(curves, namesTIME);

        const result: string[] = [];
        if (iMD >= 0) result.push("md");
        if (iTVD >= 0) result.push("tvd");
        if (iTIME >= 0) result.push("time");

        return result;
    }

    return ["md", "tvd"];
}

export default (
    welllog: Record<string, any>[],
    axes: { primaryAxis: string; secondaryAxis: string } = {
        primaryAxis: "md",
        secondaryAxis: "tvd",
    }
): TrackInfo => {
    const info = new TrackInfo();

    if (welllog && welllog[0]) {
        const data = welllog[0].data;
        const curves = welllog[0].curves;

        let titlePrimaryAxis = titles[axes.primaryAxis];
        let iPrimaryAxis = indexOfCurveByNames(curves, names[axes.primaryAxis]);
        if (iPrimaryAxis < 0) {
            // try time-based welllog
            titlePrimaryAxis = titles["time"];
            iPrimaryAxis = indexOfCurveByNames(curves, names["time"]);
        }
        const titleSecondaryAxis = titles[axes.secondaryAxis];
        const iSecondaryAxis = indexOfCurveByNames(
            curves,
            names[axes.secondaryAxis]
        );
        //alert("iPrimaryAxis=" + iPrimaryAxis + "; iSecondaryAxis=" + iSecondaryAxis)

        let nTrack = 0;
        if (iPrimaryAxis >= 0) {
            const curvePrimaryAxis = curves[iPrimaryAxis];
            if (iSecondaryAxis >= 0) {
                const scaleTrack1 = new DualScaleTrack(nTrack++, {
                    mode: 0,
                    maxWidth: 50,
                    width: 2,
                    label: titlePrimaryAxis,
                    abbr: curvePrimaryAxis.name
                        ? curvePrimaryAxis.name
                        : titlePrimaryAxis,
                    units: curvePrimaryAxis.unit
                        ? curvePrimaryAxis.unit
                        : "mtr",
                    legendConfig: scaleLegendConfig,
                });
                info.tracks.push(scaleTrack1);

                const curveSecondaryAxis = curves[iSecondaryAxis];
                const scaleTrack2 = new DualScaleTrack(nTrack++, {
                    mode: 1,
                    maxWidth: 50,
                    width: 2,
                    label: titleSecondaryAxis,
                    abbr: curveSecondaryAxis.name
                        ? curveSecondaryAxis.name
                        : titleSecondaryAxis,
                    units: curveSecondaryAxis.unit
                        ? curveSecondaryAxis.unit
                        : "mtr",
                    legendConfig: scaleLegendConfig,
                });
                info.tracks.push(scaleTrack2);

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
                const track = new ScaleTrack(nTrack++, {
                    maxWidth: 50,
                    width: 2,
                    label: titlePrimaryAxis,
                    abbr: curvePrimaryAxis.name
                        ? curvePrimaryAxis.name
                        : titlePrimaryAxis,
                    units: curvePrimaryAxis.unit
                        ? curvePrimaryAxis.unit
                        : "mtr",
                    legendConfig: scaleLegendConfig, //??
                });
                info.tracks.push(track);
            }
        }
        let iPlot = 0;
        for (let iCurve = 0; iCurve < curves.length; iCurve++) {
            const curve = curves[iCurve];
            if (iCurve === iPrimaryAxis)
                // Skip PrimaryAxis
                continue;
            if (iCurve === iSecondaryAxis)
                // Skip SecondaryAxis
                continue;

            if (curve.dimensions !== 1) continue;

            if (curve.valueType === "string") continue; //??

            if (
                nTrack > 11 &&
                iCurve !== iSecondaryAxis &&
                iCurve !== iPrimaryAxis
            )
                continue;

            const plot = preparePlotData(data, iCurve, iPrimaryAxis);
            checkMinMax(info.minmaxPrimaryAxis, plot.minmaxPrimaryAxis);
            const plotColor = colors[iPlot % colors.length];
            const plotType = plotTypes[iPlot % plotTypes.length];
            iPlot++;

            const plotDatas = [plot.data];
            const plots = [
                {
                    id: iCurve, // set some id
                    type: plotType,
                    options: {
                        scale: "linear",
                        domain: roundMinMax(plot.minmax), //??
                        color: plotColor,
                        // for 'area'!  fill: 'red',
                        fillOpacity: 0.3, // for 'area'!
                        dataAccessor: (d) => d[0],
                        legendInfo: () => ({
                            label: curve.name ? curve.name : "???",
                            unit: curve.unit ? curve.unit : "",
                        }),
                    },
                },
            ];

            const bMultiple = nTrack == 2; // for DEMO
            if (bMultiple) {
                iCurve++;
                const curve2 = curves[iCurve];
                const plot2 = preparePlotData(data, iCurve, iPrimaryAxis);
                checkMinMax(info.minmaxPrimaryAxis, plot2.minmaxPrimaryAxis);
                const plotColor2 = colors[iPlot % colors.length];
                // plotType2 == 'differential'0
                /**
                 * Data format used by differential plot
                 * @example [[0, 10, 0.5], [10, 21, 0.78], [20, 19, 1.21] ... ]
                export declare type DifferentialPlotData = Triplet<number>[];
                 */

                const plotType2 = plotTypes[iPlot % plotTypes.length];
                iPlot++;

                plotDatas.push(plot2.data);
                plots.push({
                    id: iCurve, // set some id
                    type: plotType2,
                    options: {
                        scale: "linear",
                        domain: roundMinMax(plot2.minmax), //??
                        color: plotColor2,
                        // for 'area'!  fill: 'red',
                        fillOpacity: 0.3, // for 'area'!
                        dataAccessor: (d) => d[1],
                        legendInfo: () => ({
                            label: curve2.name ? curve2.name : "???",
                            unit: curve2.unit ? curve2.unit : "",
                        }),
                    },
                });
            }

            const track = new GraphTrack(nTrack++, {
                label: makeTrackHeader(bMultiple, curve),
                abbr: curve.name,
                legendConfig: graphLegendConfig,
                //maxWidth: 250,
                //width: 2,
                scale: "linear",
                domain: roundMinMax(plot.minmax),
                data: plotDatas,
                plots: plots,
            });
            info.tracks.push(track);
        }
    }
    return info;
};
