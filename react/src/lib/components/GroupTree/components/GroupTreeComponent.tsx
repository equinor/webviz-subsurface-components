import React from "react";
import { Data } from "../redux/types";
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
}

const GroupTreeComponent: React.FC<Props> = React.memo(
    ({ id, data }: Props) => {
        return (
            <DataProvider id={id} data={data}>
                <GroupTreeViewer id={id} />
            </DataProvider>
        );
    }
);

GroupTreeComponent.displayName = "GroupTreeComponent";
export default GroupTreeComponent;
