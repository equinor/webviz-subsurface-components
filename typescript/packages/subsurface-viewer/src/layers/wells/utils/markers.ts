import type { Position } from "geojson";
import { rotate } from "../../map/utils";
import type { PropertyDataType } from "../../utils/layerTools";
import type {
    PerforationProperties,
    ScreenProperties,
    WellFeature,
} from "../types";

export type MarkerType = "perforation" | "screen-start" | "screen-end";

const PERFORATION_WIDTH = 1.5;
const PERFORATION_OFFSET = 7;
const PERFORATION_HEIGHT = 18;

const SCREEN_HEIGHT = 10;
const SCREEN_INDENT = 3;

/**
 * Returns geometry positions for different types of trajectory markers
 * @param markerType The marker type to build
 * @param anchorPoint The world position to place the anchor at
 * @param angle The angle of the marker
 * @returns A GeoJson geometry object
 */
export function buildMarkerPath(
    markerType: MarkerType,
    anchorPoint: Position,
    angle: number
): Position[] {
    switch (markerType) {
        case "perforation":
            return buildPerforationTrianglePolygonCoordinates(
                anchorPoint,
                angle
            );
        case "screen-start":
            return buildScreenMarkerLineCoordinates(
                anchorPoint,
                angle,
                "start"
            );
        case "screen-end":
            return buildScreenMarkerLineCoordinates(anchorPoint, angle, "end");
        default:
            throw new Error(`Unknown marker type: ${markerType}`);
    }
}

function getRotatedPoint(
    point: Position,
    pivotPoint: Position,
    rotation: number
) {
    return rotate(point[0], point[1], pivotPoint[0], pivotPoint[1], rotation);
}

function buildPerforationTrianglePolygonCoordinates(
    anchorPoint: Position,
    rotation: number
) {
    const point1 = [
        anchorPoint[0],
        anchorPoint[1] + (PERFORATION_HEIGHT + PERFORATION_OFFSET),
    ];
    const point2 = [
        anchorPoint[0] - PERFORATION_WIDTH,
        anchorPoint[1] + PERFORATION_OFFSET,
    ];
    const point3 = [
        anchorPoint[0] + PERFORATION_WIDTH,
        anchorPoint[1] + PERFORATION_OFFSET,
    ];

    const rotatedPoint1 = getRotatedPoint(point1, anchorPoint, rotation);
    const rotatedPoint2 = getRotatedPoint(point2, anchorPoint, rotation);
    const rotatedPoint3 = getRotatedPoint(point3, anchorPoint, rotation);

    // Keep the z coordinate the same so the marker still follows the path if this happens to be used in 3d (the marker will look "flat")
    rotatedPoint1.push(anchorPoint[2]);
    rotatedPoint2.push(anchorPoint[2]);
    rotatedPoint3.push(anchorPoint[2]);

    return [rotatedPoint1, rotatedPoint2, rotatedPoint3, rotatedPoint1];
}

function buildScreenMarkerLineCoordinates(
    anchorPoint: Position,
    rotation: number,
    type: "start" | "end"
) {
    if (type === "end") rotation += Math.PI;

    const pointCenter: Position = [...anchorPoint];

    const pointAbove = [
        anchorPoint[0] + SCREEN_INDENT,
        anchorPoint[1] + SCREEN_HEIGHT,
    ];

    const pointBelow: Position = [
        anchorPoint[0] + SCREEN_INDENT,
        anchorPoint[1] - SCREEN_HEIGHT,
    ];

    const rotatedPointAbove = getRotatedPoint(
        pointAbove,
        anchorPoint,
        rotation
    );
    const rotatedPointBelow = getRotatedPoint(
        pointBelow,
        anchorPoint,
        rotation
    );

    // Keep the z coordinate the same so the marker still follows the path if this happens to be used in 3d (the marker will look "flat")
    rotatedPointAbove.push(anchorPoint[2]);
    rotatedPointBelow.push(anchorPoint[2]);

    return [rotatedPointAbove, pointCenter, rotatedPointBelow];
}

/**
 * Creates a readout object that contains relevant screen information
 * @param screen A well trajectory screen object
 * @param parentWellFeature The well that the screen belongs to
 * @returns A PropertyDataType object or null if no screen is provided
 */
export function createScreenReadout(
    screen: ScreenProperties | undefined,
    parentWellFeature: WellFeature
): PropertyDataType | null {
    if (!screen) return null;

    return {
        name: `Screen ${parentWellFeature.properties.name}`,
        value: screen.name,
        color: parentWellFeature.properties?.color,
    };
}

/**
 * Creates a readout object that contains relevant perforation information
 * @param perforation A well trajectory perforation object
 * @param parentWellFeature The well that the perforation belongs to
 * @returns A PropertyDataType object or null if no perforation is provided
 */
export function createPerforationReadout(
    perforation: PerforationProperties | undefined,
    parentWellFeature: WellFeature
): PropertyDataType | null {
    if (!perforation) return null;

    return {
        name: perforation.name,
        value: perforation.status,
        color: parentWellFeature.properties?.color,
    };
}
