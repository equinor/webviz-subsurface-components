import { render, screen } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import userEvent from "@testing-library/user-event";
import { testStore, Wrapper } from "../../test/TestWrapper";
import DrawModeSelector from "./DrawModeSelector";

describe("Test draw-mode menu", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({ children: <DrawModeSelector layerId="drawing-layer" /> })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("select option to dispatch redux action", async () => {
        render(
            Wrapper({ children: <DrawModeSelector layerId="drawing-layer" /> })
        );
        expect(screen.getByLabelText(/draw mode/i)).toBeVisible();
        expect(
            screen.getByRole("combobox", { name: /draw mode/i })
        ).toHaveDisplayValue("drawLineString");
        userEvent.selectOptions(
            screen.getByRole("combobox", { name: /draw mode/i }),
            "view"
        );
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toBeCalledWith({
            payload: ["drawing-layer", "view"],
            type: "spec/updateDrawingMode",
        });
    });
});
