import { describe, expect, it } from "@jest/globals";
import type {
    FeatureCollection,
    GeometryCollection,
    LineString,
    Point,
} from "geojson";
import {
    abscissaTransform,
    calculateTrajectoryGap,
    getEndPoint,
    getStartPoint,
    getWellHeadGeometry,
    getWellboreGeometry,
    nearestNeighborAbscissaTransform,
} from "./abscissaTransform";
import _ from "lodash";

const MOCK_WELL: FeatureCollection<GeometryCollection> = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: {
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "Point",
                        coordinates: [50, 50, 0],
                    },
                    {
                        type: "LineString",
                        coordinates: [
                            [500, 0, 0],
                            [1500, 1000, -1000],
                            [2500, 2000, -2000],
                        ],
                    },
                ],
            },
            properties: {
                name: "WellA",
            },
        },
        {
            type: "Feature",
            geometry: {
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "Point",
                        coordinates: [2570.71, 2070.71, 0],
                    },
                    {
                        type: "LineString",
                        coordinates: [
                            [2570.71, 2070.71, 0], // 100 units lateral distance from
                            // [2500, 2000, -2000] (WellA end)
                            [2570.71, 2070.71, -500],
                            [3070.71, 2570.71, -1000],
                            [3570.71, 3070.71, -1500],
                        ],
                    },
                ],
            },
            properties: {
                name: "WellB",
            },
        },
        {
            type: "Feature",
            geometry: {
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "Point",
                        coordinates: [3000, 2500, 0],
                    },
                    {
                        type: "LineString",
                        coordinates: [
                            [3000, 2500, 0], // ~707 units lateral distance from
                            // [2500, 2000, -2000] (WellA end)
                            [2800, 2300, -500],
                            [2600, 2100, -1000],
                            [2550, 2050, -1500], // ~71 units lateral distance from
                            // [2500, 2000, -2000] (WellA end)
                        ],
                    },
                ],
            },
            properties: {
                name: "WellC",
            },
        },
    ],
};

describe("calculateTrajectoryGap", () => {
    it("should calculate correct lateral distance between trajectory endpoints", () => {
        const gap = calculateTrajectoryGap(
            MOCK_WELL.features[0],
            MOCK_WELL.features[1]
        );
        expect(gap).toBeCloseTo(100, 2); // Should be approximately 100 units
    });

    it("should return default gap when feature1 has no LineString", () => {
        const feature1 = {
            geometry: {
                type: "GeometryCollection" as const,
                geometries: [
                    {
                        type: "Point" as const,
                        coordinates: [0, 0, 0],
                    },
                ],
            },
        };

        const gap = calculateTrajectoryGap(feature1, MOCK_WELL.features[1]);
        expect(gap).toBe(0); // Default gap
    });

    it("should return default gap when feature2 has no LineString", () => {
        const feature2 = {
            geometry: {
                type: "GeometryCollection" as const,
                geometries: [
                    {
                        type: "Point" as const,
                        coordinates: [200, 0, 0],
                    },
                ],
            },
        };

        const gap = calculateTrajectoryGap(MOCK_WELL.features[0], feature2);
        expect(gap).toBe(0); // Default gap
    });

    it("should return default gap when LineString has no coordinates", () => {
        const feature1 = {
            geometry: {
                type: "GeometryCollection" as const,
                geometries: [
                    {
                        type: "LineString" as const,
                        coordinates: [], // Empty coordinates
                    },
                ],
            },
        };

        const gap = calculateTrajectoryGap(feature1, MOCK_WELL.features[1]);
        expect(gap).toBe(0); // Default gap
    });

    it("should handle zero distance between trajectories", () => {
        const feature1 = {
            geometry: {
                type: "GeometryCollection" as const,
                geometries: [
                    {
                        type: "LineString" as const,
                        coordinates: [
                            [0, 0, 0],
                            [100, 100, -100],
                        ],
                    },
                ],
            },
        };

        const feature2 = {
            geometry: {
                type: "GeometryCollection" as const,
                geometries: [
                    {
                        type: "LineString" as const,
                        coordinates: [
                            [100, 100, -200], // Same X,Y as end of feature1, different Z
                            [200, 200, -300],
                        ],
                    },
                ],
            },
        };

        const gap = calculateTrajectoryGap(feature1, feature2);
        expect(gap).toBe(0); // Zero lateral distance
    });
});

describe("Transform well trajectory", () => {
    it("Empty well", () => {
        const emptyWell: FeatureCollection<GeometryCollection> = {
            type: "FeatureCollection",
            features: [],
        };
        const transformedWell = abscissaTransform(emptyWell);
        expect(transformedWell).toStrictEqual(emptyWell);
    });

    it("Unfold well trajectories", () => {
        const transformedWell = abscissaTransform(MOCK_WELL);

        // Check number of trajectories transformed
        expect(transformedWell.features).toHaveLength(3);

        const wellHead0 = transformedWell.features[0].geometry
            .geometries[0] as Point;
        const trajectory0 = transformedWell.features[0].geometry
            .geometries[1] as LineString;

        // Check well head projection
        expect(wellHead0.coordinates).toEqual([0, 0, 0]);

        // Check first unfolded trajectory
        expect(trajectory0.coordinates[0]).toStrictEqual([0, 0, 0]);
        expect(trajectory0.coordinates[1][0]).toBeCloseTo(1414.2135);
        expect(trajectory0.coordinates[1][1]).toStrictEqual(-1000);
        expect(trajectory0.coordinates[2][0]).toBeCloseTo(2828.4271);

        // Check second unfolded trajectory
        const wellHead1 = transformedWell.features[1].geometry
            .geometries[0] as Point;
        const trajectory1 = transformedWell.features[1].geometry
            .geometries[1] as LineString;

        const previousEnd = trajectory0.coordinates.at(-1) || [0, 0, 0];

        // Well head should be offset by gap (100) from end of the the lateral distance
        // of the previous trajectory
        expect(wellHead1.coordinates[0]).toBeCloseTo(previousEnd[0] + 100);

        // Trajectory start should match well head
        expect(trajectory1.coordinates[0][0]).toBeCloseTo(
            wellHead1.coordinates[0]
        );
        expect(trajectory1.coordinates[0][1]).toBeCloseTo(
            wellHead1.coordinates[1]
        );
    });

    it("Nearest neighbor abscissa transform", () => {
        const transformedWell = nearestNeighborAbscissaTransform(MOCK_WELL);

        // Check number of trajectories transformed
        expect(transformedWell.features).toHaveLength(3);

        const wellHead0 = transformedWell.features[0].geometry
            .geometries[0] as Point;
        const trajectory0 = transformedWell.features[0].geometry
            .geometries[1] as LineString;

        // Check well head projection
        expect(wellHead0.coordinates).toEqual([0, 0, 0]);

        // Check first unfolded trajectory
        expect(trajectory0.coordinates[0]).toStrictEqual([0, 0, 0]);
        expect(trajectory0.coordinates[1][0]).toBeCloseTo(1414.2135);
        expect(trajectory0.coordinates[1][1]).toStrictEqual(-1000);
        expect(trajectory0.coordinates[2][0]).toBeCloseTo(2828.4271);

        // Check second unfolded trajectory
        const wellHead1 = transformedWell.features[1].geometry
            .geometries[0] as Point;
        const trajectory1 = transformedWell.features[1].geometry
            .geometries[1] as LineString;

        const end0 = trajectory0.coordinates.at(-1) || [0, 0, 0];
        const end1 = trajectory1.coordinates.at(-1) || [0, 0, 0];

        // Wellbore end should be offset by gap (71) from end of the the lateral distance
        // of the previous trajectory
        expect(end1[0]).toBeCloseTo(end0[0] + 70.7, 1);

        // Trajectory start should match well head
        expect(trajectory1.coordinates[0][0]).toBeCloseTo(
            wellHead1.coordinates[0]
        );
        expect(trajectory1.coordinates[0][1]).toBeCloseTo(
            wellHead1.coordinates[1]
        );
    });

    it("Nearest neighbor abscissa transform - reverse first wellbore", () => {
        const reversedFirstMockWell = _.cloneDeep(MOCK_WELL);

        // Craft a scenario where reversing the first wellbore yields a shorter gap
        const mockWellHeadGeometry = getWellHeadGeometry(
            reversedFirstMockWell.features[0]
        );
        mockWellHeadGeometry.coordinates = [2500, 2000, 0];
        const mockWellboreGeometry = getWellboreGeometry(
            reversedFirstMockWell.features[0]
        );
        mockWellboreGeometry.coordinates[0] = [2500, 2000, 0];
        mockWellboreGeometry.coordinates[1] = [1500, 1000, -1000];
        mockWellboreGeometry.coordinates[2] = [500, 0, -2000];

        const transformedWell = nearestNeighborAbscissaTransform(
            reversedFirstMockWell
        );

        // Check number of trajectories transformed
        expect(transformedWell.features).toHaveLength(3);

        const wellHead0 = transformedWell.features[0].geometry
            .geometries[0] as Point;
        const trajectory0 = transformedWell.features[0].geometry
            .geometries[1] as LineString;

        // Check well head projection - first well head is reversed
        expect(wellHead0.coordinates[0]).toBeCloseTo(2828.427);
        expect(wellHead0.coordinates[1]).toStrictEqual(0);
        expect(wellHead0.coordinates[2]).toStrictEqual(0);

        // Check first unfolded trajectory
        expect(trajectory0.coordinates[0][0]).toBeCloseTo(2828.4271);
        expect(trajectory0.coordinates[1][0]).toBeCloseTo(1414.2135);
        expect(trajectory0.coordinates[1][1]).toStrictEqual(-1000);
        expect(trajectory0.coordinates[2]).toStrictEqual([0, -2000, 0]);

        // Check second unfolded trajectory
        const wellHead1 = transformedWell.features[1].geometry
            .geometries[0] as Point;
        const trajectory1 = transformedWell.features[1].geometry
            .geometries[1] as LineString;

        const begin0 = trajectory0.coordinates[0] || [0, 0, 0];
        const end1 = trajectory1.coordinates.at(-1) || [0, 0, 0];

        // Wellbore end should be offset by gap (71) from end of the the lateral distance
        // of the previous trajectory
        expect(end1[0]).toBeCloseTo(begin0[0] + 70.7, 1);

        // Trajectory start should match well head
        expect(trajectory1.coordinates[0][0]).toBeCloseTo(
            wellHead1.coordinates[0]
        );
        expect(trajectory1.coordinates[0][1]).toBeCloseTo(
            wellHead1.coordinates[1]
        );
    });
});

describe("getEndPoint", () => {
    it("should return the last coordinate of the first LineString found", () => {
        const endPoint = getEndPoint(MOCK_WELL.features[0]);
        expect(endPoint).toEqual([2500, 2000, -2000]);
    });

    it("should return null when no LineString geometry exists", () => {
        const feature = {
            geometry: {
                type: "GeometryCollection" as const,
                geometries: [
                    {
                        type: "Point" as const,
                        coordinates: [0, 0, 0],
                    },
                ],
            },
        };

        const endPoint = getEndPoint(feature);
        expect(endPoint).toBeNull();
    });

    it("should return null when LineString has empty coordinates", () => {
        const feature = {
            geometry: {
                type: "GeometryCollection" as const,
                geometries: [
                    {
                        type: "LineString" as const,
                        coordinates: [],
                    },
                ],
            },
        };

        const endPoint = getEndPoint(feature);
        expect(endPoint).toBeNull();
    });

    it("should return null when geometry collection is empty", () => {
        const feature = {
            geometry: {
                type: "GeometryCollection" as const,
                geometries: [],
            },
        };

        const endPoint = getEndPoint(feature);
        expect(endPoint).toBeNull();
    });
});

describe("getStartPoint", () => {
    it("should return the first coordinate of the first LineString found", () => {
        const startPoint = getStartPoint(MOCK_WELL.features[0]);
        expect(startPoint).toEqual([500, 0, 0]);
    });

    it("should return null when no LineString geometry exists", () => {
        const feature = {
            geometry: {
                type: "GeometryCollection" as const,
                geometries: [
                    {
                        type: "Point" as const,
                        coordinates: [0, 0, 0],
                    },
                ],
            },
        };

        const startPoint = getStartPoint(feature);
        expect(startPoint).toBeNull();
    });

    it("should return null when LineString has empty coordinates", () => {
        const feature = {
            geometry: {
                type: "GeometryCollection" as const,
                geometries: [
                    {
                        type: "LineString" as const,
                        coordinates: [],
                    },
                ],
            },
        };

        const startPoint = getStartPoint(feature);
        expect(startPoint).toBeNull();
    });

    it("should return null when geometry collection is empty", () => {
        const feature = {
            geometry: {
                type: "GeometryCollection" as const,
                geometries: [],
            },
        };

        const startPoint = getStartPoint(feature);
        expect(startPoint).toBeNull();
    });

    it("should return null when no LineString geometry exists", () => {
        const feature = {
            geometry: {
                type: "GeometryCollection" as const,
                geometries: [
                    {
                        type: "Point" as const,
                        coordinates: [0, 0, 0],
                    },
                ],
            },
        };

        const startPoint = getStartPoint(feature);
        expect(startPoint).toBeNull();
    });

    it("should return null when LineString has empty coordinates", () => {
        const feature = {
            geometry: {
                type: "GeometryCollection" as const,
                geometries: [
                    {
                        type: "LineString" as const,
                        coordinates: [],
                    },
                ],
            },
        };

        const startPoint = getStartPoint(feature);
        expect(startPoint).toBeNull();
    });

    it("should return start point from first valid LineString when multiple exist", () => {
        const feature = {
            geometry: {
                type: "GeometryCollection" as const,
                geometries: [
                    {
                        type: "LineString" as const,
                        coordinates: [
                            [100, 200, -100],
                            [200, 300, -200],
                        ],
                    },
                    {
                        type: "LineString" as const,
                        coordinates: [
                            [300, 400, -300],
                            [400, 500, -400],
                        ],
                    },
                ],
            },
        };

        const startPoint = getStartPoint(feature);
        expect(startPoint).toEqual([100, 200, -100]); // First LineString's start
    });
});
