import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "jest-styled-components";
import React from "react";
import { testStore, Wrapper, EmptyWrapper } from "../../test/TestWrapper";
import Settings from "./Settings";
import "@testing-library/jest-dom";

describe("test settings component", () => {
    it("snapshot test", () => {
        const { container } = render(Wrapper({ children: <Settings /> }));
        expect(container.firstChild).toMatchSnapshot();
    });
    it("test empty MapState", () => {
        const { container } = render(EmptyWrapper({ children: <Settings /> }));
        expect(container.firstChild).toMatchSnapshot();
    });
    xit("test when wells layer turned off", async () => {
        const { rerender } = render(Wrapper({ children: <Settings /> }));
        const wells_settings_button = screen.getAllByRole("button", {
            name: "",
        })[1];
        const select_layers_button = screen.getAllByRole("button", {
            name: "",
        })[4];
        userEvent.click(select_layers_button);
        const wells_toggle_button = screen.getByRole("checkbox", {
            name: "Wells",
        });
        userEvent.click(wells_toggle_button);
        expect(testStore.dispatch).toHaveBeenCalledTimes(2);
        expect(testStore.dispatch).toHaveBeenNthCalledWith(1, {
            payload: ["drawing-layer", "mode", "view"],
            type: "spec/updateLayerProp",
        });
        expect(testStore.dispatch).toHaveBeenNthCalledWith(2, {
            payload: ["wells-layer", false],
            type: "spec/updateVisibleLayers",
        });
        rerender(Wrapper({ children: <Settings /> }));
        await waitFor(() =>
            expect(wells_settings_button).not.toBeInTheDocument()
        );
    });
});
