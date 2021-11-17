import { render, screen } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import userEvent from "@testing-library/user-event";
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
                        track_id: "",
                        name: "DVER",
                        units: "M",
                    },
                    {
                        color: "",
                        value: Number.NaN,
                        type: "separator",
                        track_id: "",
                    },
                    {
                        color: "orange",
                        value: 8.5,
                        type: "line",
                        track_id: 11,
                    },
                    {
                        color: "green",
                        value: 17.57,
                        type: "line",
                        track_id: 9,
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
                        track_id: "",
                        name: "DVER",
                        units: "M",
                    },
                    {
                        color: "",
                        value: Number.NaN,
                        type: "separator",
                        track_id: "",
                    },
                    {
                        color: "orange",
                        value: 8.5,
                        type: "line",
                        track_id: 11,
                    },
                    {
                        color: "green",
                        value: 17.57,
                        type: "line",
                        track_id: 9,
                    },
                ]}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
