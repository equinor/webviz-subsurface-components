import React from "react";

import "jest";
import { describe, expect, it } from "@jest/globals";

import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import "jest-styled-components";

import InfoPanel from "./InfoPanel";

describe("Test Info panel", () => {
    it("snapshot test", () => {
        const { container } = render(
            <InfoPanel
                header="Readout"
                infos={[
                    {
                        color: "black",
                        value: 2366,
                        type: "line",
                        iTrack: -1,
                        trackId: "",
                        name: "DVER",
                        units: "M",
                    },
                    {
                        color: "",
                        value: Number.NaN,
                        type: "separator",
                        iTrack: -1,
                        trackId: "",
                    },
                    {
                        color: "orange",
                        value: 8.5,
                        type: "line",
                        iTrack: -1,
                        trackId: "",
                        name: "BDIA",
                        units: "INCH",
                    },
                ]}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("snapshot test when value is infinity", () => {
        const { container } = render(
            <InfoPanel
                header="Readout"
                infos={[
                    {
                        color: "black",
                        value: Infinity,
                        type: "line",
                        iTrack: -1,
                        trackId: "",
                        name: "DVER",
                        units: "M",
                    },
                ]}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
