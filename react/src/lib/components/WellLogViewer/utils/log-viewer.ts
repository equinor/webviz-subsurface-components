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

export function showTrack(track: Track, visible: boolean): boolean {
    if (track.elm) {
        const elm = track.elm.parentElement;
        if (elm) {
            const display = visible ? "flex" : "none";
            if (elm.style.display !== display) {
                elm.style.display = display;
                return true; // visibility is changed
            }
        }
    }
    return false; // visibility is not changed
}

export function isTrackSelected(_logViewer: LogViewer, track: Track): boolean {
    if (track.elm) {
        const elm = track.elm.parentElement;
        if (elm) {
            return elm.classList.contains("selected");
        }
    }
    return false;
}

export function selectTrack(
    logViewer: LogViewer,
    track: Track,
    selected: boolean
): boolean {
    if (track.elm) {
        const elm = track.elm.parentElement;
        if (elm) {
            if (isTrackSelected(logViewer, track) !== selected) {
                elm.classList.toggle("selected");
                return true; // selection is changed
            }
        }
    }
    return false; // selection is not changed
}

export function zoomContent(logViewer: LogViewer, zoom: number): boolean {
    if (!zoom) zoom = 1.0;

    const [b1, b2] = logViewer.scaleHandler.baseDomain();
    const [d1, d2] = logViewer.domain;
    const currentZoom = Math.abs(b2 - b1) / Math.abs(d2 - d1);
    // see also: getContentZoom(logViewer);

    const f = Math.abs(Math.log(currentZoom / zoom));
    if (f > 0.01) {
        /*currentZoom !~= zoom*/
        let d = (d2 - d1) * 0.5;
        const c = d1 + d;
        d = d * (currentZoom / zoom);
        logViewer.zoomTo([c - d, c + d]);
        return true;
    }
    return false;
}

export function scrollContentTo(
    logViewer: LogViewer,
    f: /*fraction*/ number
): boolean {
    const [b1, b2] = logViewer.scaleHandler.baseDomain();
    const [d1, d2] = logViewer.domain;
    const d = d2 - d1;
    const w = b2 - b1 - (d2 - d1);

    const c = b1 + f * w;
    if (c !== d1) {
        logViewer.zoomTo([c, c + d]);
        return true;
    }
    return false;
}

export function getContentScrollPos(logViewer: LogViewer): number /*fraction*/ {
    const [b1, b2] = logViewer.scaleHandler.baseDomain();
    const [d1, d2] = logViewer.domain;
    const w = b2 - b1 - (d2 - d1);
    return w ? (d1 - b1) / w : 0;
}

export function getContentZoom(logViewer: LogViewer): number /*fraction*/ {
    // see also zoomContent(logViewer)
    const [b1, b2] = logViewer.scaleHandler.baseDomain();
    const [d1, d2] = logViewer.domain;
    return Math.abs(b2 - b1) / Math.abs(d2 - d1);
}

export function scrollTracksTo(
    logViewer: LogViewer,
    iFrom: number,
    iTo: number
): boolean {
    let visibilityIsChanged = false;
    let iTrack = 0; // non-scale (graph) tracks counter
    for (const track of logViewer.tracks) {
        if (isScaleTrack(track)) continue; // skip scales

        const visible = iFrom <= iTrack && iTrack < iTo;
        if (showTrack(track, visible)) visibilityIsChanged = true;

        iTrack++;
    }
    if (visibilityIsChanged) logViewer.updateTracks();
    return visibilityIsChanged;
}
