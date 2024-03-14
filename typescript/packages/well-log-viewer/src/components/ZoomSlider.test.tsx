/* eslint-disable @typescript-eslint/no-var-requires */
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import ZoomSlider from "./ZoomSlider";

window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));

describe("Test zoom slider", () => {
    it("snapshot test", () => {
        const { container } = render(
            <ZoomSlider
                onChange={function (): void {
                    throw new Error("Function not implemented.");
                }}
                value={0}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
