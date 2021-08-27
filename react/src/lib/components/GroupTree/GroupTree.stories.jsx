import React from "react";
import GroupTree from "./GroupTree";

export default {
    component: GroupTree,
    title: "GroupTree/Demo",
};

const Template = (args) => {
    return <GroupTree id={args.id} data={args.data} />;
};

export const Default = Template.bind({});
Default.args = {
    id: "grouptree",
    data: require("../../../demo/example-data/group-tree.json"),
};
