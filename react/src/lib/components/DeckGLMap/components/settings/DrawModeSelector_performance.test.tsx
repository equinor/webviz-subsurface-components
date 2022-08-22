import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React, { Profiler } from "react";
import { Wrapper } from "../../test/TestWrapper";
import DrawModeSelector from "./DrawModeSelector";
import { obj } from "../../../../performanceUtility/onRenderFunction";
import * as core from "@actions/core";
import logTimes from "../../../../performanceUtility/onRenderFunction";

describe("Test draw-mode menu", () => {
    it("performance test", () => {
        render(
            Wrapper({
                children: (
                    <Profiler id="Native Select" onRender={logTimes}>
                        <DrawModeSelector
                            layerId="drawing-layer"
                            label="Draw mode"
                            value="drawLineString"
                        />
                    </Profiler>
                ),
            })
        );
        if (obj.perf_metrics[0][2] > 100) {
            core.warning(
                "DrawModeSelector Component in '/components/DeckGLMap/components/settings/' seems to have performance issues. Actual render time:" +
                    obj.perf_metrics[0][2] +
                    " Expected render time: 100"
            );
        }
        // expect(obj.perf_metrics[0][2]).toBeLessThan(340);
    });
});
