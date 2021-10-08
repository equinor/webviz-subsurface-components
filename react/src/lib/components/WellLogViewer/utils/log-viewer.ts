import { LogViewer, Track } from "@equinor/videx-wellog";

import { isScaleTrack } from "../utils/tracks";

export function removeOverlay(logViewer: LogViewer): void {
    logViewer.container.select(".overlay").remove();
    //logViewer.overlay = null;
}

export function isTrackVisible(track: Track): boolean {
    if (track.elm) {
        const elm = track.elm.parentElement;
        if (elm) {
            return elm.style.display !== "none";
        }
    }
    return false;
}

export function showTrack(track: Track, visible: boolean): void {
    if (track.elm) {
        const elm = track.elm.parentElement;
        if (elm) {
            elm.style.display = visible ? "flex" : "none";
        }
    }
}

export function setZoom(logViewer: LogViewer, zoom: number): void {
    if (!zoom) zoom = 1.0;

    const [b1, b2] = logViewer.scaleHandler.baseDomain();
    const [d1, d2] = logViewer.domain;
    const currentZoom = Math.abs(b2 - b1) / Math.abs(d2 - d1);
    console.log("zoom=" + zoom + " current=" + currentZoom);
    const f = Math.abs(Math.log(currentZoom / zoom));
    //console.log("f=" + f);
    if (f > 0.01 /*currentZoom !== zoom*/) {
        let d = (d2 - d1) * 0.5;
        const c = d1 + d;
        d = d * (currentZoom / zoom);
        //console.log("c-d=" + (c-d) + " c+d=" + (c+d));
        logViewer.zoomTo([c - d, c + d]);
    }
}

export function scrollContentTo(
    logViewer: LogViewer,
    f: /*fraction*/ number
): void {
    const [b1, b2] = logViewer.scaleHandler.baseDomain();
    const [d1, d2] = logViewer.domain;
    //console.log("b1=" + b1 + " b2=" + b2);
    //console.log("d1=" + d1 + " d2=" + d2);
    const d = d2 - d1;
    const m = b2 - b1 - d;

    const c = b1 + f * m;
    //console.log("c=" + c + " c+d=" + (c + d));
    if (c !== d1) logViewer.zoomTo([c, c + d]);
}

export function scrollTracks(
    logViewer: LogViewer,
    iFrom: number,
    iTo: number
): void {
    let iTrack = 0; // non-scale tracks counter
    for (const track of logViewer.tracks) {
        if (isScaleTrack(track)) continue; // skip scales

        const visible = iFrom <= iTrack && iTrack < iTo;
        showTrack(track, visible);

        iTrack++;
    }
    logViewer.updateTracks();
}
