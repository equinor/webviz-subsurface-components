import type { LogViewer, Track } from "@equinor/videx-wellog";

import { isScaleTrack } from "../utils/tracks";

import type { Domain } from "@equinor/videx-wellog/dist/common/interfaces";

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

export function isEqDomains(
    d1: Domain /*[number, number]*/,
    d2: Domain /*[number, number]*/
): boolean {
    const eps: number = Math.abs(d1[1] - d1[0] + (d2[1] - d2[0])) * 0.00001;
    return Math.abs(d1[0] - d2[0]) < eps && Math.abs(d1[1] - d2[1]) < eps;
}

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

export function getSelectedTrackIndices(logViewer?: LogViewer): number[] {
    const selectedTrackIndices: number[] = [];
    if (logViewer) {
        let iTrack = 0;
        for (const track of logViewer.tracks) {
            if (isTrackSelected(logViewer, track))
                selectedTrackIndices.push(iTrack);
            iTrack++;
        }
    }
    return selectedTrackIndices;
}

///////////////////////

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
        let c = d1 + d; // the center of the visible part
        d = d * (currentZoom / zoom);
        // check if new domain is in the base domain
        if (c + d > b2) c = b2 - d;
        if (c - d < b1) c = b1 + d;
        const domain: [number, number] = [c - d, c + d];
        return zoomContentTo(logViewer, domain);
    }
    return false;
}

export function scrollContentTo(
    logViewer: LogViewer,
    f: /*fraction*/ number
): boolean {
    const [b1, b2] = logViewer.scaleHandler.baseDomain();
    const [d1, d2] = logViewer.domain;
    const d = d2 - d1; // width of visible part of content
    const w = b2 - b1 - d; // width of not visible part of content

    const c = b1 + f * w;
    const domain: [number, number] = [c, c + d];
    return zoomContentTo(logViewer, domain);
}

export function zoomContentTo(
    logViewer: LogViewer,
    domain: [number, number]
): boolean {
    if (!isEqDomains(logViewer.domain, domain)) {
        logViewer.zoomTo(domain);
        if (!isEqDomains(logViewer.domain, domain)) {
            // something went wrong sometimes: retry
            logViewer.zoomTo(domain);
            if (!isEqDomains(logViewer.domain, domain)) {
                // something went very wrong: print warning and retry one more time
                console.warn(
                    "zoomContentTo failed. Try to set " +
                        domain +
                        " but get " +
                        logViewer.domain
                );
                logViewer.zoomTo(domain);
            }
            return true;
        }
        return true;
    }
    return false;
}

export function setContentBaseDomain(
    logViewer: LogViewer,
    domain: [number, number]
): void {
    const [b1, b2] = logViewer.scaleHandler.baseDomain();
    if (b1 !== domain[0] || b2 !== domain[1]) {
        logViewer.domain = domain;
        // logViewer.scaleHandler.baseDomain(domain);
        // logViewer.rescale();
    }
}

////////// utilities

export function getContentBaseDomain(logViewer: LogViewer): [number, number] {
    const [b1, b2] = logViewer.scaleHandler.baseDomain();
    return [b1, b2];
}

export function getContentDomain(logViewer: LogViewer): [number, number] {
    const [d1, d2] = logViewer.domain; // same as logViewer.scale.domain()
    return [d1, d2];
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

export function getFirstVisibleTrack(logViewer: LogViewer): number {
    let iTrack = 0; // non-scale (graph) tracks counter
    for (const track of logViewer.tracks) {
        if (isScaleTrack(track)) continue; // skip scales

        if (isTrackVisible(track)) return iTrack;
        iTrack++;
    }
    return -1;
}

export function setSelectedTrackIndices(
    logViewer: LogViewer | undefined,
    selectedTrackIndices: number[]
): boolean {
    let changed = false;
    if (logViewer && selectedTrackIndices) {
        let iTrack = 0;
        for (const track of logViewer.tracks) {
            const selected = selectedTrackIndices.indexOf(iTrack) >= 0;
            if (selectTrack(logViewer, track, selected)) changed = true;
            iTrack++;
        }
    }
    return changed;
}

export function updateLegendRows(logViewer: LogViewer): void {
    // access protected member function
    // eslint-disable-next-line
    (logViewer as any).updateLegendRows();
}
