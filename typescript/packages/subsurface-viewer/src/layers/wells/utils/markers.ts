import type { Geometry, Position } from "geojson";
import { rotate } from "../../map/utils";

export type MarkerType = "perforation" | "screen-start" | "screen-end";

const PERFORATION_WIDTH = 2;
const PERFORATION_OFFSET = 7;
const PERFORATION_HEIGHT = 25;

const SCREEN_HEIGHT = 10;
const SCREEN_INDENT = 3;

/**
 * Returns GeoJSON geometries for different types of trajectory markers
 * @param markerType The marker type to build
 * @param anchorPoint The world position to place the anchor at
 * @param angle The angle of the marker
 * @returns A GeoJson geometry object
 */
export function buildMarkerGeometry(
    markerType: MarkerType,
    anchorPoint: Position,
    angle: number
): Geometry {
    switch (markerType) {
        case "perforation":
            return buildPerforationMarkerGeometry(anchorPoint, angle);
        case "screen-start":
            return buildScreenMarkerGeology(anchorPoint, angle, "start");
        case "screen-end":
            return buildScreenMarkerGeology(anchorPoint, angle, "end");
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

    return [rotatedPoint1, rotatedPoint2, rotatedPoint3, rotatedPoint1];
}

function buildPerforationMarkerGeometry(
    point: Position,
    rotation: number
): Geometry {
    return {
        type: "MultiPolygon",
        coordinates: [
            [buildPerforationTrianglePolygonCoordinates(point, rotation)],
            [
                buildPerforationTrianglePolygonCoordinates(
                    point,
                    rotation + Math.PI
                ),
            ],
        ],
    };
}

function buildScreenMarkerLineCoordinates(
    anchorPoint: Position,
    rotation: number,
    type: "start" | "end"
) {
    if (type === "end") rotation += Math.PI;

    const pointAbove = [
        anchorPoint[0] + SCREEN_INDENT,
        anchorPoint[1] + SCREEN_HEIGHT,
    ];

    const pointCenter: Position = [anchorPoint[0], anchorPoint[1]];
    const pointBelow: Position = [
        anchorPoint[0] + SCREEN_INDENT,
        anchorPoint[1] - SCREEN_HEIGHT,
    ];

    return [
        getRotatedPoint(pointAbove, anchorPoint, rotation),
        pointCenter,
        getRotatedPoint(pointBelow, anchorPoint, rotation),
    ];
}

function buildScreenMarkerGeology(
    anchorPoint: Position,
    rotation: number,
    type: "start" | "end"
): Geometry {
    return {
        type: "LineString",
        coordinates: buildScreenMarkerLineCoordinates(
            anchorPoint,
            rotation,
            type
        ),
    };
}
