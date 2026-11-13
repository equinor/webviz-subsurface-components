import "jest";

import { describe, expect, it } from "@jest/globals";

import { getFiniteValueRange, mergeFiniteValueRanges } from "./valueRange";

describe("getFiniteValueRange", () => {
    const values = [-4, -9999, Number.NaN, -Infinity, 0.25, 3, 25.25];
    // NaN and Infinity become 0 for Int32Araay and Uint32Array
    const intValues = [-4, -9999, 25, 3];
    const uintValues = [4, 9999, 25, 3];

    it("should return the finite Float32Array data range", () => {
        expect(getFiniteValueRange(new Float32Array(values))).toEqual([
            -9999, 25.25,
        ]);
    });

    it("should return the finite Float32Array data range while excluding undefined values", () => {
        expect(getFiniteValueRange(new Float32Array(values), -9999)).toEqual([
            -4, 25.25,
        ]);
    });

    it("should return undefined when the Float32Array data is empty", () => {
        const empty = new Float32Array([]);
        expect(getFiniteValueRange(empty)).toBeUndefined();
        expect(getFiniteValueRange(empty, -9999)).toBeUndefined();
    });

    it("should return undefined when the Float32Array data contains no defined values", () => {
        expect(
            getFiniteValueRange(
                new Float32Array([Number.NaN, -Infinity, Infinity])
            )
        ).toBeUndefined();
    });

    it("should return undefined when the Float32Array data contains no defined values", () => {
        expect(
            getFiniteValueRange(
                new Float32Array([Number.NaN, -9999, -Infinity, -9999]),
                -9999
            )
        ).toBeUndefined();
    });

    it("should return the finite Int32Array data range", () => {
        expect(getFiniteValueRange(new Int32Array(intValues))).toEqual([
            -9999, 25,
        ]);
    });

    it("should return the finite Int32Array data range while excluding undefined values", () => {
        expect(getFiniteValueRange(new Int32Array(intValues), -9999)).toEqual([
            -4, 25,
        ]);
    });

    it("should return undefined when the Int32Array data is empty", () => {
        expect(getFiniteValueRange(new Int32Array([]))).toBeUndefined();
        expect(getFiniteValueRange(new Int32Array([]), -9999)).toBeUndefined();
    });

    it("should return undefined when the Int32Array data contains no defined values", () => {
        expect(
            // Number.NaN and Infinity can not be encoded in Int32Array
            getFiniteValueRange(new Int32Array([]))
        ).toBeUndefined();
    });

    it("should return undefined when the Int32Array data contains no defined values", () => {
        expect(
            getFiniteValueRange(new Int32Array([-9999, -9999]), -9999)
        ).toBeUndefined();
    });

    it("should return the finite Uint32Array data range", () => {
        expect(getFiniteValueRange(new Uint32Array(uintValues))).toEqual([
            3, 9999,
        ]);
    });

    it("should return the finite Uint32Array data range while excluding undefined values", () => {
        expect(getFiniteValueRange(new Uint32Array(uintValues), 9999)).toEqual([
            3, 25,
        ]);
    });

    it("should return undefined when the Uint32Array data is empty", () => {
        expect(getFiniteValueRange(new Uint32Array([]))).toBeUndefined();
        expect(getFiniteValueRange(new Uint32Array([]), 9999)).toBeUndefined();
    });

    it("should return undefined when the Uint32Array data contains no defined values", () => {
        // Number.NaN and Infinity can not be encoded in Int32Array
        expect(getFiniteValueRange(new Uint32Array([]))).toBeUndefined();
    });

    it("should return undefined when the Uint32Array data contains no defined values", () => {
        expect(
            getFiniteValueRange(new Uint32Array([9999, 9999]), 9999)
        ).toBeUndefined();
    });

    it("should return [3,3] when the data contains only one or multiple 3's", () => {
        expect(getFiniteValueRange([3])).toEqual([3, 3]);
        expect(getFiniteValueRange([3, 3, 3, 3])).toEqual([3, 3]);
    });

    it("should return undefined when the data contains only one value", () => {
        expect(getFiniteValueRange([3, -9999], -9999)).toEqual([3, 3]);
        expect(getFiniteValueRange([3, -9999, 3, 3], -9999)).toEqual([3, 3]);
    });
});

describe("mergeValueRanges", () => {
    it("should return the first range if the second is undefined", () => {
        expect(mergeFiniteValueRanges([0, 4], undefined)).toEqual([0, 4]);
        expect(mergeFiniteValueRanges([4, 4], undefined)).toEqual([4, 4]);
    });

    it("should return a range spanning both input ranges", () => {
        expect(mergeFiniteValueRanges([-2, 1], [0, 4])).toEqual([-2, 4]);
        expect(mergeFiniteValueRanges([-2, 0], [1, 4])).toEqual([-2, 4]);
        expect(mergeFiniteValueRanges([-2, 4], [0, 3])).toEqual([-2, 4]);
        expect(mergeFiniteValueRanges([0, 3], [-2, 4])).toEqual([-2, 4]);
        expect(mergeFiniteValueRanges([0, 0], [4, 4])).toEqual([0, 4]);
    });
});
