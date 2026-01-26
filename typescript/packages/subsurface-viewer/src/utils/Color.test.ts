import "jest";

import type { RGBAColor, RGBColor } from "../utils/Color";
import { blendColors, toNormalizedColor } from "./Color";

describe("Color utilities", () => {
    describe("toNormalizedColor", () => {
        it("should normalize an RGB color array", () => {
            const input: RGBColor = [255, 128, 0];
            const result = toNormalizedColor(input);
            expect(result).toEqual([1, 128 / 255, 0, 1]);
        });

        it("should normalize an RGBA color array", () => {
            const input: RGBAColor = [64, 128, 192, 128];
            const result = toNormalizedColor(input);
            expect(result).toEqual([64 / 255, 128 / 255, 192 / 255, 128 / 255]);
        });

        it("should return undefined for undefined input", () => {
            const result = toNormalizedColor(undefined);
            expect(result).toBeUndefined();
        });

        it("should handle black RGB color", () => {
            const input: RGBColor = [0, 0, 0];
            const result = toNormalizedColor(input);
            expect(result).toEqual([0, 0, 0, 1]);
        });

        it("should handle white RGBA color", () => {
            const input: RGBAColor = [255, 255, 255, 255];
            const result = toNormalizedColor(input);
            expect(result).toEqual([1, 1, 1, 1]);
        });

        it("should handle alpha channel of 0 in RGBA", () => {
            const input: RGBAColor = [10, 20, 30, 0];
            const result = toNormalizedColor(input);
            expect(result).toEqual([10 / 255, 20 / 255, 30 / 255, 0]);
        });
    });

    describe("blendColors", () => {
        it("should blend two colors equally", () => {
            const color1: RGBAColor = [255, 0, 0, 255];
            const color2: RGBAColor = [0, 0, 255, 255];
            const result = blendColors(color1, color2);
            expect(result).toEqual([0, 0, 255, 255]);
        });

        it("should handle various opacities", () => {
            const color1: RGBAColor = [0, 255, 0, 128];
            const color2: RGBAColor = [0, 0, 255, 64];

            const result = blendColors(color1, color2);
            const [r, g, b, a] = result;

            expect([r, g, b]).toEqual([0, 153, 102]);
            expect(a).toBeCloseTo(159.87, 1);
        });

        it("should handle colors without alpha channel", () => {
            const color1: RGBColor = [255, 0, 0];
            const color2: RGBColor = [0, 0, 255];

            const result1 = blendColors(color1, color2);
            const result2 = blendColors(color2, color1);

            expect(result1).toEqual([0, 0, 255, 255]);
            expect(result2).toEqual([255, 0, 0, 255]);
        });
    });
});
