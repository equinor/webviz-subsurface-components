/**
 * Utilities for modifying the videx log controller
 */
import type {
    // Alias to separate more clearly from our WellLogViewer component
    LogViewer as VidexLogViewer,
    ScaleInterpolator,
    Track,
} from "@equinor/videx-wellog";
import { InterpolatedScaleHandler } from "@equinor/videx-wellog";
import type { TrackOptions } from "@equinor/videx-wellog/dist/tracks/interfaces";

import type { AxesInfo } from "./axes";
import type { ColorMapFunction } from "./color-function";
import { getAxisIndices } from "./well-log";
import { checkMinMax } from "./minmax";
import { createTrack, isScaleTrack, editTrack } from "../utils/tracks";
import type { TemplateTrack } from "../components/WellLogTemplateTypes";
import type { WellLogSet } from "../components/WellLogTypes";
import { isEqDomains } from "./arrays";

/**
 * Sets a log viewer's base domain.
 * @param logViewer A videx log view controller
 * @param domain The domain to change to
 * @returns `true` if the base domain was changed, otherwise `false`.
 */
export function setContentBaseDomain(
    logViewer: VidexLogViewer,
    domain: [number, number]
): boolean {
    const [b1, b2] = logViewer.scaleHandler.baseDomain();
    if (b1 !== domain[0] || b2 !== domain[1]) {
        logViewer.domain = domain;
        // logViewer.scaleHandler.baseDomain(domain);
        // logViewer.rescale();
        return true;
    }

    return false;
}

/**
 * Expands a log viewer's base domain so that a given range exists within it.
 * @param logViewer A videx log view controller
 * @param range A number range to scale to
 */
export function expandDomainToFitRange(
    logViewer: VidexLogViewer,
    range: [number, number]
) {
    const baseDomain = logViewer.scaleHandler.baseDomain();
    checkMinMax(baseDomain as [number, number], range);

    logViewer.rescale();
}

/**
 * Removes a log viewer's overlay.
 * @param logViewer A videx log view controller
 */
export function removeOverlay(logViewer: VidexLogViewer): void {
    logViewer.container.select(".overlay").remove();

    // ? Why is this commented out? (@anders2303)
    // logViewer.overlay = null;
}

/**
 * Checks if a videx track is visible.
 * @param track A videx track
 * @returns `true` if the track is visible, `false` otherwise.
 */
export function isTrackVisible(track: Track): boolean {
    if (track.elm) {
        const elm = track.elm.parentElement;
        if (elm) {
            return elm.style.display !== "none";
        }
    }
    return false;
}

/**
 * Sets the visibility of a videx track element (using CSS)
 * @param track - A videx log track.
 * @param visible - Whether the track should be visible (`true`) or hidden (`false`).
 * @returns `true` if the visibility was changed, otherwise `false`.
 */
// ? It's only used locally here, should this be exported? (@anders2303)
export function showTrack(track: Track, visible: boolean): boolean {
    const newDisplayValue = visible ? "flex" : "none";
    const trackParentElm = track.elm?.parentElement;

    if (trackParentElm && trackParentElm.style.display !== newDisplayValue) {
        trackParentElm.style.display = newDisplayValue;
        return true; // visibility is changed
    }

    return false; // visibility is not changed
}

/**
 * Checks if a videx track is currently selected
 * @param _logViewer A videx controller.
 * @param track A videx log track.
 * @returns `true` if the track is selected, otherwise `false`.
 */
export function isTrackSelected(
    _logViewer: VidexLogViewer,
    track: Track
): boolean {
    const trackParentElm = track.elm?.parentElement;

    if (!trackParentElm) return false;
    return trackParentElm.classList.contains("selected");
}

/**
 * Selects or deselects a track in a videx log viewer. A selected track get added a "selected" class.
 * @param logViewer A videx log view controller
 * @param track A videx log track
 * @param selected Whether the track should be selected or not
 * @returns `true` if the selection was changed, otherwise `false`.
 */
export function selectTrack(
    logViewer: VidexLogViewer,
    track: Track,
    selected: boolean
): boolean {
    const trackParentElm = track.elm?.parentElement;

    if (trackParentElm && isTrackSelected(logViewer, track) !== selected) {
        trackParentElm.classList.toggle("selected");
        return true; // selection is changed
    }

    return false; // selection is not changed
}

/**
 * Returns all indices of a log log viewer's selected tracks.
 * @param logViewer A videx log view controller.
 * @returns An array of indices of selected tracks.
 */
export function getSelectedTrackIndices(logViewer?: VidexLogViewer): number[] {
    if (!logViewer) return [];

    return logViewer.tracks.reduce((indices, track, idx) => {
        if (isTrackSelected(logViewer, track)) {
            return [...indices, idx];
        } else {
            return indices;
        }
    }, [] as number[]);
}

/**
 * Finds the index of a track in a videx log viewer.
 * @param logViewer A videx log view controller.
 * @param track A videx track.
 * @returns The index of the track in the log controller. -1 if the track is not found.
 */
export function getTrackIndex(logViewer: VidexLogViewer, track: Track): number {
    return logViewer.tracks.findIndex((t) => t.id === track.id);
}
///////////////////////

/**
 * Sets the zoom scale of a videx log viewer to a given scale.
 * @param logViewer A videx log view controller
 * @param zoom The zoom scale to set. If not provided, the zoom scale will be set to 1.0.
 * @returns `true` if the zoom scale was changed, otherwise `false`.
 */
export function zoomContent(logViewer: VidexLogViewer, zoom: number): boolean {
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

/**
 * Scrolls the log viewers content so that a given fraction of it is visible.
 * @param logViewer A videx log view controller
 * @param fraction The fraction of the content to be visible. 0 shows the start of the content, 1 shows the end.
 * @returns `true` if the content was scrolled, otherwise `false`.
 */
export function scrollContentTo(
    logViewer: VidexLogViewer,
    fraction: number
): boolean {
    const [b1, b2] = logViewer.scaleHandler.baseDomain();
    const [d1, d2] = logViewer.domain;
    const d = d2 - d1; // width of visible part of content
    const w = b2 - b1 - d; // width of not visible part of content

    const c = b1 + fraction * w;
    const domain: [number, number] = [c, c + d];
    return zoomContentTo(logViewer, domain);
}

/**
 * Updates a videx log viewer to show a given domain.
 * @param logViewer A videx log view controller
 * @param domain The target domain that should be shown
 * @returns `true` if the content was zoomed, otherwise `false`.
 */
export function zoomContentTo(
    logViewer: VidexLogViewer,
    domain: [number, number]
): boolean {
    // ? Why do we need to retry multiple times here? (@anders2303)
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

////////// utilities

/**
 * Returns the base domain of a videx log viewer.
 * @param logViewer A videx log view controller
 * @returns The base domain as a two-element tuple.
 */
export function getContentBaseDomain(
    logViewer: VidexLogViewer
): [number, number] {
    const [b1, b2] = logViewer.scaleHandler.baseDomain();
    return [b1, b2];
}

/**
 * Returns the domain of the currently visible content of a videx log viewer.
 * @param logViewer A videx log view controller
 * @returns The domain as a two-element tuple.
 */
export function getContentDomain(logViewer: VidexLogViewer): [number, number] {
    const [d1, d2] = logViewer.domain; // same as logViewer.scale.domain()
    return [d1, d2];
}

/**
 * Returns the zoom level (0 - 1) of a videx log viewer.
 * @param logViewer A videx log view controller
 * @returns The zoom level
 */
export function getContentZoom(logViewer: VidexLogViewer): number /*fraction*/ {
    // see also zoomContent(logViewer)
    const [b1, b2] = logViewer.scaleHandler.baseDomain();
    const [d1, d2] = logViewer.domain;
    return Math.abs(b2 - b1) / Math.abs(d2 - d1);
}

/**
 * Changes the visibliity of a range of tracks in a videx log viewer, so that the given range is visible.
 * Scale tracks are untouched.
 * @param logViewer A videx log view controller
 * @param iFrom The index of the first track that should be visible
 * @param iTo The index of the last track that should be visible
 * @returns `true` if the visibility was changed, otherwise `false`.
 */
export function scrollTracksTo(
    logViewer: VidexLogViewer,
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

/**
 * Finds the index of the first visible track in a videx log viewer.
 * @param logViewer A videx log view controller
 * @returns The index of the first visible track in the log viewer.
 */
export function getFirstVisibleTrack(logViewer: VidexLogViewer): number {
    let iTrack = 0; // non-scale (graph) tracks counter
    for (const track of logViewer.tracks) {
        if (isScaleTrack(track)) continue; // skip scales

        if (isTrackVisible(track)) return iTrack;
        iTrack++;
    }
    return -1;
}

/**
 * Sets a list of tracks in a videx log viewer as selected.
 * @param logViewer A videx log view controller
 * @param selectedTrackIndices A list of track indices to select
 * @returns `true` if the selection was changed, otherwise `false`.
 */
export function setSelectedTrackIndices(
    logViewer: VidexLogViewer | undefined,
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

/**
 * Adjusts various log viewer internals to fit a track.
 * @param logViewer A videx log view controller
 * @param modifiedTrack A videx track
 */
export function adjustControllerToModifiedTrack(
    logViewer: VidexLogViewer,
    modifiedTrack?: Track
): void {
    if (!modifiedTrack) return;

    // const newTrackRange = getTrackIndexRange(modifiedTrack);

    // expandDomainToFitRange(logViewer, newTrackRange);
    updateLegendRows(logViewer);
    logViewer.updateTracks();
    // logViewer.refresh();
}

/**
 * Updates the legend rows of a videx log view
 * @param logViewer A videx log view controller
 */
export function updateLegendRows(logViewer: VidexLogViewer): void {
    // @ts-expect-error ts2445 - Need to access a protected member function
    logViewer.updateLegendRows();
}

function addTrackAtIndex(
    logViewer: VidexLogViewer,
    track: Track,
    position: number
) {
    const newTracks = [...logViewer.tracks];
    // Inject the new track at position
    newTracks.splice(position, 0, track);
    logViewer.setTracks(newTracks);
    logViewer.updateTracks();
}

/**
 * Creates a new well-log track, and adds it to a videx log viewer at a specified position.
 * @param logViewer A videx log view controller
 * @param template A template config for the new track
 * @param position The new track's position in the log viewer
 * @param axesInfo Information about the axis curves in the log
 * @param wellLogSets A well-log JSON data set to source curve data from
 * @param colormapFunctions An array of color map functions to apply to the track
 * @returns The new track if successful, otherwise `null`
 */
export function createNewViewTrack(
    logViewer: VidexLogViewer,
    template: TemplateTrack,
    position: number,
    axesInfo: AxesInfo,
    wellLogSets: WellLogSet[],
    colormapFunctions: ColorMapFunction[] = []
): Track<TrackOptions> | null {
    const newTrack = createTrack(
        wellLogSets,
        axesInfo,
        template,
        colormapFunctions
    );
    if (!newTrack) return null;

    addTrackAtIndex(logViewer, newTrack, position);

    // Update scale to fit the new track
    // ! Thinking about it, I don't know if this actually matters, since new tracks are created with no plots?
    adjustControllerToModifiedTrack(logViewer, newTrack);

    return newTrack;
}

/**
 * Modifies a videx track with a new template configuration.
 * @param logViewer A videx log view controller
 * @param track A videx track to modify
 * @param template A modified template config to apply to the track
 * @param axesInfo Information about the axis curves in the log
 * @param wellLogSets A well-log JSON data set to source curve data from
 * @param colormapFunctions An array of color map functions to apply to the track
 * @returns The modified track
 */
export function editViewTrack(
    logViewer: VidexLogViewer,
    track: Track,
    newTemplate: TemplateTrack,
    axesInfo: AxesInfo,
    wellLogSets: WellLogSet[],
    colormapFunctions: ColorMapFunction[] = []
): Track {
    editTrack(track, newTemplate, wellLogSets, axesInfo, colormapFunctions);
    adjustControllerToModifiedTrack(logViewer, track);

    return track;
}

/**
 * Removes a videx track from a log viewer.
 * @param logViewer A videx log view controller
 * @param track A videx track to modify
 */
export function removeViewTrack(logViewer: VidexLogViewer, track: Track): void {
    logViewer.removeTrack(track);

    // ? Should there not be any scale adjustments and such here? (@anders2303)
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

function computeInterpolationArrays(
    wellLogSet: WellLogSet,
    axesInfo: AxesInfo
): { primaries: Float32Array; secondaries: Float32Array } {
    const axisIndices = getAxisIndices(wellLogSet?.curves ?? [], axesInfo);
    const idxPrimary = axisIndices.primary;
    const idxSecondary = axisIndices.secondary;

    // Interpolation is only relevant if there's multiple axes
    if (idxPrimary < 0 || idxSecondary < 0) {
        return {
            primaries: new Float32Array(0),
            secondaries: new Float32Array(0),
        };
    }

    let entryCount = 0;
    let primaries = new Float32Array(wellLogSet.data.length);
    let secondaries = new Float32Array(wellLogSet.data.length);

    for (const row of wellLogSet.data) {
        const primary: number = row[idxPrimary] as number;
        const secondary: number = row[idxSecondary] as number;

        if (primary !== null && secondary !== null) {
            secondaries[entryCount] = secondary;
            primaries[entryCount] = primary;
            entryCount++;
        }
    }

    if (entryCount < primaries.length) {
        // resize arrays to actual size used
        primaries = primaries.subarray(0, entryCount);
        secondaries = secondaries.subarray(0, entryCount);
    }

    return { primaries, secondaries };
}

/**
 * Sets up a scale interpolator for a well log viewer that has multiple axes, and adds it to the view-controller
 * @param logViewer A videx log view controller
 * @param axesInfo Information about the axis curves in the log
 * @param wellLogSets A well-log JSON data set to source curve data from
 * @returns The scale interpolator that was created
 */
export function setUpScaleInterpolator(
    logViewer: VidexLogViewer,
    wellLogSet: WellLogSet,
    axesInfo: AxesInfo
): ScaleInterpolator {
    const { primaries, secondaries } = computeInterpolationArrays(
        wellLogSet,
        axesInfo
    );

    const scaleInterpolator = createScaleInterpolator(primaries, secondaries);

    logViewer.scaleHandler = new InterpolatedScaleHandler(scaleInterpolator);

    return scaleInterpolator;
}
