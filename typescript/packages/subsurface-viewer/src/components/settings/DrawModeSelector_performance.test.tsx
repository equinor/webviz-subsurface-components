import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React, { Profiler } from "react";
import { EmptyWrapper } from "../../test/TestWrapper";
import DrawModeSelector from "./DrawModeSelector";
import * as core from "@actions/core";
import logTimes, { obj } from "../../test/performanceMetrics";

describe("Test draw-mode menu", () => {
    it("performance test", () => {
        render(
            EmptyWrapper({
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
                "DrawModeSelector Component in '/components/SubsurfaceViewer/components/settings/' seems to have performance issues. Actual render time:" +
                    obj.perf_metrics[0][2] +
                    " Expected render time: 100"
            );
        }
        // expect(obj.perf_metrics[0][2]).toBeLessThan(340);
    });
});
