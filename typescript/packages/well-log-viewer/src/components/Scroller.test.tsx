import React from "react";

import "jest";
import { describe, expect, it, jest } from "@jest/globals";

import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import "jest-styled-components";

import Scroller from "./Scroller";

globalThis.ResizeObserver =
    globalThis.ResizeObserver ||
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
