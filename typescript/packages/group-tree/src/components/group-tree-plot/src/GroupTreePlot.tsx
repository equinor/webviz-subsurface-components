import React from "react";

import GroupTree from "./Plot/group_tree";
import { DatedTrees, EdgeInfo, NodeInfo } from "./types";
import { cloneDeep, isEqual } from "lodash";

interface GroupTreePlotProps {
    id: string;
    edgeInfoList: EdgeInfo[];
    nodeInfoList: NodeInfo[];
    datedTrees: DatedTrees;
    selectedEdgeName: string;
    selectedNodeName: string;
    selectedDateTime: string;
}

export const GroupTreePlot: React.FC<GroupTreePlotProps> = (
    props: GroupTreePlotProps
) => {
    const divRef = React.useRef<HTMLDivElement>(null);
    const groupTreeRef = React.useRef<GroupTree>();

    const [isMounted, setIsMounted] = React.useState<boolean>(false);

    const [prevId, setPrevId] = React.useState<string | null>(null);
    const [prevDatedTrees, setPrevDatedTrees] =
        React.useState<DatedTrees | null>(null);

    const [prevSelectedEdgeName, setPrevSelectedEdgeName] =
        React.useState<string>(props.selectedEdgeName);
    const [prevSelectedNodeName, setPrevSelectedNodeName] =
        React.useState<string>(props.selectedNodeName);
    const [prevSelectedDateTime, setPrevSelectedDateTime] =
        React.useState<string>(props.selectedDateTime);

    React.useEffect(function initialRender() {
        setIsMounted(true);
    }, []);

    if (
        isMounted &&
        // divRef.current &&
        (!isEqual(prevDatedTrees, props.datedTrees) || prevId !== props.id)
    ) {
        setPrevDatedTrees(props.datedTrees);
        setPrevId(props.id);
        groupTreeRef.current = new GroupTree(
            props.id,
            cloneDeep(props.datedTrees),
            props.selectedEdgeName,
            props.selectedNodeName,
            props.selectedDateTime,
            props.edgeInfoList,
            props.nodeInfoList
        );
    }

    if (prevSelectedEdgeName !== props.selectedEdgeName) {
        setPrevSelectedEdgeName(props.selectedEdgeName);
        if (!groupTreeRef.current) return;

        groupTreeRef.current.flowrate = props.selectedEdgeName;
    }

    if (prevSelectedNodeName !== props.selectedNodeName) {
        setPrevSelectedNodeName(props.selectedNodeName);
        if (!groupTreeRef.current) return;

        groupTreeRef.current.nodeinfo = props.selectedNodeName;
    }

    if (prevSelectedDateTime !== props.selectedDateTime) {
        setPrevSelectedDateTime(props.selectedDateTime);
        if (!groupTreeRef.current) return;

        groupTreeRef.current.update(props.selectedDateTime);
    }

    return <div id={props.id} ref={divRef} />;
};
