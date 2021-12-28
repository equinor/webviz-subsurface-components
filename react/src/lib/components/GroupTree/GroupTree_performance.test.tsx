import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React, { Profiler } from "react";
import { Wrapper } from "../GroupTree/test/TestWrapper";
import GroupTree from "./GroupTree";
import logTimes, { obj } from "../../performanceUtility/onRenderFunction";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const exampleData = require("../../../demo/example-data/group-tree.json");

describe("Test GroupTree perfomance", () => {
    it("initial performance test", () => {
        render(
            Wrapper({
                children: (
                    <Profiler id="Native Select" onRender={logTimes}>
                        <GroupTree
                            id={"grouptree"}
                            data={exampleData}
                            edge_options={[
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
                            node_options={[
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

    expect(obj.perf_metrics[0][2]).toBeLessThan(100);
});
