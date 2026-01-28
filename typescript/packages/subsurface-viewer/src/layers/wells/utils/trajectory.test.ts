import "jest";

import type { Color } from "@deck.gl/core";
import type { Position } from "geojson";
import { cloneDeep, reverse, set } from "lodash";

import type { WellFeature } from "../types";
import {
    getColor,
    getCumulativeDistance,
    getFractionPositionSegmentIndices,
    getLineStringGeometry,
    getMd,
    getMdsInRange,
    getPositionAndAngleOnTrajectoryPath,
    getSegmentIndex,
    getTrajectory,
    getTvd,
    injectMdPoints,
    interpolateDataOnTrajectory,
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
        geometry: {
            type: "GeometryCollection",
            geometries: [
                { type: "Point", coordinates: [100, 100, -200] },
                mockPath,
            ],
        },
        properties: {
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

            const colorFunc = getColor(mockAccessor);
            const result =
                typeof colorFunc === "function"
                    ? colorFunc(mockFeature)
                    : colorFunc;

            expect(result).toEqual([0, 255, 0, 255]);
        });

        it("should return the feature's color property if accessor function returns a falsy value", () => {
            const mockAccessor = jest.fn().mockReturnValue(undefined);

            const colorFunc = getColor(mockAccessor);
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

    describe("getSegmentIndex", () => {
        it("should find closest segment to coordinate", () => {
            const path: Position[] = [
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
            ];
            const coord: Position = [1.5, 0.1];
            const result = getSegmentIndex(coord, path);
            expect(result).toBe(1);
        });
    });

    describe("interpolateDataOnTrajectory", () => {
        it("should interpolate data on trajectory", () => {
            const coord: Position = [0.5, 0];
            const data = [100, 200];
            const trajectory: Position[] = [
                [0, 0],
                [1, 0],
            ];

            const result = interpolateDataOnTrajectory(coord, data, trajectory);
            expect(result).toBeCloseTo(150, 1);
        });

        it("should return null if data length is less than 2", () => {
            const result = interpolateDataOnTrajectory([0, 0], [100], [[0, 0]]);
            expect(result).toBeNull();
        });

        it("should return null if data and trajectory lengths differ", () => {
            const result = interpolateDataOnTrajectory(
                [0, 0],
                [100, 200],
                [
                    [0, 0],
                    [1, 1],
                    [2, 2],
                ]
            );
            expect(result).toBeNull();
        });

        it("should return null if segment has zero length", () => {
            const coord: Position = [0, 0];
            const data = [100, 200];
            const trajectory: Position[] = [
                [0, 0],
                [0, 0],
            ];

            const result = interpolateDataOnTrajectory(coord, data, trajectory);
            expect(result).toBeNull();
        });

        it("should clamp value if position is past ends", () => {
            const coord1: Position = [2, 0];
            const coord2: Position = [-1, 0];
            const data = [100, 200];
            const trajectory: Position[] = [
                [0, 0],
                [1, 0],
            ];

            const result1 = interpolateDataOnTrajectory(
                coord1,
                data,
                trajectory
            );
            const result2 = interpolateDataOnTrajectory(
                coord2,
                data,
                trajectory
            );
            expect(result1).toBe(200);
            expect(result2).toBe(100);
        });
    });

    describe("getMd", () => {
        it("should get an interpolated md value on a trajectory", () => {
            const result = getMd(
                [100, 150, -100],
                mockFeature,
                [255, 0, 0, 255]
            );
            expect(result).toBeCloseTo(100);
        });

        it("should return null if md property is missing", () => {
            const mockWithoutMd: WellFeature = {
                ...mockFeature,
                properties: {
                    ...mockFeature.properties,
                    md: [],
                },
            };

            const result = getMd(
                [100, 150, -100],
                mockWithoutMd,
                [255, 0, 0, 255]
            );
            expect(result).toBeNull();
        });

        it("should return null if trajectory is undefined", () => {
            const mockWithoutTrajectory: WellFeature = set(
                cloneDeep(mockFeature),
                "geometry.geometries",
                []
            );
            const result = getMd([0, 0], mockWithoutTrajectory, [255, 0, 0, 0]);
            expect(result).toBeNull();
        });

        it("should use a 2D trajectory if coord is 2D", () => {
            const result = getMd([100, 150], mockFeature, [255, 0, 0, 255]);

            expect(result).toBeCloseTo(100);
        });
    });

    describe("getTvd", () => {
        it("should get an interpolated md value on a trajectory", () => {
            const result = getTvd(
                [100, 150, -100],
                cloneDeep(mockFeature),
                [255, 0, 0, 255]
            );
            expect(result).toBeCloseTo(-100);
        });

        it("should return wellhead z-coordinate if trajectory is undefined", () => {
            const mockWithoutTrajectory: WellFeature = set(
                cloneDeep(mockFeature),
                "geometry.geometries",
                [mockFeature.geometry.geometries[0]]
            );

            const result = getTvd(
                [0, 0],
                mockWithoutTrajectory,
                [255, 0, 0, 0]
            );
            expect(result).toBe(-200);
        });

        it("should return null if trajectory and head is undefined", () => {
            const mockWithoutTrajectory: WellFeature = set(
                cloneDeep(mockFeature),
                "geometry.geometries",
                []
            );
            const result = getTvd(
                [0, 0],
                mockWithoutTrajectory,
                [255, 0, 0, 0]
            );
            expect(result).toBeNull();
        });

        it("should return wellhead z-coordinate if trajectory has single point", () => {
            const mockWithoutTrajectory: WellFeature = set(
                cloneDeep(mockFeature),
                "geometry.geometries[1].coordinates",
                []
            );

            const result = getTvd(
                [0, 0],
                mockWithoutTrajectory,
                [255, 0, 0, 255]
            );
            expect(result).toBe(-200);
        });

        it("should use a 2D trajectory if coord is 2D", () => {
            const result = getTvd([100, 150], mockFeature, [255, 0, 0, 255]);

            expect(result).toBeCloseTo(-100);
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
    });
});
