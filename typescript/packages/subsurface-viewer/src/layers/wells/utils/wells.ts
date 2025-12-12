import { interpolateNumberArray } from "d3-interpolate";
import type { Position } from "geojson";

import type { WellFeature } from "../types";

/**
 * Gets a well feature object based on it's name
 * @param wells_data A list of data features
 * @param name The name of the well. Case insensitive
 * @returns Returns the well if found
 */
export function getWellObjectByName(
    wells_data: WellFeature[],
    name: string
): WellFeature | undefined {
    return wells_data?.find(
        (item) => item.properties?.name?.toLowerCase() === name?.toLowerCase()
    );
}

/**
 * Gets multiple well feature objects based on their names
 * @param wells_data A list of data features
 * @param name The names of the wells to find. Case insensitive
 * @returns Returns a list of all wells who's name was found
 */
export function getWellObjectsByName(
    wells_data: WellFeature[],
    name: string[]
): WellFeature[] {
    const res: WellFeature[] = [];
    for (let i = 0; i < name?.length; i++) {
        wells_data?.find((item) => {
            if (item.properties?.name?.toLowerCase() === name[i]?.toLowerCase())
                res.push(item);
        });
    }
    return res;
}

/**
 * Get measured depths array from well feature object
 * @param well_object A well feature object
 * @returns An array of measured depths for the well
 */
export function getWellMds(well_object: WellFeature): number[] {
    return well_object.properties.md[0];
}

/**
 * Gets an interpolated world position along a well trajectory based on measured depth
 * @param well_xyz A wells trajectory positions
 * @param well_mds A wells trajectory measured depths
 * @param md The measured depth to get the position for
 * @returns The interpolated world position at the given measured depth
 */
export function getPositionByMD(
    well_xyz: Position[],
    well_mds: number[],
    md: number
): Position {
    const [l_idx, h_idx] = getNeighboringMdIndices(well_mds, md);
    const md_low = well_mds[l_idx];
    const md_normalized = (md - md_low) / (well_mds[h_idx] - md_low);
    return interpolateNumberArray(
        well_xyz[l_idx],
        well_xyz[h_idx]
    )(md_normalized);
}

function getNeighboringMdIndices(mds: number[], md: number): number[] {
    const idx = mds.findIndex((x) => x >= md);
    return idx === 0 ? [idx, idx + 1] : [idx - 1, idx];
}
