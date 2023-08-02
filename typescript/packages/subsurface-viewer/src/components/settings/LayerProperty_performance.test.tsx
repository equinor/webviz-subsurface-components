import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React, { Profiler } from "react";
import { EmptyWrapper } from "../../test/TestWrapper";
import LayerProperty from "./LayerProperty";
import * as core from "@actions/core";
import logTimes, { obj } from "../../test/performanceMetrics";

import exampleData from "../../../../../../example-data/deckgl-map.json";

const layers: Record<string, unknown>[] = exampleData[0].layers;

describe("Test Layer Property", () => {
    it("performance test", () => {
        const drawing_layer = layers.find(
            (item) => item["@@type"] === "DrawingLayer"
        );
        drawing_layer &&
            render(
                EmptyWrapper({
                    children: (
                        <Profiler id="Layer properties" onRender={logTimes}>
                            <LayerProperty layer={drawing_layer} />
                        </Profiler>
                    ),
                })
            );
        if (obj.perf_metrics[0][2] > 100) {
            core.warning(
                "Layer Property Component in '/components/SubsurfaceViewer/components/settings/' seems to have performance issues. Actual render time:" +
                    obj.perf_metrics[0][2] +
                    " Expected render time: 200"
            );
        }
        // expect(obj.perf_metrics[0][2]).toBeLessThan(400);
    });
});
