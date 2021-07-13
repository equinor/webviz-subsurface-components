import {
    Track,
    ScaleTrack,
    DualScaleTrack,
    GraphTrack,
    graphLegendConfig,
    LegendHelper,
    scaleLegendConfig,
    ScaleInterpolator
} from '@equinor/videx-wellog';



//import { scaleLinear } from 'd3';

function indexOfCurveByName(data, name: string): number {
    let i: number = 0;
    for (let curve of data.curves) {
        if (curve.name.toUpperCase() == name) {
            return i;
        }
        i++;
    }
    return -1;
}
function indexOfCurveByNames(data, names: string[]): number {
    let i: number = 0;
    for (let curve of data.curves) {
        if (names.indexOf(curve.name.toUpperCase()) >= 0)
            return i;
        i++;
    }
    return -1;
}

// names could be case insentitive ("Depth")
const namesMD = ["DEPTH", "DEPT", "MD", "TDEP"/*"Tool Depth"*/] // depth based logging data
const namesTIME = ["TIME"] //  time based logging data
const namesTVD = ["TVD", "TVDSS", "DVER"/*"TRUE Vertical depth"*/]

const names = {
    "md": namesMD,
    "tvd": namesTVD,
    "time": namesTIME,
}
const titles = {
    "md": "MD",
    "tvd": "TVD",
    "time": "TIME",
}


const colors = ['red', 'blue', 'orange', 'green', 'red', 'magenta', 'gray', 'brown']
/*
* `LinePlot` - linear line graph
* `LineStepPlot` - linear stepladder graph
* `AreaPlot` - area graph
* `DotPlot` - discrete points graph
* `DifferentialPlot` - differential graph, for correlation of two data series.
*/
const plotTypes = ['line', 'line', 'line', 'linestep', 'linestep', 'dot', 'area', 'dot', 'linestep'/*, 'differential'*/]

function checkMinMaxValue(minmax: [number, number], value: number) {
    if (value !== null) {
        if (minmax[0] === Number.POSITIVE_INFINITY) 
            minmax[0] = minmax[1] = value;
        else if (minmax[0] > value)
            minmax[0] = value;
        else if (minmax[1] < value)
            minmax[1] = value;
    }
}
function checkMinMax(minmax: [number, number], minmaxSrc: [number, number]) {
    if (minmax[0] === Number.POSITIVE_INFINITY) {
        minmax[0] = minmaxSrc[0];
        minmax[1] = minmaxSrc[1];
    }
    else if (minmax[0] > minmaxSrc[0])
        minmax[0] = minmaxSrc[0];
    else if (minmax[1] < minmaxSrc[1])
        minmax[1] = minmaxSrc[1];
}
class PlotData {
    minmax: [number, number];
    minmaxPrimaryAxis: [number, number];
    data: [number, number][];

    constructor() {
        this.minmax = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
        this.minmaxPrimaryAxis = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
        this.data = []
    }
};

function preparePlotData(datas, iCurve, iPrimaryAxis): PlotData {
    let plot = new PlotData;
    let i = 0;
    for (let row of datas) {
        const value: number = row[iCurve];
        checkMinMaxValue(plot.minmax, value);
        const primary: number = iPrimaryAxis >= 0 ? row[iPrimaryAxis] : i++;
        checkMinMaxValue(plot.minmaxPrimaryAxis, primary);
        plot.data.push([primary, value]);
    }
    
    return plot;
}

function createInterpolator(from: Float32Array, to: Float32Array) {
    // 'from' array could be non monotonous (TVD) so could not use binary search

    // Calculate linear interpolation coefficient between the nodes
    let mul = new Float32Array(from.length);
    const n = from.length
    for (let i = 0; i < n; i++) {
        let d = from[i] - from[i - 1];
        mul[i] = d? (to[i] - to[i - 1]) / d: 1.0/*???*/;
    }

    return (x: number) => {
        for (let i = 0; i < n; i++) {
            if (x <= from[i]) {
                if (!i) return to[0] //??
                return (x - from[i]) * mul[i] + to[i];
            }
        }
        return to[n ? n - 1 : 0]
    }
}

function shortDescription(description) {
    // sometimes description contains the track number
    //"0  Depth",
    //"1  BVW:CPI:rC:0001:v1",
    //"02 DRAW DOWN PRESSURE",
    if ('0' <= description[0] && description[0] <= '9') {
        if (description[1] == ' ')
            return description.substring(2)
        else if ('0' <= description[1] && description[2] <= '9') 
            if (description[2] == ' ')
                return description.substring(3)
    }
    return description;
}

function makeTrackHeader(bMultiple, curve) {
    return bMultiple ? "Multiple" :
        /*iCurve === iSecondaryAxis ? titleSecondaryAxis : DEBUG*/
        curve.description ? shortDescription(curve.description):
        curve.name;
}

export default (datas, axes: { primary: string, secondary: string } = { primary: "md", secondary: "tvd" }) => {
    let tracks: Track[] = [];
    let minmaxPrimaryAxis: [number, number] = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
    let minmaxSecondaryAxis: [number, number] = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
    let interpolator: ScaleInterpolator | undefined = undefined;
    if (datas) {
        if (0) { // Debug print of available curves
            let msg = "";
            for (let data of datas) {
                msg +=/*"name="+data.header.name+"; */"well=" + data.header.well + "\r\n"
                for (let curve of data.curves) {
                    msg += "   name=" + curve.name;
                    if (curve.description)
                        msg += "; description=" + curve.description
                    //if (curve.dimensions)
                    //    msg += "; dimensions=" + curve.dimensions
                    msg += "\r\n"
                }
            }
            alert(msg)
        }
        let data = datas[0]

        let titlePrimaryAxis = titles[axes.primary]; 
        let iPrimaryAxis = indexOfCurveByNames(data, names[axes.primary])
        if (iPrimaryAxis < 0) {
            // try time-based welllog
            titlePrimaryAxis = titles["time"];
            iPrimaryAxis= indexOfCurveByNames(data, names["time"])
        }
        let titleSecondaryAxis = titles[axes.secondary]; 
        let iSecondaryAxis = indexOfCurveByNames(data, names[axes.secondary])
        //alert("iPrimaryAxis=" + iPrimaryAxis + "; iSecondaryAxis=" + iSecondaryAxis)

        let nTrack = 0;
        if (iPrimaryAxis >= 0) {
            const curvePrimaryAxis = data.curves[iPrimaryAxis];
            if (iSecondaryAxis >= 0) {
                const scaleTrack1 = new DualScaleTrack(nTrack++, {
                    mode: 0,
                    maxWidth: 50,
                    width: 2,
                    label: titlePrimaryAxis,
                    abbr: curvePrimaryAxis.name ? curvePrimaryAxis.name : titlePrimaryAxis,
                    units: curvePrimaryAxis.unit ? curvePrimaryAxis.unit : 'mtr',
                    legendConfig: scaleLegendConfig, 
                });
                tracks.push(scaleTrack1)

                let primaries = new Float32Array(data.data.length); // 32 bits should be enough
                let secondaries = new Float32Array(data.data.length);
                {
                    let count = 0;
                    for (let row of data.data) {
                        //if (row[iSecondaryAxis] !== null) // DEBUG: make TVD more non-linear
                        //    row[iSecondaryAxis] += 150 * Math.sin((row[iSecondaryAxis] - data.data[0][iSecondaryAxis])*0.01)
                        
                        const secondary: number = row[iSecondaryAxis];
                        checkMinMaxValue(minmaxSecondaryAxis, secondary);

                        if (secondary !== null) {
                            const primary: number = row[iPrimaryAxis];
                            if (primary !== null) {
                                secondaries[count] = secondary
                                primaries[count] = primary
                                count++;
                            }
                        }
                    }
                    if (count < primaries.length) { // resize arrays to actual size used 
                        primaries = primaries.subarray(0, count);
                        secondaries = secondaries.subarray(0, count);
                    }
                }
                const primary2secondary = createInterpolator(primaries, secondaries);
                const secondary2primary = createInterpolator(secondaries, primaries);
                

                const curveSecondaryAxis = data.curves[iSecondaryAxis];
                const scaleTrack2 = new DualScaleTrack(nTrack++, {
                    mode: 1,
                    maxWidth: 50,
                    width: 2,
                    label: titleSecondaryAxis,
                    abbr: curveSecondaryAxis.name ? curveSecondaryAxis.name : titleSecondaryAxis,
                    units: curveSecondaryAxis.unit ? curveSecondaryAxis.unit : 'mtr',
                    legendConfig: scaleLegendConfig,
                });
                tracks.push(scaleTrack2)

                
                const forward = (v) => { // SecondaryAxis => PrimaryAxis
                    let ret = secondary2primary(v);
                    return ret;
                }
                const reverse = (v) => { // PrimaryAxis => SecondaryAxis
                    let ret = primary2secondary(v);
                    return ret;
                }
                interpolator = {
                    forward,
                    reverse,
                    forwardInterpolatedDomain: domain => domain.map(v => forward(v)),
                    reverseInterpolatedDomain: domain => domain.map(v => reverse(v)),
                };
            }
            else {
                let track = new ScaleTrack(nTrack++, {
                    maxWidth: 50,
                    width: 2,
                    label: titlePrimaryAxis,
                    abbr: curvePrimaryAxis.name ? curvePrimaryAxis.name : titlePrimaryAxis,
                    units: curvePrimaryAxis.unit ? curvePrimaryAxis.unit : 'mtr',
                    legendConfig: scaleLegendConfig, //??
                })
                tracks.push(track)
            }
        }
        let iPlot = 0;
        for (let iCurve = 0; iCurve < data.curves.length; iCurve++) {
            const curve = data.curves[iCurve];
            if (iCurve === iPrimaryAxis) // Skip PrimaryAxis
                continue
            if (iCurve === iSecondaryAxis) // Skip SecondaryAxis
                continue
            
            if (curve.dimensions !== 1) 
                continue;

            if (curve.valueType === "string") 
                continue; //??

            if (nTrack > 11 && iCurve !== iSecondaryAxis && iCurve !== iPrimaryAxis)
                continue

            let plot = preparePlotData(data.data, iCurve, iPrimaryAxis)
            checkMinMax(minmaxPrimaryAxis, plot.minmaxPrimaryAxis)
            let plotColor = colors[iPlot % colors.length];
            let plotType = plotTypes[iPlot % plotTypes.length];
            iPlot++;

            let plotDatas = [plot.data];
            let plots = [{
                id: iCurve, // set some id
                type: plotType,
                options: {
                    scale:'linear',
                    domain: plot.minmax, //??
                    color: plotColor,
                    // for 'area'!  fill: 'red',
                    fillOpacity: 0.3, // for 'area'!  
                    dataAccessor: d => d[0],
                    legendInfo: () => ({
                        label: (curve.name ? curve.name : '???'),
                        unit: (curve.unit ? curve.unit : '') + '\r\n[' + plotType + ']',
                    }),
                },
            }];

           
            let bMultiple = nTrack==2 // for DEMO
            if (bMultiple) {
                iCurve++
                const curve2 = data.curves[iCurve];
                let plot2 = preparePlotData(data.data, iCurve, iPrimaryAxis)
                checkMinMax(minmaxPrimaryAxis, plot2.minmaxPrimaryAxis)
                let plotColor2 = colors[iPlot % colors.length];
                //let plotType2 = 'differential';/*plotTypes[iPlot % plotTypes.length];*/
                /**
                 * Data format used by differential plot
                 * @example [[0, 10, 0.5], [10, 21, 0.78], [20, 19, 1.21] ... ]
                export declare type DifferentialPlotData = Triplet<number>[];
                 */


                let plotType2 = plotTypes[iPlot % plotTypes.length];
                iPlot++;

                //alert(plot2.data)

                plotDatas.push(plot2.data);
                plots.push({
                    id: iCurve, // set some id
                    type: plotType2,
                    options: {
                        scale: 'linear',
                        domain: plot2.minmax, //??
                        color: plotColor2,
                        // for 'area'!  fill: 'red',
                        fillOpacity: 0.3, // for 'area'!  
                        dataAccessor: d => d[1],
                        legendInfo: () => ({
                            label: (curve2.name ? curve2.name : '???'),
                            unit: (curve2.unit ? curve2.unit : '') + '\r\n[' + plotType2 + ']',
                        }),
                    },
                });
            }
            

            let track = new GraphTrack(nTrack++, {
                label: makeTrackHeader(bMultiple, curve),
                abbr: curve.name,
                legendConfig: graphLegendConfig,
                //maxWidth: 250,
                //width: 2,
                scale: 'linear',
                domain: plot.minmax,
                data: plotDatas,
                plots: plots
            });
            tracks.push(track)
        }
    }
    return {
        tracks, 
        minmaxPrimaryAxis,
        interpolator
    }
}
