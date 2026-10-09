import "jest";
import { describe, expect, it } from "@jest/globals";

import {
    getUndefinedValueProperties,
    normalizeDiscreteProperties,
    resampleMesh,
    MapFrame,
} from "./mapLayer";

describe("MapLayer property input handling", () => {
    it("uses the configured sentinel for undefined discrete array values", () => {
        expect(normalizeDiscreteProperties([1, undefined, 3], 999)).toEqual([
            1, 999, 3,
        ]);
    });

    it("uses 0xFFFF as the default discrete sentinel", () => {
        expect(normalizeDiscreteProperties([1, undefined], 0xffff)).toEqual([
            1, 0xffff,
        ]);
        expect(getUndefinedValueProperties([1, undefined], true)).toBe(0xffff);
    });

    it("keeps typed discrete input unchanged", () => {
        const properties = new Uint16Array([1, 2]);

        expect(normalizeDiscreteProperties(properties, 999)).toBe(properties);
        expect(getUndefinedValueProperties(properties, true)).toBe(0xffff);
    });

    it("uses NaN as the continuous floating-point sentinel", () => {
        expect(
            getUndefinedValueProperties(new Float32Array(), false)
        ).toBeNaN();
    });
});

describe("resampleMesh", () => {
    it("adds a row and column and averages neighboring mesh values", () => {
        const frame: MapFrame = {
            origin: [0, 0],
            increment: [1, 1],
            count: [2, 2],
        };

        // The function expands a node grid by one in each direction,
        // shifts the origin by half an increment, and averages neighboring
        // mesh values. A small 2×2 input gives a clear discriminating check
        // for both the updated frame and the resulting 3×3 values.
        const [resampledFrame, resampledMesh] = resampleMesh(
            frame,
            new Float32Array([1, 2, 3, 4])
        );

        expect(resampledFrame).toEqual({
            origin: [-0.5, -0.5],
            increment: [1, 1],
            count: [3, 3],
        });
        expect(Array.from(resampledMesh)).toEqual([
            /*eslint-disable */
            1, 1.5, 2,
            2, 2.5, 3,
            3, 3.5, 4,
            /*eslint-enable */
        ]);
    });
});
