import React from "react";

import GroupTreeAssembler from "./GroupTreeAssembler/groupTreeAssembler";
import type { DatedTree, EdgeMetadata, NodeMetadata } from "./types";
import { isEqual } from "lodash";

export interface GroupTreePlotProps {
    id: string;
    edgeMetadataList: EdgeMetadata[];
    nodeMetadataList: NodeMetadata[];
    datedTrees: DatedTree[];
    selectedEdgeKey: string;
    selectedNodeKey: string;
    selectedDateTime: string;
}

export const GroupTreePlot: React.FC<GroupTreePlotProps> = (
    props: GroupTreePlotProps
) => {
    const divRef = React.useRef<HTMLDivElement>(null);
    const groupTreeAssemblerRef = React.useRef<GroupTreeAssembler>();

    // State to ensure divRef is defined before creating GroupTree
    const [isMounted, setIsMounted] = React.useState<boolean>(false);

    // Remove when typescript version is implemented using ref
    const [prevId, setPrevId] = React.useState<string | null>(null);

    const [prevDatedTrees, setPrevDatedTrees] = React.useState<
        DatedTree[] | null
    >(null);

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
        divRef.current &&
        (!isEqual(prevDatedTrees, props.datedTrees) ||
            prevId !== divRef.current.id)
    ) {
        setPrevDatedTrees(props.datedTrees);
        setPrevId(divRef.current.id);
        groupTreeAssemblerRef.current = new GroupTreeAssembler(
            divRef.current.id,
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
        if (groupTreeAssemblerRef.current) {
            groupTreeAssemblerRef.current.flowrate = props.selectedEdgeKey;
        }
    }

    if (prevSelectedNodeKey !== props.selectedNodeKey) {
        setPrevSelectedNodeKey(props.selectedNodeKey);
        if (groupTreeAssemblerRef.current) {
            groupTreeAssemblerRef.current.nodeinfo = props.selectedNodeKey;
        }
    }

    if (prevSelectedDateTime !== props.selectedDateTime) {
        setPrevSelectedDateTime(props.selectedDateTime);
        if (groupTreeAssemblerRef.current) {
            groupTreeAssemblerRef.current.update(props.selectedDateTime);
        }
    }

    return <div id={props.id} ref={divRef} />;
};

GroupTreePlot.displayName = "GroupTreePlot";
