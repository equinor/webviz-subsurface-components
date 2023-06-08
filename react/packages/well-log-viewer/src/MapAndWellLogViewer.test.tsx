/* eslint-disable @typescript-eslint/no-var-requires */
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { MapAndWellLogViewer } from "./MapAndWellLogViewer";

window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));

describe("Map and Well Log Viewer", () => {
    it("snapshot test", () => {
        const { container } = render(
            <MapAndWellLogViewer
                id={""}
                bounds={[432205, 6475078, 437720, 6481113]}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
