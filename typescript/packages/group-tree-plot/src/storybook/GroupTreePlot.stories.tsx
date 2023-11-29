import React from "react";
import { GroupTreePlot } from "../GroupTreePlot";

import type { EdgeMetadata, NodeMetadata } from "../types";

import { exampleDatedTrees } from "../../example-data/dated-trees";

/**
 * Storybook test for the group tree plot component
 */
export default {
    component: GroupTreePlot,
    title: "GroupTreePlot/Demo",
    argTypes: {
        data: {
            control: {
                type: "object",
            },
        },
    },
};

const edgeMetadataList: EdgeMetadata[] = [
    { key: "waterrate", label: "Water Rate", unit: "m3/s" },
    { key: "oilrate", label: "Oil Rate", unit: "m3/s" },
    { key: "gasrate", label: "Gas Rate", unit: "m3/s" },
    { key: "waterinjrate", label: "Water Injection Rate", unit: "m3/s" },
    { key: "gasinjrate", label: "Gas Injection Rate", unit: "m3/s" },
];

const nodeMetadataList: NodeMetadata[] = [
    { key: "pressure", label: "Pressure", unit: "Bar" },
    { key: "bhp", label: "Bottom Hole Pressure", unit: "N/m2" },
    { key: "wmctl", label: "Missing label", unit: "Unknown unit" },
];

const Template = (args) => {
    return (
        <GroupTreePlot
            id={args.id}
            datedTrees={args.datedTrees}
            edgeMetadataList={args.edgeMetadataList}
            nodeMetadataList={args.nodeMetadataList}
            selectedDateTime={args.selectedDateTime}
            selectedEdgeKey={args.selectedEdgeKey}
            selectedNodeKey={args.selectedNodeKey}
        />
    );
};

export const Default = Template.bind({});
Default.args = {
    id: "grouptreeplot",
    datedTrees: exampleDatedTrees,
    edgeMetadataList: edgeMetadataList,
    nodeMetadataList: nodeMetadataList,
    selectedDateTime: "2018-02-01",
    selectedEdgeKey: "oilrate",
    selectedNodeKey: "pressure",
};
