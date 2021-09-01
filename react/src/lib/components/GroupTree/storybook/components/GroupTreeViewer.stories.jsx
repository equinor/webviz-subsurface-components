import React from "react";
import DataProvider from "../../components/DataLoader";
import GroupTreeViewer from "../../components/GroupTreeViewer";

export default {
    component: GroupTreeViewer,
    title: "GroupTree/Components/GroupTreeViewer",
    argTypes: {
        id: {
            description:
                "The ID of this component, used to identify dash components in callbacks. The ID needs to be unique across all of the components in an app.",
        },
        data: {
            description: "Array of JSON objects describing group tree data.",
        },
    },
};

const Template = (args) => {
    return (
        <DataProvider id={args.id} data={args.data}>
            <GroupTreeViewer />
        </DataProvider>
    );
};

export const Default = Template.bind({});
Default.args = {
    id: "grouptree",
    data: require("../../../../../demo/example-data/group-tree.json"),
};
