import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { Wrapper } from "./../test/TestWrapper";
import GroupTreeComponent from "./GroupTreeComponent";

import exampleData from "../../../../../example-data/group-tree.json";

describe.skip("Test GroupTree Component", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({
                children: (
                    <GroupTreeComponent
                        id={"grouptree"}
                        data={JSON.parse(exampleData.toString())}
                        edgeMetadataList={[
                            {
                                key: "waterrate",
                                label: "Water Rate",
                            },
                            {
                                key: "oilrate",
                                label: "Oil Rate",
                            },
                            {
                                key: "gasrate",
                                label: "Gas Rate",
                            },
                            {
                                key: "waterinjrate",
                                label: "Water Injection Rate",
                            },
                            {
                                key: "gasinjrate",
                                label: "Gas Injection Rate",
                            },
                        ]}
                        nodeMetadataList={[
                            {
                                key: "pressure",
                                label: "Pressure",
                            },
                            {
                                key: "bhp",
                                label: "Bottom Hole Pressure",
                            },
                        ]}
                    />
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
