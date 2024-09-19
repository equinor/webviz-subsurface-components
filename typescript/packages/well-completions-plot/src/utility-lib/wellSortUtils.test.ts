import {
    createGetWellPlotDataCompareValueFunction,
    compareWellPlotDataValues,
    compareWellsBySortByAndDirection,
    createSortedWells,
    createSortedWellsFromSequence,
} from "./wellSortUtils";
import { SortDirection, SortWellsBy } from "../types/dataTypes";
import type { WellPlotData } from "../types/dataTypes";

describe("createGetWellPlotDataCompareValueFunction", () => {
    const mockWellPlotData: WellPlotData = {
        name: "Well A",
        completions: [
            { open: 0, zoneIndex: 10, khMean: 0, khMin: 0, khMax: 0, shut: 0 },
            { open: 1, zoneIndex: 20, khMean: 0, khMin: 0, khMax: 0, shut: 0 },
        ],
        earliestCompDateIndex: 5,
        attributes: {},
    };

    it("should return the well name when sortWellsBy is WELL_NAME", () => {
        const getCompareValue = createGetWellPlotDataCompareValueFunction(
            SortWellsBy.WELL_NAME
        );
        expect(getCompareValue(mockWellPlotData)).toBe("Well A");
    });

    it("should return the zoneIndex of the first open completion when sortWellsBy is STRATIGRAPHY_DEPTH", () => {
        const getCompareValue = createGetWellPlotDataCompareValueFunction(
            SortWellsBy.STRATIGRAPHY_DEPTH
        );
        expect(getCompareValue(mockWellPlotData)).toBe(20);
    });

    it("should return the earliest completion date index when sortWellsBy is EARLIEST_COMPLETION_DATE", () => {
        const getCompareValue = createGetWellPlotDataCompareValueFunction(
            SortWellsBy.EARLIEST_COMPLETION_DATE
        );
        expect(getCompareValue(mockWellPlotData)).toBe(5);
    });

    it("should return undefined for an unknown sortWellsBy value", () => {
        const getCompareValue = createGetWellPlotDataCompareValueFunction(
            "UNKNOWN" as SortWellsBy
        );
        expect(getCompareValue(mockWellPlotData)).toBeUndefined();
    });
});

describe("compareWellPlotDataValues", () => {
    const mockWellPlotDataA: WellPlotData = {
        name: "Well A",
        completions: [
            { open: 0, zoneIndex: 10, khMean: 0, khMin: 0, khMax: 0, shut: 0 },
            { open: 1, zoneIndex: 20, khMean: 0, khMin: 0, khMax: 0, shut: 0 },
        ],
        earliestCompDateIndex: 5,
        attributes: {},
    };

    const mockWellPlotDataB: WellPlotData = {
        name: "Well B",
        completions: [
            { open: 0, zoneIndex: 15, khMean: 0, khMin: 0, khMax: 0, shut: 0 },
            { open: 1, zoneIndex: 25, khMean: 0, khMin: 0, khMax: 0, shut: 0 },
        ],
        earliestCompDateIndex: 10,
        attributes: {},
    };

    it("should return 0 when attributes are equal", () => {
        const getCompareValue = createGetWellPlotDataCompareValueFunction(
            SortWellsBy.WELL_NAME
        );
        const result = compareWellPlotDataValues(
            mockWellPlotDataA,
            mockWellPlotDataA,
            getCompareValue,
            SortDirection.ASCENDING
        );
        expect(result).toBe(0);
    });

    it("should return -1 when a is less than b for ascending sort", () => {
        const getCompareValue = createGetWellPlotDataCompareValueFunction(
            SortWellsBy.WELL_NAME
        );
        const result = compareWellPlotDataValues(
            mockWellPlotDataA,
            mockWellPlotDataB,
            getCompareValue,
            SortDirection.ASCENDING
        );
        expect(result).toBe(-1);
    });

    it("should return 1 when a is greater than b for ascending sort", () => {
        const getCompareValue = createGetWellPlotDataCompareValueFunction(
            SortWellsBy.WELL_NAME
        );
        const result = compareWellPlotDataValues(
            mockWellPlotDataB,
            mockWellPlotDataA,
            getCompareValue,
            SortDirection.ASCENDING
        );
        expect(result).toBe(1);
    });

    it("should return 1 when a is less than b for descending sort", () => {
        const getCompareValue = createGetWellPlotDataCompareValueFunction(
            SortWellsBy.WELL_NAME
        );
        const result = compareWellPlotDataValues(
            mockWellPlotDataA,
            mockWellPlotDataB,
            getCompareValue,
            SortDirection.DESCENDING
        );
        expect(result).toBe(1);
    });

    it("should return -1 when a is greater than b for descending sort", () => {
        const getCompareValue = createGetWellPlotDataCompareValueFunction(
            SortWellsBy.WELL_NAME
        );
        const result = compareWellPlotDataValues(
            mockWellPlotDataB,
            mockWellPlotDataA,
            getCompareValue,
            SortDirection.DESCENDING
        );
        expect(result).toBe(-1);
    });

    it("should handle undefined attributes correctly", () => {
        const getCompareValue = createGetWellPlotDataCompareValueFunction(
            "UNKNOWN" as SortWellsBy
        );

        // Both are undefined
        const result = compareWellPlotDataValues(
            mockWellPlotDataA,
            mockWellPlotDataB,
            getCompareValue,
            SortDirection.ASCENDING
        );
        expect(result).toBe(0);
    });
});

describe("compareWellsBySortByAndDirection", () => {
    const mockWellPlotDataA: WellPlotData = {
        name: "Well A",
        completions: [
            { open: 0, zoneIndex: 10, khMean: 0, khMin: 0, khMax: 0, shut: 0 },
            { open: 1, zoneIndex: 20, khMean: 0, khMin: 0, khMax: 0, shut: 0 },
        ],
        earliestCompDateIndex: 5,
        attributes: {},
    };

    const mockWellPlotDataB: WellPlotData = {
        name: "Well B",
        completions: [
            { open: 0, zoneIndex: 15, khMean: 0, khMin: 0, khMax: 0, shut: 0 },
            { open: 1, zoneIndex: 25, khMean: 0, khMin: 0, khMax: 0, shut: 0 },
        ],
        earliestCompDateIndex: 10,
        attributes: {},
    };

    it("should return 0 when attributes are equal", () => {
        const result = compareWellsBySortByAndDirection(
            mockWellPlotDataA,
            mockWellPlotDataA,
            SortWellsBy.WELL_NAME,
            SortDirection.ASCENDING
        );
        expect(result).toBe(0);
    });

    it("should return -1 when a is less than b for ascending sort", () => {
        const result = compareWellsBySortByAndDirection(
            mockWellPlotDataA,
            mockWellPlotDataB,
            SortWellsBy.WELL_NAME,
            SortDirection.ASCENDING
        );
        expect(result).toBe(-1);
    });

    it("should return 1 when a is greater than b for ascending sort", () => {
        const result = compareWellsBySortByAndDirection(
            mockWellPlotDataB,
            mockWellPlotDataA,
            SortWellsBy.WELL_NAME,
            SortDirection.ASCENDING
        );
        expect(result).toBe(1);
    });

    it("should return 1 when a is less than b for descending sort", () => {
        const result = compareWellsBySortByAndDirection(
            mockWellPlotDataA,
            mockWellPlotDataB,
            SortWellsBy.WELL_NAME,
            SortDirection.DESCENDING
        );
        expect(result).toBe(1);
    });

    it("should return -1 when a is greater than b for descending sort", () => {
        const result = compareWellsBySortByAndDirection(
            mockWellPlotDataB,
            mockWellPlotDataA,
            SortWellsBy.WELL_NAME,
            SortDirection.DESCENDING
        );
        expect(result).toBe(-1);
    });

    it("should handle undefined attributes correctly", () => {
        const result = compareWellsBySortByAndDirection(
            mockWellPlotDataA,
            mockWellPlotDataB,
            "UNKNOWN" as SortWellsBy,
            SortDirection.ASCENDING
        );
        expect(result).toBe(0);
    });
});

describe("createSortedWells", () => {
    const mockWellPlotDataA: WellPlotData = {
        name: "Well A",
        completions: [
            { open: 0, zoneIndex: 10, khMean: 0, khMin: 0, khMax: 0, shut: 0 },
            { open: 1, zoneIndex: 20, khMean: 0, khMin: 0, khMax: 0, shut: 0 },
        ],
        earliestCompDateIndex: 5,
        attributes: {},
    };

    const mockWellPlotDataB: WellPlotData = {
        name: "Well B",
        completions: [
            { open: 0, zoneIndex: 15, khMean: 0, khMin: 0, khMax: 0, shut: 0 },
            { open: 1, zoneIndex: 25, khMean: 0, khMin: 0, khMax: 0, shut: 0 },
        ],
        earliestCompDateIndex: 10,
        attributes: {},
    };

    const mockWellPlotDataC: WellPlotData = {
        name: "Well C",
        completions: [
            { open: 0, zoneIndex: 5, khMean: 0, khMin: 0, khMax: 0, shut: 0 },
            { open: 1, zoneIndex: 15, khMean: 0, khMin: 0, khMax: 0, shut: 0 },
        ],
        earliestCompDateIndex: 1,
        attributes: {},
    };

    it("should sort wells by WELL_NAME in ascending order", () => {
        const sortedWells = createSortedWells(
            [mockWellPlotDataB, mockWellPlotDataA, mockWellPlotDataC],
            SortWellsBy.WELL_NAME,
            SortDirection.ASCENDING
        );
        expect(sortedWells).toEqual([
            mockWellPlotDataA,
            mockWellPlotDataB,
            mockWellPlotDataC,
        ]);
    });

    it("should sort wells by WELL_NAME in descending order", () => {
        const sortedWells = createSortedWells(
            [mockWellPlotDataA, mockWellPlotDataB, mockWellPlotDataC],
            SortWellsBy.WELL_NAME,
            SortDirection.DESCENDING
        );
        expect(sortedWells).toEqual([
            mockWellPlotDataC,
            mockWellPlotDataB,
            mockWellPlotDataA,
        ]);
    });

    it("should sort wells by STRATIGRAPHY_DEPTH in ascending order", () => {
        const sortedWells = createSortedWells(
            [mockWellPlotDataB, mockWellPlotDataA, mockWellPlotDataC],
            SortWellsBy.STRATIGRAPHY_DEPTH,
            SortDirection.ASCENDING
        );
        expect(sortedWells).toEqual([
            mockWellPlotDataC,
            mockWellPlotDataA,
            mockWellPlotDataB,
        ]);
    });

    it("should sort wells by STRATIGRAPHY_DEPTH in descending order", () => {
        const sortedWells = createSortedWells(
            [mockWellPlotDataA, mockWellPlotDataB, mockWellPlotDataC],
            SortWellsBy.STRATIGRAPHY_DEPTH,
            SortDirection.DESCENDING
        );
        expect(sortedWells).toEqual([
            mockWellPlotDataB,
            mockWellPlotDataA,
            mockWellPlotDataC,
        ]);
    });

    it("should sort wells by EARLIEST_COMPLETION_DATE in ascending order", () => {
        const sortedWells = createSortedWells(
            [mockWellPlotDataB, mockWellPlotDataA, mockWellPlotDataC],
            SortWellsBy.EARLIEST_COMPLETION_DATE,
            SortDirection.ASCENDING
        );
        expect(sortedWells).toEqual([
            mockWellPlotDataC,
            mockWellPlotDataA,
            mockWellPlotDataB,
        ]);
    });

    it("should sort wells by EARLIEST_COMPLETION_DATE in descending order", () => {
        const sortedWells = createSortedWells(
            [mockWellPlotDataA, mockWellPlotDataB, mockWellPlotDataC],
            SortWellsBy.EARLIEST_COMPLETION_DATE,
            SortDirection.DESCENDING
        );
        expect(sortedWells).toEqual([
            mockWellPlotDataB,
            mockWellPlotDataA,
            mockWellPlotDataC,
        ]);
    });
});

describe("createSortedWellsFromSequence", () => {
    const mockWellPlotDataA: WellPlotData = {
        name: "Well A",
        completions: [
            {
                open: 0,
                zoneIndex: 10,
                khMean: 0,
                khMin: 0,
                khMax: 0,
                shut: 0,
            },
            {
                open: 1,
                zoneIndex: 20,
                khMean: 0,
                khMin: 0,
                khMax: 0,
                shut: 0,
            },
        ],
        earliestCompDateIndex: 10,
        attributes: {},
    };

    const mockWellPlotDataB: WellPlotData = {
        name: "Well B",
        completions: [
            {
                open: 0,
                zoneIndex: 15,
                khMean: 0,
                khMin: 0,
                khMax: 0,
                shut: 0,
            },
            {
                open: 1,
                zoneIndex: 25,
                khMean: 0,
                khMin: 0,
                khMax: 0,
                shut: 0,
            },
        ],
        earliestCompDateIndex: 5,
        attributes: {},
    };

    const mockWellPlotDataC: WellPlotData = {
        name: "Well C",
        completions: [
            {
                open: 0,
                zoneIndex: 5,
                khMean: 0,
                khMin: 0,
                khMax: 0,
                shut: 0,
            },
            {
                open: 1,
                zoneIndex: 15,
                khMean: 0,
                khMin: 0,
                khMax: 0,
                shut: 0,
            },
        ],
        earliestCompDateIndex: 1,
        attributes: {},
    };

    const mockWellPlotDataD: WellPlotData = {
        name: "Well D",
        completions: [
            {
                open: 0,
                zoneIndex: 15,
                khMean: 0,
                khMin: 0,
                khMax: 0,
                shut: 0,
            },
            {
                open: 1,
                zoneIndex: 25,
                khMean: 0,
                khMin: 0,
                khMax: 0,
                shut: 0,
            },
        ],
        earliestCompDateIndex: 1,
        attributes: {},
    };

    it("should sort wells by multiple criteria in the specified order", () => {
        const sortWellsBySelections = new Map<SortWellsBy, SortDirection>([
            [SortWellsBy.WELL_NAME, SortDirection.ASCENDING],
            [SortWellsBy.STRATIGRAPHY_DEPTH, SortDirection.DESCENDING],
        ]);

        const sortedWells = createSortedWellsFromSequence(
            [mockWellPlotDataB, mockWellPlotDataA, mockWellPlotDataC],
            sortWellsBySelections
        );

        expect(sortedWells).toEqual([
            mockWellPlotDataA,
            mockWellPlotDataB,
            mockWellPlotDataC,
        ]);
    });

    it("should sort wells by multiple criteria in descending order", () => {
        const sortWellsBySelections = new Map<SortWellsBy, SortDirection>([
            [SortWellsBy.EARLIEST_COMPLETION_DATE, SortDirection.ASCENDING],
            [SortWellsBy.WELL_NAME, SortDirection.DESCENDING],
        ]);

        const sortedWells = createSortedWellsFromSequence(
            [
                mockWellPlotDataA,
                mockWellPlotDataB,
                mockWellPlotDataC,
                mockWellPlotDataD,
            ],
            sortWellsBySelections
        );

        expect(sortedWells).toEqual([
            mockWellPlotDataD,
            mockWellPlotDataC,
            mockWellPlotDataB,
            mockWellPlotDataA,
        ]);
    });

    it("should handle empty wells array", () => {
        const sortWellsBySelections = new Map<SortWellsBy, SortDirection>([
            [SortWellsBy.WELL_NAME, SortDirection.ASCENDING],
            [SortWellsBy.STRATIGRAPHY_DEPTH, SortDirection.ASCENDING],
        ]);

        const sortedWells = createSortedWellsFromSequence(
            [],
            sortWellsBySelections
        );

        expect(sortedWells).toEqual([]);
    });

    it("should handle single well in array", () => {
        const sortWellsBySelections = new Map<SortWellsBy, SortDirection>([
            [SortWellsBy.WELL_NAME, SortDirection.ASCENDING],
        ]);

        const sortedWells = createSortedWellsFromSequence(
            [mockWellPlotDataA],
            sortWellsBySelections
        );

        expect(sortedWells).toEqual([mockWellPlotDataA]);
    });
});
