import "./styles.scss";

import { select } from "d3";
import type { ReactNode } from "react";
import React, { Component } from "react";
import { createRoot } from "react-dom/client";
import PropTypes from "prop-types";

import { LogViewer } from "@equinor/videx-wellog";
import type { ScaleInterpolator, Plot, Track } from "@equinor/videx-wellog";
import type {
    OverlayClickEvent,
    OverlayMouseExitEvent,
    OverlayMouseMoveEvent,
    OverlayRescaleEvent,
} from "@equinor/videx-wellog/dist/ui/interfaces";
import type { DifferentialPlotOptions } from "@equinor/videx-wellog/dist/plots/interfaces";
import type { DifferentialPlotLegendInfo } from "@equinor/videx-wellog/dist/plots/legend/interfaces";
import { validateSchema } from "@webviz/wsc-common";

import type { AxesInfo } from "../utils/axes";
import type { ColorMapFunction } from "../utils/color-function";
import { deepCopy } from "../utils/deepcopy";
import {
    createNewViewTrack,
    adjustControllerToModifiedTrack,
    getTrackIndex,
    setUpScaleInterpolator,
    getContentBaseDomain,
    getContentDomain,
    getContentZoom,
    getSelectedTrackIndices,
    isTrackSelected,
    removeOverlay,
    scrollContentTo,
    scrollTracksTo,
    selectTrack,
    setContentBaseDomain,
    setSelectedTrackIndices,
    zoomContent,
    zoomContentTo,
    editViewTrack,
    removeViewTrack,
} from "../utils/log-viewer";
import { isEqualRanges } from "../utils/arrays";
import type { Pattern, PatternsTable } from "../utils/pattern";
import type { ExtPlotOptions } from "../utils/plots";
import { getPlotType } from "../utils/plots";
import {
    addPlotToTrack,
    createWellLogTracks,
    editTrackPlot,
    getScaleTrackNum,
    getTrackTemplate,
    isScaleTrack,
    removeTrackPlot,
} from "../utils/tracks";
import { getStyledTemplateTracks } from "../utils/template";
import {
    getDiscreteColorAndName,
    getDiscreteMeta,
    getAvailableAxes,
    getWellLogSetsFromProps,
} from "../utils/well-log";

import {
    ColorFunctionType,
    PatternsTableType,
    PatternsType,
    TemplateType,
} from "./CommonPropTypes";
import type { Info } from "./InfoTypes";
import { PlotPropertiesDialog } from "./PlotDialog";
import { TrackPropertiesDialog } from "./TrackDialog";
import type { WellLogCurve, WellLogSet } from "./WellLogTypes";
import type {
    Template,
    TemplatePlot,
    TemplateTrack,
} from "./WellLogTemplateTypes";

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
            pinelm1.style[horizontal ? "left" : "top"] =
                `${rubberBandOffset}px`;
            pinelm1.style[horizontal ? "right" : "bottom"] = "";
            min = vPin;
            max = vCur;
        } else {
            pinelm1.style[horizontal ? "right" : "bottom"] =
                `${rubberBandOffset}px`;
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
            parent.setInfo(parent.selCurrent);
            parent.onContentSelection();
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
            if (
                parent.props.options?.hideCurrentPosition ||
                parent.props.options?.hideSelectionInterval
            )
                return;

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

                let axisTitle = undefined;
                if (axisTitles) {
                    axisTitle = parent.props.primaryAxis
                        ? axisTitles[parent.props.primaryAxis]
                        : axisTitles[0];
                }

                elem.textContent = Number.isFinite(value)
                    ? `${axisTitle ? axisTitle : ""}: ${value.toFixed(1)}`
                    : "-";
                elem.style.visibility = "visible";
            }
        },
        onMouseExit: (event: OverlayMouseExitEvent): void => {
            const elem = event.target;
            if (elem) elem.style.visibility = "hidden";
            parent.onTrackMouseLeaveEvent();
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
                if (pinelm.style.visibility === "visible") {
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
                    if (
                        parent.selCurrent === undefined &&
                        !parent.props.options?.hideCurrentPosition
                    )
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
    wellpick: WellLogSet; // JSON Log Format
    name: string; //  "HORIZON"
    md?: string; //  Log mnemonics for depth log. default is "MD"
    /**
     * Prop containing color tables or color functions array for well picks
     */
    colorMapFunctions: ColorMapFunction[];
    colorMapFunctionName: string; // "Stratigraphy" ..., "Step func", ...
}

export const WellPickPropsType = PropTypes.shape({
    wellpick: PropTypes.object /*Of<WellLog>*/.isRequired, // JSON Log Format
    name: PropTypes.string.isRequired,
    md: PropTypes.string,
    colorMapFunctions: PropTypes.arrayOf(ColorFunctionType).isRequired,
    colorMapFunctionName: PropTypes.string.isRequired,
});

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

            const colorMapFunction = wellpick.colorMapFunctions.find(
                (colorMapFunction) =>
                    colorMapFunction.name === wellpick.colorMapFunctionName
            );

            const meta = getDiscreteMeta(wellpick.wellpick, wellpick.name);
            const { color } = getDiscreteColorAndName(
                d[c],
                colorMapFunction,
                meta
            );

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
            if (elmName.substring(0, 2) === "wp")
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
                    const pattern = patterns.find(
                        (value: [string, number]) => value[0] === horizon
                    );

                    if (pattern !== undefined) {
                        const imageIndex = pattern[1];
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

function setTracksToController(
    logController: LogViewer,
    axes: AxesInfo,
    wellLogSets: WellLogSet[], // JSON Log Format
    templateTracks: TemplateTrack[], // JSON
    colorMapFunctions: ColorMapFunction[] // JS code array or JSON file for pure color tables array without color functions elements
): ScaleInterpolator {
    const { tracks, minmaxPrimaryAxis: minmaxPrimaryAxis } =
        createWellLogTracks(
            wellLogSets,
            axes,
            templateTracks,
            colorMapFunctions
        );
    logController.reset();

    const scaleInterpolator = setUpScaleInterpolator(
        logController,
        // ! We assume each set has the same index curves, so we just use the first one
        wellLogSets[0],
        axes
    );

    setContentBaseDomain(logController, minmaxPrimaryAxis);

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

function addPlot(
    parent: HTMLElement,
    wellLogView: WellLogView,
    track: Track
): void {
    const el: HTMLElement = document.createElement("div");
    el.style.width = "10px";
    el.style.height = "13px";
    parent.appendChild(el);

    createRoot(el).render(
        <PlotPropertiesDialog
            wellLogView={wellLogView}
            track={track}
            onOK={wellLogView.addTrackPlot.bind(wellLogView, track)}
        />
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
        scale: scale === "log" || scale === "linear" ? scale : undefined,
        name: (legend1 && legend1.label ? legend1.label : legend.label) || "",
        name2: legend2 && legend2.label ? legend2.label : "",
        color: (options1 ? options1.color : options.color) || "",
        color2: options2 ? options2.color : "",
        inverseColor: options.inverseColor || "",
        fill: (options1 ? options1.fill : options.fill) || "",
        fill2: options2 ? options2.fill : "",
        colorMapFunctionName: options.colorMapFunction?.name ?? "",
        inverseColorMapFunctionName:
            options.inverseColorMapFunction?.name ?? "",
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

    createRoot(el).render(
        <PlotPropertiesDialog
            templatePlot={templatePlot}
            wellLogView={wellLogView}
            track={track}
            onOK={onOK}
        />
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

    createRoot(el).render(
        <TrackPropertiesDialog wellLogView={wellLogView} onOK={onOK} />
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

    createRoot(el).render(
        <TrackPropertiesDialog
            templateTrack={templateTrack}
            wellLogView={wellLogView}
            onOK={onOK}
        />
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
    setContentBaseDomain(domain: [number, number]): boolean;
    getContentBaseDomain(): [number, number]; // full scale range
    getContentDomain(): [number, number]; // visible range
    getContentZoom(): number;
    getContentSelection(): [number | undefined, number | undefined]; // [current, pinned]
    setContentScale(value: number): void;
    getContentScale(): number;
    setControllerDefaultZoom(): void;

    scrollTrackTo(pos: number): void;
    scrollTrackBy(delta: number): void;
    getTrackScrollPos(): number;
    getTrackScrollPosMax(): number;
    getTrackZoom(): number;

    setSelectedTrackIndices(selection: number[]): boolean;
    getSelectedTrackIndices(): number[];

    updateInfo(): void;

    setTemplate(template: Template, noEmit?: boolean): void;
    getTemplate(): Template;

    getWellLog(): WellLogSet[] | WellLogSet | undefined;

    setControllerDefaultZoom(): void; // utility function
}

export function getContentBaseScale(
    controller: WellLogController | null,
    horizontal: boolean | undefined
): number {
    if (controller) {
        const base = controller.getContentBaseDomain();
        const wellLogView = controller as unknown as WellLogView;
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
    /**
     * Hide current position. Default is false
     */
    hideCurrentPosition?: boolean;
    /**
     * Hide selection interval. Default is false
     */
    hideSelectionInterval?: boolean;
}

export interface WellLogViewProps {
    /**
     * Object from JSON file describing one or more sets of well log data.
     * @deprecated Use `wellLogSets` instead
     */
    welllog?: WellLogSet[] | WellLogSet;

    /**
     * Array from JSON file; describes a series of well log data sets.
     * Assumes each set is for the same well. (For differing wells, use SyncLogViewer instead)
     */
    wellLogSets?: WellLogSet[];

    /**
     * Prop containing track template data.
     */
    template: Template;

    /**
      Prop containing color table or color functions array for discrete well logs
     */
    colorMapFunctions: ColorMapFunction[];

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
    patterns?: Pattern[];

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
     * The view title. Set desired string or react element or true for default value from well log file
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
     * called when mouse cursor leaves track area;
     */
    onTrackMouseLeaveEvent?: () => void;

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
        description:
            "JSON object describing well log data.\n<i>Depreacted — Use <b>wellLogSets</b> instead.</i>",
    },
    wellLogSets: {
        description:
            "Array from JSON file; describes a series of well log data sets. Assumes each set is for the same well. (For differing wells, use SyncLogViewer instead)",
    },
    template: {
        description: "Prop containing track template data.",
    },
    colorMapFunctions: {
        description:
            "Prop containing color function tablefor discrete well logs and gradient plots.",
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
            "The view title. Set desired string or react element or true for default value from well log file",
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
    if (props.wellLogSets !== nextProps.wellLogSets) return true;
    if (props.welllog !== nextProps.welllog) return true;
    if (props.template !== nextProps.template) return true;
    if (props.colorMapFunctions !== nextProps.colorMapFunctions) return true;
    if (props.wellpick !== nextProps.wellpick) return true;
    if (props.primaryAxis !== nextProps.primaryAxis) return true;
    if (props.axisTitles !== nextProps.axisTitles) return true;
    if (props.axisMnemos !== nextProps.axisMnemos) return true;
    if (props.viewTitle !== nextProps.viewTitle) return true;

    if (!isEqualRanges(props.domain, nextProps.domain)) return true;
    if (!isEqualRanges(props.selection, nextProps.selection)) return true;

    if (props.options?.hideTrackTitle !== nextProps.options?.hideTrackTitle)
        return true;
    if (props.options?.hideTrackLegend !== nextProps.options?.hideTrackLegend)
        return true;
    if (
        props.options?.maxVisibleTrackNum !==
        nextProps.options?.maxVisibleTrackNum
    )
        return true;
    if (props.options?.maxContentZoom !== nextProps.options?.maxContentZoom)
        return true;

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

    // callbacks
    // ignore all?

    return false;
}

interface State {
    infos: Info[];

    scrollTrackPos: number; // the first visible non-scale track number
    errorText?: string | JSX.Element;
}

class WellLogView
    extends Component<WellLogViewProps, State>
    implements WellLogController
{
    public static propTypes: Record<string, unknown>;

    wellLogSets: WellLogSet[];
    container?: HTMLElement;
    title?: HTMLElement;
    resizeObserver: ResizeObserver;

    logController?: LogViewer;
    selCurrent: number | undefined; // current mouse position
    selPinned: number | undefined; // pinned position
    selPersistent: boolean | undefined;

    isDefZoom: boolean;

    template: Template;

    scaleInterpolator: ScaleInterpolator | undefined;

    _isMount: boolean;

    constructor(props: WellLogViewProps) {
        super(props);

        this.wellLogSets = getWellLogSetsFromProps(props);

        this.container = undefined;
        this.logController = undefined;
        this.selCurrent = undefined;
        this.selPinned = undefined;
        this.selPersistent = undefined;

        this.isDefZoom = false;

        this.resizeObserver = new ResizeObserver(
            (entries: ResizeObserverEntry[]): void => {
                const entry = entries[0];
                if (entry && entry.target) {
                    //const Width = (entry.target as HTMLElement).offsetWidth;
                    //const Height = (entry.target as HTMLElement).offsetHeight;

                    if (this.logController)
                        posWellPickTitles(this.logController, this);

                    if (
                        entry.contentRect.width > 0 &&
                        entry.contentRect.height > 0
                    )
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
        this.props.onCreateController?.(this);

        this._isMount = false;
    }

    componentDidMount(): void {
        this._isMount = true;
        this.template = deepCopy(this.props.template); // save external template content to current

        if (!this.logController) {
            this.createLogViewer();
            this.setTracks(true);
        }
    }

    componentWillUnmount(): void {
        this._isMount = false;
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
            this.props.onCreateController?.(this);
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
            this.props.wellLogSets !== prevProps.wellLogSets ||
            this.props.options?.checkDatafileSchema !==
                prevProps.options?.checkDatafileSchema
        ) {
            selection = this.props.selection;
            selectedTrackIndices = this.getSelectedTrackIndices();
            shouldSetTracks = true;
            checkSchema = true;
            this.wellLogSets = getWellLogSetsFromProps(this.props);
        }
        if (this.props.template !== prevProps.template) {
            this.setTemplate(this.props.template, true);
            shouldSetTracks = true;
            checkSchema = true;
        }
        if (this.props.primaryAxis !== prevProps.primaryAxis) {
            this.selectContent([undefined, undefined]);
            selectedTrackIndices = this.getSelectedTrackIndices();
            shouldSetTracks = true;
        }
        if (this.props.colorMapFunctions !== prevProps.colorMapFunctions) {
            selection = this.getContentSelection();
            selectedTrackIndices = this.getSelectedTrackIndices();
            shouldSetTracks = true; // force to repaint
        }
        if (
            this.props.axisTitles !== prevProps.axisTitles ||
            this.props.axisMnemos !== prevProps.axisMnemos
        ) {
            selection = this.getContentSelection();
            selectedTrackIndices = this.getSelectedTrackIndices();
            shouldSetTracks = true; //??
        }
        if (
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
            this.setControllerZoom(); // force to show props.domain (important in SyncWellViewer)
            if (selection) this.selectContent(selection);
        } else if (
            this.state.scrollTrackPos !== prevState.scrollTrackPos ||
            this.props.options?.maxVisibleTrackNum !==
                prevProps.options?.maxVisibleTrackNum
        ) {
            this.onTrackScroll();
            this.onTrackSelection();
            this.updateInfo();
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
        this.updateInfo();
    }
    getAxesInfo(): AxesInfo {
        // get Object keys available in the well log
        const axes = getAvailableAxes(this.wellLogSets, this.props.axisMnemos);
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
                    this.wellLogSets.forEach((wellLogSet) =>
                        validateSchema(wellLogSet, "WellLog")
                    );
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
                this.wellLogSets,
                this.getStyledTemplate().tracks,
                this.props.colorMapFunctions
            );
            addWellPickOverlay(this.logController, this);
            this._updateWellLogTitle();
        }
        this.setControllerZoom();
        this.setControllerSelection();
        this.setControllerZoom();
        this.onTrackScroll();
        this.onTrackSelection();
        this.updateInfo(); // Clear old track information
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
    setControllerDefaultZoom(): void {
        if (this.props.domain) this.zoomContentTo(this.props.domain);
        else this.zoomContentTo(this.getContentBaseDomain());
        this.isDefZoom = true;
    }

    /**
      Display current state of track scrolling
      */
    onTrackScroll(): void {
        const iFrom = this.getTrackScrollPos();
        const iTo = iFrom + this._maxVisibleTrackNum();
        if (this.logController) scrollTracksTo(this.logController, iFrom, iTo);

        this.props.onTrackScroll?.();
    }
    onTrackSelection(): void {
        this.props.onTrackSelection?.();
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

        this.props.onContentRescale?.();
    }

    onContentSelection(): void {
        this.showSelection();
        this.props.onContentSelection?.();
    }

    onTrackMouseEvent(ev: TrackMouseEvent): void {
        this.props.onTrackMouseEvent?.(this, ev);
    }

    onTrackMouseLeaveEvent(): void {
        this.props.onTrackMouseLeaveEvent?.();
    }

    onTemplateChanged(noEmit?: boolean): void {
        this.updateInfo();

        if (!noEmit) this.props.onTemplateChanged?.();
    }

    // content
    zoomContentTo(domain: [number, number]): boolean {
        if (!this.logController) return false;
        return zoomContentTo(this.logController, domain);
    }
    scrollContentTo(f: number): boolean {
        if (this.isDefZoom) {
            this.isDefZoom = false;
            return false;
        }
        if (!this.logController) return false;
        return scrollContentTo(this.logController, f);
    }
    zoomContent(zoom: number): boolean {
        if (!this.logController) return false;
        return zoomContent(this.logController, zoom);
    }
    showSelection(): void {
        if (!this.logController) return;
        if (this.props.options?.hideCurrentPosition)
            this.selCurrent = undefined;
        if (this.props.options?.hideSelectionInterval)
            this.selPinned = undefined;

        const horizontal = this.props.horizontal;
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
                horizontal,
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
                showWellPick(pinelm, vPrimary, horizontal, this.logController);
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
                            horizontal,
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
        this.updateInfo(); // reflect new value in this.selCurrent
    }

    setContentBaseDomain(domain: [number, number]): boolean {
        if (!this.logController) return false;
        return setContentBaseDomain(this.logController, domain);
    }
    getContentBaseDomain(): [number, number] {
        if (!this.logController) return [0.0, 0.0];
        return getContentBaseDomain(this.logController);
    }
    getContentDomain(): [number, number] {
        if (!this.logController) return [0.0, 0.0];
        return getContentDomain(this.logController);
    }
    getContentZoom(): number {
        if (!this.logController) return 1.0;
        return getContentZoom(this.logController);
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
        if (this.props.options?.maxVisibleTrackNum)
            return this.props.options?.maxVisibleTrackNum;
        return this.props.horizontal ? 3 : 5 /*some default value*/;
    }
    _forceUpdateTitleTooltips(): void {
        // workaround to refresh tooltips in videx wellog component
        if (!this.container) return;
        const elements = this.container.getElementsByClassName("track-title");
        for (const element of elements) {
            if (element.textContent)
                element.setAttribute("title", element.textContent);
        }
    }
    _updateWellLogTitle(): void {
        if (this.title && this.props.viewTitle === true) {
            this.title.textContent = this.wellLogSets[0]?.header.well ?? null;
        }
    }

    scrollTrackBy(delta: number): void {
        this.setState((state: Readonly<State>) => ({
            scrollTrackPos: this._newTrackScrollPos(
                state.scrollTrackPos + delta
            ),
        }));
    }

    scrollTrackTo(pos: number): void {
        if (this._isMount)
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
    updateInfo(): void {
        this.setInfo(); // reflect new value in this.selCurrent
    }

    /**
     * @deprecated Use getWellLogSets instead
     */
    getWellLog(): WellLogSet[] | WellLogSet | undefined {
        return this.props.wellLogSets ?? this.props.welllog;
    }

    getWellLogSets(): WellLogSet[] | undefined {
        if (this.props.wellLogSets) return this.props.wellLogSets;
        if (Array.isArray(this.props.welllog)) return this.props.welllog;
        if (this.props.welllog) return [this.props.welllog];

        return undefined;
    }

    getTemplate(): Template {
        return this.template;
    }

    getStyledTemplate(): Template {
        return {
            ...this.template,
            tracks: getStyledTemplateTracks(this.template),
            styles: [],
        };
    }

    setTemplate(template: Template, noEmit?: boolean): void {
        const tNew = JSON.stringify(template);
        const t = JSON.stringify(this.template);

        if (t !== tNew) {
            this.template = JSON.parse(tNew); // save external template content to current
            this.setTracks(true);
            // Update pre-computed styles
            this.onTemplateChanged(noEmit);
        }
    }

    _recomputeTemplateFromController(): void {
        const template = this.template;
        const tracks: TemplateTrack[] = [];
        if (this.logController) {
            for (const track of this.logController.tracks) {
                if (isScaleTrack(track)) continue;
                const templateTrack = getTrackTemplate(track);
                tracks.push(deepCopy(templateTrack));
            }
        }
        const axes = getAvailableAxes(this.wellLogSets, this.props.axisMnemos);

        // Apply the new template
        this.setTemplate({
            name: template.name,
            scale: {
                primary: this.props.primaryAxis || "" /* no scale track */,
                allowSecondary:
                    template.scale?.allowSecondary && axes.length > 1,
            },
            tracks: tracks,
            styles: template.styles,
        });
    }

    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // Track management -- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    _addTrack(clickedTrack: Track, templateTrack: TemplateTrack): void {
        if (!this.logController)
            return console.warn("Log controller not initialized");

        // User's track might be empty, but we should show it regardless
        templateTrack.required = true;

        const iClickedTrack = getTrackIndex(this.logController, clickedTrack);
        // Always add the new track to the right of the one that was clicked
        const iNewTrack = iClickedTrack + 1;

        const newTrack = createNewViewTrack(
            this.logController,
            templateTrack,
            iNewTrack,
            this.getAxesInfo(),
            this.getWellLogSets() ?? []
        );

        if (!newTrack) return;

        this._recomputeTemplateFromController();

        this.selectTrack(newTrack, true);
        // Scroll one step, to make sure the newly created one stays in view
        this.scrollTrackBy(+1);
        this.onTrackScroll();
    }

    _editTrack(track: Track, newTemplateTrack: TemplateTrack): void {
        if (!this.logController)
            return console.warn("Log controller not initialized");

        const oldTitle = track.options.label ?? "";
        const newTitle = newTemplateTrack.title ?? "";
        const titleChanged = !oldTitle.localeCompare(newTitle);

        editViewTrack(
            this.logController,
            track,
            newTemplateTrack,
            this.getAxesInfo(),
            this.getWellLogSets() ?? [],
            this.props.colorMapFunctions
        );

        if (titleChanged)
            // workaround to refresh tooltips in videx wellog component
            this._forceUpdateTitleTooltips();

        this._recomputeTemplateFromController();
    }

    removeTrack(track: Track): void {
        if (!this.logController)
            return console.warn("Log controller not initialized");

        removeViewTrack(this.logController, track);

        this.onTrackScroll();
        this.onTrackSelection();
        this._recomputeTemplateFromController();
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

    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // Track plot management - --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    addTrackPlot(track: Track, templatePlot: TemplatePlot): void {
        if (!this.logController)
            return console.warn("Log controller not initialized");

        addPlotToTrack(
            track,
            templatePlot,
            this.getWellLogSets() ?? [],
            this.getAxesInfo(),
            this.props.colorMapFunctions
        );

        adjustControllerToModifiedTrack(this.logController, track);
        this._recomputeTemplateFromController();
    }

    _editTrackPlot(track: Track, plot: Plot, templatePlot: TemplatePlot): void {
        if (!this.logController)
            return console.warn("Log controller not initialized");

        /* We have special option for track scale!
        const templateTrack = getTrackTemplate(track);
        if (templatePlot.scale === templateTrack.scale)
            templatePlot.scale = undefined;
        */

        editTrackPlot(
            track,
            plot,
            templatePlot,
            this.getWellLogSets() ?? [],
            this.getAxesInfo(),
            this.props.colorMapFunctions
        );

        adjustControllerToModifiedTrack(this.logController, track);
        this._recomputeTemplateFromController();
    }

    removeTrackPlot(track: Track, plot: Plot): void {
        if (!this.logController)
            return console.warn("Log controller not initialized");

        removeTrackPlot(track, plot);
        adjustControllerToModifiedTrack(this.logController, track);
        this._recomputeTemplateFromController();
    }

    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // Menu event bindings --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
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

    createViewTitle(
        viewTitle: string | boolean | JSX.Element //| undefined
    ): ReactNode {
        if (typeof viewTitle === "object" /*react element*/) return viewTitle;
        if (viewTitle === true) return this.wellLogSets[0]?.header.well;
        return viewTitle; // string
    }

    render(): JSX.Element {
        const horizontal = this.props.horizontal;
        const viewTitle = this.props.viewTitle;
        return (
            <div
                className="welllogview" // for CSS customization
                style={{ flexDirection: horizontal ? "row" : "column" }}
            >
                {viewTitle && (
                    <div
                        className={
                            horizontal ? "title title-horizontal" : "title"
                        }
                        ref={(el) => (this.title = el as HTMLElement)}
                    >
                        {this.createViewTitle(viewTitle)}
                    </div>
                )}
                <div className="view">
                    <div
                        className="container" // for CSS customization
                        ref={(el) => (this.container = el as HTMLElement)}
                    />
                    {this.state.errorText && (
                        <div className="error">{this.state.errorText}</div>
                    )}
                </div>
            </div>
        );
    }
}

export const WellLogViewOptionsTypes = PropTypes.shape({
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

    /**
     * Hide current position. Default is false
     */
    hideCurrentPosition: PropTypes.bool,

    /**
     * Hide selection interval. Default is false
     */
    hideSelectionInterval: PropTypes.bool,
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
        welllog: PropTypes.oneOfType([PropTypes.object, PropTypes.array]), //.isRequired,

        /**
         * Array from JSON file; describes a series of well log data sets.
         * Assumes each set is for the same well. (For differing wells, use SyncLogViewer instead)
         */
        wellLogSets: PropTypes.arrayOf(PropTypes.object),

        /**
         * Prop containing track template data
         */
        template: TemplateType.isRequired,

        /**
         * Prop containing color function/table table for discrete well logs and gradient fill plots
         */
        colorMapFunctions: PropTypes.arrayOf(ColorFunctionType).isRequired,

        /**
         * Well picks data
         */
        wellpicks: PropTypes.arrayOf(WellPickPropsType),

        /**
         * Patterns table
         */
        patternsTable: PatternsTableType,

        /**
         * Horizon to pattern index map
         */
        patterns: PropTypes.arrayOf(PatternsType),

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
        axisTitles: PropTypes.object /*Of<Record<string, string>>*/,

        /**
         * Names for axes
         */
        axisMnemos: PropTypes.object /*Of<Record<string, string>>*/,

        /**
         * Set to true for default title or to some string or JSX.Element
         */
        viewTitle: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.string,
            PropTypes.element /* react element */,
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
        options: WellLogViewOptionsTypes,
    };
}

export default WellLogView;
