import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React, { Profiler } from "react";
import * as core from "@actions/core";
import { Wrapper } from "../test/TestWrapper";
import WellCompletionComponent from "./WellCompletionComponent";
import logTimes, { obj } from "../../../performanceUtility/onRenderFunction";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const exampleData = require("../../../../demo/example-data/well-completions.json");

window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));

describe("Test Well Completion Component Performance", () => {
    it("performance test", () => {
        render(
            Wrapper({
                children: (
                    <Profiler
                        id="Well Completion Component"
                        onRender={logTimes}
                    >
                        <WellCompletionComponent id={""} data={exampleData} />
                    </Profiler>
                ),
            })
        );

        const no_of_renders = obj.perf_metrics.length;
        if (no_of_renders > 3) {
            core.setFailed(
                "Well Completion Component seems to have performance issues. Actual number of renders = " +
                    no_of_renders +
                    " .Expected number of renders <= 3 "
            );
        }
        for (let i = 0; i < no_of_renders; i++) {
            core.info(
                "Render number: " +
                    (i + 1) +
                    " | Metrics: " +
                    obj.perf_metrics[i]
            );
            if (obj.perf_metrics[i][2] > 300) {
                core.setFailed(
                    "Well Completion Component seems to have performance issues. Actual render time:" +
                        obj.perf_metrics[i][2] +
                        " Expected render time - less than 300ms"
                );
            }
        }
    });
});
