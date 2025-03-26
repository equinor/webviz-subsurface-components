import type { Color, Position } from "@deck.gl/core";
import type { Feature, GeometryCollection, LineString } from "geojson";
import type { StyleAccessorFunction } from "../../types";

type ColorAccessor = Color | StyleAccessorFunction | undefined;

function getLineStringGeometry(well_object: Feature): LineString {
    return (well_object.geometry as GeometryCollection)?.geometries.find(
        (item: { type: string }) => item.type == "LineString"
    ) as LineString;
}

export function getColor(accessor: ColorAccessor) {
    if (accessor as Color) {
        return accessor as Color;
    }

    return (object: Feature, objectInfo?: Record<string, unknown>): Color => {
        if (typeof accessor === "function") {
            const color = (accessor as StyleAccessorFunction)(
                object,
                objectInfo
            ) as Color;
            if (color) {
                return color;
            }
        }
        return object.properties?.["color"] as Color;
    };
}

/**
 * Get trajectory transparency based on alpha of trajectory color
 */
function isTrajectoryTransparent(
    well_object: Feature,
    color_accessor: ColorAccessor
): boolean {
    let alpha;
    const accessor = getColor(color_accessor);
    if (typeof accessor === "function") {
        alpha = accessor(well_object)?.[3];
    } else {
        alpha = (accessor as Color)?.[3];
    }
    return alpha === 0;
}

/**
 * Get trajectory data from LineString Geometry if it's visible (checking
 * trajectory visiblity based on line color)
 */
export function getTrajectory(
    well_object: Feature,
    color_accessor: ColorAccessor
): Position[] | undefined {
    if (!isTrajectoryTransparent(well_object, color_accessor))
        return getLineStringGeometry(well_object)?.coordinates as Position[];
    else return undefined;
}
