import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { Wrapper } from "../test/TestWrapper";
import GroupTreeViewer from "./GroupTreeViewer";

describe("Test GroupTreeViewer", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({
                children: (
                    <GroupTreeViewer
                        id={"grouptree"}
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
                        currentDateTimeChangedCallBack={(
                            currentDateTime: string
                        ) => currentDateTime}
                    />
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
