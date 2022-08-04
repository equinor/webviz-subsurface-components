/* eslint-disable @typescript-eslint/no-var-requires */
import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import ColorLegend from "./ColorLegend";
import { Layer } from "deck.gl";
import {
    ExtendedLayer,
    getLayersInViewport,
    getLayersWithDefaultProps,
} from "../layers/utils/layerTools";

const exampleData = require("../../../../demo/example-data/deckgl-map.json");
const layers = getLayersWithDefaultProps(exampleData[0].layers);
const colorTables = require("@emerson-eps/color-tables/dist/component/color-tables.json");

describe("Test Color Legend component", () => {
    it("snapshot test", () => {
        const { container } = render(
            <ColorLegend
                layer={[] as unknown as ExtendedLayer<unknown>}
                colorTables={colorTables}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
