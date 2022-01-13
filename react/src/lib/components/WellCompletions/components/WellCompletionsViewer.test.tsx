import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { testStore, Wrapper } from "../test/TestWrapper";
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
    it("snapshot test without data", () => {
        const { container } = render(<WellCompletionsViewer />);
        expect(container.firstChild).toMatchSnapshot();
    });
});
