import "jest";

import type { TypedArray, TypedFloatArray, TypedIntArray } from "./typedArray";
import { isNumberArray, isTypedArray, toTypedArray } from "./typedArray";

describe("Test isNumberArray", () => {
    it("should return true for an array of numbers", () => {
        expect(isNumberArray([1, 2, 3])).toBe(true);
        expect(isNumberArray([0, -1, 3.14])).toBe(true);
    });

    it("should return true for an empty array", () => {
        expect(isNumberArray([])).toBe(true);
    });

    it("should return false for an array of strings", () => {
        expect(isNumberArray(["a", "b", "c"])).toBe(false);
    });

    it("should return false for a mixed array", () => {
        expect(isNumberArray([1, "2", 3])).toBe(false);
    });

    it("should return false for non-array values", () => {
        expect(isNumberArray("not an array")).toBe(false);
        expect(isNumberArray(123)).toBe(false);
        expect(isNumberArray({})).toBe(false);
        expect(isNumberArray(null)).toBe(false);
        expect(isNumberArray(undefined)).toBe(false);
    });

    it("should return false for TypedArrays values", () => {
        expect(isNumberArray(new Int8Array([1, 2, 3]))).toBe(false);
        expect(isTypedArray(new Uint8Array([1, 2, 3]))).toBe(false);
        expect(isNumberArray(new Uint8ClampedArray([1, 2, 3]))).toBe(false);
        expect(isNumberArray(new Int16Array([1, 2, 3]))).toBe(false);
        expect(isNumberArray(new Uint16Array([1, 2, 3]))).toBe(false);
        expect(isNumberArray(new Int32Array([1, 2, 3]))).toBe(false);
        expect(isNumberArray(new Uint32Array([1, 2, 3]))).toBe(false);
        expect(isNumberArray(new Float32Array([1, 2, 3]))).toBe(false);
        expect(isNumberArray(new Float64Array([1, 2, 3]))).toBe(false);
    });
});

describe("Test isTypedArray", () => {
    it("should return true for all supported TypedArrays", () => {
        expect(isTypedArray(new Int8Array([1, 2, 3]))).toBe(true);
        expect(isTypedArray(new Uint8Array([1, 2, 3]))).toBe(true);
        expect(isTypedArray(new Uint8ClampedArray([1, 2, 3]))).toBe(true);
        expect(isTypedArray(new Int16Array([1, 2, 3]))).toBe(true);
        expect(isTypedArray(new Uint16Array([1, 2, 3]))).toBe(true);
        expect(isTypedArray(new Int32Array([1, 2, 3]))).toBe(true);
        expect(isTypedArray(new Uint32Array([1, 2, 3]))).toBe(true);
        expect(isTypedArray(new Float32Array([1, 2, 3]))).toBe(true);
        expect(isTypedArray(new Float64Array([1, 2, 3]))).toBe(true);
    });

    it("should return false for DataView", () => {
        const buffer = new ArrayBuffer(8);
        expect(isTypedArray(new DataView(buffer))).toBe(false);
    });

    it("should return false for regular arrays", () => {
        expect(isTypedArray([1, 2, 3])).toBe(false);
    });

    it("should return false for non-array values", () => {
        expect(isTypedArray("not an array")).toBe(false);
        expect(isTypedArray(123)).toBe(false);
        expect(isTypedArray({})).toBe(false);
        expect(isTypedArray(null)).toBe(false);
        expect(isTypedArray(undefined)).toBe(false);
    });
});

describe("Test toTypedArray", () => {
    it("should convert a number[] to the specified TypedArray", () => {
        const arr = [1, 2, 3];
        const result = toTypedArray(Float64Array, arr);
        expect(result).toBeInstanceOf(Float64Array);
        expect(Array.from(result)).toEqual(arr);
    });

    it("should return the same TypedArray if input is already a TypedArray", () => {
        const arr = new Int16Array([4, 5, 6]);
        const result = toTypedArray(Int16Array, arr);
        expect(result).toBe(arr);
    });

    it("should convert a Float32Array to Int8Array", () => {
        const arr = new Float32Array([1.7, -2.2, 3.9]);
        const result = toTypedArray(Int8Array, arr);
        expect(result).toBeInstanceOf(Int8Array);
        expect(Array.from(result)).toEqual([1, -2, 3]);
    });

    it("should convert a Uint8Array to Float32Array", () => {
        const arr = new Uint8Array([10, 20, 30]);
        const result = toTypedArray(Float32Array, arr);
        expect(result).toBeInstanceOf(Float32Array);
        expect(Array.from(result)).toEqual([10, 20, 30]);
    });

    it("should handle empty arrays", () => {
        const arr: number[] = [];
        const result = toTypedArray(Uint16Array, arr);
        expect(result).toBeInstanceOf(Uint16Array);
        expect(result.length).toBe(0);
    });

    it("should throw if constructor is not a TypedArray constructor", () => {
        // @ts-expect-error
        expect(() => toTypedArray(Array, [1, 2, 3])).toThrow();
    });
});
