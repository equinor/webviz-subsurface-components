import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "jest-styled-components";
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import FlowRateSelector from "./FlowRateSelector";

describe("Test flow rate selector component", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({ children: <FlowRateSelector /> })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("select 'water rate' option to dispatch redux action", async () => {
        render(Wrapper({ children: <FlowRateSelector /> }));
        userEvent.selectOptions(
            screen.getByRole("combobox", { name: /flow rate/i }),
            "Water Rate"
        );
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toHaveBeenCalledWith({
            payload: "waterrate",
            type: "ui/updateCurrentFlowRate",
        });
    });
});
