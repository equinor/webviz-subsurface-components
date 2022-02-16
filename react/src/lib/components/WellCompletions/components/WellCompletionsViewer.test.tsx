import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { Wrapper } from "../test/TestWrapper";
import WellCompletionsViewer from "./WellCompletionsViewer";

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

describe("Test Well Completions viewer", () => {
    it("snapshot test with data", () => {
        const { container } = render(
            Wrapper({ children: <WellCompletionsViewer /> })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
