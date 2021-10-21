import { render, screen } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import userEvent from "@testing-library/user-event";
import { testStore, Wrapper } from "../../test/TestWrapper";
import DrawModeSelector from "./DrawModeSelector";
//import logToDataBase from "../../../../performanceUtility/logPerformanceData";
import { obj } from "../../../../performanceUtility/onRenderFunction";
import * as core from "@actions/core";

describe("Test draw-mode menu", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({
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
        //expect(obj.plottable[2]).toBeLessThan(10);
        if (obj.plottable[2] > 1) {
            core.warning(
                "DrawModeSelector Component in '/components/DeckGLMap/components/settings/' seems to have performance issues"
            );
            core.setOutput("annotation_status", "annotation_present");
        }
    });
    it("select option to dispatch redux action", async () => {
        render(
            Wrapper({
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
        userEvent.selectOptions(
            screen.getByRole("combobox", { name: /draw mode/i }),
            "View"
        );
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toBeCalledWith({
            payload: ["drawing-layer", "view"],
            type: "spec/updateDrawingMode",
        });
        console.log(obj.plottable);
        //expect(obj.plottable[2]).toBeLessThan(10);
        if (obj.plottable[2] > 100) {
            core.warning("Check the DrwaModeSelector test");
        }
    });
});
