import type { Accessor } from "@deck.gl/core";
import type { Feature, Point, Position } from "geojson";

import type { SizeAccessor, WellFeature } from "../types";
import { getFromAccessor } from "../../utils/layerTools";

export const LINE = "line";
export const POINT = "point";
export const DEFAULT_POINT_SIZE = 8;
export const DEFAULT_LINE_WIDTH = 5;

/**
 * Creates an deck.gl Accessor that provides a "size" for a line or point feature (i.e. width or radius) either using an an existing accessor, or returning a default.
 * @param type The type of element to create a size for
 * @param accessor An accessor that provides a size
 * @param offset An offset applied to the resulting size. No offset is applied if the computed size is 0
 * @returns An accessor giving a size
 */
export function getSize(
    type: string,
    accessor: SizeAccessor | undefined,
    offset = 0
): Accessor<Feature, number> {
    if (typeof accessor == "function") {
        return (object, objectInfo) => {
            const width = getFromAccessor(accessor, object, objectInfo) ?? 0;

            if (width === 0) return 0;
            return width + offset;
        };
    }

    if (typeof accessor === "number") {
        // Don't apply the offset for size 0, since it's likely intended to be hidden
        if (accessor <= 0) return 0;
        if (accessor > 0) return (accessor as number) + offset;
    }

    if (type == LINE) return DEFAULT_LINE_WIDTH + offset;
    else if (type == POINT) return DEFAULT_POINT_SIZE + offset;
    else throw `Unrecognized feature type: ${type}`;
}

function getPointGeometry(well_object: WellFeature): Point | undefined {
    const geometries = well_object.geometry.geometries;
    return geometries.find((item): item is Point => item.type === "Point");
}

/**
 * Extracts the head position of a well
 * @param well_object A GeoJson well feature
 * @returns The well's head position a
 */
export function getWellHeadPosition(
    well_object: WellFeature
): Position | undefined {
    return getPointGeometry(well_object)?.coordinates;
}
