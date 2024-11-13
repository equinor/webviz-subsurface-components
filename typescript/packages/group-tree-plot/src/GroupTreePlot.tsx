import React from "react";

import type { DatedTree, EdgeMetadata, NodeMetadata } from "./types";
import TreePlotRenderer from "./TreePlotRenderer/index";
import { useDataAssembler } from "./DataAssembler/DataAssemblerHooks";

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
    const [prevDate, setPrevDate] = React.useState<string | null>(null);

    const dataAssembler = useDataAssembler(
        props.datedTrees,
        props.edgeMetadataList,
        props.nodeMetadataList
    );

    if (props.selectedDateTime !== prevDate) {
        dataAssembler.setActiveDate(props.selectedDateTime);
        setPrevDate(props.selectedDateTime);
    }

    return (
        <TreePlotRenderer
            dataAssembler={dataAssembler}
            primaryEdgeProperty={props.selectedEdgeKey}
            primaryNodeProperty={props.selectedNodeKey}
            width={938}
            height={700}
        />
    );
};

GroupTreePlot.displayName = "GroupTreePlot";
