/* eslint-disable @typescript-eslint/no-var-requires */
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React, { Profiler } from "react";
import * as core from "@actions/core";
import { Wrapper } from "../GroupTree/test/TestWrapper";
import WellLogViewer from "./WellLogViewer";
import logTimes, { obj } from "../../performanceUtility/onRenderFunction";
import { colorTables } from "@emerson-eps/color-tables";

const exampleTemplate = require("../../../demo/example-data/welllog_template_1.json");
//const exampleWellLog = require("../../../demo/example-data/L898MUD.json")[0];
const exampleWellLog = {
    header: {},
    curves: [],
    data: [],
};
const exampleColorTable = colorTables;

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
            Wrapper({
                children: (
                    <Profiler id="Well Log Viewer" onRender={logTimes}>
                        <WellLogViewer
                            id=""
                            welllog={exampleWellLog}
                            hideLegend={true}
                            hideTitles={true}
                            template={exampleTemplate}
                            colorTables={exampleColorTable}
                            onContentRescale={function (): void {
                                throw new Error("Function not implemented.");
                            }}
                        />
                    </Profiler>
                ),
            })
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
