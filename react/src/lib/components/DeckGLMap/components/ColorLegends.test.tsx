/* eslint-disable @typescript-eslint/no-var-requires */
import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import ColorLegends from "./ColorLegends";
import { Layer } from "@deck.gl/core/typed";
import {
    getLayersInViewport,
    getLayersWithDefaultProps,
} from "../layers/utils/layerTools";

const exampleData = require("../../../../demo/example-data/deckgl-map.json");
const layers = getLayersWithDefaultProps(exampleData[0].layers);
import { colorTables } from "@emerson-eps/color-tables";

describe("Test Color Legend", () => {
    it("snapshot test", () => {
        const { container } = render(
            <ColorLegends
                layers={
                    getLayersInViewport(layers, [
                        "colormap-layer",
                        "wells-layer",
                    ]) as Layer<unknown>[]
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
                    ]) as Layer<unknown>[]
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
