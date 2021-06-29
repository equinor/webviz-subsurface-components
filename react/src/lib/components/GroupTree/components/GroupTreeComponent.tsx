import React from "react";
import { Data } from "../redux/types";
import DataProvider from "./DataLoader";
import GroupTreeViewer from "./GroupTreeViewer";

//TODO schema check
interface Props {
    id: string;
    data: Data;
}

const GroupTreeComponent: React.FC<Props> = React.memo(
    ({ id, data }: Props) => {
        return (
            <DataProvider id={id} data={data}>
                <GroupTreeViewer />
            </DataProvider>
        );
    }
);

GroupTreeComponent.displayName = "GroupTreeComponent";
export default GroupTreeComponent;
