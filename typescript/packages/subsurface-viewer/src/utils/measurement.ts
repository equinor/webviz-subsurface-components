/* eslint-disable @typescript-eslint/ban-ts-comment */

import { subtract, dot } from "mathjs";
import type {
    FeatureOf,
    LineString,
    Polygon,
} from "@deck.gl-community/editable-layers";
import type { Position } from "geojson";

import { geomReduce, segmentReduce } from "@turf/meta";

export function length(geojson: FeatureOf<LineString>): number {
    // Calculate distance from 2-vertex line segments
    return segmentReduce(
        // @ts-ignore
        geojson,
        function (previousValue?: number, segment?: FeatureOf<LineString>) {
            if (segment === undefined || previousValue === undefined) return 0;
            const coords = segment.geometry.coordinates as Position[];
            return previousValue + distance(coords[0], coords[1]);
        },
        0
    );
}

/**
 * Takes one or more features and returns their area in square meters.
 */
export function area(geojson: FeatureOf<Polygon>): number {
    return geomReduce(
        // @ts-ignore
        geojson,
        function (value: number, geom: Polygon) {
            return value + calculateArea(geom);
        },
        0
    );
}

// return distance between two points in XY plane
function distance(from: Position, to: Position): number {
    const [x1, y1, z1] = from;
    const [x2, y2, z2] = to;
    let a = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
    if (z1 && z2) a += Math.pow(z2 - z1, 2);
    return Math.sqrt(a);
}

// Calculate Area
function calculateArea(geom: Polygon): number {
    const coords = geom.coordinates[0];

    let total = 0;
    for (let i = 0, l = coords.length; i < l; i++) {
        const addX = coords[i][0];
        const addY = coords[i == coords.length - 1 ? 0 : i + 1][1];
        const subX = coords[i == coords.length - 1 ? 0 : i + 1][0];
        const subY = coords[i][1];

        total += addX * addY * 0.5;
        total -= subX * subY * 0.5;
    }

    return Math.abs(total);
}

function squared_distance(a: Position, b: Position): number {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return dx * dx + dy * dy;
}

/**
 * Calculates the squared distance from a point to a line segment
 * @param v The start position of the segment
 * @param w The end position of the segment
 * @param p The point to calculate the distance to
 * @returns The squared distance from the point to the segment
 */
export function distToSegmentSquared(
    v: Position,
    w: Position,
    p: Position
): number {
    const l2 = squared_distance(v, w);
    if (l2 == 0) return squared_distance(p, v);
    let t =
        ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
    t = Math.max(0, Math.min(1, t));
    return squared_distance(p, [
        v[0] + t * (w[0] - v[0]),
        v[1] + t * (w[1] - v[1]),
    ]);
}

/**
 * Checks if a point has moved beyond the end of a line segment
 * @param point The point to check
 * @param line The line segment, defined by start and end positions
 * @returns True if the point has moved beyond the end of the line segment, false otherwise
 */
export function isPointAwayFromLineEnd(
    point: Position,
    line: [lineStart: Position, lineEnd: Position]
): boolean {
    const ab = subtract(line[1] as number[], line[0] as number[]);
    const cb = subtract(line[1] as number[], point as number[]);

    const dotProduct = dot(ab as number[], cb as number[]);

    // If the dot product is negative, the point has moved past the end of the line
    return dotProduct < 0;
}
