/* eslint-disable @typescript-eslint/ban-ts-comment */

import { subtract, dot } from "mathjs";
import type {
    Feature,
    LineString,
    Polygon,
} from "@deck.gl-community/editable-layers";
import type { Position } from "geojson";

import { geomReduce, segmentReduce } from "@turf/meta";

export function length(geojson: Feature<LineString>): number {
    // Calculate distance from 2-vertex line segments
    return segmentReduce(
        // @ts-ignore
        geojson,
        function (previousValue?: number, segment?: Feature<LineString>) {
            if (segment === undefined || previousValue === undefined) return 0;
            const coords = segment.geometry.coordinates;
            return previousValue + distance(coords[0], coords[1]);
        },
        0
    );
}

/**
 * Takes one or more features and returns their area in square meters.
 */
export function area(geojson: Feature<Polygon>): number {
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
    const dz = a.length === 3 ? a[2] - b[2] : 0;

    return dx ** 2 + dy ** 2 + dz ** 2;
}

function anyOfLength(length: number, ...positions: Position[]) {
    return positions.some((p) => p.length === length);
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
    if (anyOfLength(2, v, w, p) && anyOfLength(3, v, w, p)) {
        console.warn(":: Dimensions do not match, dropping z");
        v = v.slice(0, 2);
        w = w.slice(0, 2);
        p = p.slice(0, 2);
    }

    const squareLength = squared_distance(v, w);
    if (squareLength == 0) return squared_distance(p, v);

    let t = dot(subtract(p, v), subtract(w, v)) / squareLength;
    t = Math.max(0, Math.min(1, t));

    if (p.length === 2) {
        return squared_distance(p, [
            v[0] + t * (w[0] - v[0]),
            v[1] + t * (w[1] - v[1]),
        ]);
    } else {
        return squared_distance(p, [
            v[0] + t * (w[0] - v[0]),
            v[1] + t * (w[1] - v[1]),
            v[2] + t * (w[2] - v[2]),
        ]);
    }
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

    const dotProduct = dot(ab, cb);

    // If the dot product is negative, the point has moved past the end of the line
    return dotProduct < 0;
}

/**
 * Check if a number is close (or equal) to another number
 * @param number A number
 * @param otherNumber Another number
 * @param threshold The threshold within which the two numbers are considered "close". Defaults to `0.001`
 * @returns true if the numbers are close, false otherwise
 */
export function isClose(
    number: number,
    otherNumber: number,
    threshold: number = 0.001
) {
    return Math.abs(number - otherNumber) < threshold;
}
