import React from "react";
import { GroupTreePlot } from "../GroupTreePlot";

import type { EdgeMetadata, NodeMetadata } from "../types";

import {
    exampleDatedTrees,
    exampleDates,
} from "../../example-data/dated-trees";

/**
 * Storybook test for the group tree plot component
 */
export default {
    component: GroupTreePlot,
    title: "GroupTreePlot/Demo",
    argTypes: {
        selectedDateTime: {
            description:
                "The selected `string` must be a date time present in one of the `dates` arrays in an element of the`datedTrees`-prop.",
        },
        selectedEdgeKey: {
            description:
                "The selection `string` must be an edge key present in one of the `edge_data` objects in the `tree`-prop of an element in `datedTrees`-prop.",
        },
        selectedNodeKey: {
            description:
                "The selected `string` must be a node key present in one of the `node_data` objects in the `tree`-prop of an element in `datedTrees`-prop.",
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
    selectedDateTime: exampleDates[0],
    selectedEdgeKey: "waterrate",
    selectedNodeKey: "pressure",
};
