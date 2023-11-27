import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { Wrapper } from "../test/TestWrapper";
import GroupTreeViewer from "./GroupTreeViewer";

describe.skip("Test GroupTreeViewer", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({
                children: (
                    <GroupTreeViewer
                        id={"grouptree"}
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
