import type { AccessorContext, Color } from "@deck.gl/core";
import type { LineString, Position } from "geojson";
import { distance, dot, subtract } from "mathjs";
import { zipWith } from "lodash";
import { Vector2 } from "math.gl";

import type { Point2D, Point3D } from "../../../utils";
import {
    distToSegmentSquared,
    isPointAwayFromLineEnd,
} from "../../../utils/measurement";
import type { StyleAccessorFunction } from "../../types";
import type { ColorAccessor, WellFeature } from "../types";
import { getWellHeadPosition } from "./features";

function getLineStringGeometry(
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
 * Get position and angle (in radians) along a trajectory path
 * @param fraction 0-1 fraction along trajectory
 * @param trajectory Trajectory as a list of positions
 * @param projectionFunc Callback function to project 3D coordinates over to 2D
 * @param is3d Whether to use compute with (and return) 2-dimensional positions
 * @returns A tuple containing an angle and a interpolated point on the trajectory
 */
export function getPositionAndAngleAlongTrajectoryPath(
    fraction: number,
    trajectory: Position[],
    projectionFunc: (xyz: number[]) => number[],
    is3d?: boolean
): [angle: number, position: Point2D | Point3D] {
    if (typeof is3d === "undefined") is3d = trajectory[0]?.length === 3;
    if (!trajectory.length && is3d) return [0, [0, 0, 0]];
    if (!trajectory.length && !is3d) return [0, [0, 0]];
    if (is3d && trajectory[0].length < 3)
        throw Error(
            `Expected trajectory positions to be 3D, instead got ${trajectory[0].length} dimensions`
        );

    let angle: number;
    let position: Position;

    const maxSegmentIndex = trajectory.length - 1;

    // The point is somewhere between these two points
    const lowerSegmentIndex = Math.floor(maxSegmentIndex * fraction);
    const upperSegmentIndex = Math.ceil(maxSegmentIndex * fraction);

    const [lowerPosition, upperPosition] = getSegmentPositions(
        trajectory,
        lowerSegmentIndex,
        upperSegmentIndex
    );

    if (lowerSegmentIndex === upperSegmentIndex) {
        position = trajectory[lowerSegmentIndex];
    } else {
        // The positional fraction on this specific segment
        const segmentFraction = maxSegmentIndex * fraction - lowerSegmentIndex;

        position = zipWith(lowerPosition, upperPosition, (pl, pu) => {
            return pl + segmentFraction * (pu - pl);
        });
    }

    let lowerProjectedPosition = lowerPosition;
    let upperProjectedPosition = upperPosition;

    // We only need to project when we deal with 3 positions
    if (is3d) {
        lowerProjectedPosition = projectionFunc(lowerPosition);
        upperProjectedPosition = projectionFunc(upperPosition);

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
    const rad = Math.atan2(segmentVec[1], segmentVec[0]);

    angle = rad;

    if (is3d) return [angle, position as Point3D];
    else return [angle, [position[0], position[1]]];
}

// Helper to get a segment without reaching index overflow
function getSegmentPositions(
    trajectory: Position[],
    lowerIndex: number,
    upperIndex: number
): [Position, Position] {
    if (trajectory.length < 2) {
        console.warn("Trajectory is too short to have any segments");
        return [trajectory[lowerIndex], trajectory[upperIndex]];
    }

    // If the upper and lower index are the same (for instance)
    if (lowerIndex === upperIndex && upperIndex === trajectory.length - 1) {
        return [trajectory[upperIndex - 1], trajectory[upperIndex]];
    }

    if (lowerIndex === upperIndex) {
        return [trajectory[lowerIndex], trajectory[lowerIndex + 1]];
    }

    return [trajectory[lowerIndex], trajectory[upperIndex]];
}
