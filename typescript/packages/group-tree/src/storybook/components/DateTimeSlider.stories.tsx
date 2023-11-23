import React from "react";
import DataProvider from "../../components/DataLoader";
import DateTimeSlider from "../../components/Settings/DateTimeSlider";

export default {
    component: DateTimeSlider,
    title: "GroupTree/Components/Settings/DateTimeSlider",
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
        <DataProvider
            id={args.id}
            data={args.data}
            edgeMetadataList={[]}
            nodeMetadataList={[]}
            initialIndices={{ treeIndex: 0, dateIndex: 0 }}
        >
            <DateTimeSlider />
        </DataProvider>
    );
};

export const Default = Template.bind({});
Default.args = {
    id: "grouptree",
    data: require("../../../../../../example-data/group-tree.json"),
};
