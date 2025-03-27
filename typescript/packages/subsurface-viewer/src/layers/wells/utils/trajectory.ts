import type { Color } from "@deck.gl/core";
import type { LineString, Position } from "geojson";
import type { StyleAccessorFunction } from "../../types";
import type { WellFeature } from "../wellsLayer";

type ColorAccessor = Color | StyleAccessorFunction | undefined;

function getLineStringGeometry(
    well_object: WellFeature
): LineString | undefined {
    const geometries = well_object.geometry.geometries;
    return geometries.find(
        (item): item is LineString => item.type === "LineString"
    );
}

export function getColor(accessor: ColorAccessor) {
    if (accessor as Color) {
        return accessor as Color;
    }

    return (
        object: WellFeature,
        objectInfo?: Record<string, unknown>
    ): Color | undefined => {
        if (typeof accessor === "function") {
            const colorFunc = accessor as StyleAccessorFunction;

            const color = colorFunc(object, objectInfo) as Color;
            if (color) {
                return color;
            }
        }
        return object.properties?.color;
    };
}

/**
 * Get trajectory transparency based on alpha of trajectory color
 */
function isTrajectoryTransparent(
    well_object: WellFeature,
    color_accessor: ColorAccessor
): boolean {
    let alpha;
    const accessor = getColor(color_accessor);
    if (typeof accessor === "function") {
        alpha = accessor(well_object)?.[3];
    } else {
        alpha = accessor?.[3];
    }
    return alpha === 0;
}

/**
 * Get trajectory data from LineString Geometry if it's visible (checking
 * trajectory visiblity based on line color)
 */
export function getTrajectory(
    well_object: WellFeature,
    color_accessor: ColorAccessor
): Position[] | undefined {
    if (!isTrajectoryTransparent(well_object, color_accessor))
        return getLineStringGeometry(well_object)?.coordinates;
    else return undefined;
}
