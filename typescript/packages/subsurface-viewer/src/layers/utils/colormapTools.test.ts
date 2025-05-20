import "jest";

import { toNormalizedColor } from "./colormapTools";
describe("toNormalizedColor", () => {
    it("should normalize an RGB color array", () => {
        const input = [255, 128, 0];
        const result = toNormalizedColor(input);
        expect(result).toEqual([1, 128 / 255, 0, 1]);
    });

    it("should normalize an RGBA color array", () => {
        const input = [64, 128, 192, 128];
        const result = toNormalizedColor(input);
        expect(result).toEqual([64 / 255, 128 / 255, 192 / 255, 128 / 255]);
    });

    it("should return undefined for undefined input", () => {
        const result = toNormalizedColor(undefined);
        expect(result).toBeUndefined();
    });

    it("should handle black RGB color", () => {
        const input = [0, 0, 0];
        const result = toNormalizedColor(input);
        expect(result).toEqual([0, 0, 0, 1]);
    });

    it("should handle white RGBA color", () => {
        const input = [255, 255, 255, 255];
        const result = toNormalizedColor(input);
        expect(result).toEqual([1, 1, 1, 1]);
    });

    it("should handle alpha channel of 0 in RGBA", () => {
        const input = [10, 20, 30, 0];
        const result = toNormalizedColor(input);
        expect(result).toEqual([10 / 255, 20 / 255, 30 / 255, 0]);
    });
});
