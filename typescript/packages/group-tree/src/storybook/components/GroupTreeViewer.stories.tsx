import React from "react";
import DataProvider from "../../components/DataLoader";
import GroupTreeViewer from "../../components/GroupTreeViewer";

import {
    EdgeMetadata,
    NodeMetadata,
} from "../../components/group-tree-plot/src/types";

const edgeMetadataList: EdgeMetadata[] = [
    { key: "waterrate", label: "Water Rate" },
    { key: "oilrate", label: "Oil Rate" },
    { key: "gasrate", label: "Gas Rate" },
    { key: "waterinjrate", label: "Water Injection Rate" },
    { key: "gasinjrate", label: "Gas Injection Rate" },
];

const nodeMetadataList: NodeMetadata[] = [
    { key: "pressure", label: "Pressure" },
    { key: "bhp", label: "Bottom Hole Pressure" },
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
        <DataProvider
            id={args.id}
            data={args.data}
            edgeMetadataList={edgeMetadataList}
            nodeMetadataList={nodeMetadataList}
            initialIndices={{ treeIndex: 0, dateIndex: 0 }}
        >
            <GroupTreeViewer
                id={args.id}
                edgeMetadataList={edgeMetadataList}
                nodeMetadataList={nodeMetadataList}
                currentDateTimeChangedCallBack={() => {}}
            />
        </DataProvider>
    );
};

export const Default = Template.bind({});
Default.args = {
    id: "grouptree",
    data: require("../../../../../../example-data/group-tree.json"),
    edgeMetadataList,
    nodeMetadataList,
};
