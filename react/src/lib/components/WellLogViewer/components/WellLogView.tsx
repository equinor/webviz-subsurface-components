import React, { Component, ReactNode } from "react";
import { LogViewer } from "@equinor/videx-wellog";
import {
    InterpolatedScaleHandler,
    ScaleInterpolator,
} from "@equinor/videx-wellog";

import "./styles.scss";

import { select } from "d3";

import createTracks from "../utils/tracks";
import { AxesInfo, WellLog}  from "../utils/tracks";

function addRubberbandOverlay(instance) {
    const rubberBandSize = 9;
    const offset = (rubberBandSize - 1) / 2;
    const rbelm = instance.overlay.create("rubber-band", {
        onMouseMove: (event) => {
            const { y } = event;
            event.target.style.top = `${y - (offset + 0.5)}px`;
            event.target.style.visibility = "visible";
        },
        onMouseExit: (event) => {
            event.target.style.visibility = "hidden";
            if (instance.options.rubberbandExit) {
                instance.options.rubberbandExit({
                    source: instance,
                });
            }
        },
    });

    const rb = select(rbelm)
        .classed("rubber-band", true)
        .style("height", `${rubberBandSize}px`)
        .style("background-color", "rgba(255,0,0,0.1)")
        .style("visibility", "hidden");

    rb.append("div")
        .style("height", "1px")
        .style("background-color", "rgba(255,0,0,0.7)")
        .style("position", "relative")
        .style("top", `${offset}px`);
}

function addReadoutOverlay(instance, parent: WellLogView) {
    //instance.overlay.register(key: string, callbacks: OverlayCallbacks): void;
    const elm = instance.overlay.create("depth", {
        onClick: (event) => {
            const { target, caller, y } = event;
            const x = caller.scale.invert(y);
            target.textContent = Number.isFinite(x)
                ? `Pinned MD: ${x.toFixed(1)}`
                : "-";
            target.style.visibility = "visible";
        },
        onMouseMove: (event) => {
            const { target, caller, y } = event;
            const x = caller.scale.invert(y);
            target.textContent = Number.isFinite(x)
                ? `MD: ${x.toFixed(1)}`
                : "-";
            target.style.visibility = "visible";

            const x2 = caller.scaleHandler.interpolator.reverse(x);
            parent.onMouseMove(x, x2);
        },
        onMouseExit: (event) => {
            event.target.style.visibility = "hidden";
        },
        onRescale: (event) => {
            event.target.style.visibility = "visible";
            event.target.textContent = `Zoom: x${event.transform.k.toFixed(1)}`;
        },
    });
    elm.style.visibility = "hidden";
    elm.style.display = "inline-block";
    elm.style.padding = "2px";
    elm.style.borderRadius = "4px";
    elm.style.textAlign = "right";
    elm.style.position = "absolute";
    elm.style.backgroundColor = "rgba(0,0,0,0.5)";
    elm.style.color = "white";
    elm.style.right = "5px";
    elm.style.bottom = "5px";
}

function addPinnedValueOverlay(instance) {
    const rubberBandSize = 9;
    const offset = (rubberBandSize - 1) / 2;
    const rbelm = instance.overlay.create("pinned", {
        onClick: (event) => {
            const { y } = event;
            event.target.style.top = `${y - (offset + 0.5)}px`;
            event.target.style.visibility = "visible";
        },
        onMouseExit: (event) => {
            event.target.style.visibility = "hidden";
        },
    });

    const rb = select(rbelm)
        .classed("pinned", true)
        .style("height", `${rubberBandSize}px`)
        .style("background-color", "rgba(0,0,0,0.1)")
        .style("position", "absolute")
        .style("width", "100%")
        .style("visibility", "hidden");

    rb.append("div")
        .style("height", "1px")
        .style("background-color", "rgba(0,255,0,0.7)")
        .style("position", "relative")
        .style("top", `${offset}px`);
}

function createInterpolator(from: Float32Array, to: Float32Array) {
    // 'from' array could be non monotonous (TVD) so could not use binary search

    // Calculate linear interpolation factor between the nodes
    const mul = new Float32Array(from.length);
    const n = from.length;
    for (let i = 0; i < n; i++) {
        if (!i) mul[i] = 0;
        else {
            const d = from[i] - from[i - 1];
            mul[i] = d ? (to[i] - to[i - 1]) / d : 1.0;
        }
    }

    return (x: number, expand: boolean) => {
        for (let i = 0; i < n; i++) {
            if (x < from[i]) {
                if (!i) return expand ? to[0] : Number.NaN; //(null as unknown as number);
                return (x - from[i]) * mul[i] + to[i];
            }
        }
        return expand ? to[n ? n - 1 : 0] : Number.NaN; //(null as unknown as number);
    };
}

function createScaleHandler(
    primaries: Float32Array,
    secondaries: Float32Array
) {
    const primary2secondary = createInterpolator(primaries, secondaries);
    const secondary2primary = createInterpolator(secondaries, primaries);

    const forward = (v) => {
        // SecondaryAxis => PrimaryAxis
        return secondary2primary(v, false);
    };
    const reverse = (v) => {
        // PrimaryAxis => SecondaryAxis
        return primary2secondary(v, false);
    };
    const interpolator: ScaleInterpolator = {
        forward,
        reverse,
        forwardInterpolatedDomain: (domain) =>
            domain.map((v) => /*forward(v)*/ secondary2primary(v, true)),
        reverseInterpolatedDomain: (domain) =>
            domain.map((v) => /*reverse(v)*/ primary2secondary(v, true)),
    };
    return new InterpolatedScaleHandler(interpolator);
}

function formatValue(v1: number) {
    if (!Number.isFinite(v1)) return "";
    let v = v1.toPrecision(4);
    if (v.indexOf(".") >= 0) {
        // cut trailing zeroes
        for (;;) {
            let l = v.length;
            if (!l--) break;
            if (v[l] !== "0") break;
            v = v.substring(0, l);
        }
    }
    return v;
}

function getValue(x: number, data, plot) {
    let v = "";
    if (Number.isFinite(x)) {
        const n = data.length;
        for (let i = 0; i < n; i++) {
            const row = data[i];
            if (row[0] == null) continue;
            if (row[1] == null) continue;
            if (x < row[0]) {
                let v1: number;
                if (!i) break;
                else {
                    const rowPrev = data[i - 1];
                    if (rowPrev[0] == null || rowPrev[1] == null) break;
                    if (plot.type === "linestep") {
                        v1 = row[1]; //!! not rPrev[1] !!
                    } else {
                        const d = row[0] - rowPrev[0];
                        const f = x - rowPrev[0];
                        if (plot.type === "dot") {
                            v1 = f < d * 0.5 ? rowPrev[1] : row[1];
                        } else {
                            // "line", "area"
                            const mul = d ? (row[1] - rowPrev[1]) / d : 1.0;
                            v1 = f * mul + rowPrev[1];
                        }
                    }
                }
                v = formatValue(v1);
                break;
            }
        }
    }
    return v;
}


function setTracksToController(
    logController: LogViewer,
    axes: AxesInfo,
    welllog: WellLog, // JSON Log Format
    template: Record<string, any>// JSON
) {
    const { tracks, minmaxPrimaryAxis, primaries, secondaries } = createTracks(
        welllog,
        axes,
        template.tracks, 
        template.styles
    );
    logController.reset();
    const scaleHandler = createScaleHandler(primaries, secondaries);
    logController.scaleHandler = scaleHandler;
    logController.domain = minmaxPrimaryAxis;
    logController.setTracks(tracks);
}

interface Info {
    name?: string;
    units?: string;
    color: string;
    value: string;
    type: string; // line, linestep, area, ?dot?
}
interface Props {
    welllog: WellLog;
    template: Record<string, any>;
    primaryAxis: string;
    //setAvailableAxes : (scales: string[]) => void;
    setInfo: (infos: Info[]) => void;
    axisTitles: Record<string, string>;
    axisMnemos: Record<string, string[]>;
}

interface State {
    infos: Info[];
}

class WellLogView extends Component<Props, State> {
    container?: HTMLElement;
    logController?: LogViewer;

    constructor(props: Props) {
        super(props);
        //alert("props=" + props)

        this.container = undefined;
        this.logController = undefined;

        this.state = {
            infos: [],
        };
    }

    componentDidMount(): void {
        this.createLogViewer();
        this.setTracks();
    }

    componentDidUpdate(prevProps: Props /*, prevState: State*/): void {
        // Typical usage (don't forget to compare props):
        if (this.props.welllog !== prevProps.welllog) {
            this.setTracks();
        } else if (this.props.template !== prevProps.template) {
            this.setTracks();
        } else if (this.props.primaryAxis !== prevProps.primaryAxis) {
            this.setTracks();
        }
    }

    createLogViewer(): void {
        if (this.logController) {
            // remove old LogViewer
            this.logController.reset(); // clear UI
            this.logController.onUnmount(); //?
            this.logController = undefined;
        }
        if (this.container) {
            // create new LogViewer
            this.logController = new LogViewer({
                showLegend: true,
                horizontal: false,
            });

            this.logController.init(this.container);

            addReadoutOverlay(this.logController, this);
            addRubberbandOverlay(this.logController);
            addPinnedValueOverlay(this.logController);
        }
        this.setInfo();
    }
    setTracks(): void {
        if (this.logController) {
            const axes: AxesInfo = {
                primaryAxis: this.props.primaryAxis,
                secondaryAxis: this.props.primaryAxis == "md" ? "tvd" : "md",
                titles: this.props.axisTitles,
                mnemos: this.props.axisMnemos
            };
            setTracksToController(
                this.logController,
                axes,
                this.props.welllog,
                this.props.template
            );
        }
        this.setInfo(); // Clear old track information
    }
    setInfo(x: number = Number.NaN, x2: number = Number.NaN): void {
        if (!this.logController) return;
        const infos: Info[] = [];
        let iPlot = 0;
        let bSeparator = false;
        for (const track of this.logController.tracks) {
            const plots = track.options["plots"];
            const datas = track.data;
            if (plots) {
                if (!bSeparator) {
                    bSeparator = true;
                    infos.push({
                        color: "",
                        value: "",
                        type: "separator",
                    });
                }

                const nPlots = plots.length;
                for (let p = 0; p < nPlots; p++) {
                    const plot = plots[p];
                    const v = getValue(x, datas[p], plot);
                    const legend = plot.options.legendInfo();
                    infos.push({
                        name: legend.label,
                        units: legend.unit,
                        color: plot.options.color,
                        value: v,
                        type: plot.type,
                    });
                    iPlot++;
                }
            } else {
                const _x = iPlot == 0 ? x : x2;
                infos.push({
                    name: track.options.abbr,
                    units: track.options["units"], // ScaleTrackOptions.units
                    color: iPlot == 0 ? "black" : "grey",
                    value: formatValue(_x),
                    type: "", //plot.type,
                });
                iPlot++;
            }
        }

        this.props.setInfo(infos);
    }

    onMouseMove(x: number, x2: number): void {
        this.setInfo(x, x2);
    }

    render(): ReactNode {
        return (
            <div
                className="welllogview"
                ref={(el) => {
                    this.container = el as HTMLElement;
                }}
            />
        );
    }
}

export default WellLogView;
