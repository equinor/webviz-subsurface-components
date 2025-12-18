import "jest";

import type { LogCurveDataType } from "../types";
import {
    getLogForWellbore,
    getLogValues,
    getLogInfo,
    getDiscreteLogMetadata,
    isSelectedLogRun,
    getLogIndexByName,
    getLogIndexByNames,
    getLogMd,
    getLogSegmentIndexForMd,
    getCurveValueAtRow,
    getCurveValueAtMd,
    injectMdRows,
    getColumn,
} from "./log";

describe("log utilities", () => {
    const mockLogData: LogCurveDataType = {
        header: { name: "LogRun1", well: "Well1" },
        curves: [
            { name: "MD", description: "continuous" },
            { name: "GR", description: "continuous" },
            { name: "FACIES", description: "discrete" },
        ],
        data: [
            [100, 50, 1],
            [200, 60, 1],
            [300, 70, 2],
            [400, 80, 2],
        ],
        metadata_discrete: {
            FACIES: {
                attributes: ["color", "code"],
                objects: {
                    Sand: [[255, 255, 0], 1],
                    Shale: [[128, 128, 128], 2],
                },
            },
        },
    };

    describe("getLogForWellbore", () => {
        it("should return log when matching wellbore is found", () => {
            const logs = [mockLogData];
            const result = getLogForWellbore(logs, "LogRun1", "Well1");
            expect(result).toBe(mockLogData);
        });

        it("should return undefined when no matching wellbore is found", () => {
            const logs1 = [mockLogData];
            const result1 = getLogForWellbore(logs1, "LogRun2", "Well1");
            expect(result1).toBeUndefined();

            const logs2 = [mockLogData];
            const result2 = getLogForWellbore(logs2, "LogRun1", "Well2");
            expect(result2).toBeUndefined();
        });
    });

    describe("getLogIndexByName", () => {
        it("should return correct index for existing curve", () => {
            expect(getLogIndexByName(mockLogData, "MD")).toBe(0);
            expect(getLogIndexByName(mockLogData, "GR")).toBe(1);
            expect(getLogIndexByName(mockLogData, "FACIES")).toBe(2);
        });

        it("should be case insensitive", () => {
            expect(getLogIndexByName(mockLogData, "md")).toBe(0);
            expect(getLogIndexByName(mockLogData, "gr")).toBe(1);
        });

        it("should return -1 for non-existing curve", () => {
            expect(getLogIndexByName(mockLogData, "NONEXISTENT")).toBe(-1);
        });
    });

    describe("getLogIndexByNames", () => {
        it("should return index of first matching name", () => {
            expect(getLogIndexByNames(mockLogData, ["DEPTH", "MD"])).toBe(0);
            expect(getLogIndexByNames(mockLogData, ["MISSING", "GR"])).toBe(1);
        });

        it("should return -1 when no names match", () => {
            expect(getLogIndexByNames(mockLogData, ["DEPTH", "DEPT"])).toBe(-1);
        });
    });

    describe("isSelectedLogRun", () => {
        it("should return true for matching log run name (case insensitive)", () => {
            expect(isSelectedLogRun(mockLogData, "LogRun1")).toBe(true);
            expect(isSelectedLogRun(mockLogData, "logrun1")).toBe(true);
            expect(isSelectedLogRun(mockLogData, "LOGRUN1")).toBe(true);
        });

        it("should return false for non-matching log run name", () => {
            expect(isSelectedLogRun(mockLogData, "LogRun2")).toBe(false);
        });
    });

    describe("getLogValues", () => {
        it("should return values for valid log run and curve", () => {
            const values = getLogValues(mockLogData, "LogRun1", "GR");
            expect(values).toEqual([50, 60, 70, 80]);
        });

        it("should return empty array for invalid log run", () => {
            const values = getLogValues(mockLogData, "LogRun2", "GR");
            expect(values).toEqual([]);
        });

        it("should return empty array for non-existent curve", () => {
            const values = getLogValues(mockLogData, "LogRun1", "MISSING");
            expect(values).toEqual([]);
        });
    });

    describe("getLogInfo", () => {
        it("should return curve info for valid log run and curve", () => {
            const info = getLogInfo(mockLogData, "LogRun1", "GR");
            expect(info).toEqual({ name: "GR", description: "continuous" });
        });

        it("should return undefined for invalid log run", () => {
            const info = getLogInfo(mockLogData, "LogRun2", "GR");
            expect(info).toBeUndefined();
        });
    });

    describe("getDiscreteLogMetadata", () => {
        it("should return metadata for discrete log", () => {
            const metadata = getDiscreteLogMetadata(mockLogData, "FACIES");
            expect(metadata).toEqual({
                attributes: ["color", "code"],
                objects: {
                    Sand: [[255, 255, 0], 1],
                    Shale: [[128, 128, 128], 2],
                },
            });
        });
    });

    describe("getLogMd", () => {
        it("should return MD values for valid log run", () => {
            const mds = getLogMd(mockLogData, "LogRun1");
            expect(mds).toEqual([100, 200, 300, 400]);
        });

        it("should return empty array for invalid log run", () => {
            const mds = getLogMd(mockLogData, "LogRun2");
            expect(mds).toEqual([]);
        });
    });

    describe("getColumn", () => {
        it("should extract column from data rows", () => {
            const data = [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9],
            ];
            expect(getColumn(data, 0)).toEqual([1, 4, 7]);
            expect(getColumn(data, 1)).toEqual([2, 5, 8]);
            expect(getColumn(data, 2)).toEqual([3, 6, 9]);
        });
    });

    describe("getCurveValueAtRow", () => {
        it("should return value at specific row", () => {
            expect(getCurveValueAtRow(mockLogData, "GR", 0)).toBe(50);
            expect(getCurveValueAtRow(mockLogData, "GR", 2)).toBe(70);
        });
    });

    describe("getCurveValueAtMd", () => {
        it("should interpolate continuous values", () => {
            const value = getCurveValueAtMd(mockLogData, "GR", 150);
            expect(value).toBe(55);
        });

        it("should return previous value for discrete curves", () => {
            const value = getCurveValueAtMd(mockLogData, "FACIES", 250);
            expect(value).toBe(1);
        });

        it("should return null for MD outside range", () => {
            expect(getCurveValueAtMd(mockLogData, "GR", 50)).toBeNull();
            expect(getCurveValueAtMd(mockLogData, "GR", 500)).toBeNull();
        });

        it("should return null for invalid curve", () => {
            expect(getCurveValueAtMd(mockLogData, "MISSING", 150)).toBeNull();
        });
    });

    describe("injectMdRows", () => {
        it("should inject new MD rows with interpolated values", () => {
            const result = injectMdRows(mockLogData, 150, 250);
            expect(result.data.length).toBe(6);
            expect(result.data[1][0]).toBe(150);
            expect(result.data[1][1]).toBe(55); // interpolated GR
            expect(result.data[3][0]).toBe(250);
        });

        it("should skip MDs outside data range", () => {
            const result = injectMdRows(mockLogData, 50, 500);
            expect(result.data.length).toBe(4);
        });

        it("should skip MDs already in data", () => {
            const result = injectMdRows(mockLogData, 100, 200);
            expect(result.data.length).toBe(4);
        });

        it("should preserve discrete values", () => {
            const result = injectMdRows(mockLogData, 150);
            expect(result.data[1][2]).toBe(1); // FACIES should be from previous row
        });
    });

    describe("getLogSegmentIndexForMd", () => {
        it("should return index of first row where MD exceeds target", () => {
            expect(getLogSegmentIndexForMd(mockLogData, 150)).toBe(0);
            expect(getLogSegmentIndexForMd(mockLogData, 250)).toBe(1);
        });

        it("should give correct indices for exact segment caps", () => {
            expect(getLogSegmentIndexForMd(mockLogData, 100)).toBe(0);
            expect(getLogSegmentIndexForMd(mockLogData, 200)).toBe(1);
            expect(getLogSegmentIndexForMd(mockLogData, 300)).toBe(2);
        });

        it("should specifically include the last md value in the last segment", () => {
            expect(getLogSegmentIndexForMd(mockLogData, 400)).toBe(2);
        });

        it("should return -1 if MD is beyond all data", () => {
            expect(getLogSegmentIndexForMd(mockLogData, 50)).toBe(-1);
            expect(getLogSegmentIndexForMd(mockLogData, 500)).toBe(-1);
        });
    });
});
