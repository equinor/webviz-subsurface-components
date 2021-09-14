import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "jest-styled-components";
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import FlowRateSelector from "./FlowRateSelector";

const edge_options = [
    { name: "waterrate", label: "Water Rate" },
    { name: "oilrate", label: "Oil Rate" },
    { name: "gasrate", label: "Gas Rate" },
    { name: "waterinjrate", label: "Water Injection Rate" },
    { name: "gasinjrate", label: "Gas Injection Rate" },
];

describe("Test flow rate selector component", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({
                children: <FlowRateSelector edge_options={edge_options} />,
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("select 'water rate' option to dispatch redux action", async () => {
        render(
            Wrapper({
                children: <FlowRateSelector edge_options={edge_options} />,
            })
        );
        userEvent.selectOptions(
            screen.getByRole("combobox", { name: "Flow Rate" }),
            "waterrate"
        );
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toHaveBeenCalledWith({
            payload: "waterrate",
            type: "ui/updateCurrentFlowRate",
        });
    });
});
