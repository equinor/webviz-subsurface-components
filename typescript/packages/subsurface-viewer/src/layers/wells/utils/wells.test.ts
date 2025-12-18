import "jest";

import type { Position } from "geojson";
import type { WellFeature } from "../types";
import {
    getWellObjectByName,
    getWellObjectsByName,
    getWellMds,
    getPositionByMD,
} from "./wells";

describe("wells utility functions", () => {
    const mockWellFeatures: WellFeature[] = [
        {
            type: "Feature",
            geometry: {
                type: "GeometryCollection",
                geometries: [{ type: "LineString", coordinates: [] }],
            },
            properties: {
                name: "Well-A",
                md: [[0, 100, 200, 300]],
            },
        } as WellFeature,
        {
            type: "Feature",
            geometry: {
                type: "GeometryCollection",
                geometries: [{ type: "LineString", coordinates: [] }],
            },
            properties: {
                name: "Well-B",
                md: [[0, 150, 250]],
            },
        } as WellFeature,
        {
            type: "Feature",
            geometry: {
                type: "GeometryCollection",
                geometries: [{ type: "LineString", coordinates: [] }],
            },
            properties: {
                name: "Well-C",
                md: [[0, 50, 100]],
            },
        } as WellFeature,
    ];

    describe("getWellObjectByName", () => {
        it("should find well by exact name", () => {
            const result = getWellObjectByName(mockWellFeatures, "Well-A");
            expect(result).toBeDefined();
            expect(result?.properties.name).toBe("Well-A");
        });

        it("should find well case-insensitively", () => {
            const result = getWellObjectByName(mockWellFeatures, "well-b");
            expect(result).toBeDefined();
            expect(result?.properties.name).toBe("Well-B");
        });

        it("should return undefined for non-existent well", () => {
            const result = getWellObjectByName(mockWellFeatures, "Well-D");
            expect(result).toBeUndefined();
        });
    });

    describe("getWellObjectsByName", () => {
        it("should find multiple wells by name", () => {
            const result = getWellObjectsByName(mockWellFeatures, [
                "Well-A",
                "Well-C",
            ]);
            expect(result).toHaveLength(2);
            expect(result[0].properties.name).toBe("Well-A");
            expect(result[1].properties.name).toBe("Well-C");
        });

        it("should find wells case-insensitively", () => {
            const result = getWellObjectsByName(mockWellFeatures, [
                "well-a",
                "WELL-B",
            ]);
            expect(result).toHaveLength(2);
            expect(result[0].properties.name).toBe("Well-A");
            expect(result[1].properties.name).toBe("Well-B");
        });

        it("should return empty array for non-existent wells", () => {
            const result = getWellObjectsByName(mockWellFeatures, [
                "Well-D",
                "Well-E",
            ]);
            expect(result).toHaveLength(0);
        });

        it("should handle empty name array", () => {
            const result = getWellObjectsByName(mockWellFeatures, []);
            expect(result).toHaveLength(0);
        });
    });

    describe("getWellMds", () => {
        it("should return measured depths array", () => {
            const result1 = getWellMds(mockWellFeatures[0]);
            expect(result1).toEqual([0, 100, 200, 300]);

            const result2 = getWellMds(mockWellFeatures[1]);
            expect(result2).toEqual([0, 150, 250]);
        });
    });

    describe("getPositionByMD", () => {
        const well_mds: number[] = [0, 100, 200, 300];
        const well_xyz: Position[] = [
            [0, 0, 0],
            [10, 10, 100],
            [20, 20, 200],
            [30, 30, 300],
        ];

        it("should return exact position at a measured depth point", () => {
            const result = getPositionByMD(well_xyz, well_mds, 100);
            expect(result).toEqual([10, 10, 100]);
        });

        it("should interpolate position between measured depth points", () => {
            const result = getPositionByMD(well_xyz, well_mds, 50);
            expect(result).toHaveLength(3);
            expect(result[0]).toBeCloseTo(5);
            expect(result[1]).toBeCloseTo(5);
            expect(result[2]).toBeCloseTo(50);
        });

        it("should interpolate at quarter point", () => {
            const result = getPositionByMD(well_xyz, well_mds, 25);
            expect(result[0]).toBeCloseTo(2.5);
            expect(result[1]).toBeCloseTo(2.5);
            expect(result[2]).toBeCloseTo(25);
        });

        it("should handle md at start of trajectory", () => {
            const result = getPositionByMD(well_xyz, well_mds, 0);
            expect(result).toEqual([0, 0, 0]);
        });

        it("Should handle MD outside of range", () => {
            const result = getPositionByMD(well_xyz, well_mds, 400);

            expect(result).toHaveLength(0);
        });
    });
});
