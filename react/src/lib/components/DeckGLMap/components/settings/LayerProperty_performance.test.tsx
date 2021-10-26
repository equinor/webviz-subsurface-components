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
        if (obj.plottable[2] > 100) {
            core.warning(
                "Layer Property Component in '/components/DeckGLMap/components/settings/' seems to have performance issues. Actual render time:" +
                    obj.plottable[2] +
                    " Expected render time: 100"
            );
        }
        expect(obj.plottable[2]).toBeLessThan(100);
    });
});
