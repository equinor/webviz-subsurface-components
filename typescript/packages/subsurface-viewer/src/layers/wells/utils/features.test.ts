/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import "jest";
import type { Feature } from "geojson";

import type { WellFeature } from "../types";
import {
    getSize,
    getWellHeadPosition,
    LINE,
    POINT,
    DEFAULT_LINE_WIDTH,
    DEFAULT_POINT_SIZE,
} from "./features";

describe("features", () => {
    describe("getSize", () => {
        it("should return static value for static accessor", () => {
            const mockAccessor = 12;

            const result = getSize(LINE, mockAccessor);
            expect(typeof result).toBe("number");
            expect(result).toBe(12);
        });

        it("should return function that wraps provided accessor function", () => {
            const mockAccessor1 = jest.fn().mockReturnValue(20);
            const mockAccessor2 = jest.fn().mockReturnValue(16);

            const mockObject = {} as Feature;
            const mockObjectInfo = { index: 0 };

            const result1 = getSize(LINE, mockAccessor1);
            const result2 = getSize(LINE, mockAccessor2);

            expect(typeof result1).toBe("function");
            expect(typeof result2).toBe("function");

            const size1 = (result1 as Function)(mockObject, mockObjectInfo);
            const size2 = (result2 as Function)(mockObject, mockObjectInfo);

            expect(size1).toBe(20);
            expect(size2).toBe(16);
        });

        it("should use apply offset value in generated accessors", () => {
            const mockObject = {} as Feature;
            const mockObjectInfo = { index: 0 };
            const mockAccessor1 = jest.fn().mockReturnValue(12);
            const mockAccessor2 = 16;

            const result1 = getSize(LINE, mockAccessor1, 6);
            const result2 = getSize(LINE, mockAccessor2, 6);

            const size1 = (result1 as Function)(mockObject, mockObjectInfo);
            const size2 = result2; // static

            expect(size1).toBe(18);
            expect(size2).toBe(22);
        });

        it("should return default size for LINE and POINT types when accessor is undefined", () => {
            const result1 = getSize(LINE, undefined);
            const result2 = getSize(POINT, undefined);
            expect(result1).toBe(DEFAULT_LINE_WIDTH);
            expect(result2).toBe(DEFAULT_POINT_SIZE);
        });

        it("should apply offset to default sizes", () => {
            const result1 = getSize(LINE, undefined, 3);
            const result2 = getSize(POINT, undefined, 3);
            expect(result1).toBe(DEFAULT_LINE_WIDTH + 3);
            expect(result2).toBe(DEFAULT_POINT_SIZE + 3);
        });

        it("should return default point size for POINT type when accessor is undefined", () => {
            const result = getSize(POINT, undefined);
            expect(result).toBe(8);
        });

        it("should return 0 when accessor is 0, regardless of offset", () => {
            const result = getSize(LINE, 0, 25);
            expect(result).toBe(0);
        });

        it("should return accessor value when accessor is a positive number", () => {
            const result = getSize(LINE, 10);
            expect(result).toBe(10);
        });

        it("should apply offset to default LINE width", () => {
            const result = getSize(LINE, undefined, 3);
            expect(result).toBe(DEFAULT_LINE_WIDTH + 3);
        });

        it("should return 0 for unknown type with undefined accessor", () => {
            const result = getSize("unknown", undefined);
            expect(result).toBe(0);
        });
    });

    describe("getWellHeadPosition", () => {
        it("should return coordinates from Point geometry", () => {
            const wellFeature: WellFeature = {
                type: "Feature",
                geometry: {
                    type: "GeometryCollection",
                    geometries: [
                        {
                            type: "Point",
                            coordinates: [10, 20, 30],
                        },
                    ],
                },
                // @ts-expect-error -- not needed for test
                properties: {},
            };

            const result = getWellHeadPosition(wellFeature);
            expect(result).toEqual([10, 20, 30]);
        });

        it("should return undefined when no Point geometry exists", () => {
            const wellFeature: WellFeature = {
                type: "Feature",
                geometry: {
                    type: "GeometryCollection",
                    geometries: [
                        {
                            type: "LineString",
                            coordinates: [
                                [0, 0],
                                [1, 1],
                            ],
                        },
                    ],
                },
                // @ts-expect-error -- not needed for test
                properties: {},
            };

            const result = getWellHeadPosition(wellFeature);
            expect(result).toBeUndefined();
        });
    });
});
