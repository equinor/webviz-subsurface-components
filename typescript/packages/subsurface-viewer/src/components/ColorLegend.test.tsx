/* eslint-disable @typescript-eslint/no-var-requires */
import React from "react";

import "jest";
import { describe, expect, xit } from "@jest/globals";

import { render } from "@testing-library/react";
import "@testing-library/jest-dom/jest-globals";
import "jest-styled-components";

import { colorTables } from "@emerson-eps/color-tables";

import ColorLegend from "./ColorLegend";

import type { ExtendedLegendLayer } from "../layers/utils/layerTools";

describe("Test ColorLegend component", () => {
    xit("snapshot test", () => {
        const { container } = render(
            <ColorLegend
                layer={
                    {
                        "@@type": "ColormapLayer",
                        image: "@@#resources.propertyMap",
                        rotDeg: 0,
                        bounds: [432205, 6475078, 437720, 6481113],
                        colorMapName: "Rainbow",
                        valueRange: [2782, 3513],
                        colorMapRange: [2782, 3513],
                    } as unknown as ExtendedLegendLayer
                }
                colorTables={colorTables}
                horizontal={false}
                reverseRange={false}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
