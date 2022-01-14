import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { Wrapper } from "../test/TestWrapper";
import WellCompletionComponent from "./WellCompletionComponent";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const exampleData = require("../../../../demo/example-data/well-completions.json");

window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));

describe("Test Well Completion Component", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({
                children: (
                    <WellCompletionComponent id={""} data={exampleData} />
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("snapshot test with incorrect version number", () => {
        const { container } = render(
            Wrapper({
                children: (
                    <WellCompletionComponent
                        id={""}
                        data={{
                            version: "",
                            units: {
                                kh: {
                                    unit: "",
                                    decimalPlaces: 2,
                                },
                            },
                            stratigraphy: [],
                            wells: [],
                            timeSteps: [],
                        }}
                    />
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
