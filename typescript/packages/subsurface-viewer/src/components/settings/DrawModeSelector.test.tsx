import { render, screen } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import userEvent from "@testing-library/user-event";
import { EmptyWrapper } from "../../test/TestWrapper";
import DrawModeSelector from "./DrawModeSelector";

describe("Test draw-mode menu", () => {
    it("snapshot test", () => {
        const { container } = render(
            EmptyWrapper({
                children: (
                    <DrawModeSelector
                        layerId="drawing-layer"
                        label="Draw mode"
                        value="drawLineString"
                    />
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("select option to dispatch redux action", async () => {
        const user = userEvent.setup();
        render(
            EmptyWrapper({
                children: (
                    <DrawModeSelector
                        layerId="drawing-layer"
                        label="Draw mode"
                        value="drawLineString"
                    />
                ),
            })
        );
        expect(screen.getByLabelText(/draw mode/i)).toBeVisible();
        expect(
            screen.getByRole("combobox", { name: /draw mode/i })
        ).toHaveDisplayValue("Create polyline");
        await user.selectOptions(
            screen.getByRole("combobox", { name: /draw mode/i }),
            "View"
        );
    });
});
