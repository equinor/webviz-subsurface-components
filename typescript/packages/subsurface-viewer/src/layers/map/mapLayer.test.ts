import "jest";
import { describe, expect, it } from "@jest/globals";

import {
    getUndefinedValueProperties,
    normalizeDiscreteProperties,
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
