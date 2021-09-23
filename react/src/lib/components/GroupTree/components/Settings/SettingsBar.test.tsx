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

const node_options = [
    { name: "pressure", label: "Pressure" },
    { name: "bhp", label: "Bottom Hole Pressure" },
];

describe("Test Settins Bar component", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({
                children: (
                    <SettingsBar
                        edge_options={edge_options}
                        node_options={node_options}
                    />
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
