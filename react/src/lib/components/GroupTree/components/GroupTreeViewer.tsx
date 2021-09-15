import { createStyles, makeStyles } from "@material-ui/core";
import { cloneDeep } from "lodash";
import React, { useContext, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { GroupTreeState } from "../redux/store";
import { DataContext } from "./DataLoader";
import "./Plot/dynamic_tree.css";
import GroupTree from "./Plot/group_tree";
import SettingsBar from "./Settings/SettingsBar";
import { EdgeOptions } from "../redux/types";

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
    edge_options: EdgeOptions;
}

const GroupTreeViewer: React.FC<Props> = ({ id, edge_options }: Props) => {
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
    const currentDataType = useSelector(
        (state: GroupTreeState) => state.ui.currentDataType
    );

    useEffect(() => {
        // Clear possible elements added from earlier updates.
        const node = document.getElementById(id);
        if (node) {
            node.innerHTML = "";
        }

        renderer.current = new GroupTree(
            id,
            cloneDeep(data),
            // XXX "oilrate",
            currentFlowRate,
            currentDateTime
        );
    }, [data]);

    useEffect(() => {
        if (!renderer.current) return;

        renderer.current.update(currentDateTime);
    }, [currentDateTime]);

    useEffect(() => {
        if (!renderer.current) return;
        renderer.current.flowrate =
            currentDataType === "simulated"
                ? currentFlowRate
                : currentFlowRate + "_h";
    }, [currentFlowRate, currentDataType]);

    return (
        <div className={classes.root}>
            <SettingsBar edge_options={edge_options} />
            <div id={id} ref={divRef} />
            {/* <GroupTreePlot root={root} currentFlowRate={currentFlowRate} /> */}
        </div>
    );
};

GroupTreeViewer.displayName = "GroupTreeViewer";
export default GroupTreeViewer;
