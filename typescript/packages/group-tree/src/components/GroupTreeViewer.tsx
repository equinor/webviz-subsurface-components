/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import { styled } from "@mui/material/styles";
import React, { useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import type { GroupTreeState } from "../redux/store";
import { DataContext } from "./DataLoader";
import "./group-tree-plot/src/Plot/dynamic_tree.css";
import SettingsBar from "./Settings/SettingsBar";
import { GroupTreePlot } from "./group-tree-plot/src/GroupTreePlot";
import { EdgeInfo, NodeInfo } from "./group-tree-plot/src/types";

const PREFIX = "GroupTreeViewer";

const classes = {
    root: `${PREFIX}-root`,
};

const Root = styled("div")(() => ({
    [`&.${classes.root}`]: {
        position: "relative",
        display: "flex",
        flex: 1,
        flexDirection: "column",
        height: "90%",
    },
}));

interface GroupTreeViewerProps {
    id: string;
    edgeOptions: EdgeInfo[];
    nodeOptions: NodeInfo[];
    currentDateTimeChangedCallBack: (currentDateTime: string) => void;
}

const GroupTreeViewer: React.FC<GroupTreeViewerProps> = (
    props: GroupTreeViewerProps
) => {
    const data = useContext(DataContext);

    const currentDateTime = useSelector(
        (state: GroupTreeState) => state.ui.currentDateTime
    );
    const currentFlowRate = useSelector(
        (state: GroupTreeState) => state.ui.currentFlowRate
    );
    const currentNodeInfo = useSelector(
        (state: GroupTreeState) => state.ui.currentNodeInfo
    );

    useEffect(() => {
        if (typeof props.currentDateTimeChangedCallBack !== "undefined") {
            props.currentDateTimeChangedCallBack(currentDateTime);
        }
    }, [currentDateTime]);

    return (
        <Root className={classes.root}>
            <SettingsBar
                edge_options={props.edgeOptions}
                node_options={props.nodeOptions}
            />
            <GroupTreePlot
                id={props.id}
                datedTrees={data}
                edgeInfoList={props.edgeOptions}
                nodeInfoList={props.nodeOptions}
                selectedEdgeName={currentFlowRate}
                selectedNodeName={currentNodeInfo}
                selectedDateTime={currentDateTime}
            />
        </Root>
    );
};

GroupTreeViewer.displayName = "GroupTreeViewer";
export default GroupTreeViewer;
