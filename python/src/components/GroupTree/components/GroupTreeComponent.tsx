import React, { useCallback, useState } from "react";

import DataProvider, { DateTreesIndices } from "./DataLoader";
import GroupTreeViewer from "./GroupTreeViewer";
import { DatedTree, EdgeMetadata, NodeMetadata } from "@webviz/group-tree-plot";

//TODO schema check
export interface GroupTreeProps {
    /**
     * The ID of this component, used to identify dash components
     * in callbacks. The ID needs to be unique across all of the
     * components in an app.
     */
    id: string;
    /**
     * Array of JSON objects describing group tree data.
     */
    data: DatedTree[];

    /**
     * Arrays of metadata. Used in drop down selectors and tree visualization.
     */
    edgeMetadataList: EdgeMetadata[];
    nodeMetadataList: NodeMetadata[];
}

const GroupTreeComponent: React.FC<GroupTreeProps> = React.memo(
    (props: GroupTreeProps) => {
        const [indices, setIndices] = useState<DateTreesIndices>({
            treeIndex: 0,
            dateIndex: 0,
        });

        const currentDateTimeChangedCallBack = useCallback(
            (currentDateTime: string) => {
                const newTreeIndex = props.data.findIndex((e) => {
                    return e.dates.includes(currentDateTime);
                });
                const newDateIndex =
                    props.data[newTreeIndex].dates.indexOf(currentDateTime);

                setIndices({
                    treeIndex: newTreeIndex,
                    dateIndex: newDateIndex,
                });
            },
            [props.data]
        );

        return (
            <DataProvider
                id={props.id}
                data={props.data}
                edgeMetadataList={props.edgeMetadataList}
                nodeMetadataList={props.nodeMetadataList}
                initialIndices={indices}
            >
                <GroupTreeViewer
                    id={props.id}
                    edgeMetadataList={props.edgeMetadataList}
                    nodeMetadataList={props.nodeMetadataList}
                    currentDateTimeChangedCallBack={
                        currentDateTimeChangedCallBack
                    }
                />
            </DataProvider>
        );
    }
);

GroupTreeComponent.displayName = "GroupTreeComponent";
export default GroupTreeComponent;
