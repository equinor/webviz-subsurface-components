import _ from "lodash";
import type {
    WellLogCurve,
    WellLogMetadataDiscrete,
    WellLogSet,
} from "../components/WellLogTypes";
import type { AxesInfo } from "./tracks";
import type { WellLogViewProps } from "../components/WellLogView";

export function getAllWellLogCurves(wellLog: WellLogSet[]): WellLogCurve[] {
    return _.flatMap<WellLogSet[], WellLogCurve>(wellLog, _.iteratee("curves"));
}

type CurveIndex = { iCurve: number; iSet: number };

export function findSetAndCurveIndex(
    wellLog: WellLogSet[],
    curveName: string
): CurveIndex {
    let iCurve = -1;
    let iSet = -1;

    for (const logSet of wellLog) {
        iCurve = findIndexByCurveName(logSet.curves, curveName);
        iSet++;

        if (iCurve > -1) break; // Curve was found, can break early
    }

    return { iSet, iCurve };
}

export function getCurveByName(
    logSet: WellLogSet,
    name: string
): WellLogCurve | undefined {
    name = name.toUpperCase();

    return logSet.curves.find((curve) => curve.name.toUpperCase() === name);
}

export function getDiscreteMetaDataByName(
    logSet: WellLogSet,
    name: string
): WellLogMetadataDiscrete | null {
    const meta = logSet.metadata_discrete;
    name = name.toUpperCase();

    for (const key in meta) {
        // search case insensitive!
        if (key.toUpperCase() === name) return meta[key];
    }

    return null;
}

export type AxisIndices = {
    primary: number;
    secondary: number;
};

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

export function findIndexByCurveName(
    curves: WellLogCurve[],
    curveName: string
): number {
    curveName = curveName.toUpperCase();

    return curves.findIndex(({ name }) => name.toUpperCase() === curveName);
}

function findIndexByMemos(curves: WellLogCurve[], memos: string[]): number {
    memos = memos.map((v) => v.toUpperCase());

    return curves.findIndex(({ name }) => memos.includes(name.toUpperCase()));
}

// type PropWithWellLogOrSet = Pick<WellLogViewProps, "welllog" | "wellLogSets">;

export function getWellLogFromProps(props: WellLogViewProps): WellLogSet[] {
    let ret: WellLogSet[] = [];

    if (Array.isArray(props.welllog)) ret = props.welllog;
    else if (props.welllog) ret = [props.welllog];

    if (_.chain(ret).map("header.well").uniq().value().length > 1) {
        console.warn(
            "Got logs for different wells. WellLogView should only receive logs for the same well. For multiple wells, use SyncLogViewer instead."
        );
    }

    return ret;
}

export function getCurveFromVidexPlotId(
    wellLogSets: WellLogSet[],
    trackId: string
): WellLogCurve {
    if (!trackId.match(/^\d+-\d+$/)) {
        throw new Error(`Wrong pattern for track-id ${trackId}`);
    }

    const [iSet, iCurve] = trackId.split("-").map(Number);

    return wellLogSets[iSet].curves[iCurve];
}
