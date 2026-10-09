import "jest";

import { describe, expect, it } from "@jest/globals";

import { encodeNormalizedValueWithNaNToRGB } from "../shader_modules/utilities";
import fsTexShader from "./texTriangle.fs.glsl";

import {
    decodeValueFromPickingColor,
    getFiniteValueRange,
    mergeValueRanges,
} from "./valueRange";

describe("seismic value ranges", () => {
    it("gets the finite data range while excluding undefined values", () => {
        expect(
            getFiniteValueRange(
                new Float32Array([-3, -9999, Number.NaN, 0.25, 3]),
                -9999
            )
        ).toEqual([-3, 3]);
    });

    it("returns no range when the texture contains no defined values", () => {
        expect(
            getFiniteValueRange(new Float32Array([Number.NaN, -9999]), -9999)
        ).toBeUndefined();
    });

    it("merges the ranges of multiple seismic textures", () => {
        expect(mergeValueRanges([-2, 1], [0, 4])).toEqual([-2, 4]);
        expect(mergeValueRanges(undefined, [0, 4])).toEqual([0, 4]);
    });

    it("uses the full data range only in the texture picking shader", () => {
        expect(fsTexShader).toContain("triangles.pickRange");
        expect(fsTexShader).toContain(
            "float normalizedValue = normalizePickValue(value);"
        );
        expect(fsTexShader).toContain(
            "float normalizedValue = normalizeValue(value);"
        );
    });

    it("decodes picked samples independently of a narrower color range", () => {
        const displayRange: [number, number] = [-0.5, 0.5];
        const pickRange = getFiniteValueRange(
            new Float32Array([-3, 3]),
            Number.NaN
        )!;
        const sampleValue = 2.25;
        const normalizedValue =
            (sampleValue - pickRange[0]) / (pickRange[1] - pickRange[0]);
        const color = encodeNormalizedValueWithNaNToRGB(normalizedValue);
        const readout = decodeValueFromPickingColor(color, pickRange);

        expect(sampleValue).toBeGreaterThan(displayRange[1]);
        expect(readout).toBeCloseTo(sampleValue, 5);
    });
});
