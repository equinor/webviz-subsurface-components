import type {
    FeatureCollection,
    GeometryCollection,
    LineString,
    Point,
} from "geojson";
import { cloneDeep } from "lodash";
import type { Position3D } from "../../utils/layerTools";
import simplify from "@turf/simplify";

export function removeConsecutiveDuplicates(
    coords: Position3D[],
    mds: number[]
): [Position3D[], number[]] {
    // Filter out consecutive duplicate vertices.
    const keep = coords.map((e, index, arr) => {
        if (index < arr.length - 1) {
            return (
                e[0] !== arr[index + 1][0] ||
                e[1] !== arr[index + 1][1] ||
                e[2] !== arr[index + 1][2]
            );
        }
        return true;
    });
    coords = coords.filter((_e, index) => {
        return keep[index];
    });
    mds = mds.filter((_e: number, index: number) => {
        return keep[index];
    });

    return [coords, mds];
}

export function removeDuplicates(data: FeatureCollection): void {
    const no_wells = data.features.length;
    for (let well_no = 0; well_no < no_wells; well_no++) {
        const mds = data.features[well_no].properties?.["md"];
        if (mds === undefined) {
            continue;
        }
        const geometryCollection = data.features[well_no]
            .geometry as GeometryCollection;
        const lineString = geometryCollection?.geometries[1] as LineString;

        if (lineString.coordinates?.length === undefined) {
            continue;
        }

        let coords = lineString.coordinates as Position3D[];

        const nOrig = coords.length;
        [coords, mds[0]] = removeConsecutiveDuplicates(coords, mds[0]);

        const n = coords.length;
        if (n != nOrig) {
            console.warn("Well number ", well_no, " contains duplicates.");
        }
        if (n <= 1) {
            continue;
        }

        (
            (data.features[well_no].geometry as GeometryCollection)
                .geometries[1] as LineString
        ).coordinates = coords;

        if (data.features[well_no].properties) {
            data.features[well_no].properties!["md"] = mds; // eslint-disable-line
        }
    }
}

/**
 * Given four points P0, P1, P2, P4 and a argument t in the interval [0,1].
 * returns function value at t. t == 0 corresponds to P1 and t == 1 corrsponds to P2
 *
 * See https://qroph.github.io/2018/07/30/smooth-paths-using-catmull-rom-splines.html
 */
export function CatmullRom1D(
    P0: number,
    P1: number,
    P2: number,
    P3: number,
    t: number
): number {
    const alpha = 0.5;
    const tt = t * t;
    const ttt = t * t * t;

    const dist_p0_p1 = Math.sqrt(
        (P1 - P0) * (P1 - P0) + (P1 - P0) * (P1 - P0) + (P1 - P0) * (P1 - P0)
    );
    const dist_p1_p2 = Math.sqrt(
        (P1 - P2) * (P1 - P2) + (P1 - P2) * (P1 - P2) + (P1 - P2) * (P1 - P2)
    );
    const dist_p2_p3 = Math.sqrt(
        (P3 - P2) * (P3 - P2) + (P3 - P2) * (P3 - P2) + (P3 - P2) * (P3 - P2)
    );

    const t01 = Math.pow(dist_p0_p1, alpha);
    const t12 = Math.pow(dist_p1_p2, alpha);
    const t23 = Math.pow(dist_p2_p3, alpha);

    const m1 = P2 - P1 + t12 * ((P1 - P0) / t01 - (P2 - P0) / (t01 + t12));
    const m2 = P2 - P1 + t12 * ((P3 - P2) / t23 - (P3 - P1) / (t12 + t23));

    const a_x = 2 * (P1 - P2) + m1 + m2;
    const b_x = -3 * (P1 - P2) - m1 - m1 - m2;
    const c_x = m1;
    const d_x = P1;

    const x = a_x * ttt + b_x * tt + c_x * t + d_x;

    return x;
}

/**
 * Given four 3D points P0, P1, P2, P4 and a scalar argument t in the interval [0,1].
 * returns function value (3D) at t. t == 0 corresponds to P1 and t == 1 corrsponds to P2
 *
 * See https://qroph.github.io/2018/07/30/smooth-paths-using-catmull-rom-splines.html
 */
export function CatmullRom(
    P0: Position3D,
    P1: Position3D,
    P2: Position3D,
    P3: Position3D,
    t: number
): Position3D {
    const alpha = 0.5;
    const tt = t * t;
    const ttt = t * t * t;

    // disable eslint for some lines due to readability.
    const dist_p0_p1 = Math.sqrt((P1[0]-P0[0])*(P1[0]-P0[0]) + (P1[1]-P0[1])*(P1[1]-P0[1]) + (P1[2]-P0[2])*(P1[2]-P0[2]) ); // eslint-disable-line
    const dist_p1_p2 = Math.sqrt((P1[0]-P2[0])*(P1[0]-P2[0]) + (P1[1]-P2[1])*(P1[1]-P2[1]) + (P1[2]-P2[2])*(P1[2]-P2[2]) ); // eslint-disable-line
    const dist_p2_p3 = Math.sqrt((P3[0]-P2[0])*(P3[0]-P2[0]) + (P3[1]-P2[1])*(P3[1]-P2[1]) + (P3[2]-P2[2])*(P3[2]-P2[2]) ); // eslint-disable-line

    const t01 = Math.pow(dist_p0_p1, alpha);
    const t12 = Math.pow(dist_p1_p2, alpha);
    const t23 = Math.pow(dist_p2_p3, alpha);

    const m1_x = (P2[0] - P1[0] + t12 * ((P1[0] - P0[0]) / t01 - (P2[0] - P0[0]) / (t01 + t12))); // eslint-disable-line
    const m1_y = (P2[1] - P1[1] + t12 * ((P1[1] - P0[1]) / t01 - (P2[1] - P0[1]) / (t01 + t12))); // eslint-disable-line
    const m1_z = (P2[2] - P1[2] + t12 * ((P1[2] - P0[2]) / t01 - (P2[2] - P0[2]) / (t01 + t12))); // eslint-disable-line

    const m2_x = (P2[0] - P1[0] + t12 * ((P3[0] - P2[0]) / t23 - (P3[0] - P1[0]) / (t12 + t23))); // eslint-disable-line
    const m2_y = (P2[1] - P1[1] + t12 * ((P3[1] - P2[1]) / t23 - (P3[1] - P1[1]) / (t12 + t23))); // eslint-disable-line
    const m2_z = (P2[2] - P1[2] + t12 * ((P3[2] - P2[2]) / t23 - (P3[2] - P1[2]) / (t12 + t23))); // eslint-disable-line

    const a_x = 2 * (P1[0] - P2[0]) + m1_x + m2_x;
    const a_y = 2 * (P1[1] - P2[1]) + m1_y + m2_y;
    const a_z = 2 * (P1[2] - P2[2]) + m1_z + m2_z;

    const b_x = -3 * (P1[0] - P2[0]) - m1_x - m1_x - m2_x;
    const b_y = -3 * (P1[1] - P2[1]) - m1_y - m1_y - m2_y;
    const b_z = -3 * (P1[2] - P2[2]) - m1_z - m1_z - m2_z;

    const c_x = m1_x;
    const c_y = m1_y;
    const c_z = m1_z;

    const d_x = P1[0];
    const d_y = P1[1];
    const d_z = P1[2];

    const x = a_x * ttt + b_x * tt + c_x * t + d_x;
    const y = a_y * ttt + b_y * tt + c_y * t + d_y;
    const z = a_z * ttt + b_z * tt + c_z * t + d_z;

    return [x, y, z] as Position3D;
}

/**
 * Will interpolate and refine wellpaths using spline interploation resulting
 * in smoother curves with more points.
 * Assumes 3D data.
 */
export function splineRefine(
    data_in: FeatureCollection,
    stepCount = 5
): FeatureCollection {
    if (stepCount < 1) {
        return data_in;
    }

    const data = cloneDeep(data_in);

    const no_wells = data.features.length;

    const step = 1 / stepCount;

    const steps = Array(stepCount - 1)
        .fill(0)
        .map((_x, index) => (index + 1) * step);

    for (let well_no = 0; well_no < no_wells; well_no++) {
        const mds = data.features[well_no].properties?.["md"];
        if (mds === undefined) {
            continue;
        }
        const geometryCollection = data.features[well_no]
            .geometry as GeometryCollection;
        const lineString = geometryCollection?.geometries[1] as LineString;

        if (lineString.coordinates?.length === undefined) {
            continue;
        }

        const coords = lineString.coordinates as Position3D[];

        const n = coords.length;
        if (n <= 1) {
            continue;
        }

        const ts = n > 3 ? steps : [];

        // Point before first.
        const x0 = coords[0][0] - coords[1][0] + coords[0][0];
        const y0 = coords[0][1] - coords[1][1] + coords[0][1];
        const z0 = coords[0][2] - coords[1][2] + coords[0][2];
        const P_first: Position3D = [x0, y0, z0];

        const md_first = mds[0][0] - mds[0][1] + mds[0][0];

        // Point after last.
        const xn = coords[n - 1][0] - coords[n - 2][0] + coords[n - 1][0];
        const yn = coords[n - 1][1] - coords[n - 2][1] + coords[n - 1][1];
        const zn = coords[n - 1][2] - coords[n - 2][2] + coords[n - 1][2];
        const P_n: Position3D = [xn, yn, zn];

        const md_n = mds[0][n - 1] - mds[0][n - 2] + mds[0][n - 1];

        const newCoordinates: Position3D[] = [];
        const newMds: number[][] = [];
        newMds.push([]);

        for (let i = 0; i < n - 1; i += 1) {
            let P0: Position3D, P1: Position3D, P2: Position3D, P3: Position3D;
            let md0: number, md1: number, md2: number, md3: number;

            if (i === 0) {
                P0 = P_first;
                P1 = coords[i + 0];
                P2 = coords[i + 1];
                P3 = coords[i + 2];

                md0 = md_first;
                md1 = mds[0][i + 0];
                md2 = mds[0][i + 1];
                md3 = mds[0][i + 2];
            } else if (i === n - 2) {
                P0 = coords[n - 3];
                P1 = coords[n - 2];
                P2 = coords[n - 1];
                P3 = P_n;

                md0 = mds[0][n - 3];
                md1 = mds[0][n - 2];
                md2 = mds[0][n - 1];
                md3 = md_n;
            } else {
                P0 = coords[i - 1];
                P1 = coords[i - 0];
                P2 = coords[i + 1];
                P3 = coords[i + 2];

                md0 = mds[0][i - 1];
                md1 = mds[0][i - 0];
                md2 = mds[0][i + 1];
                md3 = mds[0][i + 2];
            }

            newCoordinates.push(P1);
            newMds[0].push(md1);

            // Skip first leg from platform to first survey point.
            if (i > 1) {
                for (let t_i = 0; t_i < ts.length; t_i += 1) {
                    const t = ts[t_i];
                    const [x, y, z] = CatmullRom(P0, P1, P2, P3, t);
                    const md = CatmullRom1D(md0, md1, md2, md3, t);

                    newCoordinates.push([x, y, z] as Position3D);
                    newMds[0].push(md);
                }
            }
        }

        newCoordinates.push(coords[n - 1]);
        newMds[0].push(mds[0][n - 1]);

        (
            (data.features[well_no].geometry as GeometryCollection)
                .geometries[1] as LineString
        ).coordinates = newCoordinates;

        if (data.features[well_no].properties) {
            data.features[well_no].properties!["md"] = newMds; // eslint-disable-line
        }
    }

    return data;
}

/**
 * Will reduce/coarse the wellpaths.
 */
export function coarsenWells(data_in: FeatureCollection): FeatureCollection {
    const data = cloneDeep(data_in);

    const no_wells = data.features.length;
    for (let well_no = 0; well_no < no_wells; well_no++) {
        const geometryCollection = data.features[well_no]
            .geometry as GeometryCollection;
        const lineString = geometryCollection?.geometries[1] as LineString;

        if (lineString.coordinates?.length === undefined) {
            continue;
        }

        const isVerticalWell = lineString.coordinates.every(
            (e) =>
                e[0] === lineString.coordinates[0][0] &&
                e[1] === lineString.coordinates[0][1]
        );

        if (isVerticalWell) {
            // The simplify algorithm below did not work on vertical wells hence in this case we only use first and last point.
            const n = lineString.coordinates.length;
            const coordsSimplified = [
                lineString.coordinates[0],
                lineString.coordinates[n - 1],
            ];
            lineString.coordinates = coordsSimplified;
        } else {
            const options = {
                tolerance: 0.01,
                highQuality: false,
                mutate: false,
            };

            const coordsSimplified = simplify(lineString, options);
            lineString.coordinates =
                coordsSimplified.coordinates as Position3D[];
        }
    }

    return data;
}

export function flattenPath(data_in: FeatureCollection): FeatureCollection {
    const data = cloneDeep(data_in);

    const no_wells = data.features.length;
    for (let well_no = 0; well_no < no_wells; well_no++) {
        const geometryCollection = data.features[well_no]
            .geometry as GeometryCollection;
        const lineString = geometryCollection?.geometries[1] as LineString;

        if (lineString.coordinates?.length === undefined) {
            continue;
        }

        const coords = lineString.coordinates as Position3D[];

        // flatten by setting z value constant.
        const coords_flat: Position3D[] = coords.map((e: Position3D) => {
            return [e[0], e[1], 0.0];
        });

        (
            (data.features[well_no].geometry as GeometryCollection)
                .geometries[1] as LineString
        ).coordinates = coords_flat;
    }

    return data;
}

export function invertPath(data_in: FeatureCollection): FeatureCollection {
    const data = cloneDeep(data_in);

    const no_wells = data.features.length;
    for (let well_no = 0; well_no < no_wells; well_no++) {
        const geometryCollection = data.features[well_no]
            .geometry as GeometryCollection;

        const lineString = geometryCollection?.geometries[1] as LineString;

        const wellHead = geometryCollection?.geometries[0] as Point;
        if (wellHead.coordinates?.[2]) {
            wellHead.coordinates[2] *= -1;
        }

        if (lineString.coordinates?.length === undefined) {
            continue;
        }

        const coords = lineString.coordinates as Position3D[];

        // Invert path by multiplying depth with -1.
        const coords_inverted: Position3D[] = coords.map((e: Position3D) => {
            return [e[0], e[1], -e[2]];
        });

        (
            (data.features[well_no].geometry as GeometryCollection)
                .geometries[1] as LineString
        ).coordinates = coords_inverted;
    }

    return data;
}

/**
 * Calculates bounding box of all wells.
 */
export function GetBoundingBox(
    data: FeatureCollection
): [number, number, number, number, number, number] {
    let xMin = 9999999999;
    let yMin = 9999999999;
    let zMin = 9999999999;
    let xMax = -9999999999;
    let yMax = -9999999999;
    let zMax = -9999999999;

    const no_wells = data.features.length;
    for (let well_no = 0; well_no < no_wells; well_no++) {
        const geometryCollection = data.features[well_no]
            .geometry as GeometryCollection;
        const lineString = geometryCollection?.geometries[1] as LineString;

        if (lineString.coordinates?.length === undefined) {
            continue;
        }

        const coords = lineString.coordinates as Position3D[];
        const n = coords.length;
        for (let i = 0; i < n; i++) {
            const xyz = coords[i];

            xMin = xyz[0] < xMin ? xyz[0] : xMin;
            yMin = xyz[1] < yMin ? xyz[1] : yMin;
            zMin = xyz[2] < zMin ? xyz[2] : zMin;

            xMax = xyz[0] > xMax ? xyz[0] : xMax;
            yMax = xyz[1] > yMax ? xyz[1] : yMax;
            zMax = xyz[2] > zMax ? xyz[2] : zMax;
        }
    }

    return [xMin, yMin, zMin, xMax, yMax, zMax];
}
