import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import ColorLegend from "./ColorLegend";
import { testState } from "../test/testReduxState";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const example_color_table = require("../../../../demo/example-data/color-tables.json");
describe("Test Color Legend", () => {
    it("snapshot test", () => {
        const { container } = render(
            <ColorLegend
                layers={testState.layers}
                colorTables={example_color_table}
                visible={true}
                position={[16, 10]}
                horizontal={false}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
