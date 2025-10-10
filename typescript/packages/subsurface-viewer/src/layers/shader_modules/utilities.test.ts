import "jest";

import { describe, expect, it } from "@jest/globals";

import {
    encodeIndexToRGB,
    decodeIndexFromRGB,
    encodeNormalizedValueToRGB,
    encodeNormalizedValueWithNaNToRGB,
    decodeNormalizedValueFromRGB,
    decodeNormalizedValueWithNaNFromRGB,
} from "./utilities";

describe("Shader Module Utilities", () => {
    describe("encodeIndexToRGB", () => {
        it("should encode values to RGB", () => {
            const tr = [
                { t: 0, r: [0, 0, 0] },
                { t: 1, r: [0, 0, 1] },
                { t: 255, r: [0, 0, 255] },
                { t: 256, r: [0, 1, 0] },
                { t: 257, r: [0, 1, 1] },
                { t: 511, r: [0, 1, 255] },
                { t: 512, r: [0, 2, 0] },
                { t: 513, r: [0, 2, 1] },
                { t: 65535, r: [0, 255, 255] },
                { t: 65536, r: [1, 0, 0] },
                { t: 65537, r: [1, 0, 1] },
                { t: 16777215, r: [255, 255, 255] },
                { t: 8388607, r: [127, 255, 255] },
                { t: 8388608, r: [128, 0, 0] },
            ];
            for (const test of tr) {
                const result = encodeIndexToRGB(test.t);
                expect(result).toEqual(test.r);
                expect(decodeIndexFromRGB(result)).toBe(test.t);
            }
        });
        it("should clamp out of range values to RGB", () => {
            {
                const result = encodeIndexToRGB(16777216);
                expect(result).toEqual([255, 255, 255]);
                expect(decodeIndexFromRGB(result)).toBe(16777215);
            }
            {
                const result = encodeIndexToRGB(167772160);
                expect(result).toEqual([255, 255, 255]);
                expect(decodeIndexFromRGB(result)).toBe(16777215);
            }
        });
    });

    describe("encodeNormalizedValueToRGB", () => {
        it("should encode normalized value to RGB", () => {
            // Values computed from incr are exact
            const incr = 1.0 / (256 * 256 * 256 - 1);
            const exactTests = [
                { t: 0, r: [0, 0, 0] },
                { t: incr, r: [0, 0, 1] },
                { t: 255 * incr, r: [0, 0, 255] },
                { t: 256 * incr, r: [0, 1, 0] },
                { t: 257 * incr, r: [0, 1, 1] },
                { t: 511 * incr, r: [0, 1, 255] },
                { t: 512 * incr, r: [0, 2, 0] },
                { t: 513 * incr, r: [0, 2, 1] },
                { t: 65535 * incr, r: [0, 255, 255] },
                { t: 65536 * incr, r: [1, 0, 0] },
                { t: 65537 * incr, r: [1, 0, 1] },
                { t: 16777215 * incr, r: [255, 255, 255] },
                { t: 1, r: [255, 255, 255] },
            ];
            for (const test of exactTests) {
                const result = encodeNormalizedValueToRGB(test.t);
                expect(result).toEqual(test.r);
                expect(decodeNormalizedValueFromRGB(result)).toBe(test.t);
            }
            // Other values are approximate
            const approximateTests = [
                { t: 0.00001, r: [0, 0, 167] },
                { t: 0.5, r: [127, 255, 255] },
            ];
            for (const test of approximateTests) {
                const result = encodeNormalizedValueToRGB(test.t);
                expect(result).toEqual(test.r);
                expect(decodeNormalizedValueFromRGB(result)).toBeCloseTo(
                    test.t
                );
            }
        });
        it("should clamp out of range value to RGB", () => {
            {
                const result = encodeNormalizedValueToRGB(-0.1);
                expect(result).toEqual([0, 0, 0]);
                expect(decodeNormalizedValueFromRGB(result)).toBe(0);
            }
            {
                const result = encodeNormalizedValueToRGB(1.1);
                expect(result).toEqual([255, 255, 255]);
                expect(decodeNormalizedValueFromRGB(result)).toBe(1);
            }
        });
    });

    describe("encodeNormalizedValueWithNaNToRGB", () => {
        // Values computed from incr are exact
        const incr = 1.0 / (256 * 256 * 256 - 2);
        it("should encode normalized value to RGB", () => {
            const exactTests = [
                { t: Number.NaN, r: [255, 255, 255] },
                { t: 0, r: [0, 0, 0] },
                { t: incr, r: [0, 0, 1] },
                { t: 255 * incr, r: [0, 0, 255] },
                { t: 256 * incr, r: [0, 1, 0] },
                { t: 257 * incr, r: [0, 1, 1] },
                { t: 511 * incr, r: [0, 1, 255] },
                { t: 512 * incr, r: [0, 2, 0] },
                { t: 513 * incr, r: [0, 2, 1] },
                { t: 65535 * incr, r: [0, 255, 255] },
                { t: 65536 * incr, r: [1, 0, 0] },
                { t: 65537 * incr, r: [1, 0, 1] },
                { t: 16777214 * incr, r: [255, 255, 254] },
                { t: 1, r: [255, 255, 254] },
            ];
            for (const test of exactTests) {
                const result = encodeNormalizedValueWithNaNToRGB(test.t);
                expect(result).toEqual(test.r);
                expect(decodeNormalizedValueWithNaNFromRGB(result)).toBe(
                    test.t
                );
            }
            // Other values are approximate
            const approximateTests = [
                { t: 0.00001, r: [0, 0, 167] },
                { t: 0.5, r: [127, 255, 255] },
            ];
            for (const test of approximateTests) {
                const result = encodeNormalizedValueToRGB(test.t);
                expect(result).toEqual(test.r);
                expect(decodeNormalizedValueFromRGB(result)).toBeCloseTo(
                    test.t
                );
            }
        });
        it("should clamp out of range value to RGB", () => {
            {
                const result = encodeNormalizedValueWithNaNToRGB(-0.1);
                expect(result).toEqual([0, 0, 0]);
                expect(decodeNormalizedValueWithNaNFromRGB(result)).toBe(0);
            }
            {
                const result = encodeNormalizedValueWithNaNToRGB(1.1);
                expect(result).toEqual([255, 255, 254]);
                expect(decodeNormalizedValueWithNaNFromRGB(result)).toBe(1);
            }
        });
    });
});
