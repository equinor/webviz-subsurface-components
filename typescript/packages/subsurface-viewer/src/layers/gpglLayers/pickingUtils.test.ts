import "jest";

import { describe, expect, it } from "@jest/globals";

import type { ValueRange } from "../../utils/valueRange";

import { encodeNormalizedValueWithNaNToRGB } from "../shader_modules/utilities";
import fsTexShader from "./texTriangle.fs.glsl";

import { decodeValueFromPickingColor } from "./pickingUtils";

describe("seismic value ranges", () => {
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
        const pickRange: ValueRange = [-3, 3];
        const sampleValue = 2.25;
        const normalizedValue =
            (sampleValue - pickRange[0]) / (pickRange[1] - pickRange[0]);
        const color = encodeNormalizedValueWithNaNToRGB(normalizedValue);
        const readout = decodeValueFromPickingColor(color, pickRange);

        expect(sampleValue).toBeGreaterThan(displayRange[1]);
        expect(readout).toBeCloseTo(sampleValue, 5);
    });
});

