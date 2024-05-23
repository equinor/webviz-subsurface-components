/* eslint-disable @typescript-eslint/no-var-requires */
import type { Layer } from "@deck.gl/core";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { getLayersInViewport } from "../layers/utils/layerTools";
import ColorLegends from "./ColorLegends";

import { colorTables } from "@emerson-eps/color-tables";

const colormapLayer = {
    "@@type": "ColormapLayer",
    name: "Property map",
    id: "colormap-layer",
    pickable: true,
    visible: true,
    valueRange: { type: "array", value: [0, 1] },
    colorMapRange: { type: "array" },
    valueDecoder: {
        rgbScaler: [1, 1, 1],
        // By default, scale the [0, 256*256*256-1] decoded values to [0, 1]
        floatScaler: 1.0 / (256.0 * 256.0 * 256.0 - 1.0),
        offset: 0,
        step: 0,
    },
    rotDeg: 0,
    colorMapName: "Rainbow",
};

const wellsLayer = {
    "@@type": "WellsLayer",
    name: "Wells",
    id: "wells-layer",
    autoHighlight: true,
    opacity: 1,
    lineWidthScale: 1,
    pointRadiusScale: 1,
    lineStyle: { dash: false },
    outline: true,
    logRadius: 10,
    logCurves: true,
    refine: true,
    visible: true,
    wellNameVisible: false,
    wellNameAtTop: false,
    wellNameSize: 14,
    wellNameColor: [0, 0, 0, 255],
    selectedWell: "@@#editedData.selectedWells", // used to get data from deckgl layer
    depthTest: true,
};

const layers = [colormapLayer, wellsLayer];

describe("Test Color Legend", () => {
    it("snapshot test", () => {
        const { container } = render(
            <ColorLegends
                layers={
                    getLayersInViewport(layers, [
                        "colormap-layer",
                        "wells-layer",
                    ]) as Layer[]
                }
                colorTables={colorTables}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("snapshot test with props", () => {
        const { container } = render(
            <ColorLegends
                layers={
                    getLayersInViewport(layers, [
                        "colormap-layer",
                        "wells-layer",
                    ]) as Layer[]
                }
                horizontal={true}
                colorTables={colorTables}
                reverseRange={true}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("snapshot test if layers=0", () => {
        const { container } = render(
            <ColorLegends
                layers={[]}
                horizontal={true}
                colorTables={colorTables}
                reverseRange={true}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
