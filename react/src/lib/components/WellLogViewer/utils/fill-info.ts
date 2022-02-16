import { Info, InfoOptions } from "../components/InfoTypes";

import {
    Track,
    DualScaleTrack,
    GraphTrack,
    StackedTrack,
} from "@equinor/videx-wellog";

import { InterpolatedScaleHandler } from "@equinor/videx-wellog";
import { DifferentialPlotLegendInfo } from "@equinor/videx-wellog/dist/plots/legend/interfaces";
import { DifferentialPlotOptions } from "@equinor/videx-wellog/dist/plots/interfaces";
import { LogViewer } from "@equinor/videx-wellog";

import { ExtPlotOptions } from "./tracks";
import { isScaleTrack } from "./tracks";
import { getPlotType } from "./tracks";

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

function addScaleTrackInfos(
    infos: Info[],
    x: number,
    logController: LogViewer,
    tracks: Track[]
) {
    const interpolator = (
        logController.scaleHandler as InterpolatedScaleHandler
    ).interpolator;
    const x2 = interpolator && !isNaN(x) ? interpolator.reverse(x) : Number.NaN;
    let iPlot = 0;
    for (const _track of tracks) {
        if (!isScaleTrack(_track)) continue;
        const track = _track as DualScaleTrack;
        const _x = track.options.mode /* DualScaleTrack and mode is slave */
            ? x2
            : x;
        infos.push({
            name: track.options.abbr,
            units: track.options.units,
            color: iPlot == 0 ? "black" : "grey", //??
            value: _x,
            type: "", // "scale"
            trackId: track.id,
        });
        iPlot++;
    }

    // Add separator line
    infos.push({
        color: "", // dummy value
        value: Number.NaN, // dummy value
        type: "separator",
        trackId: "separator",
    });
}

export function fillInfos(
    x: number,
    logController: LogViewer,
    iFrom: number,
    iTo: number,
    collapsedTrackIds: (string | number)[],
    options?: InfoOptions
): Info[] {
    const infos: Info[] = [];
    const tracks = logController.tracks;

    // Scale tracks first
    addScaleTrackInfos(infos, x, logController, tracks);

    // another tracks

    const allTracks = options?.allTracks;
    const grouping = options?.grouping;

    let iTrack = 0;
    for (const _track of tracks) {
        if (isScaleTrack(_track)) continue;
        const visible = allTracks || (iFrom <= iTrack && iTrack < iTo);
        iTrack++;
        if (!visible) continue;
        const collapsed = collapsedTrackIds.indexOf(_track.id) >= 0;

        const track = _track as GraphTrack;
        if (grouping === "by_track" && track.plots && track.plots.length) {
            infos.push({
                name: track.options.label,
                units: "",
                color: "",
                value: -999,
                type: "track",
                collapsed: collapsed,
                trackId: track.id,
                groupStart: "!",
            });
        }
        if (!collapsed) {
            if (_track instanceof StackedTrack) {
                const trackStacked = _track as StackedTrack;
                const d = trackStacked.data;
                let value = "";
                let color = "";
                if (d) {
                    // data is ready
                    for (let i = 0; i < d.length; i++) {
                        const p = d[i];
                        if (p.from <= x && x <= p.to) {
                            value = p.name;
                            color =
                                "rgb(" +
                                p.color.r +
                                "," +
                                p.color.g +
                                "," +
                                p.color.b +
                                ")";
                            break;
                        }
                    }
                }
                infos.push({
                    name: trackStacked.options.abbr,
                    units: "",
                    color: color,
                    value: value,
                    type: "stacked", //??
                    trackId: trackStacked.id,
                });
            } else {
                for (const plot of track.plots) {
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
                        trackId: track.id,
                    });

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
                            trackId: "_" + track.id,
                        });
                    }
                }
            }
        }
    }
    return infos;
}
