import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import Scroller from "./Scroller";

window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));

describe("Test scroller", () => {
    it("snapshot test", () => {
        const { container } = render(
            <Scroller onScroll={(x: number, y: number) => [x, y]} />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
