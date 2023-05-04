import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { cloneDeep } from "lodash";
import React, { useContext, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { GroupTreeState } from "../redux/store";
import { DataContext } from "./DataLoader";
import "!style-loader!css-loader!./Plot/dynamic_tree.css";
import GroupTree from "./Plot/group_tree";
import SettingsBar from "./Settings/SettingsBar";
import { DataInfos } from "../redux/types";

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            position: "relative",
            display: "flex",
            flex: 1,
            flexDirection: "column",
            height: "90%",
        },
    })
);

interface Props {
    id: string;
    edge_options: DataInfos;
    node_options: DataInfos;
    currentDateTimeChangedCallBack: (currentDateTime: string) => void;
}

const GroupTreeViewer: React.FC<Props> = ({
    id,
    edge_options,
    node_options,
    currentDateTimeChangedCallBack,
}: Props) => {
    const classes = useStyles();
    const divRef = useRef<HTMLDivElement>(null);
    const data = useContext(DataContext);

    const renderer = useRef<GroupTree>();

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
        renderer.current = new GroupTree(
            id,
            cloneDeep(data),
            currentFlowRate,
            currentNodeInfo,
            currentDateTime,
            edge_options,
            node_options
        );
    }, [data]);

    useEffect(() => {
        if (!renderer.current) return;

        renderer.current.update(currentDateTime);

        if (typeof currentDateTimeChangedCallBack !== "undefined") {
            currentDateTimeChangedCallBack(currentDateTime);
        }
    }, [currentDateTime]);

    useEffect(() => {
        if (!renderer.current) return;
        renderer.current.flowrate = currentFlowRate;
    }, [currentFlowRate]);

    useEffect(() => {
        if (!renderer.current) return;
        renderer.current.nodeinfo = currentNodeInfo;
    }, [currentNodeInfo]);

    return (
        <div className={classes.root}>
            <SettingsBar
                edge_options={edge_options}
                node_options={node_options}
            />
            <div id={id} ref={divRef} />
            {/* <GroupTreePlot root={root} currentFlowRate={currentFlowRate} /> */}
        </div>
    );
};

GroupTreeViewer.displayName = "GroupTreeViewer";
export default GroupTreeViewer;
