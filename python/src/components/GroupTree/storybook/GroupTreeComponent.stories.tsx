import React from "react";
import GroupTreeComponent from "../components/GroupTreeComponent";

import { EdgeMetadata, NodeMetadata } from "@webviz/group-tree-plot/src/types";

export default {
    component: GroupTreeComponent,
    title: "GroupTree",
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
    { key: "wmctl", label: "Missing label" },
];

const Template = (args) => {
    return <GroupTreeComponent {...args} />;
};

export const Default = Template.bind({});
Default.args = {
    id: "grouptree",
    data: require("../../../../../example-data/group-tree.json"),
    edgeMetadataList: edgeMetadataList,
    nodeMetadataList: nodeMetadataList,
};
