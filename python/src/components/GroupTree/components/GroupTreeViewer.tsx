/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import { styled } from "@mui/material/styles";
import React, { useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import type { GroupTreeState } from "../redux/store";
import { DataContext } from "./DataLoader";
import SettingsBar from "./Settings/SettingsBar";

import {
    GroupTreePlot,
    EdgeMetadata,
    NodeMetadata,
} from "@webviz/group-tree-plot";

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
    edgeMetadataList: EdgeMetadata[];
    nodeMetadataList: NodeMetadata[];
    currentDateTimeChangedCallBack: (currentDateTime: string) => void;
}

const GroupTreeViewer: React.FC<GroupTreeViewerProps> = (
    props: GroupTreeViewerProps
) => {
    const data = useContext(DataContext);

    const currentDateTime = useSelector(
        (state: GroupTreeState) => state.ui.currentDateTime
    );
    const currentFlowRateKey = useSelector(
        (state: GroupTreeState) => state.ui.currentFlowRate
    );
    const currentNodeKey = useSelector(
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
                edgeMetadataList={props.edgeMetadataList}
                nodeMetadataList={props.nodeMetadataList}
            />
            <GroupTreePlot
                id={props.id}
                datedTrees={data}
                edgeMetadataList={props.edgeMetadataList}
                nodeMetadataList={props.nodeMetadataList}
                selectedEdgeKey={currentFlowRateKey}
                selectedNodeKey={currentNodeKey}
                selectedDateTime={currentDateTime}
            />
        </Root>
    );
};

GroupTreeViewer.displayName = "GroupTreeViewer";
export default GroupTreeViewer;
