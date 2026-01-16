import "jest";

import type { Color } from "@deck.gl/core";
import type { Position } from "geojson";
import type { WellFeature } from "../types";
import {
    getColor,
    getTrajectory,
    getMdsInRange,
    interpolateDataOnTrajectory,
    getMd,
    getTvd,
    getSegmentIndex,
} from "./trajectory";
import { cloneDeep, set } from "lodash";

describe("trajectory utils", () => {
    const mockFeature: WellFeature = {
        geometry: {
            type: "GeometryCollection",
            geometries: [
                { type: "Point", coordinates: [100, 100, -200] },
                {
                    type: "LineString",
                    coordinates: [
                        [100, 100, -200],
                        [100, 150, -100],
                        [200, 200, 0],
                        [200, 300, 100],
                    ],
                },
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
            const colorAccessor: Color = [255, 0, 0, 255];
            const result = getTrajectory(mockFeature, colorAccessor);

            expect(result).toEqual([
                [100, 100, -200],
                [100, 150, -100],
                [200, 200, 0],
                [200, 300, 100],
            ]);
        });

        it("should return undefined when trajectory is transparent", () => {
            const colorAccessor: Color = [255, 0, 0, 0];
            const result = getTrajectory(mockFeature, colorAccessor);

            expect(result).toBeUndefined();
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
    });
});
