import "jest";
import { describe, expect, it, jest } from "@jest/globals";

import type { Color } from "@deck.gl/core";
import type { Position } from "geojson";
import { cloneDeep, reverse, set } from "lodash";

import type { ColorAccessor, WellFeature } from "../types";
import type { ScaleFactor } from "./trajectory";
import {
    getAziAndInclForSegment,
    getColor,
    getCumulativeDistance,
    getFractionPositionSegmentIndices,
    getLineStringGeometry,
    getMdsInRange,
    getPositionAndAngleOnTrajectoryPath,
    getSegmentIndicesForCoord,
    getSegmentIndicesForMd,
    getTrajectory,
    injectMdPoints,
    scaledPosition,
    unScaledPosition,
} from "./trajectory";

describe("trajectory utils", () => {
    const mockPath = {
        type: "LineString",
        coordinates: [
            [100, 100, -200],
            [100, 150, -100],
            [200, 200, 0],
            [200, 300, 100],
        ],
    };

    const mockFeature: WellFeature = {
        type: "Feature",
        geometry: {
            type: "GeometryCollection",
            geometries: [
                { type: "Point", coordinates: [100, 100, -200] },
                mockPath,
            ],
        },
        properties: {
            name: "Depth",
            md: [[0, 100, 200, 300]],
            color: [100, 100, 100, 255],
        },
    } as WellFeature;

    describe("getColor", () => {
        it("should return color array directly if accessor is a static value", () => {
            const color: [number, number, number, number] = [255, 0, 0, 255];
            const result = getColor(color);
            expect(result).toEqual(color);
        });

        it("Should return a wrapped accessor function if accessor is a function", () => {
            const mockAccessor = jest.fn().mockReturnValue([0, 255, 0, 255]);

            const colorFunc = getColor(mockAccessor as ColorAccessor);
            const result =
                typeof colorFunc === "function"
                    ? colorFunc(mockFeature)
                    : colorFunc;

            expect(result).toEqual([0, 255, 0, 255]);
        });

        it("should return the feature's color property if accessor function returns a falsy value", () => {
            const mockAccessor = jest.fn().mockReturnValue(undefined);

            const colorFunc = getColor(mockAccessor as ColorAccessor);
            const result =
                typeof colorFunc === "function"
                    ? colorFunc(mockFeature)
                    : colorFunc;

            expect(result).toEqual([100, 100, 100, 255]);
        });
    });

    describe("getTrajectory", () => {
        it("should return trajectory coordinates when not transparent", () => {
            const color: Color = [255, 0, 0, 255];
            const result = getTrajectory(mockFeature, color);
            const result2 = getTrajectory(mockFeature, () => color);
            const result3 = getTrajectory(mockFeature, [0, 0, 0, 0]);

            expect(result).not.toBeUndefined();
            expect(result2).not.toBeUndefined();
            expect(result3).toBeUndefined();
        });

        it("should check GeoJSON property if accessor not present", () => {
            const result = getTrajectory(mockFeature, undefined);

            expect(result).not.toBeUndefined();
        });
    });

    describe("getMdsInRange", () => {
        it("should return mds within range including start and end", () => {
            const mdArray = [0, 100, 200, 300, 400, 500];
            const result = getMdsInRange(mdArray, 150, 450);

            expect(result).toEqual([150, 200, 300, 400, 450]);
        });

        it("should skip values equal to or below start", () => {
            const mdArray = [0, 100, 200, 300];
            const result = getMdsInRange(mdArray, 100, 300);

            expect(result).toEqual([100, 200, 300]);
        });

        it("should handle empty array", () => {
            const result = getMdsInRange([], 0, 100);
            expect(result).toEqual([0, 100]);
        });
    });

    describe("getSegmentIndicesForCoord", () => {
        it("should find closest segment to coordinate", () => {
            const path: Position[] = [
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
            ];
            const coord: Position = [1.5, 0.1];
            const result = getSegmentIndicesForCoord(coord, path);
            expect(result).toEqual([1, 2]);
        });

        it("should handle 3D coordinates", () => {
            const path: Position[] = [
                [0, 0, 0],
                [1, 0, 0],
                [2, 0, 0],
                [3, 0, 0],
            ];
            const coord: Position = [1.5, 0.1, 0];
            const result = getSegmentIndicesForCoord(coord, path);
            expect(result).toEqual([1, 2]);
        });
    });

    describe("getLineStringGeometry", () => {
        it("should find and return LineString geometry", () => {
            const result = getLineStringGeometry(mockFeature);
            const result2 = getLineStringGeometry({
                ...mockFeature,
                geometry: {
                    ...mockFeature.geometry,
                    geometries: reverse(mockFeature.geometry.geometries),
                },
            });

            expect(result?.type).toEqual("LineString");
            expect(result2?.type).toEqual("LineString");
        });
    });

    describe("getFractionPositionSegmentIndices", () => {
        it("should return correct segment indices along trajectory", () => {
            const result = getFractionPositionSegmentIndices(
                0.25,
                mockPath.coordinates,
                mockFeature.properties.md[0]
            );

            // Between the first to positions, slightly towards the end
            expect(result).toEqual([0, 1, 0.75]);
        });

        it("should handle fractionPosition of 0", () => {
            const result = getFractionPositionSegmentIndices(
                0,
                mockPath.coordinates,
                mockFeature.properties.md[0]
            );

            expect(result).toEqual([0, 1, 0]);
        });

        it("should handle fractionPosition of 1", () => {
            const result = getFractionPositionSegmentIndices(
                1,
                mockPath.coordinates,
                mockFeature.properties.md[0]
            );

            expect(result).toEqual([2, 3, 1]);
        });

        it("should clamp invalid fraction position", () => {
            const result1 = getFractionPositionSegmentIndices(
                -100,
                mockPath.coordinates,
                mockFeature.properties.md[0]
            );
            const result2 = getFractionPositionSegmentIndices(
                100,
                mockPath.coordinates,
                mockFeature.properties.md[0]
            );

            expect(result1).toEqual([0, 1, 0]);
            expect(result2).toEqual([2, 3, 1]);
        });

        it("should handle distance-arrays that don't start at 0", () => {
            const result = getFractionPositionSegmentIndices(
                0.5,
                mockPath.coordinates,
                [100, 200, 300, 400]
            );
            expect(result).toEqual([1, 2, 0.5]);

            const result2 = getFractionPositionSegmentIndices(
                1.5,
                mockPath.coordinates,
                [100, 200, 300, 400]
            );
            expect(result2).toEqual([2, 3, 1]);
        });

        it("should return start and end for close values", () => {
            const result1 = getFractionPositionSegmentIndices(
                0.0001,
                mockPath.coordinates,
                mockFeature.properties.md[0]
            );
            const result2 = getFractionPositionSegmentIndices(
                9.9999,
                mockPath.coordinates,
                mockFeature.properties.md[0]
            );

            expect(result1).toEqual([0, 1, 0]);
            expect(result2).toEqual([2, 3, 1]);
        });

        it("should throw for invalid parameters", () => {
            expect(() =>
                getFractionPositionSegmentIndices(
                    0.5,
                    [],
                    mockFeature.properties.md[0]
                )
            ).toThrow("Expected trajectory to have at least 2 points");

            expect(() =>
                getFractionPositionSegmentIndices(
                    0.5,
                    ["pos1", "pos2"],
                    [0, 10, 20]
                )
            ).toThrow(
                "Expected path measurements array to be same length as path array"
            );
        });
    });

    describe("getPositionAlongTrajectory", () => {
        it("should return correct position along trajectory", () => {
            const result2d = getPositionAndAngleOnTrajectoryPath(
                0.5,
                mockPath.coordinates.map((p) => p.slice(0, 2)),
                mockFeature.properties.md[0]
            );

            const result3d = getPositionAndAngleOnTrajectoryPath(
                0.5,
                mockPath.coordinates,
                mockFeature.properties.md[0],
                (xyz) => xyz.slice(0, 2)
            );

            expect(result2d[0]).toBeCloseTo(0.463);
            expect(result2d[1]).toEqual([150, 175]);

            expect(result3d[0]).toBeCloseTo(-0.463);
            expect(result3d[1]).toEqual([150, 175, -50]);
        });

        it("should give angle of zero for projected segments of length 0", () => {
            const flatPath = {
                type: "LineString",
                coordinates: [
                    [100, 100, -200],
                    [100, 100, -100],
                    [200, 100, 0],
                ],
            };

            const result = getPositionAndAngleOnTrajectoryPath(
                0.5,
                flatPath.coordinates,
                [0, 100, 200],
                (xyz) => xyz.slice(0, 3)
            );

            expect(result[0]).toBe(0);
        });

        it("should return default for empty trajectories", () => {
            const result2d = getPositionAndAngleOnTrajectoryPath(0.5, [], []);
            const result3d = getPositionAndAngleOnTrajectoryPath(
                0.5,
                [],
                [],
                (xyz) => xyz.slice(0, 2),
                true
            );

            expect(result2d).toEqual([0, [0, 0]]);
            expect(result3d).toEqual([0, [0, 0, 0]]);
        });

        it("should throw for invalid parameters", () => {
            expect(() =>
                getPositionAndAngleOnTrajectoryPath(
                    0.5,
                    [
                        [0, 1],
                        [0, 2],
                    ],
                    [0, 10],
                    undefined,
                    true
                )
            ).toThrow(
                `Expected trajectory positions to be 3D, instead got 2 dimensions`
            );

            expect(() =>
                getPositionAndAngleOnTrajectoryPath(
                    0.5,
                    [
                        [0, 1, 0],
                        [0, 2, 0],
                    ],
                    [0, 10],
                    undefined,
                    true
                )
            ).toThrow("2D projection function required for 3d trajectories");
        });
    });

    describe("getCumulativeDistance", () => {
        it("should compute cumulative distances for trajectory", () => {
            const trajectory: Position[] = [
                [0, 0, 0],
                [3, 4, 0],
                [6, 8, 0],
            ];
            const result = getCumulativeDistance(trajectory);
            expect(result).toEqual([0, 5, 10]);
        });
    });

    describe("injectMdPoints", () => {
        it("should inject md points into trajectory", () => {
            const mdValuesToInject = [50, 150, 250];

            const result = injectMdPoints(mockFeature, ...mdValuesToInject);
            const resultTrajectory = getLineStringGeometry(result)!.coordinates;

            expect(result.properties.md[0]).toEqual([
                0, 50, 100, 150, 200, 250, 300,
            ]);

            expect(resultTrajectory).toEqual([
                [100, 100, -200],
                [100, 125, -150],
                [100, 150, -100],
                [150, 175, -50],
                [200, 200, 0],
                [200, 250, 50],
                [200, 300, 100],
            ]);
        });

        it("should handle missing path or md", () => {
            const featureWithoutMd: WellFeature = set(
                cloneDeep(mockFeature),
                "properties.md",
                []
            );
            const featureWithoutPathAndMd: WellFeature = set(
                cloneDeep(featureWithoutMd),
                "geometry.geometries",
                []
            );

            const result1 = injectMdPoints(featureWithoutMd, 50, 150);
            const result2 = injectMdPoints(featureWithoutPathAndMd, 50, 150);
            // A feature with an md array but a path will throw, so we'll cover that in another test

            // We don't care what the auto-computed md is, so we just verify that the injected MDs are present
            expect(result1.properties.md[0]).toContain(50);
            expect(result1.properties.md[0]).toContain(150);

            expect(result2.properties.md[0]).toEqual([]);
        });

        it("should throw if md and path lengths differ", () => {
            const featureWithMismatchedMd: WellFeature = set(
                cloneDeep(mockFeature),
                "properties.md",
                [[0, 100]] // the mock has 4 points
            );

            expect(() =>
                injectMdPoints(featureWithMismatchedMd, 50, 150)
            ).toThrow(
                "Cannot inject MD points, md and path are of different length"
            );
        });

        it("should throw if md and path lengths differ", () => {
            const featureWithMismatchedMd: WellFeature = set(
                cloneDeep(mockFeature),
                "properties.md",
                [[0, 50, 50, 100]] // the mock has 4 points
            );

            const result = injectMdPoints(
                featureWithMismatchedMd,
                49,
                50,
                51,
                110
            );

            expect(result.properties.md[0]).toEqual([0, 49, 50, 50, 51, 100]);
        });
    });

    describe("getAziAndInclForSegment", () => {
        it("should calculate azimuth and inclination for vertical segment", () => {
            const start: Position = [0, 0, 0];
            const end: Position = [0, 0, 100];

            const result = getAziAndInclForSegment(start, end);

            expect(result.inclination).toBeCloseTo(0, 1);
            expect(result.azimuth).toBeDefined();
        });

        it("should calculate azimuth and inclination for horizontal segment", () => {
            const start: Position = [0, 0, 0];
            const end: Position = [0, 100, 0];

            const result = getAziAndInclForSegment(start, end);

            expect(result.inclination).toBeCloseTo(90, 1);
            expect(result.azimuth).toBeCloseTo(180, 1);
        });

        it("should calculate azimuth and inclination for diagonal segment", () => {
            const start: Position = [0, 0, 0];
            const end: Position = [100, 100, 100];

            const result = getAziAndInclForSegment(start, end);

            expect(result.inclination).toBeCloseTo(54.74, 1);
            expect(result.azimuth).toBeCloseTo(135, 1);
        });

        it("should handle segment with non-zero start position", () => {
            const start: Position = [50, 50, 50];
            const end: Position = [50, 150, 50];

            const result = getAziAndInclForSegment(start, end);

            expect(result.inclination).toBeCloseTo(90, 1);
            expect(result.azimuth).toBeCloseTo(180, 1);
        });

        it("should calculate for downward segment", () => {
            const start: Position = [0, 0, 0];
            const end: Position = [0, 0, -100];

            const result = getAziAndInclForSegment(start, end);

            expect(result.inclination).toBeCloseTo(180, 1);
            expect(result.azimuth).toBeDefined();
        });
    });

    describe("getSegmentIndicesForMd", () => {
        it("should return correct segment indices for md within trajectory", () => {
            const trajectory_md = [0, 100, 200, 300];
            const result = getSegmentIndicesForMd(trajectory_md, 150);

            expect(result).toEqual([1, 2]);
        });

        it("should return first segment with fraction 0 when md equals minimum", () => {
            const trajectory_md = [0, 100, 200, 300];
            const result = getSegmentIndicesForMd(trajectory_md, 0);

            expect(result).toEqual([0, 1]);
        });

        it("should return last segment with fraction 1 when md equals maximum", () => {
            const trajectory_md = [0, 100, 200, 300];
            const result = getSegmentIndicesForMd(trajectory_md, 300);

            expect(result).toEqual([2, 3]);
        });

        it("should calculate correct fraction at start of segment", () => {
            const trajectory_md = [0, 100, 200, 300];
            const result = getSegmentIndicesForMd(trajectory_md, 100);

            expect(result).toEqual([0, 1]);
        });

        it("should throw error if trajectory has less than 2 points", () => {
            expect(() => getSegmentIndicesForMd([0], 0)).toThrow(
                "Expected trajectory to have at least 2 points"
            );

            expect(() => getSegmentIndicesForMd([], 0)).toThrow(
                "Expected trajectory to have at least 2 points"
            );
        });

        it("should throw error if md is outside range", () => {
            const trajectory_md = [100, 200, 300];
            expect(() => getSegmentIndicesForMd(trajectory_md, 50)).toThrow(
                "MD 50 is outside of trajectory range 100,300"
            );

            expect(() => getSegmentIndicesForMd(trajectory_md, 350)).toThrow(
                "MD 350 is outside of trajectory range 100,300"
            );
        });

        it("should handle non-zero starting md values", () => {
            const trajectory_md = [1000, 1100, 1200, 1300];
            const result = getSegmentIndicesForMd(trajectory_md, 1150);

            expect(result).toEqual([1, 2]);
        });

        it("should handle unevenly spaced md values", () => {
            const trajectory_md = [0, 50, 200, 500];
            const result = getSegmentIndicesForMd(trajectory_md, 100);

            expect(result[0]).toBe(1);
            expect(result[1]).toBe(2);
        });
    });

    describe("scaledPosition", () => {
        it("should scale a 2D point with provided scale factors", () => {
            const point: Position = [2, 3];
            const scaleFactor: ScaleFactor = { x: 2, y: 3 };
            const result = scaledPosition(point, scaleFactor);
            expect(result).toEqual([4, 9]);
        });

        it("should scale a 3D point with provided scale factors", () => {
            const point: Position = [2, 3, 4];
            const scaleFactor: ScaleFactor = { x: 2, y: 3, z: 4 };
            const result = scaledPosition(point, scaleFactor);
            expect(result).toEqual([4, 9, 16]);
        });

        it("should handle missing scale factors for some dimensions", () => {
            const point: Position = [2, 3, 4];
            const scaleFactor: ScaleFactor = { x: 2, z: 4 };
            const result = scaledPosition(point, scaleFactor);
            expect(result).toEqual([4, 3, 16]);
        });

        it("should handle an empty scale factor object", () => {
            const point: Position = [2, 3, 4];
            const scaleFactor: ScaleFactor = {};
            const result = scaledPosition(point, scaleFactor);
            expect(result).toEqual([2, 3, 4]);
        });
    });

    describe("unScaledPosition", () => {
        it("should unscale a 2D point with provided scale factors", () => {
            const point: Position = [4, 9];
            const scaleFactor: ScaleFactor = { x: 2, y: 3 };
            const result = unScaledPosition(point, scaleFactor);
            expect(result).toEqual([2, 3]);
        });

        it("should unscale a 3D point with provided scale factors", () => {
            const point: Position = [4, 9, 16];
            const scaleFactor: ScaleFactor = { x: 2, y: 3, z: 4 };
            const result = unScaledPosition(point, scaleFactor);
            expect(result).toEqual([2, 3, 4]);
        });

        it("should handle missing scale factors for some dimensions", () => {
            const point: Position = [4, 3, 16];
            const scaleFactor: ScaleFactor = { x: 2, z: 4 };
            const result = unScaledPosition(point, scaleFactor);
            expect(result).toEqual([2, 3, 4]);
        });

        it("should handle an empty scale factor object", () => {
            const point: Position = [2, 3, 4];
            const scaleFactor: ScaleFactor = {};
            const result = unScaledPosition(point, scaleFactor);
            expect(result).toEqual([2, 3, 4]);
        });

        it("should handle scale factor of 0 for any dimension", () => {
            const point: Position = [4, 9, 16];
            const scaleFactor: ScaleFactor = { x: 0, y: 3, z: 0 };
            const result = unScaledPosition(point, scaleFactor);
            expect(result).toEqual([4, 3, 16]);
        });

        it("should handle 2D points with scale factor of 0", () => {
            const point: Position = [4, 9];
            const scaleFactor: ScaleFactor = { x: 0, y: 0 };
            const result = unScaledPosition(point, scaleFactor);
            expect(result).toEqual([4, 9]);
        });
    });
});
