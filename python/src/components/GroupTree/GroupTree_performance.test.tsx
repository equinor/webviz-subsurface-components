import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React, { Profiler } from "react";
import * as core from "@actions/core";
import { GroupTree } from "./GroupTree";
import { Wrapper } from "./test/TestWrapper";
import logTimes, { obj } from "./test/performanceMetrics";

import exampleData from "../../../../example-data/group-tree.json";

describe("Test GroupTree perfomance", () => {
    it("initial performance test", () => {
        render(
            Wrapper({
                children: (
                    <Profiler id="Native Select" onRender={logTimes}>
                        <GroupTree
                            id={"grouptree"}
                            data={exampleData}
                            edge_metadata_list={[
                                {
                                    name: "waterrate",
                                    label: "Water Rate",
                                },
                                {
                                    name: "oilrate",
                                    label: "Oil Rate",
                                },
                                {
                                    name: "gasrate",
                                    label: "Gas Rate",
                                },
                                {
                                    name: "waterinjrate",
                                    label: "Water Injection Rate",
                                },
                                {
                                    name: "gasinjrate",
                                    label: "Gas Injection Rate",
                                },
                            ]}
                            node_metadata_list={[
                                {
                                    name: "pressure",
                                    label: "Pressure",
                                },
                                {
                                    name: "bhp",
                                    label: "Bottom Hole Pressure",
                                },
                            ]}
                        />
                    </Profiler>
                ),
            })
        );
    });

    const no_of_renders = obj.perf_metrics.length;
    if (no_of_renders > 2) {
        core.setFailed(
            "GroupTree Component seems to have performance issues. Actual number of renders = " +
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
                "GroupTree Component seems to have performance issues. Actual render time:" +
                    obj.perf_metrics[i][2] +
                    " Expected render time - less than 100ms"
            );
        }
    }
});
