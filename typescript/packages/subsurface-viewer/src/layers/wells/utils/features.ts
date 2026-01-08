import type { Accessor } from "@deck.gl/core";
import type { Feature, Point, Position } from "geojson";

import type { SizeAccessor, WellFeature } from "../types";
import { getFromAccessor } from "../../utils/layerTools";

export const LINE = "line";
export const POINT = "point";
export const DEFAULT_POINT_SIZE = 8;
export const DEFAULT_LINE_WIDTH = 5;

export function getSize(
    type: string,
    accessor: SizeAccessor | undefined,
    offset = 0
): Accessor<Feature, number> {
    if (typeof accessor == "function") {
        return (object, objectInfo) => {
            const width = getFromAccessor(accessor, object, objectInfo);
            return (width as number) + offset;
        };
    }

    if ((accessor as number) == 0) return 0;
    if ((accessor as number) > 0) return (accessor as number) + offset;

    if (type == LINE) return DEFAULT_LINE_WIDTH + offset;
    if (type == POINT) return DEFAULT_POINT_SIZE + offset;
    return 0;
}

function getPointGeometry(well_object: WellFeature): Point | undefined {
    const geometries = well_object.geometry.geometries;
    return geometries.find((item): item is Point => item.type === "Point");
}

// Return well head position from Point Geometry
export function getWellHeadPosition(
    well_object: WellFeature
): Position | undefined {
    return getPointGeometry(well_object)?.coordinates;
}
