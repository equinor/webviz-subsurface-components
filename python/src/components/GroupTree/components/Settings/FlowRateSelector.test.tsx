import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "jest-styled-components";
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import FlowRateSelector from "./FlowRateSelector";

import { EdgeMetadata } from "@webviz/group-tree-plot";

const edgeMetadataList: EdgeMetadata[] = [
    { key: "waterrate", label: "Water Rate" },
    { key: "oilrate", label: "Oil Rate" },
    { key: "gasrate", label: "Gas Rate" },
    { key: "waterinjrate", label: "Water Injection Rate" },
    { key: "gasinjrate", label: "Gas Injection Rate" },
];
];

describe("Test flow rate selector component", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({
                children: <FlowRateSelector edgeMetadataList={edgeMetadataList} />,
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("select 'water rate' option to dispatch redux action", async () => {
        render(
            Wrapper({
                children: <FlowRateSelector edgeMetadataList={edgeMetadataList} />,
            })
        );
        userEvent.selectOptions(
            screen.getByRole("combobox", { name: "Flow Rate" }),
            "waterrate"
        );
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toHaveBeenCalledWith({
            payload: "waterrate",
            type: "ui/updateCurrentFlowRate",
        });
    });
});
