import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { Wrapper } from "../../test/TestWrapper";
import SettingsBar from "./SettingsBar";

const edge_options = [
    { name: "waterrate", label: "Water Rate" },
    { name: "oilrate", label: "Oil Rate" },
    { name: "gasrate", label: "Gas Rate" },
    { name: "waterinjrate", label: "Water Injection Rate" },
    { name: "gasinjrate", label: "Gas Injection Rate" },
];

describe("Test Settins Bar component", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({ children: <SettingsBar edge_options={edge_options} /> })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
