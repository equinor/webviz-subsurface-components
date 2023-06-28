import React from "react";
import GroupTreeComponent from "../components/GroupTreeComponent";

export default {
    component: GroupTreeComponent,
    title: "GroupTree",
};

const edge_options = [
    { name: "waterrate", label: "Water Rate", unit: "m3/s" },
    { name: "oilrate", label: "Oil Rate", unit: "m3/s" },
    { name: "gasrate", label: "Gas Rate", unit: "m3/s" },
    { name: "waterinjrate", label: "Water Injection Rate", unit: "m3/s" },
    { name: "gasinjrate", label: "Gas Injection Rate", unit: "m3/s" },
];

const node_options = [
    { name: "pressure", label: "Pressure", unit: "Bar" },
    { name: "bhp", label: "Bottom Hole Pressure", unit: "N/m2" },
];

const Template = (args) => {
    return <GroupTreeComponent {...args} />;
};

export const Default = Template.bind({});
Default.args = {
    id: "grouptree",
    data: require("../../../../../example-data/group-tree.json"),
    edge_options: edge_options,
    node_options: node_options,
};
