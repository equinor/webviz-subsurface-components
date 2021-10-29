import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React, { Profiler } from "react";
import { Wrapper } from "../../test/TestWrapper";
import LayerProperty from "./LayerProperty";
import * as core from "@actions/core";
import { obj } from "../../../../performanceUtility/onRenderFunction";
import logTimes from "../../../../performanceUtility/onRenderFunction";

describe("Test Layer Property", () => {
    it("performance test", () => {
        render(
            Wrapper({
                children: (
                    <Profiler id="Layer properties" onRender={logTimes}>
                        <LayerProperty layerId="drawing-layer" />
                    </Profiler>
                ),
            })
        );
        if (obj.perf_metrics[2] > 100) {
            core.warning(
                "Layer Property Component in '/components/DeckGLMap/components/settings/' seems to have performance issues. Actual render time:" +
                    obj.perf_metrics[2] +
                    " Expected render time: 100"
            );
        }
        expect(obj.perf_metrics[2]).toBeLessThan(100);
    });
});
