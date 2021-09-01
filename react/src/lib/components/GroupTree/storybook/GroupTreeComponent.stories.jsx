import React from "react";
import GroupTreeComponent from "../components/GroupTreeComponent";

export default {
    component: GroupTreeComponent,
    title: "GroupTree",
};

const Template = (args) => {
    return <GroupTreeComponent {...args} />;
};

export const Default = Template.bind({});
Default.args = {
    id: "grouptree",
    data: require("../../../../demo/example-data/group-tree.json"),
};
