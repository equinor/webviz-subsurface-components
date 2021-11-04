import React, { Component, ReactNode } from "react";
import { LogViewer } from "@equinor/videx-wellog";

import {
    InterpolatedScaleHandler,
    ScaleInterpolator,
} from "@equinor/videx-wellog";

import { Track, GraphTrack } from "@equinor/videx-wellog";

import { ScaleTrackOptions } from "@equinor/videx-wellog/dist/tracks/scale/interfaces";

import {
    OverlayClickEvent,
    OverlayMouseMoveEvent,
    OverlayMouseExitEvent,
    OverlayRescaleEvent,
    //LogControllerResizeEvent,
} from "@equinor/videx-wellog/dist/ui/interfaces";

import "./styles.scss";

import { select } from "d3";

import { WellLog } from "./WellLogTypes";
import { Template } from "./WellLogTemplateTypes";
import { ColorTable } from "./ColorTableTypes";

import { createTracks } from "../utils/tracks";
import { getScaleTrackNum, isScaleTrack } from "../utils/tracks";
import { AxesInfo } from "../utils/tracks";
import { ExtPlotOptions } from "../utils/tracks";

import {
    addGraphTrackPlot,
    editGraphTrackPlot,
    removeGraphTrackPlot,
} from "../utils/tracks";
import { getPlotType } from "../utils/tracks";

import { TemplatePlot } from "./WellLogTemplateTypes";

import {
    removeOverlay,
    zoomContent,
    scrollContentTo,
    getContentScrollPos,
    getContentZoom,
    scrollTracks,
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
            }
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
                const pos = getContentScrollPos(instance);
                parent.onRescaleContent(pos, event.transform.k);

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
    const rbelm = instance.overlay.create("pinned", {
        onClick: (event: OverlayClickEvent): void => {
            const { x, y } = event;
            if (event.target) {
                if (parent.props.horizontal)
                    event.target.style.left = `${x - (offset + 0.5)}px`;
                else event.target.style.top = `${y - (offset + 0.5)}px`;
                event.target.style.visibility = "visible";
            }
        },
        onMouseExit: (event: OverlayMouseExitEvent): void => {
            if (event.target) event.target.style.visibility = "hidden";
        },
    });

    const rb = select(rbelm)
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

    rb.append("div")
        .style(parent.props.horizontal ? "width" : "height", "1px")
        .style(parent.props.horizontal ? "height" : "width", `${100}%`)
        .style(parent.props.horizontal ? "left" : "top", `${offset}px`)
        .style("background-color", "rgba(0,255,0,0.7)")
        .style("position", "relative");
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
            domain.map((v) => /*forward(v)*/ secondary2primary(v, true)),
        reverseInterpolatedDomain: (domain) =>
            domain.map((v) => /*reverse(v)*/ primary2secondary(v, true)),
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
                        v = row[1]; //!! not rPrev[1] !!
                    } else {
                        const d = row[0] - rowPrev[0];
                        const f = x - rowPrev[0];
                        if (type === "dot") {
                            v = f < d * 0.5 ? rowPrev[1] : row[1];
                        } else {
                            // "line", "area"
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

function addTrackContextMenu(
    element: HTMLElement,
    track: Track,
    func: (ev: TrackEvent) => void
): void {
    element.addEventListener("contextmenu", (ev: MouseEvent) => {
        func({ track: track, element: element, ev: ev });
        ev.preventDefault();
    });
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
            const datas = track.data;
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
                const nPlots = (track as GraphTrack).plots.length;
                for (let p = 0; p < nPlots; p++) {
                    const plot = (track as GraphTrack).plots[p];
                    const type = getPlotType(plot);
                    const v = getValue(x, datas[p], type);
                    const legend = (
                        plot.options as ExtPlotOptions
                    ).legendInfo();
                    infos.push({
                        name: legend.label,
                        units: legend.unit,
                        color: plot.options.color ? plot.options.color : "",
                        value: v,
                        type: type,
                        track_id: track.id,
                    });
                    iPlot++;
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

interface TrackEvent {
    track: Track;
    element: HTMLElement;
    ev: MouseEvent;
}

export interface WellLogController {
    scrollTrackTo(pos: number): boolean;
    getTrackScrollPos(): number;
    getTrackScrollPosMax(): number;

    _graphTrackMax(): number;
    _maxTrackNum(): number;

    scrollContentTo(f: number): boolean;
    zoomContent(zoom: number): void;
    getContentScrollPos(): number;
    getContentZoom(): number;
}

import { Info } from "./InfoTypes";

interface Props {
    welllog: WellLog;
    template: Template;
    colorTables: ColorTable[];
    horizontal?: boolean;
    primaryAxis: string;
    //setAvailableAxes : (scales: string[]) => void;
    axisTitles: Record<string, string>;
    axisMnemos: Record<string, string[]>;

    maxTrackNum?: number;
    scrollTrackPos?: number; // the first track number

    onInfo?: (infos: Info[]) => void;
    onCreateController?: (controller: WellLogController) => void;

    onLocalMenuTitle?: (
        parent: HTMLElement,
        track: Track,
        wellLogView: WellLogView
    ) => void;
    onLocalMenuLegend?: (
        parent: HTMLElement,
        track: Track,
        wellLogView: WellLogView
    ) => void;
    onLocalMenuContainer?: (
        parent: HTMLElement,
        track: Track,
        wellLogView: WellLogView
    ) => void;

    onScrollTrackPos?: (pos: number) => void;
    onZoomContent?: (zoom: number) => void;
    onScrollContentPos?: (pos: number) => void;
}

interface State {
    infos: Info[];

    scrollTrackPos: number; // the first track number
}

class WellLogView extends Component<Props, State> implements WellLogController {
    container?: HTMLElement;
    logController?: LogViewer;

    constructor(props: Props) {
        super(props);
        //alert("props=" + props)

        this.container = undefined;
        this.logController = undefined;

        this.state = {
            infos: [],
            scrollTrackPos: props.scrollTrackPos ? props.scrollTrackPos : 0,
        };

        this.onTrackTitleContextMenu = this.onTrackTitleContextMenu.bind(this);
        this.onTrackLegendContextMenu =
            this.onTrackLegendContextMenu.bind(this);
        this.onTrackContainerContextMenu =
            this.onTrackContainerContextMenu.bind(this);

        if (this.props.onCreateController)
            // set callback to component caller
            this.props.onCreateController(this);
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
        if (this.props.scrollTrackPos !== nextProps.scrollTrackPos) return true;

        if (this.props.maxTrackNum !== nextProps.maxTrackNum) return true;
        if (this.state.scrollTrackPos !== nextState.scrollTrackPos) return true;

        return false;
    }
    componentDidUpdate(prevProps: Props, prevState: State): void {
        // Typical usage (don't forget to compare props):
        let shouldSetTracks = false;
        if (this.props.horizontal !== prevProps.horizontal) {
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

        //console.log("WellLogView.componentDidUpdate shouldSetTracks=" + shouldSetTracks);
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
            this.scrollTrack();
            this.setInfo();
        }

        /*??
        if (this.props.onCreateController !== prevProps.onCreateController) {
            if (this.props.onCreateController) // set callback to component caller
                this.props.onCreateController(this);
        }*/
    }

    createLogViewer(): void {
        if (this.logController) {
            // remove old LogViewer
            this.logController.reset(); // clear UI
            this.logController.onUnmount(); //?
            removeOverlay(this.logController);
            this.logController = undefined;
        }
        if (this.container) {
            // create new LogViewer
            const addTrackContextMenus = this.addTrackContextMenus.bind(this);
            this.logController = new LogViewer({
                showLegend: true,
                horizontal: this.props.horizontal,

                /*
                onResize: function (event: LogControllerResizeEvent): void {
                    console.log("onResize", event);
                },
                */
                onTrackEnter: function (elm: HTMLElement, track: Track): void {
                    addTrackContextMenus(elm, track);
                },
                /* never called 
                onTrackUpdate: function (elm: HTMLElement, track: Track): void {
                },
                */
                // TODO: how to use it?  onTrackExit: function (): void {},
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
        this.scrollTrack();
        this.setInfo(); // Clear old track information
    }

    addGraphTrackPlot(track: GraphTrack, templatePlot: TemplatePlot): void {
        addGraphTrackPlot(this, track, templatePlot);
        if (this.logController) this.logController.updateTracks();
        this.setInfo();
    }

    editGraphTrackPlot(
        track: GraphTrack,
        name: string,
        templatePlot: TemplatePlot
    ): void {
        editGraphTrackPlot(this, track, name, templatePlot);
        if (this.logController) this.logController.updateTracks();
        this.setInfo();
    }

    removeGraphTrackPlot(track: GraphTrack, name: string): void {
        removeGraphTrackPlot(this, track, name);
        if (this.logController) this.logController.updateTracks();
        this.setInfo();
    }

    scrollTrack(): void {
        /*
        const nGraphTracks = this._graphTrackMax();
        let zoom = nGraphTracks / this._maxTrackNum();
        if (zoom < 1) zoom = 1;
        */

        const iFrom = this._newTrackScrollPos(this.state.scrollTrackPos);
        const iTo = iFrom + this._maxTrackNum();
        if (this.logController) scrollTracks(this.logController, iFrom, iTo);

        if (this.props.onScrollTrackPos) this.props.onScrollTrackPos(iFrom);
    }
    setInfo(x: number = Number.NaN, x2: number = Number.NaN): void {
        if (!this.props.onInfo) return; // no callback is given
        if (!this.logController) return;

        const iFrom = this._newTrackScrollPos(this.state.scrollTrackPos);
        const iTo = iFrom + this._maxTrackNum();
        const infos = fillInfos(x, x2, this.logController.tracks, iFrom, iTo);
        this.props.onInfo(infos);
    }

    onMouseMove(x: number, x2: number): void {
        this.setInfo(x, x2);
    }

    onRescaleContent(pos: number, zoom: number): void {
        if (this.props.onZoomContent) this.props.onZoomContent(zoom);

        if (this.props.onScrollContentPos) this.props.onScrollContentPos(pos);
    }

    _addTrackContextMenu(
        elm: HTMLElement,
        className: string,
        func: (ev: TrackEvent) => void,
        track: Track
    ): void {
        if (!this.logController || !this.logController.container) return;
        const elements = elm.getElementsByClassName(className);
        for (const element of elements) {
            addTrackContextMenu(element as HTMLElement, track, func);
        }
    }

    addTrackContextMenus(elm: HTMLElement, track: Track): void {
        this._addTrackContextMenu(
            elm,
            "track-title",
            this.onTrackTitleContextMenu,
            track
        );
        this._addTrackContextMenu(
            elm,
            "track-legend",
            this.onTrackLegendContextMenu,
            track
        );
        this._addTrackContextMenu(
            elm,
            "track-container",
            this.onTrackContainerContextMenu,
            track
        );
    }
    onTrackTitleContextMenu(ev: TrackEvent): void {
        if (this.logController && this.props.onLocalMenuTitle)
            this.props.onLocalMenuTitle(ev.element, ev.track, this);
    }
    onTrackLegendContextMenu(ev: TrackEvent): void {
        if (this.logController && this.props.onLocalMenuLegend)
            this.props.onLocalMenuLegend(ev.element, ev.track, this);
    }
    onTrackContainerContextMenu(ev: TrackEvent): void {
        if (this.logController && this.props.onLocalMenuContainer)
            this.props.onLocalMenuContainer(ev.element, ev.track, this);
    }

    _graphTrackMax(): number {
        // for scrollbar
        if (!this.logController) return 0;
        const nScaleTracks = getScaleTrackNum(this.logController.tracks);
        return this.logController.tracks.length - nScaleTracks;
    }
    _getTrackScrollPosMax(): number {
        // for scrollbar
        const nGraphTracks = this._graphTrackMax();
        let posMax = nGraphTracks - this._maxTrackNum();
        if (posMax < 0) posMax = 0;
        return posMax;
    }
    _newTrackScrollPos(pos: number): number {
        let newPos = pos;
        const posMax = this._getTrackScrollPosMax();
        if (newPos > posMax) newPos = posMax;
        if (newPos < 0) newPos = 0;
        return newPos;
    }
    _maxTrackNum(): number {
        return this.props.maxTrackNum
            ? this.props.maxTrackNum
            : 7 /*some default value*/;
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
        return this._getTrackScrollPosMax();
    }

    scrollContentTo(f: number): boolean {
        if (this.logController) {
            const ret = scrollContentTo(this.logController, f);
            console.log("WellLogView::scrollContentTo(" + f + ")=" + ret);
            return ret;
        }
        return false;
    }
    zoomContent(zoom: number): boolean {
        if (this.logController) {
            const ret = zoomContent(this.logController, zoom);
            console.log("WellLogView::zoomContent(" + zoom + ")=" + ret);
            return ret;
        }
        return false;
    }
    getContentScrollPos(): number {
        if (this.logController) {
            return getContentScrollPos(this.logController);
        }
        return 0.0;
    }

    getContentZoom(): number {
        if (this.logController) {
            return getContentZoom(this.logController);
        }
        return 1.0;
    }

    addTrack(trackNew: Track, trackCurrent: Track, bAfter: boolean): void {
        console.log("addTrack");
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

            this.scrollTrack();
        }
    }

    removeTrack(track: Track): void {
        console.log("removeTrack");
        if (this.logController) {
            this.logController.removeTrack(track);

            this.scrollTrack();
        }
    }

    render(): ReactNode {
        console.log("WellLogView.render");
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
