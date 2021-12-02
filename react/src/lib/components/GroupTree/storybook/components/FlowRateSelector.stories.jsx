import React from "react";
import DataProvider from "../../components/DataLoader";
import FlowRateSelector from "../../components/Settings/FlowRateSelector";

const edge_options = [
    { name: "waterrate", label: "Water Rate" },
    { name: "oilrate", label: "Oil Rate" },
    { name: "gasrate", label: "Gas Rate" },
    { name: "waterinjrate", label: "Water Injection Rate" },
    { name: "gasinjrate", label: "Gas Injection Rate" },
];

export default {
    component: FlowRateSelector,
    title: "GroupTree/Components/Settings/FLowRateSelector",
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
            <FlowRateSelector edge_options={edge_options} />
        </DataProvider>
    );
};

export const Default = Template.bind({});
Default.args = {
    id: "grouptree",
    data: require("../../../../../demo/example-data/group-tree.json"),
    edge_options,
};
