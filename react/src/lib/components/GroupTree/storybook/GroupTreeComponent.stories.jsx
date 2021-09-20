import React from "react";
import GroupTreeComponent from "../components/GroupTreeComponent";

export default {
    component: GroupTreeComponent,
    title: "GroupTree",
};

// These are going in the drop down list.
const options = [
    { name: "waterrate", label: "Water Rate" },
    { name: "oilrate", label: "Oil Rate" },
    { name: "gasrate", label: "Gas Rate" },
    { name: "waterinjrate", label: "Water Injection Rate" },
    { name: "gasinjrate", label: "Gas Injection Rate" },
];

const Template = (args) => {
    return <GroupTreeComponent {...args} />;
};

export const Default = Template.bind({});
Default.args = {
    id: "grouptree",
    data: require("../../../../demo/example-data/group-tree.json"),
    edge_options: options,
};
