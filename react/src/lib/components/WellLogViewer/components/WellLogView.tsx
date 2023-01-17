import React, { Component } from "react";
import { LogViewer } from "@equinor/videx-wellog";

import PropTypes from "prop-types";

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
import { PatternsTable } from "../utils/pattern";

import { getDiscreteColorAndName, getDiscreteMeta } from "../utils/tracks";
import { createTracks } from "../utils/tracks";
import { getScaleTrackNum } from "../utils/tracks";
import { AxesInfo } from "../utils/tracks";
import { ExtPlotOptions } from "../utils/tracks";
import { getTrackTemplate } from "../utils/tracks";
import { isScaleTrack } from "../utils/tracks";
import { deepCopy } from "../utils/deepcopy";

import {
    addOrEditGraphTrack,
    addOrEditGraphTrackPlot,
    addOrEditStackedTrack,
    removeGraphTrackPlot,
} from "../utils/tracks";
import { getPlotType } from "../utils/tracks";
import { getAvailableAxes } from "../utils/tracks";

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

const rubberBandSize = 9;
const rubberBandOffset = rubberBandSize / 2;

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

    rbelm.style[horizontal ? "left" : "top"] = `${v - rubberBandOffset}px`;
    rbelm.style.visibility = "visible";

    if (vPin !== undefined && Number.isFinite(vPin)) {
        const pinelm1 = pinelm.firstElementChild as HTMLElement;
        let min, max;
        if (vPin < vCur) {
            pinelm1.style[
                horizontal ? "left" : "top"
            ] = `${rubberBandOffset}px`;
            pinelm1.style[horizontal ? "right" : "bottom"] = "";
            min = vPin;
            max = vCur;
        } else {
            pinelm1.style[
                horizontal ? "right" : "bottom"
            ] = `${rubberBandOffset}px`;
            pinelm1.style[horizontal ? "left" : "top"] = "";
            min = vCur;
            max = vPin;
        }

        min = logViewer.scale(min);
        max = logViewer.scale(max);

        const x = min - rubberBandOffset;
        const w = max - min + rubberBandSize;
        pinelm.style[horizontal ? "left" : "top"] = `${x}px`;
        pinelm.style[horizontal ? "width" : "height"] = `${w}px`;
    } else {
        pinelm.style.visibility = "hidden";
    }
}

function addRubberbandOverlay(instance: LogViewer, parent: WellLogView) {
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
        .classed("rubber-band", true) // for CSS customization
        .style(horizontal ? "width" : "height", `${rubberBandSize}px`)
        .style(horizontal ? "height" : "width", `${100}%`)
        .style("visibility", "hidden");

    rb.append("div")
        .style(horizontal ? "width" : "height", "1px")
        .style(horizontal ? "height" : "width", `${100}%`)
        .style(horizontal ? "left" : "top", `${rubberBandOffset}px`)
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
                const axisTitle =
                    !parent.props.axisTitles || !parent.props.primaryAxis
                        ? undefined
                        : parent.props.axisTitles[parent.props.primaryAxis];
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
                const axisTitles = parent.props.axisTitles;
                const axisTitle = !axisTitles
                    ? undefined
                    : parent.props.primaryAxis
                    ? axisTitles[parent.props.primaryAxis]
                    : axisTitles[0];
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
    elm.className = "depth"; // for CSS customization
    elm.style.visibility = "hidden";
    elm.style.position = "absolute";
}

function addPinnedValueOverlay(instance: LogViewer, parent: WellLogView) {
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
        .classed("pinned", true) // for CSS customization
        .style(horizontal ? "width" : "height", `${rubberBandSize}px`)
        .style(horizontal ? "height" : "width", `${100}%`)
        .style(horizontal ? "top" : "left", `${0}px`)
        .style("position", "absolute")
        .style("visibility", "hidden");

    pin.append("div")
        .style(horizontal ? "width" : "height", "1px")
        .style(horizontal ? "height" : "width", `${100}%`)
        .style(horizontal ? "left" : "top", `${rubberBandOffset}px`)
        .style("position", "absolute");
}

export interface WellPickProps {
    wellpick: WellLog; // JSON Log Format
    name: string; //  "HORIZON"
    md?: string; //  Log mnemonics for depth log. default is "MD"
    /**
     * Prop containing color table data for well picks
     */
    colorTables: ColorTable[];
    color: string; // "Stratigraphy" ...
}

const wpSize = 3; //9;
const wpOffset = wpSize / 2;

function showWellPick(
    elm: HTMLElement,
    vCur: number | undefined,
    horizontal: boolean | undefined,
    logViewer: LogViewer /*LogController*/
) {
    if (vCur === undefined) {
        elm.style.visibility = "hidden";
        return;
    }
    const v = logViewer.scale(vCur);
    if (!Number.isFinite(v)) {
        // logViewer could be empty
        elm.style.visibility = "hidden";
        return;
    }

    elm.style[horizontal ? "left" : "top"] = `${v - wpOffset}px`;
    elm.style.visibility = "visible";
}

function fillWellPicks(
    elm: HTMLElement,
    vCur: number | undefined,
    vCur2: number | undefined,
    horizontal: boolean | undefined,
    logViewer: LogViewer /*LogController*/
) {
    if (vCur === undefined) {
        elm.style.visibility = "hidden";
        return;
    }
    const v = logViewer.scale(vCur);
    if (!Number.isFinite(v)) {
        // logViewer could be empty
        elm.style.visibility = "hidden";
        return;
    }
    if (vCur2 === undefined) {
        elm.style.visibility = "hidden";
        return;
    }
    const v2 = logViewer.scale(vCur2);
    if (!Number.isFinite(v2)) {
        // logViewer could be empty
        elm.style.visibility = "hidden";
        return;
    }

    elm.style[horizontal ? "left" : "top"] = `${v}px`; // /*- offset*/
    elm.style[horizontal ? "width" : "height"] = `${v2 - v}px`;
    elm.style.visibility = "visible";

    const elm1 = elm.querySelector("div.wellpick-pattern") as HTMLDivElement;
    if (elm1) {
        const backgroundPosition =
            "background-position-" + (horizontal ? "x" : "y");
        elm1.style[backgroundPosition as unknown as number] = `${-v}px`;
    }
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
    if (!wellpick.wellpick) {
        console.error("No WellLog object in WellLogView prop.wellpick given");
        return wps;
    }

    const curves = wellpick.wellpick.curves;
    const mnemo = wellpick.md ? wellpick.md : "MD";
    const md = _getLogIndexByNames(curves, [mnemo]);
    if (md < 0) {
        console.error("Depth log '" + mnemo + "' is not found for wellpicks");
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

function posWellPickTitles(instance: LogViewer, parent: WellLogView) {
    if (parent.logController && parent.props.wellpick) {
        const element: HTMLElement = instance.overlay.elm.node();
        if (element) {
            const horizontal = parent.props.horizontal;
            let i = 0;
            for (const track of parent.logController.tracks) {
                if (!isScaleTrack(track)) continue;
                const elm = (track as Track).elm;
                const style = "wp-title-" + i;
                for (const _td of element.querySelectorAll("td." + style)) {
                    const td = _td as HTMLElement;
                    td.style.position = "absolute";
                    if (horizontal) {
                        td.style.top = elm.offsetTop + "px";
                    } else {
                        td.style.left = elm.offsetLeft + "px";
                        if (elm.offsetWidth < 38) {
                            td.style.width = "";
                            td.style.top = "-11px";
                            td.classList.add("vertical-text");
                        } else {
                            td.style.width = elm.offsetWidth + "px";
                            td.style.top = "";
                            td.classList.remove("vertical-text");
                        }
                    }
                }
                i++;
            }
        }
    }
}

function addWellPickOverlay(instance: LogViewer, parent: WellLogView) {
    {
        /* clear old wellpicks */
        for (const elmName in instance.overlay.elements) {
            if (elmName.substring(0, 2) == "wp")
                // "wpFill" + horizon; "wp" + horizon;
                instance.overlay.remove(elmName); // clear old if exists
        }
    }

    const wellpick = parent.props.wellpick;
    if (!wellpick) return;

    const wps = getWellPicks(parent);
    if (!wps.length) return;

    //const primaryAxis = parent.props.primaryAxis;
    const horizontal = parent.props.horizontal;

    const wellpickColorFill = parent.props.options?.wellpickColorFill;
    const patternsTable = parent.props.patternsTable;
    const patterns = parent.props.patterns;
    const wellpickPatternFill =
        patternsTable && patterns && parent.props.options?.wellpickPatternFill;
    const patternSize = patternsTable?.patternSize;
    const patternImages = patternsTable?.patternImages;

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
            : /*(primaryAxis === "md" ? "TVD:" : "MD:") +*/ vSecondary?.toFixed(
                  0
              );

        const elmName = "wp" + horizon;
        const pinelm = instance.overlay.create(elmName, {});

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
            .classed("wellpick", true) // for CSS customization
            .style(horizontal ? "width" : "height", `${wpSize}px`)
            .style(horizontal ? "height" : "width", `${100}%`)
            .style(horizontal ? "top" : "left", `${0}px`)
            .style("position", "absolute")
            .style("background-color", rgba)
            .style("visibility", "false");

        pin.append("div")
            .html(
                horizontal
                    ? "<table height=100%'>" +
                          "<tr><td class='wp-title-0'>" +
                          "<span " +
                          styleText +
                          ">" +
                          txtPrimary +
                          "</span>" +
                          "</td></tr>" +
                          "<tr><td class='wp-title-1'>" +
                          "<span " +
                          styleText +
                          ">" +
                          txtSecondary +
                          "</span>" +
                          "</td></tr>" +
                          "<tr><td height=100%>" +
                          "<span " +
                          styleText +
                          ">" +
                          horizon +
                          "</span>" +
                          "</td></tr>" +
                          "</table>"
                    : "<table width=100% style='position:relative; top:-1.5em;'><tr>" +
                          "<td class='wp-title-0'>" +
                          "<span " +
                          styleText +
                          ">" +
                          txtPrimary +
                          "</span>" +
                          "</td>" +
                          "<td class='wp-title-1'>" +
                          "<span " +
                          styleText +
                          ">" +
                          txtSecondary +
                          "</span>" +
                          "</td>" +
                          "<td align=center>" +
                          "<span " +
                          styleText +
                          ">" +
                          horizon +
                          "</span>" +
                          "</td>" +
                          "</tr></table>"
            )
            .style("position", "absolute")
            .style(horizontal ? "width" : "height", "1px")
            .style(horizontal ? "height" : "width", `${100}%`)
            .style("background-color", rgba);
        {
            // Filling
            const elmName = "wpFill" + horizon;
            if (wellpickPatternFill || wellpickColorFill) {
                const pinelm = instance.overlay.create(elmName, {});
                const pin = select(pinelm)
                    .style("position", "absolute")
                    .style(horizontal ? "width" : "height", `${wpSize}px`)
                    .style(horizontal ? "height" : "width", `${100}%`)
                    .style(horizontal ? "top" : "left", `${0}px`)
                    .style("visibility", "false");
                if (wellpickColorFill) {
                    pin.append("div")
                        .classed("wellpick-fill", true) // for CSS customization
                        .style("width", "100%")
                        .style("height", "100%")
                        .style("background-color", rgba);
                }
                if (wellpickPatternFill) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const pattern = patterns!.find(
                        (value: [string, number]) => value[0] === horizon
                    );

                    if (pattern !== undefined) {
                        const imageIndex = pattern[1];
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        const patternImage = patternImages![imageIndex];
                        pin.append("div")
                            .classed("wellpick-pattern", true) // for CSS customization
                            .style("position", "absolute")
                            .style("left", "0px")
                            .style("top", "0px")
                            .style("width", "100%")
                            .style("height", "100%")
                            .style(
                                "background-size",
                                patternSize + "px " + patternSize + "px"
                            )
                            .style(
                                "background-image",
                                "url('" + patternImage + "')"
                            );
                    }
                }
            }
        }
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
    colorTables?: ColorTable[] // JSON
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
    setContentScale(value: number): void;
    getContentScale(): number;

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

export function getContentBaseScale(
    controller: WellLogController | null,
    horizontal: boolean | undefined
): number {
    if (controller) {
        const base = controller.getContentBaseDomain();
        const wellLogView = controller as WellLogView;
        const logController = wellLogView.logController;
        if (logController) {
            const overlay = logController?.overlay;
            const source = overlay?.elm.node();
            if (source) {
                const clientSize = horizontal
                    ? source.clientWidth
                    : source.clientHeight;
                const m = clientSize * (0.0254 / 96); // "screen" CSS height in meters
                return (base[1] - base[0]) / m;
            }
        }
    }
    return 16000;
}
export function setContentScale(
    controller: WellLogController | null,
    horizontal: boolean | undefined,
    value: number
): void {
    if (controller) {
        const zoom = getContentBaseScale(controller, horizontal) / value;
        controller.zoomContent(zoom);
    }
}

import { Info } from "./InfoTypes";

export interface WellLogViewOptions {
    /**
     * Fill with color between well picks
     */
    wellpickColorFill?: boolean;
    /**
     * Fill with pattern between well picks
     */
    wellpickPatternFill?: boolean;

    /**
     * The maximum zoom value
     */
    maxContentZoom?: number; // default is 256
    /**
     * The maximum number of visible tracks
     */
    maxVisibleTrackNum?: number; // default is horizontal ? 3: 5
    /**
     * Validate JSON datafile against schema
     */
    checkDatafileSchema?: boolean;
    /**
     * Hide titles of the track. Default is false
     */
    hideTrackTitle?: boolean;
    /**
     * Hide Legends on the tracks
     */
    hideTrackLegend?: boolean;
}

export interface WellLogViewProps {
    /**
     * Object from JSON file describing single well log data.
     */
    welllog: WellLog | undefined;

    /**
     * Prop containing track template data.
     */
    template: Template;

    /**
     * Prop containing color table data for discrete well logs
     */
    colorTables: ColorTable[];

    /**
     * Well Picks data
     */
    wellpick?: WellPickProps;

    /**
     * Patterns table
     */
    patternsTable?: PatternsTable;

    /**
     * Horizon to pattern index map
     */
    patterns?: [string, number][];

    /**
     * Orientation of the track plots on the screen.
     */
    horizontal?: boolean;

    /**
     * Primary axis id: "md", "tvd", "time"... Default is the first available from axisMnemos
     */
    primaryAxis?: string;

    /**
     * Log mnemonics for axes
     */
    axisTitles: Record<string, string>;

    /**
     * Names for axes
     */
    axisMnemos: Record<string, string[]>;

    /**
     * The view title. Set desired string or react element or true for default value from welllog file
     */
    viewTitle?: boolean | string | JSX.Element;

    /**
     * Initial visible range
     */
    domain?: [number, number];

    /**
     * Initial selected range
     */
    selection?: [number | undefined, number | undefined];

    /**
     * Additional options
     */
    options?: WellLogViewOptions;

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

export const argTypesWellLogViewProp = {
    horizontal: {
        description: "Orientation of the track plots on the screen.", // defaultValue: false
    },
    welllog: {
        description: "JSON object describing well log data.",
    },
    template: {
        description: "Prop containing track template data.",
    },
    colorTables: {
        description: "Prop containing color table data for discrete well logs.",
    },
    wellpick: {
        description: "Well Picks data",
    },
    patternsTable: {
        description: "Patterns table",
    },
    patterns: {
        description: "Horizon to pattern index map",
    },

    domain: {
        description: "Initial visible range",
    },
    selection: {
        description: "Initial selected range",
    },
    primaryAxis: {
        description: "Primary axis id", //?? defaultValue: "md"
    },
    axisMnemos: {
        description: "Log mnemonics for axes",
    },
    axisTitles: {
        description: "Names for axes",
    },
    viewTitle: {
        description:
            "The view title. Set desired string or react element or true for default value from welllog file",
    },
    options: {
        description:
            "Additional options:<br/>" +
            "maxContentZoom: The maximum zoom value (default 256)<br/>" +
            "maxVisibleTrackNum: The maximum number of visible tracks<br/>" +
            "checkDatafileSchema: Validate JSON datafile against schema<br/>" +
            "hideTrackTitle: Hide titles on the tracks<br/>" +
            "hideLegend: Hide legends on the tracks.",
    },
    // callbacks...
};

export function shouldUpdateWellLogView(
    props: WellLogViewProps,
    nextProps: WellLogViewProps
): boolean {
    // Props could contain some unknown object key:value so we should ignore they
    // so compare only known key:values
    if (props.horizontal !== nextProps.horizontal) return true;
    if (props.options?.hideTrackTitle !== nextProps.options?.hideTrackTitle)
        return true;
    if (props.options?.hideTrackLegend !== nextProps.options?.hideTrackLegend)
        return true;

    if (props.welllog !== nextProps.welllog) return true;
    if (props.template !== nextProps.template) return true;
    if (props.colorTables !== nextProps.colorTables) return true;
    if (props.wellpick !== nextProps.wellpick) return true;
    if (props.primaryAxis !== nextProps.primaryAxis) return true;
    if (props.axisTitles !== nextProps.axisTitles) return true;
    if (props.axisMnemos !== nextProps.axisMnemos) return true;

    if (
        props.options?.maxVisibleTrackNum !==
        nextProps.options?.maxVisibleTrackNum
    )
        return true;
    if (props.options?.maxContentZoom !== nextProps.options?.maxContentZoom)
        return true;

    if (!isEqualRanges(props.domain, nextProps.domain)) return true;
    if (!isEqualRanges(props.selection, nextProps.selection)) return true;

    if (
        props.options?.checkDatafileSchema !==
        nextProps.options?.checkDatafileSchema
    )
        return true;

    if (
        props.options?.wellpickColorFill !==
        nextProps.options?.wellpickColorFill
    )
        return true;
    if (
        props.options?.wellpickPatternFill !==
        nextProps.options?.wellpickPatternFill
    )
        return true;

    if (props.viewTitle !== nextProps.viewTitle) return true;

    // callbacks
    // ignore all?

    return false;
}

export function isEqualRanges(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    d1: undefined | [any, any],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    d2: undefined | [any, any]
): boolean {
    if (!d1) return !d2;
    if (!d2) return !d1;
    return d1[0] === d2[0] && d1[1] === d2[1];
}

interface State {
    infos: Info[];

    scrollTrackPos: number; // the first visible non-scale track number
    errorText?: string;
}

class WellLogView
    extends Component<WellLogViewProps, State>
    implements WellLogController
{
    public static propTypes: Record<string, unknown>;

    container?: HTMLElement;
    resizeObserver: ResizeObserver;

    logController?: LogViewer;
    selCurrent: number | undefined; // current mouse position
    selPinned: number | undefined; // pinned position
    selPersistent: boolean | undefined;

    template: Template;

    scaleInterpolator: ScaleInterpolator | undefined;

    constructor(props: WellLogViewProps) {
        super(props);
        this.container = undefined;
        this.logController = undefined;
        this.selCurrent = undefined;
        this.selPinned = undefined;
        this.selPersistent = undefined;

        this.resizeObserver = new ResizeObserver(
            (entries: ResizeObserverEntry[]): void => {
                const entry = entries[0];
                if (entry && entry.target) {
                    //const Width = (entry.target as HTMLElement).offsetWidth;
                    //const Height = (entry.target as HTMLElement).offsetHeight;

                    if (this.logController)
                        posWellPickTitles(this.logController, this);

                    this.onContentRescale();
                }
            }
        );

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

        this.setControllerZoom();
    }

    componentDidMount(): void {
        this.createLogViewer();

        this.template = deepCopy(this.props.template); // save external template content to current
        this.setTracks(true);
    }

    shouldComponentUpdate(
        nextProps: WellLogViewProps,
        nextState: State
    ): boolean {
        if (shouldUpdateWellLogView(this.props, nextProps)) return true;

        if (this.state.scrollTrackPos !== nextState.scrollTrackPos) return true;
        if (this.state.errorText !== nextState.errorText) return true;

        return false;
    }
    componentDidUpdate(prevProps: WellLogViewProps, prevState: State): void {
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
            this.props.options?.hideTrackTitle !==
                prevProps.options?.hideTrackTitle ||
            this.props.options?.hideTrackLegend !==
                prevProps.options?.hideTrackLegend ||
            this.props.options?.maxContentZoom !==
                prevProps.options?.maxContentZoom
        ) {
            selection = this.getContentSelection();
            selectedTrackIndices = this.getSelectedTrackIndices();
            this.createLogViewer();
            shouldSetTracks = true;
        }

        if (
            this.props.welllog !== prevProps.welllog ||
            this.props.options?.checkDatafileSchema !==
                prevProps.options?.checkDatafileSchema
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
        } else if (
            this.props.wellpick !== prevProps.wellpick ||
            this.props.options?.wellpickPatternFill !==
                prevProps.options?.wellpickPatternFill ||
            this.props.options?.wellpickColorFill !==
                prevProps.options?.wellpickColorFill
        ) {
            if (this.logController) {
                addWellPickOverlay(this.logController, this);
                this.showSelection();
            }
        }
        if (shouldSetTracks) {
            this.setTracks(checkSchema); // use this.template
            setSelectedTrackIndices(this.logController, selectedTrackIndices);
            if (selection) this.selectContent(selection);
        } else if (
            this.state.scrollTrackPos !== prevState.scrollTrackPos ||
            this.props.options?.maxVisibleTrackNum !==
                prevProps.options?.maxVisibleTrackNum
        ) {
            this.onTrackScroll();
            this.onTrackSelection();
            this.setInfo();
        }

        if (
            this.props.domain &&
            (!prevProps.domain ||
                this.props.domain[0] !== prevProps.domain[0] ||
                this.props.domain[1] !== prevProps.domain[1])
        ) {
            this.setControllerZoom();
        }

        if (
            this.props.selection &&
            (!prevProps.selection ||
                this.props.selection[0] !== prevProps.selection[0] ||
                this.props.selection[1] !== prevProps.selection[1])
        ) {
            this.setControllerSelection();
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
                showTitles: !this.props.options?.hideTrackTitle,
                showLegend: !this.props.options?.hideTrackLegend,
                maxZoom: this.props.options?.maxContentZoom,
                onTrackEnter: (elm: HTMLElement, track: Track) =>
                    addTrackMouseEventHandlers(
                        elm,
                        track,
                        this.onTrackMouseEvent
                    ),
            });

            this.logController.init(this.container);
            if (this.container) this.resizeObserver.observe(this.container);
            //if (this.container) this.resizeObserver.unobserve(this.container);

            initOverlays(this.logController, this);
        }
        this.setInfo();
    }
    getAxesInfo(): AxesInfo {
        // get Object keys available in the welllog
        const axes = getAvailableAxes(
            this.props.welllog,
            this.props.axisMnemos
        );
        const primaryAxisIndex = axes.findIndex(
            (value: string) => value === this.props.primaryAxis
        );
        return {
            primaryAxis: this.props.primaryAxis || "",
            secondaryAxis:
                this.props.template &&
                this.props.template.scale &&
                this.props.template.scale.allowSecondary &&
                axes.length > 1 // get next in available axes
                    ? axes[primaryAxisIndex + 1] || axes[0]
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
                if (this.props.options?.checkDatafileSchema) {
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
    setControllerZoom(): void {
        if (this.props.domain) this.zoomContentTo(this.props.domain);
    }
    setControllerSelection(): void {
        if (this.props.selection) this.selectContent(this.props.selection);
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
        if (!this.logController) return;
        const elements = this.logController.overlay.elements;
        const rbelm = elements["rubber-band"];
        const pinelm = elements["pinned"];
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
            let i = 0;
            for (const wp of wps) {
                const horizon = wp.horizon;
                const vPrimary = wp.vPrimary;
                const elmName = "wp" + horizon;
                const pinelm = elements[elmName];
                if (!pinelm) continue;
                showWellPick(
                    pinelm,
                    vPrimary,
                    this.props.horizontal,
                    this.logController
                );
                if (this.props.patterns) {
                    const elmName1 = "wpFill" + horizon;
                    const pinelm1 = elements[elmName1];
                    if (pinelm1) {
                        const wp2 = wps[i + 1];
                        const vPrimary2 = wp2?.vPrimary;
                        fillWellPicks(
                            pinelm1,
                            vPrimary,
                            vPrimary2,
                            this.props.horizontal,
                            this.logController
                        );
                    }
                }
                i++;
            }
            posWellPickTitles(this.logController, this);
        }
    }
    selectContent(selection: [number | undefined, number | undefined]): void {
        const selPinned = selection[1];
        if (this.selCurrent === selection[0] && this.selPinned === selPinned)
            return;
        this.selCurrent = selection[0];
        this.selPinned = selPinned;
        this.selPersistent = this.selPinned !== undefined;

        this.showSelection();
        this.setInfo(); // reflect new value in this.selCurrent
    }

    setContentBaseDomain(domain: [number, number]): void {
        if (this.logController)
            setContentBaseDomain(this.logController, domain);
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
    setContentScale(value: number): void {
        return setContentScale(this, this.props.horizontal, value);
    }
    getContentScale(): number {
        const zoomValue = this.getContentZoom();
        const baseScale = getContentBaseScale(this, this.props.horizontal);
        return baseScale / zoomValue;
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
        return this.props.options?.maxVisibleTrackNum
            ? this.props.options?.maxVisibleTrackNum
            : this.props.horizontal
            ? 3
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
        const axes = getAvailableAxes(
            this.props.welllog,
            this.props.axisMnemos
        );
        return {
            name: template.name,
            scale: {
                primary: this.props.primaryAxis || "" /* no scale track */,
                allowSecondary:
                    template.scale?.allowSecondary && axes.length > 1,
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

    render(): JSX.Element {
        const horizontal = this.props.horizontal;
        const viewTitle = this.props.viewTitle;
        return (
            <div
                className="welllogview"
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: horizontal ? "row" : "column",
                }}
            >
                {viewTitle && (
                    <div
                        style={{
                            flex: "0, 0",
                            writingMode: horizontal ? "vertical-lr" : undefined,
                            transform: horizontal
                                ? "rotate(180deg)"
                                : undefined,
                        }}
                        className="title"
                    >
                        {typeof viewTitle === "object" /*react element*/
                            ? viewTitle
                            : viewTitle === true
                            ? this.props.welllog?.header.well
                            : viewTitle}
                    </div>
                )}
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        flex: "1, 1",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div
                        style={{ flex: "1, 1" }}
                        ref={(el) => (this.container = el as HTMLElement)}
                    />
                    {this.state.errorText && (
                        <div style={{ flex: "0, 0" }} className="error">
                            {this.state.errorText}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

const WellLogViewOptions_propTypes = PropTypes.shape({
    /**
     * The maximum zoom value
     */
    maxContentZoom: PropTypes.number,

    /**
     * The maximum number of visible tracks
     */
    maxVisibleTrackNum: PropTypes.number,

    /**
     * Validate JSON datafile against schema4
     */
    checkDatafileSchema: PropTypes.bool,

    /**
     * Hide titles of the track. Default is false
     */
    hideTrackTitle: PropTypes.bool,

    /**
     * Hide legends of the track. Default is false
     */
    hideTrackLegend: PropTypes.bool,
});

WellLogView.propTypes = _propTypesWellLogView();

export function _propTypesWellLogView(): Record<string, unknown> {
    return {
        /**
         * The ID of this component, used to identify dash components
         * in callbacks. The ID needs to be unique across all of the
         * components in an app.
         */
        id: PropTypes.string,

        /**
         * An object from JSON file describing well log data
         */
        welllog: PropTypes.object, //.isRequired,

        /**
         * Prop containing track template data
         */
        template: PropTypes.object.isRequired,

        /**
         * Prop containing color table data for discrete well logs
         */
        colorTables: PropTypes.array.isRequired,

        /**
         * Well picks data
         */
        wellpick: PropTypes.object,

        /**
         * Patterns table
         */
        patternsTable: PropTypes.object,

        /**
         * Horizon to pattern index map
         */
        patterns: PropTypes.array, // [string, number][];

        /**
         * Orientation of the track plots on the screen. Default is false
         */
        horizontal: PropTypes.bool,

        /**
         * Primary axis id: " md", "tvd", "time"...
         */
        primaryAxis: PropTypes.string,

        /**
         * Log mnemonics for axes
         */
        axisTitles: PropTypes.object,

        /**
         * Names for axes
         */
        axisMnemos: PropTypes.object,

        /**
         * Set to true for default title or to some string or JSX.Element
         */
        viewTitle: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.string,
            PropTypes.object /* react element */,
        ]),

        /**
         * Initial visible interval of the log data
         */
        domain: PropTypes.arrayOf(PropTypes.number),

        /**
         * Initial selected interval of the log data
         */
        selection: PropTypes.arrayOf(PropTypes.number),

        /**
         * Additional options
         */
        options: WellLogViewOptions_propTypes,
    };
}

export default WellLogView;
