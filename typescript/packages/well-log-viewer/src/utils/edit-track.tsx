import React from "react";
import ReactDOM from "react-dom";
import type { Plot } from "@equinor/videx-wellog";
import type WellLogView from "../components/WellLogView";
import type { TrackMouseEvent } from "../components/WellLogView";
import { SimpleMenu, editPlots } from "../components/LocalMenus";

export function onTrackMouseEventDefault(
    wellLogView: WellLogView,
    ev: TrackMouseEvent
): void {
    const track = ev.track;
    if (ev.type === "click") {
        wellLogView.selectTrack(track, !wellLogView.isTrackSelected(track)); // toggle selection
    } else if (ev.type === "dblclick") {
        wellLogView.selectTrack(track, true);
        if (ev.area === "title") {
            wellLogView.editTrack(ev.element, ev.track);
        } else {
            const plot: Plot | null = ev.plot;
            if (!plot) editPlots(ev.element, wellLogView, ev.track);
            else wellLogView.editPlot(ev.element, ev.track, plot);
        }
    } else if (ev.type === "contextmenu") {
        wellLogView.selectTrack(track, true);
        const el: HTMLElement = document.createElement("div");
        el.style.width = "10px";
        el.style.height = "3px";
        ev.element.appendChild(el);
        // eslint-disable-next-line react/no-deprecated
        ReactDOM.render(
            <SimpleMenu
                type={ev.area}
                anchorEl={el}
                wellLogView={wellLogView}
                track={track}
            />,
            el
        );
    }
}
