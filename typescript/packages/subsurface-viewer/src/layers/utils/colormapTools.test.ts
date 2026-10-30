import "jest";
import { describe, expect, it } from "@jest/globals";

import { getColormapDiscreteColors, getImageData } from "./colormapTools";

describe("discrete colormap helpers", () => {
    it("provides a fallback color for an empty raw colormap", () => {
        expect(getImageData(new Uint8Array(), 0, true)).toEqual(
            new Uint8Array([0, 0, 0])
        );
        expect(
            getColormapDiscreteColors(new Uint8Array(), {
                discreteData: true,
                colormapSize: 0,
            })
        ).toEqual(new Uint8Array([0, 0, 0]));
    });

    it("generates one fallback entry for an empty discrete function colormap", () => {
        const colors = getColormapDiscreteColors(() => [255, 0, 0], {
            discreteData: true,
            colormapSize: 0,
        });

        expect(colors).toEqual(new Uint8Array([255, 0, 0]));
    });
});
