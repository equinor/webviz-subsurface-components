/* eslint-disable @typescript-eslint/no-var-requires */
import { jest } from "@jest/globals";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React, { Profiler } from "react";
import DeckGLMap from "./DeckGLMap";
import * as core from "@actions/core";
import logTimes, { obj } from "../../../performanceUtility/onRenderFunction";

//const mapData = require("../../../../demo/example-data/deckgl-map.json");
//const colorTablesData = require("../../../../demo/example-data/color-tables.json");
//const templateData = require("../../../../demo/example-data/welllayer_template.json");

jest.mock("@emerson-eps/color-tables");

describe("Test Map component performance", () => {
    it("renders without any edited-data", () => {
        render(
            <Profiler id="Default Map" onRender={logTimes}>
                <DeckGLMap />
            </Profiler>
        );
        const no_of_renders = obj.perf_metrics.length;
        if (no_of_renders > 4) {
            core.setFailed(
                "Map Component in '/components/DeckGLMap/components/' seems to have performance issues. Actual number of renders = " +
                    no_of_renders +
                    " .Expected number of renders <= 4 "
            );
        }
        for (let i = 0; i < no_of_renders; i++) {
            core.info(
                "Render number: " +
                    (i + 1) +
                    " | Metrics: " +
                    obj.perf_metrics[i]
            );
            if (obj.perf_metrics[i][2] > 100) {
                core.setFailed(
                    "Map Component in '/components/DeckGLMap/components/' seems to have performance issues. Actual render time:" +
                        obj.perf_metrics[i][2] +
                        " Expected render time - less than 100ms"
                );
            }
        }
        //expect(obj.perf_metrics[0][2]).toBeLessThan(100);
    });
});
