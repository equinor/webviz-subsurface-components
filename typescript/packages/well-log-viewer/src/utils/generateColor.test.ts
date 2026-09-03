import "jest";
import { describe, expect, it } from "@jest/globals";

import { createColorGenerator, generateColor } from "./generateColor";

const PALETTE = [
    "red",
    "blue",
    "orange",
    "green",
    "red",
    "magenta",
    "gray",
    "brown",
];

describe("generateColor", () => {
    it("cycles through the palette with a period of 8, wrapping around", () => {
        // generateColor() uses a shared, module-level counter that is never
        // reset, so its exact starting position depends on how many times it
        // has already been called elsewhere in this process. Rather than
        // asserting an absolute starting color, assert the invariant that
        // holds regardless of starting position: the next 8 colors always
        // repeat identically after another full cycle of the palette.
        const firstCycle = Array.from({ length: PALETTE.length }, () =>
            generateColor()
        );
        const secondCycle = Array.from({ length: PALETTE.length }, () =>
            generateColor()
        );
        expect(secondCycle).toEqual(firstCycle);

        // Every color returned must come from the palette.
        for (const color of firstCycle) {
            expect(PALETTE).toContain(color);
        }
    });
});

describe("createColorGenerator", () => {
    it("starts at the beginning of the palette and cycles through it", () => {
        const nextColor = createColorGenerator();
        for (let i = 0; i < PALETTE.length * 2; i++) {
            expect(nextColor()).toBe(PALETTE[i % PALETTE.length]);
        }
    });

    it("returns an independent generator for each call", () => {
        const first = createColorGenerator();
        first(); // advance the first generator by one

        const second = createColorGenerator();
        expect(second()).toBe(PALETTE[0]);
    });

    it("does not advance the shared generateColor() counter", () => {
        // Capture where the shared counter currently is by taking a full
        // cycle as a fingerprint (see the period-8 rationale above), then
        // confirm the *next* fingerprint is unaffected by an independent
        // generator's calls in between.
        const before = Array.from({ length: PALETTE.length }, () =>
            generateColor()
        );

        const nextColor = createColorGenerator();
        nextColor();
        nextColor();
        nextColor();

        const after = Array.from({ length: PALETTE.length }, () =>
            generateColor()
        );
        expect(after).toEqual(before);
    });
});
