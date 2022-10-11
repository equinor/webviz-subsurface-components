import React, { Component, ReactNode } from "react";
import { LogViewer } from "@equinor/videx-wellog";

import {
    InterpolatedScaleHandler,
    ScaleInterpolator,
} from "@equinor/videx-wellog";

import { Track, GraphTrack, StackedTrack } from "@equinor/videx-wellog";
import { Plot } from "@equinor/videx-wellog";

import {
    OverlayClickEvent,
    OverlayMouseMoveEvent,
    OverlayMouseExitEvent,
    OverlayRescaleEvent,
} from "@equinor/videx-wellog/dist/ui/interfaces";

import "!vue-style-loader!css-loader!sass-loader!./styles.scss";

import { validateSchema } from "../../../inputSchema/validator";

import { select } from "d3";

import { WellLog, WellLogCurve } from "./WellLogTypes";
import { Template } from "./WellLogTemplateTypes";
import { ColorTable } from "./ColorTableTypes";

import { getDiscreteColorAndName, getDiscreteMeta } from "../utils/tracks";
import { createTracks } from "../utils/tracks";
import { getScaleTrackNum } from "../utils/tracks";
import { AxesInfo } from "../utils/tracks";
import { ExtPlotOptions } from "../utils/tracks";
import { getTrackTemplate } from "../utils/tracks";
import { isScaleTrack } from "../utils/tracks";
import { deepCopy } from "../utils/tracks";

import {
    addOrEditGraphTrack,
    addOrEditGraphTrackPlot,
    addOrEditStackedTrack,
    removeGraphTrackPlot,
} from "../utils/tracks";
import { getPlotType } from "../utils/tracks";

import { TemplatePlot, TemplateTrack } from "./WellLogTemplateTypes";

import {
    removeOverlay,
    zoomContent,
    scrollContentTo,
    zoomContentTo,
    setContentBaseDomain,
    getContentBaseDomain,
    getContentDomain,
    getContentZoom,
    scrollTracksTo,
    isTrackSelected,
    selectTrack,
    getSelectedTrackIndices,
    setSelectedTrackIndices,
} from "../utils/log-viewer";

function showSelection(
    rbelm: HTMLElement,
    pinelm: HTMLElement,
    vCur: number | undefined,
    vPin: number | undefined,
    horizontal: boolean | undefined,
    logViewer: LogViewer /*LogController*/
) {
    if (vCur === undefined) {
        rbelm.style.visibility = "hidden";
        pinelm.style.visibility = "hidden";
        return;
    }
    const v = logViewer.scale(vCur);
    if (!Number.isFinite(v)) {
        // logViewer could be empty
        rbelm.style.visibility = "hidden";
        pinelm.style.visibility = "hidden";
        return;
    }

    const rubberBandSize = 9;
    const offset = rubberBandSize / 2;

    rbelm.style[horizontal ? "left" : "top"] = `${v - offset}px`;
    rbelm.style.visibility = "visible";

    if (vPin !== undefined && Number.isFinite(vPin)) {
        const pinelm1 = pinelm.firstElementChild as HTMLElement;
        let min, max;
        if (vPin < vCur) {
            pinelm1.style[horizontal ? "left" : "top"] = `${offset}px`;
            pinelm1.style[horizontal ? "right" : "bottom"] = "";
            min = vPin;
            max = vCur;
        } else {
            pinelm1.style[horizontal ? "right" : "bottom"] = `${offset}px`;
            pinelm1.style[horizontal ? "left" : "top"] = "";
            min = vCur;
            max = vPin;
        }

        min = logViewer.scale(min);
        max = logViewer.scale(max);

        const x = min - offset;
        const w = max - min + rubberBandSize;
        pinelm.style[horizontal ? "width" : "height"] = `${w}px`;
        pinelm.style[horizontal ? "left" : "top"] = `${x}px`;
    } else {
        pinelm.style.visibility = "hidden";
    }
}

function addRubberbandOverlay(instance: LogViewer, parent: WellLogView) {
    const rubberBandSize = 9;
    const offset = rubberBandSize / 2;
    const horizontal = parent.props.horizontal;
    const rbelm = instance.overlay.create("rubber-band", {
        onMouseMove: (event: OverlayMouseMoveEvent) => {
            if (parent.selPersistent) return;
            const v = horizontal ? event.x : event.y;
            parent.selCurrent = instance.scale.invert(v);

            const rbelm = event.target;
            const pinelm = instance.overlay.elements["pinned"];
            if (rbelm && pinelm) {
                showSelection(
                    rbelm,
                    pinelm,
                    parent.selCurrent,
                    parent.selPinned,
                    horizontal,
                    instance
                );
            }
        },
        onMouseExit: (event: OverlayMouseExitEvent) => {
            if (event.target) {
                // do not hide! event.target.style.visibility = "hidden";
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
        .style(horizontal ? "width" : "height", `${rubberBandSize}px`)
        .style(horizontal ? "height" : "width", `${100}%`)
        .style("background-color", "rgba(255,0,0,0.1)")
        .style("visibility", "hidden");

    rb.append("div")
        .style(horizontal ? "width" : "height", "1px")
        .style(horizontal ? "height" : "width", `${100}%`)
        .style(horizontal ? "left" : "top", `${offset}px`)
        .style("background-color", "rgba(255,0,0,0.7)")
        .style("position", "relative");
}

function addReadoutOverlay(instance: LogViewer, parent: WellLogView) {
    const horizontal = parent.props.horizontal;
    const elm = instance.overlay.create("depth", {
        onClick: (event: OverlayClickEvent): void => {
            const { caller, x, y } = event;
            const value = caller.scale.invert(horizontal ? x : y);
            const elem = event.target;
            if (elem) {
                const axisTitle = parent.props.axisTitles
                    ? parent.props.axisTitles[parent.props.primaryAxis]
                    : undefined;
                elem.textContent = Number.isFinite(value)
                    ? `Pinned ${axisTitle ? axisTitle : ""}: ${value.toFixed(
                          1
                      )}`
                    : "-";
                elem.style.visibility = "visible";
            }
        },
        onMouseMove: (event: OverlayMouseMoveEvent): void => {
            if (parent.selPersistent) return;
            const { caller, x, y } = event;
            const value = caller.scale.invert(parent.props.horizontal ? x : y);
            const elem = event.target;
            if (elem) {
                const axisTitle = parent.props.axisTitles
                    ? parent.props.axisTitles[parent.props.primaryAxis]
                    : undefined;
                elem.textContent = Number.isFinite(value)
                    ? `${axisTitle ? axisTitle : ""}: ${value.toFixed(1)}`
                    : "-";
                elem.style.visibility = "visible";
            }

            parent.setInfo(value);
            parent.onContentSelection();
        },
        onMouseExit: (event: OverlayMouseExitEvent): void => {
            const elem = event.target;
            if (elem) elem.style.visibility = "hidden";
        },
        onRescale: (event: OverlayRescaleEvent): void => {
            const elem = event.target;
            if (elem && event.transform) {
                // event.transform.k could be not valid after add/edit plot
                // so use getContentZoom(instance) to be consistent
                // console.log("zoom=", getContentZoom(instance), event.transform.k)

                parent.onContentRescale();

                const k = event.transform.k;
                if (Number.isFinite(k)) {
                    elem.style.visibility = "visible";
                    elem.textContent = `Zoom: x${k.toFixed(1)}`;
                } else {
                    // empty logview
                    elem.style.visibility = "hidden";
                }
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
    const offset = rubberBandSize / 2;
    const horizontal = parent.props.horizontal;
    const pinelm = instance.overlay.create("pinned", {
        onClick: (event: OverlayClickEvent): void => {
            const v = horizontal ? event.x : event.y;
            const pinelm = event.target;
            if (pinelm) {
                if (pinelm.style.visibility == "visible") {
                    if (!parent.selPersistent) {
                        parent.selPersistent = true;
                    } else {
                        parent.selPersistent = false;
                        parent.selCurrent = instance.scale.invert(v);

                        pinelm.style.visibility = "hidden";
                        parent.selPinned = undefined;
                        parent.onContentSelection();
                    }
                } else {
                    parent.selPinned = instance.scale.invert(v);
                    if (parent.selCurrent === undefined)
                        parent.selCurrent = parent.selPinned;

                    const rbelm = instance.overlay.elements["rubber-band"];
                    if (rbelm && pinelm) {
                        showSelection(
                            rbelm,
                            pinelm,
                            parent.selCurrent,
                            parent.selPinned,
                            horizontal,
                            instance
                        );
                    }
                }
            }
        },
    });

    const pin = select(pinelm)
        .classed("pinned", true)
        .style(horizontal ? "width" : "height", `${rubberBandSize}px`)
        .style(horizontal ? "height" : "width", `${100}%`)
        .style(horizontal ? "top" : "left", `${0}px`)
        .style("background-color", "rgba(0,0,0,0.1)")
        .style("position", "absolute")
        .style("visibility", "hidden");

    pin.append("div")
        .style(horizontal ? "width" : "height", "1px")
        .style(horizontal ? "height" : "width", `${100}%`)
        .style(horizontal ? "left" : "top", `${offset}px`)
        .style("background-color", "rgba(0,255,0,0.7)")
        //.style("position", "relative");
        .style("position", "absolute");
}

export interface WellPickProps {
    wellpick: WellLog; // JSON Log Format
    name: string; //  "HORIZON"
    md?: string; //  default is "MD"
    /**
     * Prop containing color table data.
     */
    colorTables: ColorTable[];
    color: string; // "Stratigraphy" ...
}

function showWellPicks(
    pinelm: HTMLElement,
    vCur: number | undefined,
    horizontal: boolean | undefined,
    logViewer: LogViewer /*LogController*/
) {
    if (vCur === undefined) {
        pinelm.style.visibility = "hidden";
        return;
    }
    const v = logViewer.scale(vCur);
    if (!Number.isFinite(v)) {
        // logViewer could be empty
        pinelm.style.visibility = "hidden";
        return;
    }

    const wpSize = 3; //9;
    const offset = wpSize / 2;

    pinelm.style[horizontal ? "left" : "top"] = `${v - offset}px`;
    pinelm.style.visibility = "visible";
}

function _getLogIndexByNames(curves: WellLogCurve[], names: string[]): number {
    for (const name of names) {
        const n = name.toLowerCase();
        const index = curves.findIndex((item) => item.name.toLowerCase() === n);
        if (index >= 0) return index;
    }
    return -1;
}

interface WellPick {
    vMD: number;
    vPrimary: number | undefined;
    vSecondary: number | undefined;
    horizon: string;
    color: number[];
}

export function getWellPicks(wellLogView: WellLogView): WellPick[] {
    const wps: WellPick[] = [];
    const wellpick = wellLogView.props.wellpick;
    if (!wellpick) return wps;

    const curves = wellpick.wellpick.curves;
    const md = _getLogIndexByNames(curves, [wellpick.md ? wellpick.md : "MD"]);
    if (md < 0) {
        console.error(
            "MD log is not found for wellpicks ",
            wellpick.md ? wellpick.md : ""
        );
        return wps;
    }

    const primaryAxis = wellLogView.props.primaryAxis;
    const scaleInterpolator = wellLogView.scaleInterpolator;

    for (const c in curves) {
        const curve = curves[c];
        if (curve.name !== wellpick.name) continue;
        const data = wellpick.wellpick.data;
        for (const d of data) {
            if (d[md] === null) continue; // no MD!
            const horizon = d[c] as string | null;
            if (horizon === null) continue;

            const vMD = d[md] as number;
            const vPrimary =
                primaryAxis === "md" ? vMD : scaleInterpolator?.forward(vMD);
            const vSecondary =
                primaryAxis === "md" ? scaleInterpolator?.reverse(vMD) : vMD;

            const colorTable = wellpick.colorTables.find(
                (colorTable) => colorTable.name == wellpick.color
            );

            const meta = getDiscreteMeta(wellpick.wellpick, wellpick.name);
            const { color } = getDiscreteColorAndName(d[c], colorTable, meta);

            const wp = { vMD, vPrimary, vSecondary, horizon, color };
            wps.push(wp);
        }
        break;
    }
    return wps;
}

function addWellPickOverlay(instance: LogViewer, parent: WellLogView) {
    const wpSize = 3; //9;
    //const offset = wpSize / 2;
    const wps = getWellPicks(parent);
    if (!wps.length) return;

    const wellpick = parent.props.wellpick;
    if (!wellpick) return;

    const primaryAxis = parent.props.primaryAxis;
    const horizontal = parent.props.horizontal;

    for (const wp of wps) {
        const horizon = wp.horizon;
        const vPrimary = wp.vPrimary;
        const vSecondary = wp.vSecondary;
        const color = wp.color;

        const txtPrimary = !Number.isFinite(vPrimary)
            ? ""
            : vPrimary?.toFixed(0);
        const txtSecondary = !Number.isFinite(vSecondary)
            ? ""
            : (primaryAxis === "md" ? "TVD:" : "MD:") + vSecondary?.toFixed(0);

        instance.overlay.remove("wp" + horizon); // clear old if exists
        const pinelm = instance.overlay.create("wp" + horizon, {});

        const rgba =
            "rgba(" + color[0] + "," + color[1] + "," + color[2] + ",0.8)";
        const styleText =
            "style='background-color:rgba(" +
            color[0] +
            "," +
            color[1] +
            "," +
            color[2] +
            ",0.16)'";

        const pin = select(pinelm)
            .classed("wellpick", true)
            .style(horizontal ? "width" : "height", `${wpSize}px`)
            .style(horizontal ? "height" : "width", `${100}%`)
            .style(horizontal ? "top" : "left", `${0}px`)
            .style("background-color", rgba)
            .style("position", "absolute")
            .style("visibility", "false");

        pin.append("div")
            .html(
                horizontal
                    ? "<font size=1><table height=100%'><tr><td><span " +
                          styleText +
                          ">" +
                          txtPrimary +
                          "</span></td></tr><tr><td height=100%><span  " +
                          styleText +
                          ">" +
                          horizon +
                          "</span></td></tr><tr><td><span " +
                          styleText +
                          ">" +
                          txtSecondary +
                          "</span></td></tr></table>"
                    : "<font size=1><table width=100% style='position:relative; top:-1.5em;'><tr><td " +
                          styleText +
                          ">" +
                          txtPrimary +
                          "</td><td width=100% align=center><span  " +
                          styleText +
                          ">" +
                          horizon +
                          "</span></td><td " +
                          styleText +
                          ">" +
                          txtSecondary +
                          "</td></tr></table>"
            )
            .style(horizontal ? "width" : "height", "1px")
            .style(horizontal ? "height" : "width", `${100}%`)
            ///.style(horizontal ? "left" : "top", `${offset}px`)
            .style("background-color", rgba)
            //.style("position", "relative");
            .style("position", "absolute");
    }
}

function initOverlays(instance: LogViewer, parent: WellLogView) {
    instance.overlay.elm.style("overflow", "hidden"); // to clip content selection

    addReadoutOverlay(instance, parent);
    addRubberbandOverlay(instance, parent);
    addPinnedValueOverlay(instance, parent);

    addWellPickOverlay(instance, parent);
}

function createInterpolator(from: Float32Array, to: Float32Array) {
    // 'from' array could be non monotonous (TVD) so we could not use binary search!

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

    return (x: number, expand: boolean): number => {
        for (let i = 0; i < n; i++) {
            if (x < from[i]) {
                if (!i) return expand ? to[0] : Number.NaN;
                return (x - from[i]) * mul[i] + to[i];
            }
        }
        return expand ? to[n ? n - 1 : 0] : Number.NaN;
    };
}

function createScaleInterpolator(
    primaries: Float32Array,
    secondaries: Float32Array
): ScaleInterpolator {
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
    return {
        forward,
        reverse,
        forwardInterpolatedDomain: (domain: number[]) =>
            domain.map((v) => secondary2primary(v, true)),
        reverseInterpolatedDomain: (domain: number[]) =>
            domain.map((v) => primary2secondary(v, true)),
    };
}

function setTracksToController(
    logController: LogViewer,
    axes: AxesInfo,
    welllog: WellLog | undefined, // JSON Log Format
    template: Template, // JSON
    colorTables: ColorTable[] // JSON
): ScaleInterpolator {
    const { tracks, minmaxPrimaryAxis, primaries, secondaries } = createTracks(
        welllog,
        axes,
        template.tracks,
        template.styles,
        colorTables
    );
    logController.reset();
    const scaleInterpolator = createScaleInterpolator(primaries, secondaries);
    logController.scaleHandler = new InterpolatedScaleHandler(
        scaleInterpolator
    );
    logController.domain = minmaxPrimaryAxis;
    logController.setTracks(tracks);
    return scaleInterpolator;
}

function addTrackMouseEventListner(
    type: /*string, */ "click" | "contextmenu" | "dblclick",
    area: /*string, */ "title" | "legend" | "container",
    element: HTMLElement,
    track: Track,
    func: (ev: TrackMouseEvent) => void
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
function addTrackMouseEventHandlers(
    elm: HTMLElement,
    track: Track,
    func: (ev: TrackMouseEvent) => void
): void {
    for (const area of areas) {
        const elements = elm.getElementsByClassName("track-" + area);
        for (const element of elements)
            for (const type of types)
                addTrackMouseEventListner(
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

function fillPlotTemplate(
    templateTrack: TemplateTrack,
    plot: Plot
): TemplatePlot {
    const options = plot.options as ExtPlotOptions;
    const optionsDifferential = plot.options as DifferentialPlotOptions; // DifferentialPlot - 2 series!
    const options1 = optionsDifferential.serie1;
    const options2 = optionsDifferential.serie2;

    const legend = options.legendInfo();
    const legendDifferential = legend as DifferentialPlotLegendInfo; // DifferentialPlot - 2 series!
    const legend1 = legendDifferential.serie1;
    const legend2 = legendDifferential.serie2;

    const scale =
        templateTrack?.scale !== options.scale ? options.scale : undefined;

    return {
        style: undefined, // No style for this full Plot options.
        type: getPlotType(plot),
        scale: scale == "log" || scale == "linear" ? scale : undefined,
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
        colorScale: options.colorScale,
        inverseColorScale: options.inverseColorScale,
    };
}

function editPlot(
    parent: HTMLElement,
    wellLogView: WellLogView,
    track: Track,
    templatePlot: TemplatePlot,
    onOK: (templatePlot: TemplatePlot) => void
): void {
    const el: HTMLElement = document.createElement("div");
    el.style.width = "10px";
    el.style.height = "13px";
    parent.appendChild(el);

    ReactDOM.render(
        <PlotPropertiesDialog
            templatePlot={templatePlot}
            wellLogView={wellLogView}
            track={track}
            onOK={onOK}
        />,
        el
    );
}

export function addTrack(
    parent: HTMLElement,
    wellLogView: WellLogView,
    onOK: (templateTrack: TemplateTrack) => void
): void {
    const el: HTMLElement = document.createElement("div");
    el.style.width = "10px";
    el.style.height = "13px";
    parent.appendChild(el);

    ReactDOM.render(
        <TrackPropertiesDialog wellLogView={wellLogView} onOK={onOK} />,
        el
    );
}

export function editTrack(
    parent: HTMLElement,
    wellLogView: WellLogView,
    templateTrack: TemplateTrack,
    onOK: (templateTrack: TemplateTrack) => void
): void {
    const el: HTMLElement = document.createElement("div");
    el.style.width = "10px";
    el.style.height = "13px";
    parent.appendChild(el);

    ReactDOM.render(
        <TrackPropertiesDialog
            templateTrack={templateTrack}
            wellLogView={wellLogView}
            onOK={onOK}
        />,
        el
    );
}

export interface TrackMouseEvent {
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
    selectContent(selection: [number | undefined, number | undefined]): void;
    setContentBaseDomain(domain: [number, number]): void;
    getContentBaseDomain(): [number, number]; // full scale range
    getContentDomain(): [number, number]; // visible range
    getContentZoom(): number;
    getContentSelection(): [number | undefined, number | undefined]; // [current, pinned]

    scrollTrackTo(pos: number): void;
    scrollTrackBy(delta: number): void;
    getTrackScrollPos(): number;
    getTrackScrollPosMax(): number;
    getTrackZoom(): number;

    setSelectedTrackIndices(selection: number[]): boolean;
    getSelectedTrackIndices(): number[];

    setTemplate(template: Template): void;
    getTemplate(): Template;
}

import { Info } from "./InfoTypes";

interface Props {
    /**
     * Object from JSON file describing single well log data.
     */
    welllog: WellLog | undefined;

    /**
     * Prop containing track template data.
     */
    template: Template;
    /**
     * Prop containing color table data.
     */
    colorTables: ColorTable[];
    /**
     * Well Picks data
     */
    wellpick?: WellPickProps;
    /**
     * Orientation of the track plots on the screen.
     */
    horizontal?: boolean;

    /**
     * Primary axis: " md", "tvd",...
     */
    primaryAxis: string;
    /**
     * Show Titles on the tracks
     */
    hideTitles?: boolean;
    /**
     * Hide Legends on the tracks
     */
    hideLegend?: boolean;

    axisTitles: Record<string, string>;
    axisMnemos: Record<string, string[]>;

    maxVisibleTrackNum?: number; // default is horizontal ? 3: 5
    maxContentZoom?: number; // default is 256

    /**
     * Validate JSON datafile against schems
     */
    checkDatafileSchema?: boolean;

    // callbacks:
    onCreateController?: (controller: WellLogController) => void;
    onInfo?: (
        x: number,
        logController: LogViewer,
        iFrom: number,
        iTo: number
    ) => void;

    /**
     * called when track scrolling is changed
     */
    onTrackScroll?: () => void;
    /**
     * called when track selection is changed
     */
    onTrackSelection?: () => void;
    /**
     * called when content zoom and scrolling are changed
     */
    onContentRescale?: () => void;
    /**
     * called when content zoom and scrolling are changed
     */
    onContentSelection?: () => void;

    /**
     * called when mouse click on a track
     */
    onTrackMouseEvent?: (wellLogView: WellLogView, ev: TrackMouseEvent) => void;
    /**
     * called when template is changed
     */
    onTemplateChanged?: () => void;
}

interface State {
    infos: Info[];

    scrollTrackPos: number; // the first visible non-scale track number
    errorText?: string;
}

class WellLogView extends Component<Props, State> implements WellLogController {
    container?: HTMLElement;
    logController?: LogViewer;
    selCurrent: number | undefined; // current mouse position
    selPinned: number | undefined; // pinned position
    selPersistent: boolean | undefined;

    template: Template;

    scaleInterpolator: ScaleInterpolator | undefined;

    constructor(props: Props) {
        super(props);
        this.container = undefined;
        this.logController = undefined;
        this.selCurrent = undefined;
        this.selPinned = undefined;
        this.selPersistent = undefined;

        this.template = {
            name: "",
            scale: {
                primary: "",
            },
            tracks: [],
            styles: [],
        };
        this.scaleInterpolator = undefined;

        this.state = {
            infos: [],
            scrollTrackPos: 0,
        };

        this.onTrackMouseEvent = this.onTrackMouseEvent.bind(this);

        // set callback to component's caller
        if (this.props.onCreateController) this.props.onCreateController(this);
    }

    componentDidMount(): void {
        this.createLogViewer();

        this.template = deepCopy(this.props.template); // save external template content to current
        this.setTracks(true);
    }

    shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
        if (this.props.horizontal !== nextProps.horizontal) return true;
        if (this.props.hideTitles !== nextProps.hideTitles) return true;
        if (this.props.hideLegend !== nextProps.hideLegend) return true;

        if (this.props.welllog !== nextProps.welllog) return true;
        if (this.props.template !== nextProps.template) return true;
        if (this.props.colorTables !== nextProps.colorTables) return true;
        if (this.props.wellpick !== nextProps.wellpick) return true;
        if (this.props.primaryAxis !== nextProps.primaryAxis) return true;
        if (this.props.axisTitles !== nextProps.axisTitles) return true;
        if (this.props.axisMnemos !== nextProps.axisMnemos) return true;

        if (this.props.maxVisibleTrackNum !== nextProps.maxVisibleTrackNum)
            return true;
        if (this.state.scrollTrackPos !== nextState.scrollTrackPos) return true;
        if (this.state.errorText !== nextState.errorText) return true;

        if (this.props.maxContentZoom !== nextProps.maxContentZoom) return true;
        if (this.props.checkDatafileSchema !== nextProps.checkDatafileSchema)
            return true;

        // callbacks

        return false;
    }
    componentDidUpdate(prevProps: Props, prevState: State): void {
        // Typical usage (don't forget to compare props):
        if (this.props.onCreateController !== prevProps.onCreateController) {
            // update callback to component's caller
            if (this.props.onCreateController)
                this.props.onCreateController(this);
        }

        let selectedTrackIndices: number[] = []; // Indices to restore
        let selection: [number | undefined, number | undefined] | undefined =
            undefined; // content selection to restore
        let shouldSetTracks = false;
        let checkSchema = false;
        if (
            this.props.horizontal !== prevProps.horizontal ||
            this.props.hideTitles !== prevProps.hideTitles ||
            this.props.hideLegend !== prevProps.hideLegend ||
            this.props.maxContentZoom !== prevProps.maxContentZoom
        ) {
            selection = this.getContentSelection();
            selectedTrackIndices = this.getSelectedTrackIndices();
            this.createLogViewer();
            shouldSetTracks = true;
        }

        if (
            this.props.welllog !== prevProps.welllog ||
            this.props.checkDatafileSchema !== prevProps.checkDatafileSchema
        ) {
            shouldSetTracks = true;
            checkSchema = true;
        } else if (this.props.template !== prevProps.template) {
            this.template = deepCopy(this.props.template); // save external template content to current
            shouldSetTracks = true;
            checkSchema = true;
        } else if (this.props.primaryAxis !== prevProps.primaryAxis) {
            this.selectContent([undefined, undefined]);
            selectedTrackIndices = this.getSelectedTrackIndices();
            shouldSetTracks = true;
        } else if (this.props.colorTables !== prevProps.colorTables) {
            selection = this.getContentSelection();
            selectedTrackIndices = this.getSelectedTrackIndices();
            shouldSetTracks = true; // force to repaint
        } else if (
            this.props.axisTitles !== prevProps.axisTitles ||
            this.props.axisMnemos !== prevProps.axisMnemos
        ) {
            selection = this.getContentSelection();
            selectedTrackIndices = this.getSelectedTrackIndices();
            shouldSetTracks = true; //??
        } else if (this.props.wellpick !== prevProps.wellpick) {
            if (this.logController)
                addWellPickOverlay(this.logController, this);
        }

        if (shouldSetTracks) {
            this.setTracks(checkSchema); // use this.template
            setSelectedTrackIndices(this.logController, selectedTrackIndices);
            if (selection) this.selectContent(selection);
        } else if (
            this.state.scrollTrackPos !== prevState.scrollTrackPos ||
            this.props.maxVisibleTrackNum !== prevProps.maxVisibleTrackNum
        ) {
            this.onTrackScroll();
            this.onTrackSelection();
            this.setInfo();
        }
    }

    createLogViewer(): void {
        this.selPersistent = undefined;
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
                horizontal: this.props.horizontal,
                showTitles: !this.props.hideTitles,
                showLegend: !this.props.hideLegend,
                maxZoom: this.props.maxContentZoom,
                onTrackEnter: (elm: HTMLElement, track: Track) =>
                    addTrackMouseEventHandlers(
                        elm,
                        track,
                        this.onTrackMouseEvent
                    ),
            });

            this.logController.init(this.container);

            initOverlays(this.logController, this);
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

    setTracks(checkSchema?: boolean): void {
        this.selCurrent = this.selPinned = undefined; // clear old selection (primary scale could be changed)

        if (checkSchema) {
            //check against the json schema
            try {
                validateSchema(this.template, "WellLogTemplate");
                if (this.props.checkDatafileSchema) {
                    validateSchema(this.props.welllog, "WellLog");
                }
            } catch (e) {
                this.setState({ errorText: String(e) });
            }
        }

        if (this.logController) {
            const axes = this.getAxesInfo();
            this.scaleInterpolator = setTracksToController(
                this.logController,
                axes,
                this.props.welllog,
                this.template,
                this.props.colorTables
            );
            addWellPickOverlay(this.logController, this);
        }
        this.onTrackScroll();
        this.onTrackSelection();
        this.setInfo(); // Clear old track information
    }

    findTrackById(trackId: string | number): Track | undefined {
        return this.logController?.tracks.find(function (track: Track) {
            return track.id === trackId;
        });
    }

    /**
      Display current state of track scrolling
      */
    onTrackScroll(): void {
        const iFrom = this.getTrackScrollPos();
        const iTo = iFrom + this._maxVisibleTrackNum();
        if (this.logController) scrollTracksTo(this.logController, iFrom, iTo);

        if (this.props.onTrackScroll) this.props.onTrackScroll();
    }
    onTrackSelection(): void {
        if (this.props.onTrackSelection) this.props.onTrackSelection();
    }

    setInfo(x: number = Number.NaN): void {
        if (!this.props.onInfo) return; // no callback is given
        if (!this.logController) return; // not initialized yet

        if (isNaN(x) && this.selCurrent !== undefined) x = this.selCurrent;

        const iFrom = this.getTrackScrollPos();
        const iTo = iFrom + this._maxVisibleTrackNum();
        this.props.onInfo(x, this.logController, iFrom, iTo);
    }

    onContentRescale(): void {
        this.showSelection();

        if (this.props.onContentRescale) this.props.onContentRescale();
    }

    onContentSelection(): void {
        this.showSelection();
        if (this.props.onContentSelection) this.props.onContentSelection();
    }

    onTrackMouseEvent(ev: TrackMouseEvent): void {
        if (this.props.onTrackMouseEvent)
            this.props.onTrackMouseEvent(this, ev);
    }

    onTemplateChanged(): void {
        this.setInfo();

        this.template = this._generateTemplate(); // save current template

        if (this.props.onTemplateChanged) this.props.onTemplateChanged();
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
    showSelection(): void {
        if (this.logController) {
            const rbelm = this.logController.overlay.elements["rubber-band"];
            const pinelm = this.logController.overlay.elements["pinned"];
            if (rbelm && pinelm) {
                rbelm.style.visibility =
                    this.selCurrent === undefined ? "hidden" : "visible";
                pinelm.style.visibility =
                    this.selPinned === undefined ? "hidden" : "visible";
                showSelection(
                    rbelm,
                    pinelm,
                    this.selCurrent,
                    this.selPinned,
                    this.props.horizontal,
                    this.logController
                );
            }

            const wellpick = this.props.wellpick;
            if (wellpick) {
                const wps = getWellPicks(this);
                if (!wps.length) return;
                for (const wp of wps) {
                    const horizon = wp.horizon;
                    const vPrimary = wp.vPrimary;

                    const pinelm =
                        this.logController.overlay.elements["wp" + horizon];
                    if (!pinelm) continue;
                    showWellPicks(
                        pinelm,
                        vPrimary,
                        this.props.horizontal,
                        this.logController
                    );
                }
            }
        }
    }
    selectContent(selection: [number | undefined, number | undefined]): void {
        this.selCurrent = selection[0];
        this.selPinned = selection[1];
        this.selPersistent = this.selPinned !== undefined;

        this.showSelection();
        this.setInfo(); // reflect new value in this.selCurrent
    }

    setContentBaseDomain(domain: [number, number]): void {
        if (this.logController)
            return setContentBaseDomain(this.logController, domain);
    }
    getContentBaseDomain(): [number, number] {
        if (this.logController) return getContentBaseDomain(this.logController);
        return [0.0, 0.0];
    }
    getContentDomain(): [number, number] {
        if (this.logController) return getContentDomain(this.logController);
        return [0.0, 0.0];
    }
    getContentZoom(): number {
        if (this.logController) return getContentZoom(this.logController);
        return 1.0;
    }
    getContentSelection(): [number | undefined, number | undefined] {
        if (!this.logController) return [undefined, undefined];
        return [this.selCurrent, this.selPinned];
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
    _maxVisibleTrackNum(): number {
        return this.props.maxVisibleTrackNum
            ? this.props.maxVisibleTrackNum
            : 5 /*some default value*/;
    }

    scrollTrackBy(delta: number): void {
        this.setState((state: Readonly<State>) => ({
            scrollTrackPos: this._newTrackScrollPos(
                state.scrollTrackPos + delta
            ),
        }));
    }

    scrollTrackTo(pos: number): void {
        this.setState((state: Readonly<State>) => {
            const newPos = this._newTrackScrollPos(pos);
            if (state.scrollTrackPos === newPos) return null;
            return { scrollTrackPos: newPos };
        });
    }
    getTrackScrollPos(): number {
        return this.state.scrollTrackPos;
    }
    getTrackScrollPosMax(): number {
        // for scrollbar
        const nGraphTracks = this._graphTrackMax();
        let posMax = nGraphTracks - this._maxVisibleTrackNum();
        if (posMax < 0) posMax = 0;
        return posMax;
    }
    getTrackZoom(): number {
        return this._graphTrackMax() / this._maxVisibleTrackNum();
    }

    getSelectedTrackIndices(): number[] {
        return getSelectedTrackIndices(this.logController);
    }
    setSelectedTrackIndices(selection: number[]): boolean {
        const changed = setSelectedTrackIndices(this.logController, selection);
        if (changed) this.onTrackSelection();
        return changed;
    }

    getTemplate(): Template {
        return this.template;
    }
    setTemplate(template: Template): void {
        const tNew = JSON.stringify(template);
        const t = JSON.stringify(this.template);
        if (t !== tNew) {
            this.template = JSON.parse(tNew); // save external template content to current
            this.setTracks(true);
            /* not sure */ this.onTemplateChanged();
        }
    }

    _generateTemplate(): Template {
        const template = this.template;
        const tracks: TemplateTrack[] = [];
        if (this.logController) {
            for (const track of this.logController.tracks) {
                if (isScaleTrack(track)) continue;
                const templateTrack = getTrackTemplate(track);
                tracks.push(deepCopy(templateTrack));
            }
        }
        return {
            name: template.name,
            scale: {
                primary: this.props.primaryAxis,
                allowSecondary: template.scale?.allowSecondary,
            },
            tracks: tracks,
            styles: template.styles,
        };
    }

    // editting
    _addTrack(trackCurrent: Track, templateTrack: TemplateTrack): void {
        templateTrack.required = true; // user's tracks could be empty
        const bAfter = true;

        let trackNew: Track | null;
        if (
            templateTrack.plots &&
            templateTrack.plots[0] &&
            templateTrack.plots[0].type === "stacked"
        ) {
            trackNew = addOrEditStackedTrack(
                this,
                null,
                templateTrack,
                trackCurrent,
                bAfter
            );
        } else {
            trackNew = addOrEditGraphTrack(
                this,
                null,
                templateTrack,
                trackCurrent,
                bAfter
            );
        }
        if (trackNew) {
            this.onTemplateChanged();

            if (bAfter)
                // force new track to be visible when added after the current
                this.scrollTrackBy(+1);
            else {
                this.onTrackScroll();
                this.setInfo();
            }
            this.selectTrack(trackNew, true);
        }
    }

    _editTrack(track: Track, templateTrack: TemplateTrack): void {
        if (templateTrack.plots && templateTrack.plots[0].type === "stacked") {
            addOrEditStackedTrack(
                this,
                track as StackedTrack,
                templateTrack,
                track,
                false
            );
        } else {
            addOrEditGraphTrack(
                this,
                track as GraphTrack,
                templateTrack,
                track,
                false
            );
        }
        this.onTemplateChanged();
    }

    removeTrack(track: Track): void {
        if (this.logController) {
            this.logController.removeTrack(track);

            this.onTrackScroll();
            this.onTrackSelection();
            this.onTemplateChanged();
        }
    }

    isTrackSelected(track: Track): boolean {
        return (
            !!this.logController && isTrackSelected(this.logController, track)
        );
    }

    selectTrack(track: Track, selected: boolean): boolean {
        let changed = false;
        if (this.logController)
            for (const _track of this.logController.tracks) {
                // single selection: remove selection from another tracks
                if (
                    selectTrack(
                        this.logController,
                        _track,
                        selected && track === _track
                    )
                )
                    changed = true;
            }
        if (changed) this.onTrackSelection();

        return changed;
    }

    addTrackPlot(track: Track, templatePlot: TemplatePlot): void {
        addOrEditGraphTrackPlot(this, track as GraphTrack, null, templatePlot);
        this.onTemplateChanged();
    }

    _editTrackPlot(
        track: Track,
        plot: Plot,
        _templatePlot: TemplatePlot
    ): void {
        const templatePlot = { ..._templatePlot };
        /* We have special option for track scale!
        const templateTrack = getTrackTemplate(track);
        if (templatePlot.scale === templateTrack.scale)
            templatePlot.scale = undefined;
        */

        addOrEditGraphTrackPlot(this, track as GraphTrack, plot, templatePlot);
        this.onTemplateChanged();
    }

    removeTrackPlot(track: Track, plot: Plot): void {
        removeGraphTrackPlot(this, track as GraphTrack, plot);
        const templateTrack = getTrackTemplate(track);
        templateTrack.required = true; // user's tracks could be empty
        this.onTemplateChanged();
    }

    // Dialog functions
    addTrack(parent: HTMLElement | null, trackCurrent: Track): void {
        if (parent) {
            addTrack(parent, this, this._addTrack.bind(this, trackCurrent));
        }
    }
    editTrack(parent: HTMLElement | null, track: Track): void {
        if (parent) {
            const templateTrack = getTrackTemplate(track);
            editTrack(
                parent,
                this,
                templateTrack,
                this._editTrack.bind(this, track)
            );
        }
    }
    addPlot(parent: HTMLElement | null, track: Track): void {
        if (parent) {
            addPlot(parent, this, track);
        }
    }
    editPlot(parent: HTMLElement | null, track: Track, plot: Plot): void {
        if (parent) {
            const templateTrack = getTrackTemplate(track);
            const templatePlot = fillPlotTemplate(templateTrack, plot);
            editPlot(
                parent,
                this,
                track,
                templatePlot,
                this._editTrackPlot.bind(this, track, plot)
            );
        }
    }

    render(): ReactNode {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div
                    style={{ flex: "1, 1" }}
                    className="welllogview"
                    ref={(el) => (this.container = el as HTMLElement)}
                />
                {this.state.errorText ? (
                    <div style={{ flex: "0, 0" }} className="welllogview-error">
                        {this.state.errorText}
                    </div>
                ) : (
                    <></>
                )}
            </div>
        );
    }
}

export default WellLogView;
