import React, { Component, ReactNode } from "react";
import { LogViewer } from "@equinor/videx-wellog";

import {
    InterpolatedScaleHandler,
    ScaleInterpolator,
} from "@equinor/videx-wellog";

import { Track, GraphTrack } from "@equinor/videx-wellog";
import { Plot } from "@equinor/videx-wellog";

import { ScaleTrackOptions } from "@equinor/videx-wellog/dist/tracks/scale/interfaces";

import {
    OverlayClickEvent,
    OverlayMouseMoveEvent,
    OverlayMouseExitEvent,
    OverlayRescaleEvent,
} from "@equinor/videx-wellog/dist/ui/interfaces";

import "./styles.scss";

import { select } from "d3";

import { debouncer, DebounceFunction } from "@equinor/videx-wellog";

import { WellLog } from "./WellLogTypes";
import { Template } from "./WellLogTemplateTypes";
import { ColorTable } from "./ColorTableTypes";

import { createTracks } from "../utils/tracks";
import { getScaleTrackNum, isScaleTrack } from "../utils/tracks";
import { AxesInfo } from "../utils/tracks";
import { ExtPlotOptions } from "../utils/tracks";

import { addOrEditGraphTrack, addOrEditGraphTrackPlot, removeGraphTrackPlot } from "../utils/tracks";
import { getPlotType } from "../utils/tracks";

import { TemplatePlot } from "./WellLogTemplateTypes";
import { TemplateTrack } from "./WellLogTemplateTypes";

import {
    removeOverlay,
    zoomContent,
    scrollContentTo,
    zoomContentTo,
    getContentDomain,
    getContentScrollPos,
    getContentZoom,
    scrollTracksTo,
    isTrackSelected,
    selectTrack,
} from "../utils/log-viewer";

function addRubberbandOverlay(instance: LogViewer, parent: WellLogView) {
    const rubberBandSize = 9;
    const offset = (rubberBandSize - 1) / 2;
    const rbelm = instance.overlay.create("rubber-band", {
        onMouseMove: (event: OverlayMouseMoveEvent) => {
            if (event.target) {
                if (parent.props.horizontal)
                    event.target.style.left = `${event.x - (offset + 0.5)}px`;
                else event.target.style.top = `${event.y - (offset + 0.5)}px`;
                event.target.style.visibility = "visible";

                const pinelms = document.getElementsByClassName("pinned");
                if (parent.selPinned !== undefined && pinelms) {
                    const pinelm = pinelms[0] as HTMLElement;
                    if (pinelm) {
                        const pinelm1 = pinelm.firstElementChild as HTMLElement;
                        if (parent.props.horizontal) {
                            if (parent.selPinned < event.x) {
                                const x = parent.selPinned - (offset + 0.5);
                                const w =
                                    event.x - parent.selPinned + rubberBandSize;
                                pinelm.style.width = `${w}px`;
                                pinelm.style.left = `${x}px`;

                                pinelm1.style.left = `${offset + 0.5}px`;
                                pinelm1.style.right = null;
                            } else {
                                const x = event.x - (offset + 0.5);
                                const w =
                                    parent.selPinned - event.x + rubberBandSize;
                                pinelm.style.width = `${w}px`;
                                pinelm.style.left = `${x}px`;

                                pinelm1.style.right = `${offset + 0.5}px`;
                                pinelm1.style.left = null;
                            }
                        } else {
                            if (parent.selPinned < event.y) {
                                const y = parent.selPinned - (offset + 0.5);
                                const h =
                                    event.y - parent.selPinned + rubberBandSize;
                                pinelm.style.height = `${h}px`;
                                pinelm.style.top = `${y}px`;

                                pinelm1.style.top = `${offset + 0.5}px`;
                                pinelm1.style.bottom = null;
                            } else {
                                const y = event.y - (offset + 0.5);
                                const h =
                                    parent.selPinned - event.y + rubberBandSize;
                                pinelm.style.height = `${h}px`;
                                pinelm.style.top = `${y}px`;

                                pinelm1.style.top = `${offset + 0.5}px`;
                                pinelm1.style.bottom = null;
                            }
                        }
                    }
                }
            }
            if (parent.props.horizontal) parent.selCurrent = event.x;
            else parent.selCurrent = event.y;
        },
        onMouseExit: (event: OverlayMouseExitEvent) => {
            if (event.target) {
                event.target.style.visibility = "hidden";
                /* does not exist ?
                if (instance.options.rubberbandExit) {
                    instance.options.rubberbandExit({
                        source: instance,
                    });
                }
                */
            }
        },
    });

    const rb = select(rbelm)
        .classed("rubber-band", true)
        .style(
            parent.props.horizontal ? "width" : "height",
            `${rubberBandSize}px`
        )
        .style(parent.props.horizontal ? "height" : "width", `${100}%`)
        .style("background-color", "rgba(255,0,0,0.1)")
        .style("visibility", "hidden");

    rb.append("div")
        .style(parent.props.horizontal ? "width" : "height", "1px")
        .style(parent.props.horizontal ? "height" : "width", `${100}%`)
        .style(parent.props.horizontal ? "left" : "top", `${offset}px`)
        .style("background-color", "rgba(255,0,0,0.7)")
        .style("position", "relative");
}

function addReadoutOverlay(instance: LogViewer, parent: WellLogView) {
    const elm = instance.overlay.create("depth", {
        onClick: (event: OverlayClickEvent): void => {
            const { caller, x, y } = event;
            const value = caller.scale.invert(parent.props.horizontal ? x : y);
            if (event.target) {
                event.target.textContent = Number.isFinite(value)
                    ? `Pinned MD: ${value.toFixed(1)}`
                    : "-";
                event.target.style.visibility = "visible";
            }
        },
        onMouseMove: (event: OverlayMouseMoveEvent): void => {
            const { caller, x, y } = event;
            const value = caller.scale.invert(parent.props.horizontal ? x : y);
            if (event.target) {
                event.target.textContent = Number.isFinite(value)
                    ? `MD: ${value.toFixed(1)}`
                    : "-";
                event.target.style.visibility = "visible";
            }

            const x2 = (
                caller.scaleHandler as InterpolatedScaleHandler
            ).interpolator.reverse(value);
            parent.onMouseMove(value, x2);
        },
        onMouseExit: (event: OverlayMouseExitEvent): void => {
            if (event.target) event.target.style.visibility = "hidden";
        },
        onRescale: (event: OverlayRescaleEvent): void => {
            if (event.target && event.transform) {
                // event.transform.k could be not valid after updateTracks();
                // so use getContentZoom(instance) to be consistent
                //console.log("zoom=", zoom, event.transform.k)

                parent.onContentRescale();

                event.target.style.visibility = "visible";
                event.target.textContent = `Zoom: x${event.transform.k.toFixed(
                    1
                )}`;
            }
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

function addPinnedValueOverlay(instance: LogViewer, parent: WellLogView) {
    const rubberBandSize = 9;
    const offset = (rubberBandSize - 1) / 2;
    const pinelm = instance.overlay.create("pinned", {
        onClick: (event: OverlayClickEvent): void => {
            const { x, y } = event;
            if (event.target) {
                if (event.target.style.visibility == "visible") {
                    event.target.style.visibility = "hidden";
                    parent.selPinned = undefined;
                    parent.onContentRescale();
                } else {
                    if (parent.props.horizontal)
                        event.target.style.left = `${x - (offset + 0.5)}px`;
                    else event.target.style.top = `${y - (offset + 0.5)}px`;
                    if (parent.props.horizontal)
                        event.target.style.width = `${rubberBandSize}px`;
                    else event.target.style.height = `${rubberBandSize}px`;
                    event.target.style.visibility = "visible";

                    const pinelm1 = pinelm.firstElementChild as HTMLElement;
                    if (parent.props.horizontal)
                        pinelm1.style.left = `${offset}px`;
                    else pinelm1.style.top = `${offset}px`;

                    if (parent.props.horizontal) parent.selPinned = event.x;
                    else parent.selPinned = event.y;
                }
            }
        },
        /* keep selection  onMouseExit: (event: OverlayMouseExitEvent): void => {
            if (event.target) event.target.style.visibility = "hidden";
        },*/
    });

    const pin = select(pinelm)
        .classed("pinned", true)
        .style(
            parent.props.horizontal ? "width" : "height",
            `${rubberBandSize}px`
        )
        .style(parent.props.horizontal ? "height" : "width", `${100}%`)
        .style(parent.props.horizontal ? "top" : "left", `${0}px`)
        .style("background-color", "rgba(0,0,0,0.1)")
        .style("position", "absolute")
        .style("visibility", "hidden");

    pin.append("div")
        .style(parent.props.horizontal ? "width" : "height", "1px")
        .style(parent.props.horizontal ? "height" : "width", `${100}%`)
        .style(parent.props.horizontal ? "left" : "top", `${offset}px`)
        .style("background-color", "rgba(0,255,0,0.7)")
        //.style("position", "relative");
        .style("position", "absolute");
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
                if (!i) return expand ? to[0] : Number.NaN;
                return (x - from[i]) * mul[i] + to[i];
            }
        }
        return expand ? to[n ? n - 1 : 0] : Number.NaN;
    };
}

function createScaleHandler(
    primaries: Float32Array,
    secondaries: Float32Array
) {
    const primary2secondary = createInterpolator(primaries, secondaries);
    const secondary2primary = createInterpolator(secondaries, primaries);

    const forward = (v: number): number => {
        // SecondaryAxis => PrimaryAxis
        return secondary2primary(v, false);
    };
    const reverse = (v: number): number => {
        // PrimaryAxis => SecondaryAxis
        return primary2secondary(v, false);
    };
    const interpolator: ScaleInterpolator = {
        forward,
        reverse,
        forwardInterpolatedDomain: (domain) =>
            domain.map((v) => secondary2primary(v, true)),
        reverseInterpolatedDomain: (domain) =>
            domain.map((v) => primary2secondary(v, true)),
    };
    return new InterpolatedScaleHandler(interpolator);
}

function getValue(
    x: number,
    data: [],
    type: string
): number /*|string for discrete?*/ {
    let v = Number.NaN;
    if (Number.isFinite(x)) {
        const n = data.length;
        for (let i = 0; i < n; i++) {
            const row = data[i];
            if (row[0] == null) continue;
            if (row[1] == null) continue;
            if (x < row[0]) {
                if (!i) break;
                else {
                    const rowPrev = data[i - 1];
                    if (rowPrev[0] == null || rowPrev[1] == null) break;
                    if (type === "linestep") {
                        v = row[1]; //!! not rowPrev[1] !!
                    } else {
                        const d = row[0] - rowPrev[0];
                        const f = x - rowPrev[0];
                        if (type === "dot") {
                            v = f < d * 0.5 ? rowPrev[1] : row[1];
                        } else {
                            // "line", "area", "gradientfill"
                            const mul = d ? (row[1] - rowPrev[1]) / d : 1.0;
                            v = f * mul + rowPrev[1];
                        }
                    }
                }
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
    template: Template, // JSON
    colorTables: ColorTable[] // JSON
) {
    const { tracks, minmaxPrimaryAxis, primaries, secondaries } = createTracks(
        welllog,
        axes,
        template.tracks,
        template.styles,
        colorTables
    );
    logController.reset();
    const scaleHandler = createScaleHandler(primaries, secondaries);
    logController.scaleHandler = scaleHandler;
    logController.domain = minmaxPrimaryAxis;
    logController.setTracks(tracks);
}

function addTrackEventListner(
    type: /*string, */ "click" | "contextmenu" | "dblclick",
    area: /*string, */ "title" | "legend" | "container",
    element: HTMLElement,
    track: Track,
    func: (ev: TrackEvent) => void
): void {
    element.addEventListener(type, (ev: Event) => {
        const plot: Plot | null = null; ///!!
        func({
            track: track,
            plot: plot,
            element: element,
            ev: ev,
            type: type,
            area: area,
        });
        ev.preventDefault();
    });
}

const types: ("contextmenu" | "click" | "dblclick")[] = [
    "contextmenu",
    "click",
    "dblclick",
];
const areas: ("title" | "legend" | "container")[] = [
    "title",
    "legend",
    "container",
];
function addTrackEventHandlers(
    elm: HTMLElement,
    track: Track,
    func: (ev: TrackEvent) => void
): void {
    for (const area of areas) {
        const elements = elm.getElementsByClassName("track-" + area);
        for (const element of elements)
            for (const type of types)
                addTrackEventListner(
                    type,
                    area,
                    element as HTMLElement,
                    track,
                    func
                );
    }
}

import ReactDOM from "react-dom";
import { PlotPropertiesDialog } from "./PlotDialog";
import { TrackPropertiesDialog } from "./TrackDialog";
import { DifferentialPlotLegendInfo } from "@equinor/videx-wellog/dist/plots/legend/interfaces";
import { DifferentialPlotOptions } from "@equinor/videx-wellog/dist/plots/interfaces";

function addPlot(
    parent: HTMLElement,
    wellLogView: WellLogView,
    track: Track
): void {
    const el: HTMLElement = document.createElement("div");
    el.style.width = "10px";
    el.style.height = "13px";
    parent.appendChild(el);

    ReactDOM.render(
        <PlotPropertiesDialog
            wellLogView={wellLogView}
            track={track}
            onOK={wellLogView.addTrackPlot.bind(wellLogView, track)}
        />,
        el
    );
}

function fillTemplatePlot(plot: Plot): TemplatePlot {
    const options = plot.options as ExtPlotOptions;
    const optionsDifferential = plot.options as DifferentialPlotOptions; // DifferentialPlot - 2 series!
    const options1 = optionsDifferential.serie1;
    const options2 = optionsDifferential.serie2;

    const legend = options.legendInfo();
    const legendDifferential = legend as DifferentialPlotLegendInfo; // DifferentialPlot - 2 series!
    const legend1 = legendDifferential.serie1;
    const legend2 = legendDifferential.serie2;

    return {
        style: "", // No style for this full Plot options.
        type: getPlotType(plot),
        scale: options.scale,
        name: (legend1 && legend1.label ? legend1.label : legend.label) || "",
        name2: legend2 && legend2.label ? legend2.label : "",
        color: (options1 ? options1.color : options.color) || "",
        color2: options2 ? options2.color : "",
        inverseColor: options.inverseColor || "",
        fill: (options1 ? options1.fill : options.fill) || "",
        fill2: options2 ? options2.fill : "",
        colorTable: options.colorTable ? options.colorTable.name : "",
        inverseColorTable: options.inverseColorTable
            ? options.inverseColorTable.name
            : "",
    };
}

function editPlot(
    parent: HTMLElement,
    wellLogView: WellLogView,
    track: Track,
    plot: Plot
): void {
    const el: HTMLElement = document.createElement("div");
    el.style.width = "10px";
    el.style.height = "13px";
    parent.appendChild(el);

    const templatePlot = fillTemplatePlot(plot);

    ReactDOM.render(
        <PlotPropertiesDialog
            templatePlot={templatePlot}
            wellLogView={wellLogView}
            track={track}
            onOK={wellLogView._editTrackPlot.bind(wellLogView, track, plot)}
        />,
        el
    );
}

function fillTemplateTrack(track: Track): TemplateTrack {
    const options = track.options;

    return {
        title: options.label ? options.label : "",
        plots: [],
    };
}

export function addTrack(
    parent: HTMLElement,
    wellLogView: WellLogView,
    trackCurrent: Track
): void {
    const el: HTMLElement = document.createElement("div");
    el.style.width = "10px";
    el.style.height = "13px";
    parent.appendChild(el);

    ReactDOM.render(
        <TrackPropertiesDialog
            wellLogView={wellLogView}
            onOK={wellLogView._addTrack.bind(wellLogView, trackCurrent)}
        />,
        el
    );
}

export function editTrack(
    parent: HTMLElement,
    wellLogView: WellLogView,
    track: Track
): void {
    const el: HTMLElement = document.createElement("div");
    el.style.width = "10px";
    el.style.height = "13px";
    parent.appendChild(el);

    const templateTrack = fillTemplateTrack(track);

    ReactDOM.render(
        <TrackPropertiesDialog
            templateTrack={templateTrack}
            wellLogView={wellLogView}
            onOK={wellLogView._editTrack.bind(wellLogView, track)}
        />,
        el
    );
}

function fillInfos(
    x: number,
    x2: number,
    tracks: Track[],
    iFrom: number,
    iTo: number
): Info[] {
    const infos: Info[] = [];
    let iPlot = 0;
    let bSeparatorCreated = false;
    let iTrack = 0;
    for (const track of tracks) {
        const bScaleTrack = isScaleTrack(track);
        const visible = (iFrom <= iTrack && iTrack < iTo) || bScaleTrack;
        if (visible) {
            if (!bScaleTrack) {
                if (!bSeparatorCreated) {
                    // Add separator line
                    infos.push({
                        color: "", // dummy value
                        value: Number.NaN, // dummy value
                        type: "separator",
                        track_id: track.id,
                    });
                    bSeparatorCreated = true;
                }
                for (const plot of (track as GraphTrack).plots) {
                    const type = getPlotType(plot);
                    let data = plot.data;
                    if (type === "differential") data = plot.data[0]; // DifferentialPlot has 2 arrays of data pairs

                    const options = plot.options as ExtPlotOptions;
                    const optionsDifferential =
                        plot.options as DifferentialPlotOptions; // DifferentialPlot - 2 series!
                    const options1 = optionsDifferential.serie1;
                    const options2 = optionsDifferential.serie2;

                    const legend = options.legendInfo();
                    const legendDifferential =
                        legend as DifferentialPlotLegendInfo; // DifferentialPlot - 2 series!
                    const legend1 = legendDifferential.serie1;
                    const legend2 = legendDifferential.serie2;

                    infos.push({
                        name: legend1 ? legend1.label : legend.label,
                        units: legend1 ? legend1.unit : legend.unit,
                        color:
                            (options1 ? options1.color : options.color) || "",
                        value: getValue(x, data, type),
                        type: type,
                        track_id: track.id,
                    });
                    iPlot++;

                    if (type === "differential") {
                        data = plot.data[1];
                        infos.push({
                            name: legend2.label,
                            units: legend2.unit,
                            color:
                                (options2 ? options2.color : options.color) ||
                                "",
                            value: getValue(x, data, type),
                            type: type,
                            track_id: "_" + track.id,
                        });
                        iPlot++;
                    }
                }
            } else {
                const _x = iPlot == 0 ? x : x2;
                infos.push({
                    name: track.options.abbr,
                    units: (track.options as ScaleTrackOptions)["units"],
                    color: iPlot == 0 ? "black" : "grey", //??
                    value: _x,
                    type: "", // "scale"
                    track_id: track.id,
                });
                iPlot++;
            }
        }
        if (!bScaleTrack) iTrack++;
    }
    return infos;
}

export interface TrackEvent {
    track: Track;
    type: /*string, */ "click" | "contextmenu" | "dblclick";
    area: /*string, */ "title" | "legend" | "container";
    plot: Plot | null;
    element: HTMLElement;
    ev: /*Mouse*/ Event;
}

export interface WellLogController {
    zoomContentTo(domain: [number, number]): boolean;
    scrollContentTo(f: number): boolean; // fraction of content
    zoomContent(zoom: number): void;
    getContentDomain(): [number, number];
    getContentScrollPos(): number; // fraction of content
    getContentZoom(): number;
    getContentSelection(): [number | undefined, number | undefined]; // [current, pinned]

    scrollTrackTo(pos: number): boolean;
    scrollTrackBy(delta: number): void;
    getTrackScrollPos(): number;
    getTrackScrollPosMax(): number;
    getTrackZoom(): number;
}

import { Info } from "./InfoTypes";

interface Props {
    welllog: WellLog;
    template: Template;
    colorTables: ColorTable[];
    horizontal?: boolean;
    primaryAxis: string;

    axisTitles: Record<string, string>;
    axisMnemos: Record<string, string[]>;

    maxTrackNum?: number; // default is horizontal ? 3: 5
    maxContentZoom?: number; // default is 256

    // current view position:
    scrollTrackPos?: number; // the first track number

    // callbacks:
    onCreateController?: (controller: WellLogController) => void;
    onInfo?: (infos: Info[]) => void;

    onTrackScroll?: () => void; // called when track scrolling are changed
    onContentRescale?: () => void; // called when content zoom and scrolling are changed

    onTrackEvent?: (wellLogView: WellLogView, ev: TrackEvent) => void;
}

interface State {
    infos: Info[];

    scrollTrackPos: number; // the first visible graph track number
}

class WellLogView extends Component<Props, State> implements WellLogController {
    container?: HTMLElement;
    logController?: LogViewer;
    debounce: DebounceFunction;
    selCurrent: number | undefined; // current mouse position
    selPinned: number | undefined; // pinned position

    constructor(props: Props) {
        super(props);

        this.container = undefined;
        this.logController = undefined;
        this.debounce = debouncer(50);
        this.selCurrent = undefined;
        this.selPinned = undefined;

        this.state = {
            infos: [],
            scrollTrackPos: props.scrollTrackPos ? props.scrollTrackPos : 0,
        };

        this.onTrackEvent = this.onTrackEvent.bind(this);

        if (this.props.onCreateController) {
            // set callback to component's caller
            this.props.onCreateController(this);
        }
    }

    componentDidMount(): void {
        this.createLogViewer();
        this.setTracks();
    }
    shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
        if (this.props.horizontal !== nextProps.horizontal) return true;
        if (this.props.welllog !== nextProps.welllog) return true;
        if (this.props.template !== nextProps.template) return true;
        if (this.props.colorTables !== nextProps.colorTables) return true;
        if (this.props.primaryAxis !== nextProps.primaryAxis) return true;
        if (this.props.axisTitles !== nextProps.axisTitles) return true;
        if (this.props.axisMnemos !== nextProps.axisMnemos) return true;

        if (this.props.maxTrackNum !== nextProps.maxTrackNum) return true;
        if (this.props.scrollTrackPos !== nextProps.scrollTrackPos) return true;
        if (this.state.scrollTrackPos !== nextState.scrollTrackPos) return true;

        if (this.props.maxContentZoom !== nextProps.maxContentZoom) return true;

        // callbacks

        return false;
    }
    componentDidUpdate(prevProps: Props, prevState: State): void {
        // Typical usage (don't forget to compare props):
        if (this.props.onCreateController !== prevProps.onCreateController) {
            if (this.props.onCreateController)
                // update callback to component's caller
                this.props.onCreateController(this);
        }

        let shouldSetTracks = false;
        if (
            this.props.horizontal !== prevProps.horizontal ||
            this.props.maxContentZoom !== prevProps.maxContentZoom
        ) {
            this.createLogViewer();
            shouldSetTracks = true;
        }

        if (this.props.welllog !== prevProps.welllog) {
            shouldSetTracks = true;
        } else if (this.props.template !== prevProps.template) {
            shouldSetTracks = true;
        } else if (this.props.colorTables !== prevProps.colorTables) {
            shouldSetTracks = true; // force to repaint
        } else if (this.props.primaryAxis !== prevProps.primaryAxis) {
            shouldSetTracks = true;
        } else if (
            this.props.axisTitles !== prevProps.axisTitles ||
            this.props.axisMnemos !== prevProps.axisMnemos
        ) {
            shouldSetTracks = true;
        }

        if (shouldSetTracks) {
            this.setTracks();
        } else if (this.props.scrollTrackPos !== prevProps.scrollTrackPos) {
            this.scrollTrackTo(
                this.props.scrollTrackPos ? this.props.scrollTrackPos : 0
            );
        } else if (
            this.state.scrollTrackPos !== prevState.scrollTrackPos ||
            this.props.maxTrackNum !== prevProps.maxTrackNum
        ) {
            this.onTrackScroll();
            this.setInfo();
        }
    }

    createLogViewer(): void {
        if (this.logController) {
            // remove old LogViewer
            this.logController.reset(); // clear UI
            this.logController.onUnmount(); //?
            removeOverlay(this.logController); // we should remove it because LogViewer do not delete it
            this.logController = undefined;
        }
        if (this.container) {
            // create new LogViewer
            this.logController = new LogViewer({
                showLegend: true,
                horizontal: this.props.horizontal,
                maxZoom: this.props.maxContentZoom,
                onTrackEnter: (elm: HTMLElement, track: Track) =>
                    addTrackEventHandlers(elm, track, this.onTrackEvent),
            });

            this.logController.init(this.container);

            addReadoutOverlay(this.logController, this);
            addRubberbandOverlay(this.logController, this);
            addPinnedValueOverlay(this.logController, this);
        }
        this.setInfo();
    }
    getAxesInfo(): AxesInfo {
        return {
            primaryAxis: this.props.primaryAxis,
            secondaryAxis:
                this.props.template &&
                this.props.template.scale &&
                this.props.template.scale.allowSecondary
                    ? this.props.primaryAxis == "md"
                        ? "tvd"
                        : "md"
                    : "",
            titles: this.props.axisTitles,
            mnemos: this.props.axisMnemos,
        };
    }

    setTracks(): void {
        if (this.logController) {
            const axes = this.getAxesInfo();
            setTracksToController(
                this.logController,
                axes,
                this.props.welllog,
                this.props.template,
                this.props.colorTables
            );
        }
        this.onTrackScroll();
        this.setInfo(); // Clear old track information
    }

    /** 
      Display current state of track scrolling
      */
    onTrackScroll(): void {
        const iFrom = this.getTrackScrollPos();
        const iTo = iFrom + this._maxTrackNum();
        if (this.logController) scrollTracksTo(this.logController, iFrom, iTo);

        if (this.props.onTrackScroll) this.props.onTrackScroll();
    }
    setInfo(x: number = Number.NaN, x2: number = Number.NaN): void {
        if (!this.props.onInfo) return; // no callback is given
        if (!this.logController) return; // not initialized yet

        const iFrom = this.getTrackScrollPos();
        const iTo = iFrom + this._maxTrackNum();
        const infos = fillInfos(x, x2, this.logController.tracks, iFrom, iTo);
        this.props.onInfo(infos);
    }

    onMouseMove(x: number, x2: number): void {
        this.setInfo(x, x2);

        this.onContentRescale();
    }

    onContentRescale(): void {
        // use debouncer to prevent too frequent notifications while animation
        this.debounce(() => {
            if (this.props.onContentRescale) this.props.onContentRescale();
        });
    }

    onTrackEvent(ev: TrackEvent): void {
        if (this.props.onTrackEvent) this.props.onTrackEvent(this, ev);
    }

    // content
    zoomContentTo(domain: [number, number]): boolean {
        if (this.logController)
            return zoomContentTo(this.logController, domain);
        return false;
    }
    scrollContentTo(f: number): boolean {
        if (this.logController) return scrollContentTo(this.logController, f);
        return false;
    }
    zoomContent(zoom: number): boolean {
        if (this.logController) return zoomContent(this.logController, zoom);
        return false;
    }
    getContentDomain(): [number, number] {
        if (this.logController) return getContentDomain(this.logController);
        return [0.0, 0.0];
    }
    getContentScrollPos(): number {
        if (this.logController) return getContentScrollPos(this.logController);
        return 0.0;
    }
    getContentZoom(): number {
        if (this.logController) return getContentZoom(this.logController);
        return 1.0;
    }
    getContentSelection(): [number | undefined, number | undefined] {
        if (!this.logController) return [undefined, undefined];
        let current = this.selCurrent;
        let pinned = this.selPinned;

        if (current !== undefined)
            current = this.logController.scale.invert(current);
        if (pinned !== undefined)
            pinned = this.logController.scale.invert(pinned);
        return [current, pinned];
    }

    // tracks
    _graphTrackMax(): number {
        // for scrollbar
        if (!this.logController) return 0;
        const nScaleTracks = getScaleTrackNum(this.logController.tracks);
        return this.logController.tracks.length - nScaleTracks;
    }
    _newTrackScrollPos(pos: number): number {
        let newPos = pos;
        const posMax = this.getTrackScrollPosMax();
        if (newPos > posMax) newPos = posMax;
        if (newPos < 0) newPos = 0;
        return newPos;
    }
    _maxTrackNum(): number {
        return this.props.maxTrackNum
            ? this.props.maxTrackNum
            : 6 /*some default value*/;
    }

    scrollTrackBy(delta: number): void {
        this.setState((prevState: State) => ({
            scrollTrackPos: this._newTrackScrollPos(
                prevState.scrollTrackPos + delta
            ),
        }));
    }

    scrollTrackTo(pos: number): boolean {
        const newPos = this._newTrackScrollPos(pos);
        if (this.state.scrollTrackPos == newPos) return false;
        this.setState({ scrollTrackPos: newPos });
        return true;
    }
    getTrackScrollPos(): number {
        return this.state.scrollTrackPos;
    }
    getTrackScrollPosMax(): number {
        // for scrollbar
        const nGraphTracks = this._graphTrackMax();
        let posMax = nGraphTracks - this._maxTrackNum();
        if (posMax < 0) posMax = 0;
        return posMax;
    }
    getTrackZoom(): number {
        return this._graphTrackMax() / this._maxTrackNum();
    }

    // editting

    __addTrack(trackNew: Track, trackCurrent: Track, bAfter: boolean): void {
        if (this.logController) {
            let order = 0;
            for (const track of this.logController.tracks) {
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

            this.logController.addTrack(trackNew);
            if (bAfter)
                // force new track to be visible when added after the current
                this.scrollTrackBy(+1);
            else {
                this.onTrackScroll();
                this.setInfo();
            }
        }
    }

    _addTrack(trackCurrent: Track, templateTrack: TemplateTrack): void {
        const bAfter = true;
        const trackNew = addOrEditGraphTrack(this, null, templateTrack, trackCurrent, bAfter);

        if (bAfter)
            // force new track to be visible when added after the current
            this.scrollTrackBy(+1);
        else {
            this.onTrackScroll();
            this.setInfo();
        }
        this.selectTrack(trackNew, true);
    }

    _editTrack(track: Track, templateTrack: TemplateTrack): void {
        addOrEditGraphTrack(this, track as GraphTrack, templateTrack, track, false);
        this.setInfo();
    }

    removeTrack(track: Track): void {
        if (this.logController) {
            this.logController.removeTrack(track);

            this.onTrackScroll();
            this.setInfo();
        }
    }

    isTrackSelected(track: Track): boolean {
        return (
            !!this.logController && isTrackSelected(this.logController, track)
        );
    }

    selectTrack(track: Track, selected: boolean): void {
        if (this.logController)
            for (const _track of this.logController.tracks) {
                // single selection: remove selection from another tracks
                selectTrack(
                    this.logController,
                    _track,
                    selected && track === _track
                );
            }
    }

    addTrackPlot(track: Track, templatePlot: TemplatePlot): void {
        addOrEditGraphTrackPlot(this, track as GraphTrack, null, templatePlot);
        this.setInfo();
    }

    _editTrackPlot(track: Track, plot: Plot, templatePlot: TemplatePlot): void {
        addOrEditGraphTrackPlot(this, track as GraphTrack, plot, templatePlot);
        this.setInfo();
    }

    removeTrackPlot(track: Track, plot: Plot): void {
        removeGraphTrackPlot(this, track as GraphTrack, plot);
        this.setInfo();
    }

    // Dialog functions
    addTrack(parent: HTMLElement | null, trackCurrent: Track): void {
        if (parent) addTrack(parent, this, trackCurrent);
    }
    editTrack(parent: HTMLElement | null, track: Track): void {
        if (parent) editTrack(parent, this, track);
    }
    addPlot(parent: HTMLElement | null, track: Track): void {
        if (parent) addPlot(parent, this, track);
    }
    editPlot(parent: HTMLElement | null, track: Track, plot: Plot): void {
        if (parent) editPlot(parent, this, track, plot);
    }

    render(): ReactNode {
        return (
            <div style={{ width: "100%", height: "100%" }}>
                <div
                    className="welllogview"
                    ref={(el) => {
                        this.container = el as HTMLElement;
                    }}
                />
            </div>
        );
    }
}

export default WellLogView;
