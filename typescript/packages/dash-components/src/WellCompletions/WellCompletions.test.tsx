import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { Wrapper } from "./test/TestWrapper";
import { WellCompletions } from "./WellCompletions";
import { Data } from "./redux/types";

import exampleData from "./example-data/well-completions.json";

window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));

/**
a random UUID is generated every time a tooltip is rendered, 
which changes Jest snapshots every time they're run.
Below snippet will replace the random class names with
generic class name like "t00000000-0000-4000-8000-000000000000"
 */
jest.mock("crypto", () => ({
    randomBytes: (num: number) => new Array(num).fill(0),
}));

describe("Test Well Completion Component", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({
                children: (
                    <WellCompletions
                        id={""}
                        data={exampleData as unknown as Data}
                    />
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("snapshot test with incorrect version number", () => {
        const { container } = render(
            Wrapper({
                children: (
                    <WellCompletions
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
