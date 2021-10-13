import React, { Component, ReactNode } from "react";
import { LogViewer } from "@equinor/videx-wellog";

import {
    InterpolatedScaleHandler,
    ScaleInterpolator,
} from "@equinor/videx-wellog";

import {
    Track,
    GraphTrack /*, ScaleTrack, DualScaleTrack*/,
} from "@equinor/videx-wellog";

import { ScaleTrackOptions } from "@equinor/videx-wellog/dist/tracks/scale/interfaces";
import { GraphTrackOptions } from "@equinor/videx-wellog/dist/tracks/graph/interfaces";

import {
    OverlayClickEvent,
    OverlayMouseMoveEvent,
    OverlayMouseExitEvent,
    OverlayRescaleEvent,
    LogControllerResizeEvent,
} from "@equinor/videx-wellog/dist/ui/interfaces";

import "./styles.scss";

import { select } from "d3";

import Scroller from "./Scroller";
import { WellLog } from "./WellLogTypes";
import { Template } from "./WellLogTemplateTypes";

import { createTracks } from "../utils/tracks";
import { newGraphTrack } from "../utils/tracks";
import { getScaleTrackNum, isScaleTrack } from "../utils/tracks";
import { AxesInfo } from "../utils/tracks";
import { ExtPlotOptions } from "../utils/tracks";
import { addTrackPlot, removeTrackPlot } from "../utils/tracks";

import {
    removeOverlay,
    setZoom,
    scrollContentTo,
    scrollTracks,
} from "../utils/log-viewer";

import ReactDOM from "react-dom";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

interface SimpleMenuProps {
    anchorEl: HTMLElement;
    wellLogView: WellLogView;
    track: Track;
    type: string;
    plotName?: string;
}
interface SimpleMenuState {
    anchorEl: HTMLElement | null;
}

class SimpleMenu extends Component<SimpleMenuProps, SimpleMenuState> {
    constructor(props: SimpleMenuProps) {
        super(props);
        this.state = { anchorEl: this.props.anchorEl };

        this.addTrack = this.addTrack.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
    }
    componentDidUpdate(prevProps: SimpleMenuProps) {
        if (this.props.anchorEl !== prevProps.anchorEl) {
            this.setState({ anchorEl: this.props.anchorEl });
        }
        /*if (
            this.props.welllog !== prevProps.welllog ||
            this.props.track !== prevProps.track
        ) {
        }*/
    }

    closeMenu() {
        this.setState({ anchorEl: null });
    }

    handleContextMenu(ev: React.MouseEvent<HTMLElement>) {
        ev.preventDefault();
        this.closeMenu();
    }
    handleCloseMenu(ev: React.MouseEvent<HTMLElement>) {
        ev;
        this.closeMenu();
    }
    handleClickItem(action?: () => void) {
        if (action) action();
        this.closeMenu();
    }

    createAddPlotMenuItem(item: string, parent: HTMLElement | null): ReactNode {
        return (
            <MenuItem
                key={item}
                onClick={() => {
                    this.handleClickItem(this.addPlot.bind(this, item, parent));
                }}
            >
                &nbsp;&nbsp;&nbsp;&nbsp;{item}
            </MenuItem>
        );
    }
    createRemovePlotMenuItem(item: string): ReactNode {
        return (
            <MenuItem
                key={item}
                onClick={() => {
                    this.handleClickItem(this.removePlot.bind(this, item));
                }}
            >
                &nbsp;&nbsp;&nbsp;&nbsp;{item}
            </MenuItem>
        );
    }

    addPlot(item: string, parent: HTMLElement | null) {
        console.log("addPlot(" + item + ")");

        if (parent) {
            const el: HTMLElement = document.createElement("div");
            el.style.width = "10px";
            el.style.height = "13px";
            parent.appendChild(el);
            ReactDOM.render(
                <SimpleMenu
                    type="type"
                    anchorEl={el}
                    wellLogView={this.props.wellLogView}
                    track={this.props.track}
                    plotName={item}
                />,
                el
            );
        }

        /*const track = this.props.track;
        const type = "line";
        addTrackPlot(this.props.wellLogView, (track as GraphTrack), item, type);*/
    }

    _addPlot(item?: string, type?: string) {
        console.log("_addPlot(" + item + ", " + type + ")");
        if (!item || !type) return;
        const track = this.props.track;
        addTrackPlot(this.props.wellLogView, track as GraphTrack, item, type);
    }

    menuAddPlotItems(): ReactNode[] {
        const nodes: ReactNode[] = [];
        const track = this.props.track;
        const plots = (track as GraphTrack).plots;
        const abbr = track.options.abbr;

        const welllog = this.props.wellLogView.props.welllog;
        if (welllog && welllog[0]) {
            const curves = welllog[0].curves;
            let iCurve = 0;
            for (const curve of curves) {
                let bUsed = false;
                if (plots) {
                    // GraphTrack
                    for (const plot of plots)
                        if (plot.id == iCurve) {
                            bUsed = true;
                            break;
                        }
                } else if (abbr === curve.name) {
                    bUsed = true;
                }
                if (!bUsed)
                    nodes.push(
                        this.createAddPlotMenuItem(
                            curve.name,
                            this.state.anchorEl
                        )
                    );
                iCurve++;
            }
        }

        return nodes;
    }

    removePlot(item: string) {
        console.log("removePlot(" + item + ")");
        const track = this.props.track;

        removeTrackPlot(this.props.wellLogView, track as GraphTrack, item);
    }

    menuRemovePlotItems(): ReactNode[] {
        const nodes: ReactNode[] = [];
        const track = this.props.track;
        const plots = (track as GraphTrack).plots;

        const welllog = this.props.wellLogView.props.welllog;
        if (welllog && welllog[0]) {
            const curves = welllog[0].curves;

            for (const plot of plots) {
                const iCurve = plot.id as number;
                nodes.push(this.createRemovePlotMenuItem(curves[iCurve].name));
            }
        }

        return nodes;
    }

    addPlots(parent: HTMLElement | null) {
        if (parent) {
            const el: HTMLElement = document.createElement("div");
            el.style.width = "10px";
            el.style.height = "13px";
            parent.appendChild(el);
            ReactDOM.render(
                <SimpleMenu
                    type="addPlots"
                    anchorEl={el}
                    wellLogView={this.props.wellLogView}
                    track={this.props.track}
                />,
                el
            );
        }
    }
    removePlots(parent: HTMLElement | null) {
        if (parent) {
            const el: HTMLElement = document.createElement("div");
            el.style.width = "10px";
            el.style.height = "13px";
            parent.appendChild(el);
            ReactDOM.render(
                <SimpleMenu
                    type="removePlots"
                    anchorEl={el}
                    wellLogView={this.props.wellLogView}
                    track={this.props.track}
                />,
                el
            );
        }
    }

    addTrack() {
        console.log("addTrack");
        if (this.props.wellLogView.logController) {
            //newScaleTrack
            //newDualScaleTrack
            const trackNew = newGraphTrack("new Track", [], []);
            const trackCurrent = this.props.track;
            const bAfter = true;
            {
                let order = 0;
                for (const track of this.props.wellLogView.logController
                    .tracks) {
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
            }
            this.props.wellLogView.logController.addTrack(trackNew);

            this.props.wellLogView.setZoomTrack();
            this.props.wellLogView.setScrollTrack();

            //this.props.wellLogView.addTrackContextMenus(trackNew); //ZZZZ~!!!!
        }
    }
    removeTrack() {
        console.log("removeTrack");
        if (this.props.wellLogView.logController) {
            this.props.wellLogView.logController.removeTrack(this.props.track);

            this.props.wellLogView.setZoomTrack();
            this.props.wellLogView.setScrollTrack();
        }
    }

    render(): ReactNode {
        if (this.props.type == "title") {
            return (
                <div>
                    <Menu
                        id="simple-menu"
                        anchorEl={this.state.anchorEl}
                        open={Boolean(this.state.anchorEl)}
                        onClose={this.handleCloseMenu.bind(this)}
                        onContextMenu={this.handleContextMenu.bind(this)}
                    >
                        <MenuItem
                            onClick={() => {
                                this.handleClickItem(this.addTrack);
                            }}
                        >
                            {"Add track"}
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                this.handleClickItem(this.removeTrack);
                            }}
                        >
                            {"Remove track"}
                        </MenuItem>
                    </Menu>
                </div>
            );
        }

        if (this.props.type == "container") {
            return (
                <div>
                    <Menu
                        id="simple-menu"
                        anchorEl={this.state.anchorEl}
                        keepMounted
                        open={Boolean(this.state.anchorEl)}
                        onClose={this.handleCloseMenu.bind(this)}
                        onContextMenu={this.handleContextMenu.bind(this)}
                    >
                        <MenuItem>{"Menu item 1"}</MenuItem>
                        <MenuItem>{"Menu item 2"}</MenuItem>
                    </Menu>
                </div>
            );
        }

        if (this.props.type == "addPlots") {
            return (
                <div>
                    <Menu
                        id="simple-menu"
                        anchorEl={this.state.anchorEl}
                        keepMounted
                        open={Boolean(this.state.anchorEl)}
                        onClose={this.handleCloseMenu.bind(this)}
                        onContextMenu={this.handleContextMenu.bind(this)}
                    >
                        {this.menuAddPlotItems()}
                    </Menu>
                </div>
            );
        }
        if (this.props.type == "removePlots") {
            return (
                <div>
                    <Menu
                        id="simple-menu"
                        anchorEl={this.state.anchorEl}
                        keepMounted
                        open={Boolean(this.state.anchorEl)}
                        onClose={this.handleCloseMenu.bind(this)}
                        onContextMenu={this.handleContextMenu.bind(this)}
                    >
                        {this.menuRemovePlotItems()}
                    </Menu>
                </div>
            );
        }

        if (this.props.type == "type") {
            return (
                <div>
                    <Menu
                        id="simple-menu"
                        anchorEl={this.state.anchorEl}
                        open={Boolean(this.state.anchorEl)}
                        onClose={this.handleCloseMenu.bind(this)}
                        onContextMenu={this.handleContextMenu.bind(this)}
                    >
                        <MenuItem
                            onClick={() => {
                                this.handleClickItem(
                                    this._addPlot.bind(
                                        this,
                                        this.props.plotName,
                                        "line"
                                    )
                                );
                            }}
                        >
                            {"line"}
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                this.handleClickItem(
                                    this._addPlot.bind(
                                        this,
                                        this.props.plotName,
                                        "dot"
                                    )
                                );
                            }}
                        >
                            {"dot"}
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                this.handleClickItem(
                                    this._addPlot.bind(
                                        this,
                                        this.props.plotName,
                                        "linestep"
                                    )
                                );
                            }}
                        >
                            {"linestep"}
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                this.handleClickItem(
                                    this._addPlot.bind(
                                        this,
                                        this.props.plotName,
                                        "area"
                                    )
                                );
                            }}
                        >
                            {"area"}
                        </MenuItem>
                    </Menu>
                </div>
            );
        }

        const track = this.props.track;
        const plots = (track as GraphTrack).plots;

        return (
            <div>
                <Menu
                    id="simple-menu"
                    anchorEl={this.state.anchorEl}
                    keepMounted
                    open={Boolean(this.state.anchorEl)}
                    onClose={this.handleCloseMenu.bind(this)}
                    onContextMenu={this.handleContextMenu.bind(this)}
                >
                    <MenuItem
                        onClick={this.handleClickItem.bind(
                            this,
                            this.addPlots.bind(this, this.state.anchorEl)
                        )}
                    >
                        {"Add plot"}
                    </MenuItem>

                    {!plots.length ? (
                        <></>
                    ) : (
                        <MenuItem
                            onClick={this.handleClickItem.bind(
                                this,
                                this.removePlots.bind(this, this.state.anchorEl)
                            )}
                        >
                            {"Remove plot"}
                        </MenuItem>
                    )}
                </Menu>
            </div>
        );
    }
}
function localMenuTitle(
    parent: HTMLElement,
    track: Track,
    wellLogView: WellLogView
) {
    //if (track) return; // not ready
    const el: HTMLElement = document.createElement("div");
    el.style.width = "10px";
    el.style.height = "13px";
    parent.appendChild(el);
    ReactDOM.render(
        <SimpleMenu
            type="title"
            anchorEl={el}
            wellLogView={wellLogView}
            track={track}
        />,
        el
    );
}
function localMenuLegend(
    parent: HTMLElement,
    track: Track,
    wellLogView: WellLogView
) {
    //if (track) return; // not ready
    const el: HTMLElement = document.createElement("div");
    el.style.width = "10px";
    el.style.height = "3px";
    parent.appendChild(el);
    ReactDOM.render(
        <SimpleMenu
            type="legend"
            anchorEl={el}
            wellLogView={wellLogView}
            track={track}
        />,
        el
    );
}
function localMenuContainer(
    parent: HTMLElement,
    track: Track,
    wellLogView: WellLogView
) {
    //if (track) return; // not ready
    const el: HTMLElement = document.createElement("div");
    el.style.width = "10px";
    el.style.height = "3px";
    parent.appendChild(el);
    ReactDOM.render(
        <SimpleMenu
            type="container"
            anchorEl={el}
            wellLogView={wellLogView}
            track={track}
        />,
        el
    );
}

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
    //instance.overlay.register(key: string, callbacks: OverlayCallbacks): void;
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
                /*
                console.log(
                    "event.transform=" +
                        event.transform.k +
                        "; " +
                        event.transform.x +
                        "; " +
                        event.transform.y
                );*/
                //console.log("event.domain", event.domain);
                parent.onRescale(event.transform.k);

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

function getValue(x: number, data: [], type: string) {
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
                    if (type === "linestep") {
                        v1 = row[1]; //!! not rPrev[1] !!
                    } else {
                        const d = row[0] - rowPrev[0];
                        const f = x - rowPrev[0];
                        if (type === "dot") {
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
    template: Template // JSON
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

interface TrackEvent {
    track: Track;
    element: HTMLElement;
    ev: MouseEvent;
}

export interface WellLogController {
    scrollTrackTo(pos: number): boolean;
    getScrollTrackPos(): number;
    getScrollTrackPosMax(): number;
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
    template: Template;
    horizontal?: boolean;
    primaryAxis: string;
    //setAvailableAxes : (scales: string[]) => void;
    axisTitles: Record<string, string>;
    axisMnemos: Record<string, string[]>;

    onInfo?: (infos: Info[]) => void;
    onCreateController?: (controller: WellLogController) => void;
    onScrollTrackPos?: (pos: number) => void;
    onZoom?: (pos: number) => void;

    maxTrackNum?: number;

    zoom?: number;
    scrollPos?: number; // fraction
    zoomTrack?: number;
    scrollTrackPos?: number; // the first track number
}

interface State {
    infos: Info[];

    zoom: number;
    scrollPos: number; // fraction
    zoomTrack: number;
    scrollTrackPos: number; // the first track number
}

class WellLogView extends Component<Props, State> implements WellLogController {
    container?: HTMLElement;
    logController?: LogViewer;
    //scroller: React.RefObject<Scroller>;

    constructor(props: Props) {
        super(props);
        //alert("props=" + props)

        this.container = undefined;
        this.logController = undefined;

        this.state = {
            infos: [],
            zoom: props.zoom ? props.zoom : 1.0,
            scrollPos: props.scrollPos ? props.scrollPos : 0,
            zoomTrack: props.zoomTrack ? props.zoomTrack : 1.0,
            scrollTrackPos: props.scrollTrackPos ? props.scrollTrackPos : 0,
        };

        if (this.props.onCreateController)
            // set callback to component caller
            this.props.onCreateController(this);

        //this.scroller = React.createRef();
        this.onScroll = this.onScroll.bind(this);
    }

    componentDidMount(): void {
        this.createLogViewer();
        this.setTracks();
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
            this.setZoomTrack(); // ZLP
            this.setScrollTrack();
            this.setInfo();
        }

        if (this.state.scrollPos !== prevState.scrollTrackPos) {
            //this.setZoom();
            //this.setScroll();
        }
        if (this.props.zoom !== prevProps.zoom) {
            this.setZoom();
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

                onResize: function (event: LogControllerResizeEvent): void {
                    console.log("onResize", event);
                },
                onTrackEnter: function (elm: HTMLElement, track: Track): void {
                    addTrackContextMenus(elm, track);
                    console.log("onTrackEnter", track);
                },
                onTrackUpdate: function (elm: HTMLElement, track: Track): void {
                    // never called
                    elm;
                    console.log("onTrackUpdate", track);
                },
                onTrackExit: function (): void {
                    //console.log("onTrackExit");
                },
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
                this.props.template
            );
        }
        this.setScrollTrack();
        this.setZoomTrack();
        this.setInfo(); // Clear old track information
    }
    setZoom(): void {
        const zoom = this.props.zoom ? this.props.zoom : 1;
        if (this.logController) {
            setZoom(this.logController, zoom);
        }
        if (Math.abs(Math.log(this.state.zoom / zoom)) > 0.01)
            this.setState({ zoom: zoom });
    }
    setZoomTrack(): void {
        const nGraphTracks = this._graphTrackMax();

        let zoomTrack = nGraphTracks / this._maxTrackNum();
        if (zoomTrack < 1) zoomTrack = 1;

        if (Math.abs(Math.log(this.state.zoomTrack / zoomTrack)) > 0.01)
            this.setState({ zoomTrack: zoomTrack });
    }
    setScrollTrack(): void {
        const iFrom = this._newScrollPos(this.state.scrollTrackPos);
        const iTo = iFrom + this._maxTrackNum();
        if (this.logController) scrollTracks(this.logController, iFrom, iTo);

        if (this.props.onScrollTrackPos) this.props.onScrollTrackPos(iFrom);
    }
    setInfo(x: number = Number.NaN, x2: number = Number.NaN): void {
        if (!this.props.onInfo) return;

        if (!this.logController) return;

        const iFrom = this._newScrollPos(this.state.scrollTrackPos);
        const iTo = iFrom + this._maxTrackNum();
        let iTrack = 0;

        const infos: Info[] = [];
        let iPlot = 0;
        let bSeparator = false;
        for (const track of this.logController.tracks) {
            const bScaleTrack = isScaleTrack(track);
            const visible = (iFrom <= iTrack && iTrack < iTo) || bScaleTrack;
            if (visible) {
                const plotConfigs = (track.options as GraphTrackOptions)[
                    "plots"
                ];
                const datas = track.data;

                if (plotConfigs) {
                    if (!bSeparator) {
                        bSeparator = true;
                        infos.push({
                            color: "",
                            value: "",
                            type: "separator",
                        });
                    }

                    const nPlots = plotConfigs.length;
                    for (let p = 0; p < nPlots; p++) {
                        const plotConfig = plotConfigs[p];
                        const v = getValue(x, datas[p], plotConfig.type);
                        const legend = (
                            plotConfig.options as ExtPlotOptions
                        ).legendInfo();
                        infos.push({
                            name: legend.label,
                            units: legend.unit,
                            color: plotConfig.options.color
                                ? plotConfig.options.color
                                : "",
                            value: v,
                            type: plotConfig.type,
                        });
                        iPlot++;
                    }
                } else {
                    const _x = iPlot == 0 ? x : x2;
                    infos.push({
                        name: track.options.abbr,
                        units: (track.options as ScaleTrackOptions)["units"],
                        color: iPlot == 0 ? "black" : "grey",
                        value: formatValue(_x),
                        type: "", //plot.type,
                    });
                    iPlot++;
                }
            }
            if (!bScaleTrack) iTrack++;
        }

        this.props.onInfo(infos);
    }

    onMouseMove(x: number, x2: number): void {
        this.setInfo(x, x2);
    }

    onRescale(k: number): void {
        if (this.props.onZoom) this.props.onZoom(k);

        if (this.logController) {
            const [b1, b2] = this.logController.scaleHandler.baseDomain();
            const [d1, d2] = this.logController.domain;

            //console.log("b1=", b1, "b2=", b2);
            //console.log("d1=", d1, "d2=", d2);
            const w = b2 - b1 - (d2 - d1);
            const scrollPos = w ? (d1 - b1) / w : 0;
            console.log(
                "onRescale scrollPos=",
                scrollPos,
                Math.abs(this.state.scrollPos - scrollPos)
            );

            if (Math.abs(this.state.scrollPos - scrollPos) > 0.0001)
                this.setState({ scrollPos: scrollPos });
        }
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
            this.onTrackTitleContextMenu.bind(this),
            track
        );
        this._addTrackContextMenu(
            elm,
            "track-legend",
            this.onTrackLegendContextMenu.bind(this),
            track
        );
        this._addTrackContextMenu(
            elm,
            "track-container",
            this.onTrackContainerContextMenu.bind(this),
            track
        );
    }
    onTrackTitleContextMenu(ev: TrackEvent): void {
        if (this.logController) localMenuTitle(ev.element, ev.track, this);
    }
    onTrackLegendContextMenu(ev: TrackEvent): void {
        if (this.logController) localMenuLegend(ev.element, ev.track, this);
    }
    onTrackContainerContextMenu(ev: TrackEvent): void {
        if (this.logController) localMenuContainer(ev.element, ev.track, this);
    }

    _graphTrackMax(): number {
        // for scrollbar
        if (!this.logController) return 0;
        const nScaleTracks = getScaleTrackNum(this.logController.tracks);
        return this.logController.tracks.length - nScaleTracks;
    }
    _scrollTrackPosMax(): number {
        // for scrollbar
        const nGraphTracks = this._graphTrackMax();
        let posMax = nGraphTracks - this._maxTrackNum();
        if (posMax < 0) posMax = 0;
        return posMax;
    }
    _newScrollPos(pos: number): number {
        let newPos = pos;
        const posMax = this._scrollTrackPosMax();
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
        const newPos = this._newScrollPos(pos);
        if (this.state.scrollTrackPos == newPos) return false;
        this.setState({ scrollTrackPos: newPos });
        return true;
    }
    getScrollTrackPos(): number {
        return this.state.scrollTrackPos;
    }
    getScrollTrackPosMax(): number {
        return this._scrollTrackPosMax();
    }

    onScroll(x: number, y: number): void {
        if (this.logController) {
            const f = this.props.horizontal ? x : y;
            scrollContentTo(this.logController, f);
        }
        const posMax = this._scrollTrackPosMax();
        let posTrack = (this.props.horizontal ? y : x) * posMax;
        posTrack = Math.round(posTrack);
        /*
        console.log(
            "posTrack=" + posTrack,
            "horizontal=" + this.props.horizontal
        );
        */
        this.scrollTrackTo(posTrack);
    }

    render(): ReactNode {
        const fTrack = this._scrollTrackPosMax()
            ? this.state.scrollTrackPos / this._scrollTrackPosMax()
            : 0.0; // fraction
        const x = this.props.horizontal ? this.state.scrollPos : fTrack;
        const y = this.props.horizontal ? fTrack : this.state.scrollPos;

        const zoomX = this.props.horizontal
            ? this.state.zoom
            : this.state.zoomTrack;
        const zoomY = this.props.horizontal
            ? this.state.zoomTrack
            : this.state.zoom;
        //console.log("WLV render zoomX=" + zoomX, "zoomY=" + zoomY)

        return (
            <div style={{ width: "100%", height: "100%" }}>
                <Scroller
                    zoomX={zoomX}
                    zoomY={zoomY}
                    x={x}
                    y={y}
                    onScroll={this.onScroll}
                >
                    <div
                        className="welllogview"
                        ref={(el) => {
                            this.container = el as HTMLElement;
                        }}
                    />
                </Scroller>
            </div>
        );
    }
}

export default WellLogView;
