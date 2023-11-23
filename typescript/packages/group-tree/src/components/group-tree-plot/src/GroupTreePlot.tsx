import React from "react";

import GroupTree from "./Plot/group_tree";
import { DatedTrees, EdgeMetadata, NodeMetadata } from "./types";
import { isEqual } from "lodash";

interface GroupTreePlotProps {
    id: string;
    edgeMetadataList: EdgeMetadata[];
    nodeMetadataList: NodeMetadata[];
    datedTrees: DatedTrees;
    selectedEdgeKey: string;
    selectedNodeKey: string;
    selectedDateTime: string;
}

export const GroupTreePlot: React.FC<GroupTreePlotProps> = (
    props: GroupTreePlotProps
) => {
    const divRef = React.useRef<HTMLDivElement>(null);
    const groupTreeRef = React.useRef<GroupTree>();

    // State to ensure divRef is defined before creating GroupTree
    const [isMounted, setIsMounted] = React.useState<boolean>(false);

    // Remove when typescript version is implemented using ref
    const [prevId, setPrevId] = React.useState<string | null>(null);

    const [prevDatedTrees, setPrevDatedTrees] =
        React.useState<DatedTrees | null>(null);

    const [prevSelectedEdgeKey, setPrevSelectedEdgeKey] =
        React.useState<string>(props.selectedEdgeKey);
    const [prevSelectedNodeKey, setPrevSelectedNodeKey] =
        React.useState<string>(props.selectedNodeKey);
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
            props.datedTrees,
            props.selectedEdgeKey,
            props.selectedNodeKey,
            props.selectedDateTime,
            props.edgeMetadataList,
            props.nodeMetadataList
        );
    }

    if (prevSelectedEdgeKey !== props.selectedEdgeKey) {
        setPrevSelectedEdgeKey(props.selectedEdgeKey);
        if (!groupTreeRef.current) return;

        groupTreeRef.current.flowrate = props.selectedEdgeKey;
    }

    if (prevSelectedNodeKey !== props.selectedNodeKey) {
        setPrevSelectedNodeKey(props.selectedNodeKey);
        if (!groupTreeRef.current) return;

        groupTreeRef.current.nodeinfo = props.selectedNodeKey;
    }

    if (prevSelectedDateTime !== props.selectedDateTime) {
        setPrevSelectedDateTime(props.selectedDateTime);
        if (!groupTreeRef.current) return;

        groupTreeRef.current.update(props.selectedDateTime);
    }

    return <div id={props.id} ref={divRef} />;
};
