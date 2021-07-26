import { render, screen } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import userEvent from "@testing-library/user-event";
import { testStore, Wrapper } from "../../test/TestWrapper";
import DrawModeSelector from "./DrawModeSelector";

describe("test hide zero completions switch", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({ children: <DrawModeSelector layerId="colormap-layer"/> })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("click to dispatch redux action", async () => {
        const container = render(<DrawModeSelector layerId="colormap-layer" />, {
            wrapper: Wrapper,
        });
        expect(screen.getByText(/draw mode/i)).toBeVisible()
        expect(screen.getByRole('combobox', {  name: /draw mode/i})).toHaveDisplayValue('drawLineString')
        userEvent.selectOptions(
            screen.getByRole("combobox", { name: /draw mode/i }),
            "view"
        );
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toBeCalledWith({
            payload: ["colormap-layer", "view"],
            type: "spec/updateDrawingMode",
        });
    });
});
