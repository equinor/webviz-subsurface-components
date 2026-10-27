import "jest";
import { describe, expect, it } from "@jest/globals";

import { colorTables } from "@emerson-eps/color-tables";

import { getColormapColorArray } from "./colormapTools";

describe("discrete colormap helpers", () => {
    it("provides a fallback color for an empty raw colormap", () => {
        expect(
            getColormapColorArray(new Uint8Array(), { colormapSize: 0 })
        ).toEqual(new Uint8Array([0, 0, 0]));
        expect(
            getColormapColorArray(new Uint8Array(), {
                discreteData: true,
                colormapSize: 0,
            })
        ).toEqual(new Uint8Array([0, 0, 0]));
    });

    it("returns correct colormap", () => {
        const colorChannels = 3;
        const colormapSize = 3;
        const colormapDef = {
            colormapName: "Rainbow",
            colorTables,
        };
        const expectedResult = new Uint8Array([
            255, 0, 0, 0, 255, 128, 255, 0, 255,
        ]);

        const imageData = getColormapColorArray(colormapDef, { colormapSize });
        expect(imageData).toHaveLength(colorChannels * colormapSize);
        expect(imageData).toEqual(expectedResult);

        const discreteColors = getColormapColorArray(colormapDef, {
            discreteData: true,
            colormapSize,
        });
        expect(discreteColors).toHaveLength(colorChannels * colormapSize);
        expect(discreteColors).toEqual(expectedResult);
    });

    it("generates one fallback entry for an empty discrete function colormap", () => {
        const colors = getColormapColorArray(() => [255, 0, 0], {
            discreteData: true,
            colormapSize: 0,
        });

        expect(colors).toEqual(new Uint8Array([255, 0, 0]));
    });
});
