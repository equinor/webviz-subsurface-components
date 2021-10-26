import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import { Wrapper } from "../../test/TestWrapper";
import LayerProperty from "./LayerProperty";
import * as core from "@actions/core";
import { obj } from "../../../../performanceUtility/onRenderFunction";

describe("Test Layer Property", () => {
    it("snapshot test", () => {
        render(
            Wrapper({
                children: <LayerProperty layerId="drawing-layer" />,
            })
        );
        if (obj.plottable[2] > 1) {
            core.warning(
                "DrawModeSelector Component in '/components/DeckGLMap/components/settings/' seems to have performance issues. Actual render time:" +
                    obj.plottable[2] +
                    " Expected render time: 1.5"
            );
            core.setOutput("annotation_status", "annotation_present");
            // core.setOutput("Actual render time in ms", obj.plottable[2]);
            // core.setOutput("Expected render time in ms", "1");
        }
        expect(obj.plottable[2]).toBeLessThan(1);
    });
});
