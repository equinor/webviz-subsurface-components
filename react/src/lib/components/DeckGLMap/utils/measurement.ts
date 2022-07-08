import { FeatureOf, LineString, Polygon } from "@nebula.gl/edit-modes";
import { Position } from "deck.gl";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const meta = require("@turf/meta");

export function length(geojson: FeatureOf<LineString>): number {
    // Calculate distance from 2-vertex line segments
    return meta.segmentReduce(
        geojson,
        function (previousValue: number, segment: FeatureOf<LineString>) {
            const coords = segment.geometry.coordinates;
            return previousValue + distance(coords[0], coords[1]);
        },
        0
    );
}

/**
 * Takes one or more features and returns their area in square meters.
 */
export function area(geojson: FeatureOf<Polygon>): number {
    return meta.geomReduce(
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
