import React from "react";
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
        return (
            <DataProvider
                id={id}
                data={data}
                edge_options={edge_options}
                node_options={node_options}
            >
                <GroupTreeViewer
                    id={id}
                    edge_options={edge_options}
                    node_options={node_options}
                />
            </DataProvider>
        );
    }
);

GroupTreeComponent.displayName = "GroupTreeComponent";
export default GroupTreeComponent;
