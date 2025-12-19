import "jest";

import { scaleArray } from "./arrays";

describe("scaleArray", () => {
    it("should scale all elements by the given factor", () => {
        const input = [1, 2, 3, -4, 5.25];
        const result = scaleArray(input, 2);
        expect(result).toEqual([2, 4, 6, -8, 10.5]);
    });

    it("should handle empty arrays", () => {
        const input: number[] = [];
        const result = scaleArray(input, 5);
        expect(result).toEqual([]);
    });

    it("should not mutate the original array", () => {
        const input = [1, 2, 3];
        const original = [...input];
        scaleArray(input, 2);
        expect(input).toEqual(original);
    });
});
