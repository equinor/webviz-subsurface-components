/* eslint-disable @typescript-eslint/no-var-requires */
import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import ColorLegends from "./ColorLegends";
import { Layer } from "deck.gl";
import {
    getLayersInViewport,
    getLayersWithDefaultProps,
} from "../layers/utils/layerTools";

const exampleData = require("../../../../demo/example-data/deckgl-map.json");
const layers = getLayersWithDefaultProps(exampleData[0].layers);

describe("Test Color Legend", () => {
    it("snapshot test", () => {
        const { container } = render(
            <ColorLegends
                layers={
                    getLayersInViewport(layers, [
                        "geojson-line-layer",
                        "geojson-layer",
                        "text-layer",
                    ]) as Layer<unknown>[]
                }
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
