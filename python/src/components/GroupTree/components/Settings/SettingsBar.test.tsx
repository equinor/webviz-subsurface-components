import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { Wrapper } from "../../test/TestWrapper";
import SettingsBar from "./SettingsBar";

import { EdgeMetadata, NodeMetadata } from "@webviz/group-tree-plot";

const edgeMetadataList: EdgeMetadata[] = [
    { key: "waterrate", label: "Water Rate" },
    { key: "oilrate", label: "Oil Rate" },
    { key: "gasrate", label: "Gas Rate" },
    { key: "waterinjrate", label: "Water Injection Rate" },
    { key: "gasinjrate", label: "Gas Injection Rate" },
];

const nodeMetadataList: NodeMetadata[] = [
    { key: "pressure", label: "Pressure" },
    { key: "bhp", label: "Bottom Hole Pressure" },
];

describe("Test Settins Bar component", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({
                children: (
                    <SettingsBar
                        edgeMetadataList={edgeMetadataList}
                        nodeMetadataList={nodeMetadataList}
                    />
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
