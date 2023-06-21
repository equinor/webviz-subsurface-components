import React from "react";
import DataProvider from "../../components/DataLoader";
import GroupTreeViewer from "../../components/GroupTreeViewer";

const edge_options = [
    { name: "waterrate", label: "Water Rate" },
    { name: "oilrate", label: "Oil Rate" },
    { name: "gasrate", label: "Gas Rate" },
    { name: "waterinjrate", label: "Water Injection Rate" },
    { name: "gasinjrate", label: "Gas Injection Rate" },
];

const node_options = [
    { name: "pressure", label: "Pressure" },
    { name: "bhp", label: "Bottom Hole Pressure" },
];

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
            <GroupTreeViewer
                id={args.id}
                edge_options={edge_options}
                node_options={node_options}
            />
        </DataProvider>
    );
};

export const Default = Template.bind({});
Default.args = {
    id: "grouptree",
    data: require("../../../../../demo/example-data/group-tree.json"),
    edge_options,
    node_options,
};
