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

describe("Test Well Completions viewer", () => {
    it("snapshot test with data", () => {
        const { container } = render(
            Wrapper({ children: <WellCompletionsViewer /> })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
