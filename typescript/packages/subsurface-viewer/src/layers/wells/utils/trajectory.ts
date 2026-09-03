import type { AccessorContext, Color } from "@deck.gl/core";
import type { LineString, Position } from "geojson";
import _ from "lodash";
import { Vector2, Vector3 } from "math.gl";
import { distance, dot, subtract } from "mathjs";

import type { Point2D, Point3D } from "../../../utils";
import { distToSegmentSquared, isClose } from "../../../utils/measurement";
import type { StyleAccessorFunction } from "../../types";
import type { ColorAccessor, WellFeature } from "../types";

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
 * Checks if the color settings defined for a trajectory hides it
 * @param well_object A well feature object
 * @param color_accessor A value accessor
 * @returns `true` if the well's color setting makes it transparent, otherwise `false
 */
export function isTrajectoryTransparent(
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
 * trajectory visibility based on line color)
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
        throw new Error("Expected trajectory to have at least 2 points");
    }
    if (cumulativeTrajectoryDistance.length !== trajectory.length) {
        throw new Error(
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
        throw new Error("Position is outside of trajectory");
    }

    const lowerDistance = cumulativeTrajectoryDistance[sortedIndex - 1];
    const upperDistance = cumulativeTrajectoryDistance[sortedIndex];

    // Distance arrays are expected to be increasing, so this implies invalid data
    if (upperDistance - lowerDistance === 0) {
        console.warn(`segment length is 0 at index ${sortedIndex - 1}`);
        return [sortedIndex - 1, sortedIndex, 0];
    }

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
        throw new Error(
            `Expected trajectory positions to be 3D, instead got ${trajectory[0].length} dimensions`
        );
    if (is3d && projectionFunc === undefined)
        throw new Error("2D projection function required for 3d trajectories");

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

    let angle = 0;

    // The projected vector has no length, so we cannot define an angle. This is most likely because the two points are stacked on top of each other
    if (segmentVec.len() !== 0) {
        segmentVec.normalize();
        angle = Math.atan2(segmentVec[1], segmentVec[0]);
    }

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

    for (const nextMdToInject of mdValuesToInject) {
        if (nextMdToInject < md[0]) continue;
        if (nextMdToInject > md.at(-1)!) break;

        // Increase until we go over or find the value
        while (
            currentDataRowIdx < md.length &&
            md[currentDataRowIdx] < nextMdToInject
        ) {
            currentDataRowIdx++;
        }

        if (currentDataRowIdx >= md.length) break;

        // Data already in array, so we can skip it
        const mdBelow = md[currentDataRowIdx - 1];
        const mdAbove = md[currentDataRowIdx];

        if (isClose(mdBelow, nextMdToInject)) continue;
        if (isClose(mdAbove, nextMdToInject)) continue;

        // above/below values are guaranteed to be different here, so we don't need to worry about 0 division
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

/**
 * Computes the Azimuth and Inclination angles – in degrees – for a given segment.
 * @param segmentStartPos A 3D world position that the segments starts in
 * @param segmentEndPos A 3D world position that the segment ends in
 * @returns An object containing the azimuth and inclination angles in degrees
 */
export function getAziAndInclForSegment(
    segmentStartPos: Position,
    segmentEndPos: Position
) {
    const vector = new Vector3(
        segmentEndPos[0] - segmentStartPos[0],
        segmentEndPos[1] - segmentStartPos[1],
        segmentEndPos[2] - segmentStartPos[2]
    ).normalize();

    const azimuth = Math.atan2(vector[1], vector[0]) * (180 / Math.PI) + 90;
    const inclination = Math.acos(vector[2]) * (180 / Math.PI);

    return { azimuth, inclination };
}

/**
 * Finds the segment of a trajectory that is closest to a given world position.
 * @param coord A world position
 * @param trajectory_path A list of positions that describes the trajectory
 * @param scaleFactor Applies a scaling along axis when picking the "closest" point. For example, a layer applying vertical scaling can use this prop to match the computation what is visually shown to the user
 * @returns A tuple consisting of the lower and upper segment indices
 */
export function getSegmentIndicesForCoord(
    coord: Position,
    trajectory_path: Position[],
    scaleFactor?: ScaleFactor
): [startIndex: number, endIndex: number] {
    if (trajectory_path.length < 2) {
        throw new Error("Expected trajectory to have at least 2 points");
    }

    const dimension = coord.length === 2 ? "2D" : "3D";
    const scaledCoord = fixupPoint(coord, scaleFactor, dimension);

    let minSegDistance = Number.POSITIVE_INFINITY;
    let minSegStart = -1;
    let minSegEnd = -1;

    for (let i = 0; i < trajectory_path.length - 1; i++) {
        const segmentStart = fixupPoint(
            trajectory_path[i],
            scaleFactor,
            dimension
        );
        const segmentEnd = fixupPoint(
            trajectory_path[i + 1],
            scaleFactor,
            dimension
        );

        const distance = distToSegmentSquared(
            segmentStart,
            segmentEnd,
            scaledCoord
        );

        if (distance < minSegDistance) {
            minSegDistance = distance;
            minSegStart = i;
            minSegEnd = i + 1;
        }
    }

    return [minSegStart, minSegEnd];
}

/**
 * Computes the fractional position along a segment that is closest to a given world position.
 * @param coord A world position
 * @param segmentStart The world position where the segment starts
 * @param segmentEnd The world position where the segment endS
 * @param scaleFactor Applies a scaling along axis when picking the "closest" point. For example, a layer applying vertical scaling can use this prop to match the computation what is visually shown to the user
 * @returns A number between 0 and 1 that describes the fractional position along the segment, where 0 is the start of the segment and 1 is the end of the segment
 */
export function getFractionAlongSegmentForCoord(
    coord: Position,
    segmentStart: Position,
    segmentEnd: Position,
    scaleFactor?: ScaleFactor
): number {
    const dimension = coord.length === 2 ? "2D" : "3D";

    const scaledCoord = fixupPoint(coord, scaleFactor, dimension);
    const scaledStart = fixupPoint(segmentStart, scaleFactor, dimension);
    const scaledEnd = fixupPoint(segmentEnd, scaleFactor, dimension);

    const lineLength = distance(scaledStart, scaledEnd) as number;

    if (lineLength === 0) return 0;

    const vCoord = subtract(scaledCoord, scaledStart);
    const vLine = subtract(scaledEnd, scaledStart);
    const scalar_projection = dot(vCoord, vLine) / (lineLength * lineLength);

    return _.clamp(scalar_projection, 0, 1);
}

/**
 * Locates the segment of a trajectory that contains a given MD.
 * @param trajectory_md The measured depth array for a well trajectory. Expected to be sorted and without duplicates.
 * @param md The target md
 * @returns A tuple containing the lower and upper segment indices */
export function getSegmentIndicesForMd(
    trajectory_md: number[],
    md: number
): [start: number, end: number] {
    if (trajectory_md.length < 2) {
        throw new Error("Expected trajectory to have at least 2 points");
    }

    const mdMin = trajectory_md[0];
    const mdMax = trajectory_md[trajectory_md.length - 1];

    if (md < mdMin || md > mdMax) {
        throw new Error(
            `MD ${md} is outside of trajectory range ${[mdMin, mdMax].toString()}`
        );
    }

    if (md === mdMin) {
        return [0, 1];
    }

    // We assume the trajectory is sorted, and without duplicates, so lower and upper is guaranteed to be different
    const upperIndex = _.sortedIndex(trajectory_md, md);
    const lowerIndex = upperIndex - 1;

    return [lowerIndex, upperIndex];
}

/** Describes scaling to be applied along each axis */
export type ScaleFactor = { x?: number; y?: number; z?: number };

/**
 * Scales a 2D or 3D point by a given scale factor.
 * @param point a 2D or 3D point
 * @param scaleFactor The scaling factor to apply in each dimension. Non-specified dimensions will default to 1 (no scaling)
 * @returns A new point that is scaled according to the scaleFactor.
 */
export function scaledPosition(
    point: Position,
    scaleFactor: ScaleFactor = {}
): Position {
    if (point.length === 2) {
        return [
            point[0] * (scaleFactor.x ?? 1),
            point[1] * (scaleFactor.y ?? 1),
        ];
    } else {
        return [
            point[0] * (scaleFactor.x ?? 1),
            point[1] * (scaleFactor.y ?? 1),
            point[2] * (scaleFactor.z ?? 1),
        ];
    }
}

/**
 * Reverts a 2D or 3D point that has been scaled by a given scale factor back to the original value.
 * @param point a 2D or 3D point
 * @param scaleFactor The scaling factor to revert in each dimension. Non-specified dimensions will default to 1 (no scaling). A Scale of 0 is not allowed, and will default to 1
 * @returns A new point that is un-scaled according to the scaleFactor.
 */
export function unScaledPosition(
    point: Position,
    scaleFactor: ScaleFactor = {}
): Position {
    if (point.length === 2) {
        return [
            scaleFactor.x === 0 ? point[0] : point[0] / (scaleFactor.x ?? 1),
            scaleFactor.y === 0 ? point[1] : point[1] / (scaleFactor.y ?? 1),
        ];
    } else {
        return [
            scaleFactor.x === 0 ? point[0] : point[0] / (scaleFactor.x ?? 1),
            scaleFactor.y === 0 ? point[1] : point[1] / (scaleFactor.y ?? 1),
            scaleFactor.z === 0 ? point[2] : point[2] / (scaleFactor.z ?? 1),
        ];
    }
}

type Dimension = "2D" | "3D";

function fixDimension(
    point: Position,
    dimension: Dimension,
    defaultZ = 0
): Position {
    if (dimension === "2D" && point.length === 3) return point.slice(0, 2);
    if (dimension === "3D" && point.length === 2) {
        console.warn(`:: Converting 2D point to 3D, using z=${defaultZ}`);
        return [...point, defaultZ];
    }

    return point;
}

function fixupPoint(
    point: Position,
    scaleFactor?: ScaleFactor,
    dimension?: Dimension
) {
    const scaledPoint = scaledPosition(point, scaleFactor);

    if (!dimension) return scaledPoint;
    return fixDimension(scaledPoint, dimension);
}
