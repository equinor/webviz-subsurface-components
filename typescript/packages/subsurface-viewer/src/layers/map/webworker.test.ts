import "jest";
import { describe, expect, it } from "@jest/globals";

import type { Params } from "./mapLayer";
import { makeFullMesh } from "./webworker";

const frame = {
    origin: [0, 0] as [number, number],
    increment: [1, 1] as [number, number],
    count: [2, 2] as [number, number],
};

function makeParams(properties: Uint16Array, undefinedValue = 0xffff): Params {
    return [null, properties, false, frame, false, false, undefinedValue];
}

describe("MapLayer webworker", () => {
    it("ignores the configured undefined value when calculating the range", () => {
        const [, , , , , , propertyValueRange] = makeFullMesh({
            data: makeParams(new Uint16Array([10, 0xffff, 20, 0xffff])),
        });

        expect(propertyValueRange).toEqual([10, 20]);
    });

    it("returns a safe range when every property is undefined", () => {
        const [, , , , , , propertyValueRange] = makeFullMesh({
            data: makeParams(new Uint16Array([0xffff, 0xffff, 0xffff, 0xffff])),
        });

        expect(propertyValueRange).toEqual([0, 0]);
    });

    it("honors a non-default undefined value", () => {
        const [, , , , , , propertyValueRange] = makeFullMesh({
            data: makeParams(new Uint16Array([1, 999, 2, 999]), 999),
        });

        expect(propertyValueRange).toEqual([1, 2]);
    });
});
