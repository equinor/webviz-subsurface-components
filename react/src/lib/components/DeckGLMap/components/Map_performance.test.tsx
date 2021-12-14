/* eslint-disable @typescript-eslint/no-var-requires */
import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React, { Profiler } from "react";
import Map from "./Map";
import * as core from "@actions/core";
import logTimes, { obj } from "../../../performanceUtility/onRenderFunction";

const mapData = require("../../../../demo/example-data/deckgl-map.json");
const colorTablesData = require("../../../../demo/example-data/color-tables.json");
const templateData = require("../../../../demo/example-data/welllayer_template.json");

describe("Test Map component performance", () => {
    it("renders without any edited-data", () => {
        render(
            <Profiler id="Default Map" onRender={logTimes}>
                <Map
                    id={mapData[0].id}
                    coords={mapData[0].coords}
                    scale={mapData[0].scale}
                    legend={mapData[0].scale}
                    coordinateUnit={mapData[0].coordinateUnit}
                    resources={mapData[0].resources}
                    bounds={mapData[0].bounds}
                    zoom={mapData[0].zoom}
                    layers={mapData[0].layers}
                    editedData={mapData[0].editedData}
                    setEditedData={(data: Record<string, unknown>) => data}
                    template={[templateData[0]]}
                    colorTables={[colorTablesData[0]]}
                    view3D={false}
                />
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
