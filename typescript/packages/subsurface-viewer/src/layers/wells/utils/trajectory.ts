import type { AccessorContext, Color } from "@deck.gl/core";
import type { LineString, Position } from "geojson";
import _ from "lodash";
import { Vector2, Vector3 } from "math.gl";
import { distance, dot, subtract } from "mathjs";

import type { Point2D, Point3D } from "../../../utils";
import {
    distToSegmentSquared,
    isClose,
    isPointAwayFromLineEnd,
} from "../../../utils/measurement";
import type { StyleAccessorFunction } from "../../types";
import type { ColorAccessor, WellFeature } from "../types";
import { getWellHeadPosition } from "./features";

/**
 * Finds the nested geometry object that describes a well's trajectory
 * @param well_object A GeoJSON Well Feature
 * @returns A "LineString" object that describes the well's path
 */
export function getLineStringGeometry(
    well_object: WellFeature
): LineString | undefined {
    const geometries = well_object.geometry.geometries;
    return geometries.find(
        (item): item is LineString => item.type === "LineString"
    );
}

export function getColor(accessor: ColorAccessor) {
    if (Array.isArray(accessor)) {
        return accessor as Color;
    }

    return (
        object: WellFeature,
        objectInfo?: AccessorContext<WellFeature>
    ): Color | undefined => {
        if (typeof accessor === "function") {
            const colorFunc = accessor as StyleAccessorFunction;

            // info object is arguably required, but there's too many spots that don't pass it along atm
            // @ts-expect-error -- @ander2303
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

export function getMdsInRange(
    mdArray: number[],
    // We assume the range is already sanitized (aka: mdStart < mdEnd)
    mdStart: number,
    mdEnd: number
) {
    const mdSection = [];

    mdSection.push(mdStart);

    for (let index = 0; index < mdArray.length; index++) {
        const md = mdArray[index];

        // Equal mds are skipped, since they're added at the end
        if (md <= mdStart) continue;
        if (md >= mdEnd) break;

        mdSection.push(md);
    }

    mdSection.push(mdEnd);

    return mdSection;
}

// Interpolates point closest to the coords on trajectory
export function interpolateDataOnTrajectory(
    coord: Position,
    data: number[],
    trajectory: Position[]
): number | null {
    // if number of data points in less than 1 or
    // length of data and trajectory are different we cannot interpolate.
    if (data.length <= 1 || data.length != trajectory.length) return null;

    // Identify closest well path leg to coord.
    const segment_index = getSegmentIndex(coord, trajectory);

    const index0 = segment_index;
    const index1 = index0 + 1;

    // Get the nearest data.
    const data0 = data[index0];
    const data1 = data[index1];

    // Get the nearest survey points.
    const survey0 = trajectory[index0];
    const survey1 = trajectory[index1];

    // To avoid interpolating longer than the actual wellbore path we ignore the coordinate if it's moved beyond the last line
    if (
        index1 === trajectory.length - 1 &&
        isPointAwayFromLineEnd(coord, [survey0, survey1])
    ) {
        coord = survey1;
    }

    if (index0 === 0 && isPointAwayFromLineEnd(coord, [survey1, survey0])) {
        coord = survey0;
    }

    const dv = distance(survey0, survey1) as number;
    if (dv === 0) {
        return null;
    }

    // Calculate the scalar projection onto segment.
    const v0 = subtract(coord as number[], survey0 as number[]);
    const v1 = subtract(survey1 as number[], survey0 as number[]);

    // scalar_projection in interval [0,1]
    const scalar_projection: number =
        dot(v0 as number[], v1 as number[]) / (dv * dv);

    // Interpolate data.
    return data0 * (1.0 - scalar_projection) + data1 * scalar_projection;
}

export function getMd(
    coord: Position,
    feature: WellFeature,
    accessor: ColorAccessor
): number | null {
    if (!feature.properties?.["md"]?.[0] || !feature.geometry) return null;

    const measured_depths = feature.properties.md[0] as number[];
    const trajectory3D = getTrajectory(feature, accessor);

    if (trajectory3D == undefined) return null;

    let trajectory;
    // In 2D view coord is of type Point2D and in 3D view it is Point3D,
    // so use appropriate trajectory for interpolation
    if (coord.length == 2) {
        const trajectory2D = trajectory3D.map((v) => {
            return v.slice(0, 2);
        }) as Position[];
        trajectory = trajectory2D;
    } else {
        trajectory = trajectory3D;
    }

    return interpolateDataOnTrajectory(coord, measured_depths, trajectory);
}

export function getTvd(
    coord: Position,
    feature: WellFeature,
    accessor: ColorAccessor
): number | null {
    const trajectory3D = getTrajectory(feature, accessor);

    // if trajectory is not found or if it has a data single point then get tvd from well head
    if (trajectory3D == undefined || trajectory3D?.length <= 1) {
        const wellhead_xyz = getWellHeadPosition(feature);
        return wellhead_xyz?.[2] ?? null;
    }
    let trajectory;
    // For 2D view coord is Point2D and for 3D view it is Point3D
    if (coord.length == 2) {
        const trajectory2D = trajectory3D?.map((v) => {
            return v.slice(0, 2);
        }) as Position[];
        trajectory = trajectory2D;
    } else {
        trajectory = trajectory3D;
    }

    const tvds = trajectory3D.map((v) => {
        return v[2];
    }) as number[];

    // TVD goes downwards, so it's reversed
    return interpolateDataOnTrajectory(coord, tvds, trajectory);
} // Identify closest path leg to coord.

export function getSegmentIndex(coord: Position, path: Position[]): number {
    let min_d = Number.MAX_VALUE;
    let segment_index = 0;
    for (let i = 0; i < path?.length - 1; i++) {
        const d = distToSegmentSquared(path[i], path[i + 1], coord);
        if (d > min_d) continue;

        segment_index = i;
        min_d = d;
    }
    return segment_index;
}

/**
 * Gets the lower and upper path-indices for the path-segment that contains a specific fractional point along the path. fraction-positions that are very close to either end (by 0.001 units) will be rounded of.
 * @param fractionPosition A fractional position along the track (0-1);
 * @param trajectory A list of positions that describes the trajectory
 * @param cumulativeTrajectoryDistance A list of pre-computed distance measurements for each trajectory point (i.e. a wells measured depth array). The measurements must cumulative values.
 * @returns a tuple containing the lower and upper segment indices, as well as the fractional position along the segment (0-1, with 0 being the beginning of the segment)
 */
export function getFractionPositionSegmentIndices(
    fractionPosition: number,
    trajectory: unknown[],
    cumulativeTrajectoryDistance: number[]
): [lowerIndex: number, upperIndex: number, segmentFraction: number] {
    if (trajectory.length < 2) {
        throw Error("Expected trajectory to have at least 2 points");
    }
    if (cumulativeTrajectoryDistance.length !== trajectory.length) {
        throw Error(
            "Expected path measurements array to be same length as path array"
        );
    }

    // Some trajectories dont have the md-array starting at 1
    const offset = cumulativeTrajectoryDistance.at(0)!;

    const pointDistance = _.clamp(
        fractionPosition * (cumulativeTrajectoryDistance.at(-1)! + offset),
        cumulativeTrajectoryDistance.at(0)!,
        cumulativeTrajectoryDistance.at(-1)!
    );

    const sortedIndex = _.sortedIndex(
        cumulativeTrajectoryDistance,
        pointDistance
    );

    if (sortedIndex === 0) {
        return [0, 1, 0];
    }

    // Since we clamp it, this shouldn't be possible, but Im leaving it just in case
    /* istanbul ignore next @preserve */
    if (sortedIndex >= cumulativeTrajectoryDistance.length) {
        throw Error("Position is outside of trajectory");
    }

    const lowerDistance = cumulativeTrajectoryDistance[sortedIndex - 1];
    const upperDistance = cumulativeTrajectoryDistance[sortedIndex];

    let segmentPos =
        (pointDistance - lowerDistance) / (upperDistance - lowerDistance);

    if (isClose(segmentPos, 0)) segmentPos = 0;
    if (isClose(segmentPos, 1)) segmentPos = 1;

    return [sortedIndex - 1, sortedIndex, segmentPos];
}

/**
 * Get position and angle (in radians) along a trajectory path
 * @param positionAlongPath 0-1 fraction along trajectory
 * @param trajectory Trajectory as a list of positions
 * @param projectionFunc Callback function to project 3D coordinates over to 2D
 * @param is3d Whether to use compute with (and return) 2-dimensional positions
 * @returns A tuple containing an angle and a interpolated point on the trajectory
 */
export function getPositionAndAngleOnTrajectoryPath(
    positionAlongPath: number,
    trajectory: Position[],
    cumulativeTrajectoryDistance: number[],
    projectionFunc?: (xyz: number[]) => number[],
    is3d?: boolean
): [angle: number, position: Point2D | Point3D] {
    if (is3d === undefined) is3d = trajectory[0]?.length === 3;
    if (!trajectory.length && is3d) return [0, [0, 0, 0]];
    if (!trajectory.length && !is3d) return [0, [0, 0]];
    if (is3d && trajectory[0].length < 3)
        throw Error(
            `Expected trajectory positions to be 3D, instead got ${trajectory[0].length} dimensions`
        );
    if (is3d && projectionFunc === undefined)
        throw Error("2D projection function required for 3d trajectories");

    let angle: number;

    const [lowerSegmentIndex, upperSegmentIndex, segmentFraction] =
        getFractionPositionSegmentIndices(
            positionAlongPath,
            trajectory,
            cumulativeTrajectoryDistance
        );

    const position = _.zipWith(
        trajectory[lowerSegmentIndex],
        trajectory[upperSegmentIndex],
        (pl, pu) => {
            return pl + segmentFraction * (pu - pl);
        }
    );

    // Compute angle projected to camera
    let lowerProjectedPosition = trajectory[lowerSegmentIndex];
    let upperProjectedPosition = trajectory[upperSegmentIndex];

    // We only need to project when we deal with 3 positions
    if (is3d) {
        lowerProjectedPosition = projectionFunc!(trajectory[lowerSegmentIndex]);
        upperProjectedPosition = projectionFunc!(trajectory[upperSegmentIndex]);

        // ? I don't understand why we need to apply this whenever we project from 3d, but the angle gets wrong if I don't
        lowerProjectedPosition[1] *= -1;
        upperProjectedPosition[1] *= -1;
    }

    const segmentVec = new Vector2(
        upperProjectedPosition[0] - lowerProjectedPosition[0],
        upperProjectedPosition[1] - lowerProjectedPosition[1]
    );

    // The projected vector has no length, so we cannot define an angle. This is most likely because the two points are stacked on top of each other
    if (segmentVec.len() === 0) {
        angle = 0;
    }

    segmentVec.normalize();
    angle = Math.atan2(segmentVec[1], segmentVec[0]);

    if (is3d) return [angle, position as Point3D];
    return [angle, position as Point2D];
}

/**
 * Computes an array of cumulative distances for a well's trajectory path.
 *
 * **Note:** This is usually equivalent to the MD-array, so you probably don't need this.
 * @param well_xyz A list of positions that describe the wells trajectory
 * @returns a list of cumulative distances
 */
export function getCumulativeDistance(well_xyz: Position[]): number[] {
    if (!well_xyz.length) return [];

    const cumulativeDistance = [0];
    for (let i = 1; i < well_xyz.length; i++) {
        const p1 = well_xyz[i - 1];
        const p2 = well_xyz[i];

        const v0 = new Vector3(p1);
        const v1 = new Vector3(p2);
        const distance = v0.distance(v1);

        cumulativeDistance.push(cumulativeDistance[i - 1] + distance);
    }
    return cumulativeDistance;
}

/**
 * Adds interpolated entries to trajectory data (MD and position) at a given MD. If an MD value is close (0.001 units) the point will *not* be added.
 * @param well A well feature to add entries to
 * @param mdValuesToInject one or more MD values to inject
 * @returns A copy of the well object with the new MD values injected
 */
export function injectMdPoints(
    well: WellFeature,
    ...mdValuesToInject: number[]
): WellFeature {
    const path = getLineStringGeometry(well)?.coordinates ?? [];
    const md = well.properties.md[0] ?? getCumulativeDistance(path);

    if (path.length !== md.length) {
        throw new Error(
            "Cannot inject MD points, md and path are of different length"
        );
    }

    const newPath = [...path];
    const newMd = [...md];

    let currentDataRowIdx = 0;
    let spliceCount = 0;

    for (let i = 0; i < mdValuesToInject.length; i++) {
        const nextMdToInject = mdValuesToInject[i];
        if (nextMdToInject < md[0]) continue;
        if (nextMdToInject > md[md.length - 1]) break;

        // Increase until we go over or find the value
        while (
            md[currentDataRowIdx] < nextMdToInject &&
            currentDataRowIdx < md.length
        ) {
            currentDataRowIdx++;
        }

        if (currentDataRowIdx >= md.length) break;

        // Data already in array, so we can skip it
        const mdBelow = md[currentDataRowIdx - 1];
        const mdAbove = md[currentDataRowIdx];

        if (isClose(mdBelow, nextMdToInject)) continue;
        if (isClose(mdAbove, nextMdToInject)) continue;

        const interpolatedT = (nextMdToInject - mdBelow) / (mdAbove - mdBelow);

        const interpolatedPosition = _.zipWith(
            path[currentDataRowIdx - 1],
            path[currentDataRowIdx],
            (pl, pu) => {
                return pl + interpolatedT * (pu - pl);
            }
        );

        const spliceIndex = currentDataRowIdx + spliceCount;
        newPath.splice(spliceIndex, 0, interpolatedPosition);
        newMd.splice(spliceIndex, 0, nextMdToInject);

        spliceCount++;
    }

    return {
        ...well,
        properties: {
            ...well.properties,
            md: [newMd],
        },
        geometry: {
            ...well.geometry,
            geometries: well.geometry.geometries.map((g) => {
                if (g.type !== "LineString") return g;
                return {
                    ...g,
                    coordinates: newPath,
                };
            }),
        },
    };
}
