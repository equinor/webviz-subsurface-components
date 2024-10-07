import {
    findIndexByCurveName,
    findSetAndCurveIndex,
    getAllWellLogCurves,
    getAxisIndices,
    getCurveByName,
    getCurveFromVidexPlotId,
    getDiscreteMetaDataByName,
    getWellLogSetsFromProps,
} from "./well-log";
import type { WellLogSet } from "../components/WellLogTypes";
import type { AxesInfo } from "./tracks";
import type { WellLogViewProps } from "../components/WellLogView";

// @ts-expect-error TS2741 Mock object kept simple for testing purposes
const MOCK_LOG_SET_1 = {
    curves: [{ name: "Curve1" }, { name: "Curve2" }],
    header: { well: "Well1" },
    metadata_discrete: {
        Curve1: {
            attributes: "Attributes1",
            objects: "Objects1",
        },
    },
    // Data is not needed for any of these tests
    data: [],
} as WellLogSet;

const MOCK_LOG_SET_2: WellLogSet = {
    curves: [{ name: "Curve3" }, { name: "Curve4" }],
    header: { well: "Well1" },
    metadata_discrete: {},
    // Data is not needed for any of these tests
    data: [],
} as WellLogSet;

const MOCK_LOG_SET_3: WellLogSet = {
    curves: [{ name: "C1" }, { name: "C2" }],
    header: { well: "Well1" },
    metadata_discrete: {},
    // Data is not needed for any of these tests
    data: [],
} as WellLogSet;

const MOCK_LOG_FROM_DIFFERENT_WELL: WellLogSet = {
    curves: [{ name: "Curve1" }, { name: "Curve1" }],
    header: { well: "Some Other Well" },
    metadata_discrete: {},
    // Data is not needed for any of these tests
    data: [],
} as WellLogSet;

// @ts-expect-error TS2741 Mock object kept simple for testing purposes
const MOCK_AXES_INFO: AxesInfo = {
    primaryAxis: "primary",
    secondaryAxis: "secondary",
    mnemos: {
        primary: ["Curve1", "C1"],
        secondary: ["Curve2"],
    },
};

describe("getAllWellLogCurves", () => {
    it("should return all curves from a single well log set", () => {
        const wellLogSets: WellLogSet[] = [MOCK_LOG_SET_1];

        const result = getAllWellLogCurves(wellLogSets);
        expect(result).toEqual([{ name: "Curve1" }, { name: "Curve2" }]);
    });

    it("should return all curves from multiple well log sets", () => {
        const wellLogSets: WellLogSet[] = [MOCK_LOG_SET_1, MOCK_LOG_SET_2];

        const result = getAllWellLogCurves(wellLogSets);
        expect(result).toEqual([
            { name: "Curve1" },
            { name: "Curve2" },
            { name: "Curve3" },
            { name: "Curve4" },
        ]);
    });

    it("should handle well log sets with no curves", () => {
        const wellLogSets: WellLogSet[] = [
            { ...MOCK_LOG_SET_1, curves: [] },
            MOCK_LOG_SET_2,
        ];

        const result = getAllWellLogCurves(wellLogSets);
        expect(result).toEqual([{ name: "Curve3" }, { name: "Curve4" }]);
    });
});

describe("findSetAndCurveIndex", () => {
    it("should return the correct indices for an existing curve", () => {
        const wellLogSets: WellLogSet[] = [MOCK_LOG_SET_1, MOCK_LOG_SET_2];

        const result = findSetAndCurveIndex(wellLogSets, "Curve1");
        expect(result).toEqual({ iSet: 0, iCurve: 0 });
    });

    it("should return -1 indices for a curve that does not exist", () => {
        const wellLogSets: WellLogSet[] = [MOCK_LOG_SET_1, MOCK_LOG_SET_2];

        const result = findSetAndCurveIndex(wellLogSets, "Curve5");
        expect(result).toEqual({ iSet: -1, iCurve: -1 });
    });
});

describe("findIndexByCurveName", () => {
    it("should return the correct index for an existing curve", () => {
        const curves = MOCK_LOG_SET_1.curves;

        const result = findIndexByCurveName(curves, "Curve1");
        expect(result).toBe(0);
    });

    it("should return -1 for a curve that does not exist", () => {
        const curves = MOCK_LOG_SET_1.curves;

        const result = findIndexByCurveName(curves, "Curve5");
        expect(result).toBe(-1);
    });
});

describe("getCurveByName", () => {
    it("should return the correct curve", () => {
        const wellLogSet = MOCK_LOG_SET_1;

        const result = getCurveByName(wellLogSet, "Curve1");
        expect(result).toEqual({ name: "Curve1" });
    });

    it("should return undefined for a curve that does not exist", () => {
        const wellLogSet = MOCK_LOG_SET_1;

        const result = getCurveByName(wellLogSet, "Curve5");
        expect(result).toBeUndefined();
    });
});

describe("getDiscreteMetaDataByName", () => {
    it("should return the correct metadata for an existing curve", () => {
        const wellLogSet = MOCK_LOG_SET_1;

        const result = getDiscreteMetaDataByName(wellLogSet, "Curve1");
        expect(result).toEqual({
            attributes: "Attributes1",
            objects: "Objects1",
        });
    });

    it("should return null for a curve that does not exist", () => {
        const wellLogSet = MOCK_LOG_SET_1;

        const result = getDiscreteMetaDataByName(wellLogSet, "Curve5");
        expect(result).toBeNull();
    });

    it("should return null for a curve that does not have associated metadata", () => {
        const wellLogSet = MOCK_LOG_SET_1;

        const result = getDiscreteMetaDataByName(wellLogSet, "Curve5");
        expect(result).toBeNull();
    });

    it("should return null for a well log set that does not have metadata", () => {
        const wellLogSet = MOCK_LOG_SET_2;

        const result = getDiscreteMetaDataByName(wellLogSet, "Curve3");
        expect(result).toBeNull();
    });
});

describe("getAxisIndices", () => {
    it("should return the correct axis indices", () => {
        const curves = MOCK_LOG_SET_1.curves;

        const result = getAxisIndices(curves, MOCK_AXES_INFO);

        expect(result).toEqual({ primary: 0, secondary: 1 });
    });

    it("should work with a different name mnemonic", () => {
        const curves = MOCK_LOG_SET_3.curves;

        const result = getAxisIndices(curves, MOCK_AXES_INFO);

        expect(result).toEqual({ primary: 0, secondary: -1 });
    });

    it("should return -1 for both axes if they are not found", () => {
        const curvesWithOutAxes = [{ name: "Curr_1" }, { name: "Curr_1" }];

        const result = getAxisIndices(curvesWithOutAxes, MOCK_AXES_INFO);

        expect(result).toEqual({ primary: -1, secondary: -1 });
    });

    it("should return -1 if mnemos are not provided", () => {
        const curves = MOCK_LOG_SET_1.curves;

        // @ts-expect-error TS2345 Intentionally passing a broken object
        const result = getAxisIndices(curves, {});
        expect(result).toEqual({ primary: -1, secondary: -1 });
    });

    it("should return -1 if mnemos for axis dont exist", () => {
        const curves = MOCK_LOG_SET_1.curves;
        // @ts-expect-error TS2741 Kept simple for testing purposes
        const axesInfoWithWrongMnemos: AxesInfo = {
            primaryAxis: "foo",
            secondaryAxis: "fee",
            mnemos: {
                bar: ["Curve1", "C1"],
                fum: ["Curve2"],
            },
        };

        const result = getAxisIndices(curves, axesInfoWithWrongMnemos);
        expect(result).toEqual({ primary: -1, secondary: -1 });
    });
});

describe("getWellLogSetsFromProps", () => {
    it("should return an array for welllog prop", () => {
        // @ts-expect-error TS2739 Prop kept simple for testing purposes
        const propWithSingle: WellLogViewProps = {
            welllog: MOCK_LOG_SET_1,
        };

        const result1 = getWellLogSetsFromProps(propWithSingle);
        expect(result1).toEqual([MOCK_LOG_SET_1]);
        // @ts-expect-error TS2739 Prop kept simple for testing purposes
        const propWithArray: WellLogViewProps = {
            welllog: [MOCK_LOG_SET_1, MOCK_LOG_SET_2],
        };

        const result2 = getWellLogSetsFromProps(propWithArray);
        expect(result2).toEqual([MOCK_LOG_SET_1, MOCK_LOG_SET_2]);
    });

    it("should return an array for wellLogSets prop", () => {
        // @ts-expect-error TS2739 Prop kept simple for testing purposes
        const prop: WellLogViewProps = {
            wellLogSets: [MOCK_LOG_SET_1, MOCK_LOG_SET_2],
        };

        const result = getWellLogSetsFromProps(prop);
        expect(result).toEqual([MOCK_LOG_SET_1, MOCK_LOG_SET_2]);
    });

    it("should prioritize wellLogSets prop over welllog prop", () => {
        // @ts-expect-error TS2739 Prop kept simple for testing purposes
        const prop: WellLogViewProps = {
            welllog: MOCK_LOG_SET_1,
            wellLogSets: [MOCK_LOG_SET_2],
        };

        const result = getWellLogSetsFromProps(prop);
        expect(result).toEqual([MOCK_LOG_SET_2]);
    });

    it("should return an empty array if none of the properties are provided", () => {
        // @ts-expect-error TS2345 Prop kept simple
        const result = getWellLogSetsFromProps({});

        expect(result).toEqual([]);
    });

    it("should warn if logs for different wells are found", () => {
        const warnSpy = jest.spyOn(console, "warn").mockImplementation();
        // @ts-expect-error TS2739 Prop kept simple for testing purposes
        const prop: WellLogViewProps = {
            welllog: [MOCK_LOG_SET_1, MOCK_LOG_FROM_DIFFERENT_WELL],
        };

        getWellLogSetsFromProps(prop);
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });
});

describe("getCurveFromVidexPlotId", () => {
    it("should return the first curve in the second set", () => {
        const wellLogSets = [MOCK_LOG_SET_1, MOCK_LOG_SET_2];

        const result = getCurveFromVidexPlotId(wellLogSets, "1-0");

        expect(result).toEqual({ name: "Curve3" });
    });

    it("should return undefined if the id gives out-of-bounds indices", () => {
        const wellLogSets = [MOCK_LOG_SET_1, MOCK_LOG_SET_2];

        const result = getCurveFromVidexPlotId(wellLogSets, "2-0");
        expect(result).toBeUndefined();
    });

    it("should throw if the id is not in the correct format", () => {
        const wellLogSets = [MOCK_LOG_SET_1, MOCK_LOG_SET_2];

        expect(() => getCurveFromVidexPlotId(wellLogSets, "1")).toThrow(
            "Wrong pattern"
        );
    });
});
