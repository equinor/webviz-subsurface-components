import React from "react";
import DataProvider from "../../components/DataLoader";
import FlowRateSelector from "../../components/Settings/FlowRateSelector";

import { EdgeMetadata } from "../../components/group-tree-plot/src/types";

const edgeMetadataList: EdgeMetadata[] = [
    { key: "waterrate", label: "Water Rate" },
    { key: "oilrate", label: "Oil Rate" },
    { key: "gasrate", label: "Gas Rate" },
    { key: "waterinjrate", label: "Water Injection Rate" },
    { key: "gasinjrate", label: "Gas Injection Rate" },
];

export default {
    component: FlowRateSelector,
    title: "GroupTree/Components/Settings/FlowRateSelector",
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
            edgeMetadataList={edgeMetadataList}
            nodeMetadataList={[]}
            initialIndices={{ treeIndex: 0, dateIndex: 0 }}
        >
            <FlowRateSelector edgeMetadataList={edgeMetadataList} />
        </DataProvider>
    );
};

export const Default = Template.bind({});
Default.args = {
    id: "grouptree",
    data: require("../../../../../../example-data/group-tree.json"),
    edgeMetadataList,
};
