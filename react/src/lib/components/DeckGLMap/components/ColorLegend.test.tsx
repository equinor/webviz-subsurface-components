/* eslint-disable @typescript-eslint/no-var-requires */
import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import ColorLegend from "./ColorLegend";
import { ExtendedLayer } from "../layers/utils/layerTools";
import { colorTables } from "@emerson-eps/color-tables";

describe("Test Color Legend component", () => {
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
                    } as unknown as ExtendedLayer<unknown>
                }
                colorTables={colorTables}
                horizontal={false}
                invertLegend={false}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
