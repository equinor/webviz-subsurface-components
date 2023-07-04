import React, { useCallback, useState } from "react";
import { Data, DataInfos } from "../redux/types";
import DataProvider from "./DataLoader";
import GroupTreeViewer from "./GroupTreeViewer";

//TODO schema check
interface Props {
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
    edge_options: DataInfos;
    node_options: DataInfos;
}

const GroupTreeComponent: React.FC<Props> = React.memo(
    ({ id, data, edge_options, node_options }: Props) => {
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
                edge_options={edge_options}
                node_options={node_options}
                initial_index={index}
            >
                <GroupTreeViewer
                    id={id}
                    edge_options={edge_options}
                    node_options={node_options}
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
