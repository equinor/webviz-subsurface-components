import "jest";

import { describe, expect, it } from "@jest/globals";

import { filterOutUndefined } from "./arrays";

describe("arrays", () => {
    describe("filterOutUndefined", () => {
        it("should filter out undefined values from an array", () => {
            const input = [1, undefined, 2, undefined, 3];
            const expectedOutput = [1, 2, 3];
            expect(filterOutUndefined(input)).toEqual(expectedOutput);
        });
        it("should filter out undefined values from an array elements", () => {
            const input = [
                [1, 2],
                [11, undefined, 12],
                [21, 22, 23],
                [undefined],
                [undefined, undefined],
                [undefined, 31, undefined, 32],
                [41, 42, 43],
            ];
            const expectedOutput = [
                [1, 2],
                [11, 12],
                [21, 22, 23],
                [31, 32],
                [41, 42, 43],
            ];
            expect(filterOutUndefined(input)).toEqual(expectedOutput);
        });
    });
});
