import React, { useCallback, useState } from "react";
import type { Data, DataInfos } from "../redux/types";
import DataProvider from "./DataLoader";
import GroupTreeViewer from "./GroupTreeViewer";

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
    data: Data;

    /**
     * Arrays of options. Used in drop down selectors.
     */
    edgeOptions: DataInfos;
    nodeOptions: DataInfos;
}

const GroupTreeComponent: React.FC<GroupTreeProps> = React.memo(
    ({ id, data, edgeOptions, nodeOptions }: GroupTreeProps) => {
        const [index, setIndex] = useState([0, 0] as [number, number]);

        const currentDateTimeChangedCallBack = useCallback(
            (currentDateTime: string) => {
                const current_tree_index = data.findIndex((e) => {
                    return e.dates.includes(currentDateTime);
                });
                const date_index =
                    data[current_tree_index].dates.indexOf(currentDateTime);

                setIndex([current_tree_index, date_index]);
            },
            [data]
        );

        return (
            <DataProvider
                id={id}
                data={data}
                edge_options={edgeOptions}
                node_options={nodeOptions}
                initial_index={index}
            >
                <GroupTreeViewer
                    id={id}
                    edge_options={edgeOptions}
                    node_options={nodeOptions}
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
