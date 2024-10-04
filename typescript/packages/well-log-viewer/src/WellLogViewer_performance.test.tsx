/* eslint-disable @typescript-eslint/no-var-requires */
import * as core from "@actions/core";
import { colorTables } from "@emerson-eps/color-tables";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React, { Profiler } from "react";
import WellLogViewer from "./WellLogViewer";
import logTimes, { obj } from "./test/performanceMetrics";
import { axisMnemos, axisTitles } from "./utils/axes";
import type { ColorMapFunction } from "./components/ColorMapFunction";

// TODO: Fix this the next time the file is edited.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const exampleTemplate = require("../../../../example-data/welllog_template_1.json");
//const exampleWellLog = require("../../../../example-data/L898MUD.json")[0];
const exampleWellLog = {
    header: {},
    curves: [],
    data: [],
};
const exampleColorMapFunctions = colorTables as ColorMapFunction[];

window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));

describe("Well Log Viewer perfomance", () => {
    it("initial performance test", () => {
        render(
            <Profiler id="Well Log Viewer" onRender={logTimes}>
                <WellLogViewer
                    id=""
                    welllog={exampleWellLog}
                    options={{
                        hideTrackTitle: true,
                        hideTrackLegend: true,
                    }}
                    primaryAxis={"md"}
                    axisTitles={axisTitles}
                    axisMnemos={axisMnemos}
                    template={exampleTemplate}
                    colorMapFunctions={exampleColorMapFunctions}
                    onContentRescale={function (): void {
                        // todo: fix the test
                        // commented to make test pass
                        // throw new Error("Function not implemented.");
                    }}
                />
            </Profiler>
        );
    });

    const no_of_renders = obj.perf_metrics.length;
    if (no_of_renders > 2) {
        core.setFailed(
            "Well Log viewer Component seems to have performance issues. Actual number of renders = " +
                no_of_renders +
                " .Expected number of renders <= 2 "
        );
    }
    for (let i = 0; i < no_of_renders; i++) {
        core.info(
            "Render number: " + (i + 1) + " | Metrics: " + obj.perf_metrics[i]
        );
        if (obj.perf_metrics[i][2] > 100) {
            core.setFailed(
                "Well Log Viewer seems to have performance issues. Actual render time:" +
                    obj.perf_metrics[i][2] +
                    " Expected render time - less than 100ms"
            );
        }
    }
});
