import type { Position3D } from "../utils/layerTools";

// square distance from a point to a segment
function getSquareSegmentDistance(
    p: Position3D,
    p1: Position3D,
    p2: Position3D
) {
    let x = p1[0],
        y = p1[1],
        z = p1[2],
        dx = p2[0] - x,
        dy = p2[1] - y,
        dz = p2[2] - z;

    if (dx !== 0 || dy !== 0 || dz !== 0) {
        const t =
            ((p[0] - x) * dx + (p[1] - y) * dy + (p[2] - z) * dz) /
            (dx * dx + dy * dy + dz * dz);

        if (t > 1) {
            x = p2[0];
            y = p2[1];
            z = p2[2];
        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
            z += dz * t;
        }
    }

    dx = p[0] - x;
    dy = p[1] - y;
    dz = p[2] - z;

    return dx * dx + dy * dy + dz * dz;
}

// simplification using optimized Douglas-Peucker algorithm with recursion elimination
function simplifyDouglasPeucker(
    points: Position3D[],
    mds: number[],
    sqTolerance: number
) {
    const len = points.length,
        MarkerArray = typeof Uint8Array !== "undefined" ? Uint8Array : Array,
        markers = new MarkerArray(len),
        stack = [],
        newPoints = [],
        newMds = [];
    let first = 0,
        last = len - 1,
        i = 0,
        maxSqDist,
        sqDist,
        index = 0;
    markers[first] = markers[last] = 1;

    while (last) {
        maxSqDist = 0;

        for (i = first + 1; i < last; i++) {
            sqDist = getSquareSegmentDistance(
                points[i],
                points[first],
                points[last]
            );

            if (sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }

        if (maxSqDist > sqTolerance) {
            markers[index] = 1;
            stack.push(first, index, index, last);
        }

        last = stack.pop() as number;
        first = stack.pop() as number;
    }

    for (i = 0; i < len; i++) {
        if (markers[i]) {
            newPoints.push(points[i]);
            newMds.push(mds[i]);
        }
    }

    return [newPoints, newMds];
}

// See: https://github.com/mourner/simplify-js/blob/3d/simplify.js
export function simplify(
    points: Position3D[],
    mds: number[],
    tolerance: number | undefined
) {
    const sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;
    const [newPoints, newMds] = simplifyDouglasPeucker(
        points,
        mds,
        sqTolerance
    );
    return [newPoints, newMds];
}
