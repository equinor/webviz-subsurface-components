/**
 * Utilities module for working with JSON well-log objects.
 */

import _ from "lodash";
import type {
    WellLogCurve,
    WellLogMetadataDiscrete,
    WellLogSet,
} from "../components/WellLogTypes";
import type { AxesInfo } from "./tracks";
import type { WellLogViewProps } from "../components/WellLogView";

/**
 * Get all well log curves from a collection of well log sets
 * @param logSets And array of well log sets
 * @returns An array containing each curve in all sets.
 */
export function getAllWellLogCurves(wellLogSets: WellLogSet[]): WellLogCurve[] {
    const iterator = _.iteratee("curves");

    return _.flatMap<WellLogSet[], WellLogCurve>(wellLogSets, iterator);
}

type CurveIndex = { iCurve: number; iSet: number };

/**
 * Finds the first matching curve with a given name, and returns the index of the containing well log set, and the curve's index within that set's curve-array
 * @param wellLogSets An array of well log sets
 * @param curveName The name of the targeted curve
 * @returns An object containing the set's and curve's index. Returns -1 for both if no matching curve is found
 */
export function findSetAndCurveIndex(
    wellLogSets: WellLogSet[],
    curveName: string
): CurveIndex {
    let iCurve = -1;
    let iSet = -1;

    for (const logSet of wellLogSets) {
        iCurve = findIndexByCurveName(logSet.curves, curveName);
        iSet++;

        // Curve was found, return early
        if (iCurve > -1) return { iSet, iCurve };
    }

    // No curve was found
    return { iCurve: -1, iSet: -1 };
}

/**
 * Finds the index of a curve in a given array of well log curves by its name
 * @param curves An array of well log curves
 * @param curveName The name to search on. Case insensitive
 * @returns The index of the curve in the array. Returns -1 if no matching curve is found
 */
export function findIndexByCurveName(
    curves: WellLogCurve[],
    curveName: string
): number {
    curveName = curveName.toUpperCase();

    return curves.findIndex(({ name }) => name.toUpperCase() === curveName);
}

/**
 * Finds a curve object in a given well log set by its name
 * @param logSet A single well log set
 * @param name The name of a well log curve
 * @returns The curve object matching the given name. Returns undefined if no matching curve is found
 */
export function getCurveByName(
    wellLogSet: WellLogSet,
    curveName: string
): WellLogCurve | undefined {
    const name = curveName.toUpperCase();

    return wellLogSet.curves.find((curve) => curve.name.toUpperCase() === name);
}

/**
 * Get the discrete metadata associated with a given curve-name.
 *
 * @param wellLogSet - A well log set extended to containing discrete metadata.
 * @param name - The curve name that the metadata is associated with. Case insensitive.
 * @returns The discrete metadata associated with the given name, or `null` if not found.
 */
export function getDiscreteMetaDataByName(
    wellLogSet: WellLogSet,
    name: string
): WellLogMetadataDiscrete | null {
    const meta = wellLogSet.metadata_discrete;
    name = name.toUpperCase();

    for (const key in meta) {
        // search case insensitive!
        if (key.toUpperCase() === name) return meta[key];
    }

    return null;
}

/**
 * Represents the indices of the curves in a well-log set that that serve as primary and secondary axes.
 */
export type AxisIndices = {
    primary: number;
    secondary: number;
};

/**
 * Get the indices of the primary and secondary axes in a given array of well log curves.
 *
 * @param curves - An array of well log curves.
 * @param axesInfo - An `AxesInfo` object providing mnemonics for the primary and secondary axes.
 * @returns An object with the indices of the primary and secondary axes. Returns both indices as -1 if the curves are not found
 */
export function getAxisIndices(
    curves: WellLogCurve[],
    axesInfo: AxesInfo
): AxisIndices {
    if (!axesInfo.mnemos) return { primary: -1, secondary: -1 };

    const primaryMemos = axesInfo.mnemos[axesInfo.primaryAxis] ?? [];
    const secondaryMemos = axesInfo.mnemos[axesInfo.secondaryAxis] ?? [];

    return {
        primary: findIndexByMemos(curves, primaryMemos),
        secondary: findIndexByMemos(curves, secondaryMemos),
    };
}

function findIndexByMemos(curves: WellLogCurve[], memos: string[]): number {
    memos = memos.map((v) => v.toUpperCase());

    return curves.findIndex(({ name }) => memos.includes(name.toUpperCase()));
}

/**
 * Extracts well log sets from the properties of a WellLogView component.
 * Prioritizes the `wellLogSets` property, but uses the depreacted `welllog` property as a fallback.
 * A warning is logged if logs for different wells are found.
 * @param props The properties of a WellLogView component (or one extending it)
 * @returns An array of well log sets
 */
export function getWellLogSetsFromProps(props: WellLogViewProps): WellLogSet[] {
    let ret: WellLogSet[] = [];
    const setsProp = props.wellLogSets ?? props.welllog ?? [];

    if (Array.isArray(setsProp)) ret = setsProp;
    else ret = [setsProp];

    if (_.chain(ret).map("header.well").uniq().value().length > 1) {
        console.warn(
            "Got logs for different wells. WellLogView should only receive logs for the same well. For multiple wells, use SyncLogViewer instead."
        );
    }

    return ret;
}

/**
 * Gets the curve that corresponds to a given videx track ID. Throws if the id string is of the wrong pattern
 * @param wellLogSets An array of well log sets
 * @param trackId A string ID, of the pattern `<set-index>-<curve-index>`
 * @returns The curve corresponding to the given track ID. Returns `undefined` if the track ID is invalid
 */
export function getCurveFromVidexPlotId(
    wellLogSets: WellLogSet[],
    trackId: string
): WellLogCurve | undefined {
    if (!trackId.match(/^\d+-\d+$/)) {
        throw new Error(`Wrong pattern for track-id ${trackId}`);
    }

    const [iSet, iCurve] = trackId.split("-").map(Number);

    return wellLogSets[iSet]?.curves[iCurve];
}
