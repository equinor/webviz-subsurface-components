/* eslint-disable @typescript-eslint/no-var-requires */
import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import ColorLegend from "./ColorLegend";
import { Layer } from "deck.gl";
import {
    getLayersInViewport,
    getLayersWithDefaultProps,
} from "../layers/utils/layerTools";
import { ContinuousLegend } from "@emerson-eps/color-tables";
import { DiscreteColorLegend } from "@emerson-eps/color-tables";

const example_color_table = require("../../../../demo/example-data/color-tables.json");
const exampleData = require("../../../../demo/example-data/deckgl-map.json");
const layers = getLayersWithDefaultProps(exampleData[0].layers);
const views = exampleData[0].views;

describe("Test Color Legend", () => {
    it("snapshot test continous legend", () => {
        const { container } = render(
            <ContinuousLegend
                min={0}
                max={0.35}
                dataObjectName={"Wells / PORO"}
                position={[16, 10]}
                name={"PORO"}
                horizontal={false}
                colorName={"Rainbow"}
                colorTables={example_color_table}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("snapshot test with discrete pattern", () => {
        const legendProps = {
            title: "",
            name: "string",
            colorName: "string",
            discrete: true,
            metadata: {
                Above_BCU: [[255, 13, 186, 255], 0],
                ABOVE: [[255, 64, 53, 255], 1],
                H12: [[247, 255, 164, 255], 2],
                BELOW: [[73, 255, 35, 255], 14],
                H3: [[255, 144, 1, 255], 11],
            },
            valueRange: [0, 0.35],
        };
        const { container } = legendProps.discrete
            ? render(
                  <DiscreteColorLegend
                      discreteData={legendProps.metadata}
                      dataObjectName={legendProps.title}
                      position={[16, 10]}
                      colorName={legendProps.colorName}
                      colorTables={example_color_table}
                      horizontal={false}
                  />
              )
            : render(<div />);
        expect(container.firstChild).toMatchSnapshot();
    });
});
