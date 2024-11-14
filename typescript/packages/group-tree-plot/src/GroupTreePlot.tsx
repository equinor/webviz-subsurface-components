import React from "react";

import type { DatedTree, EdgeMetadata, NodeMetadata } from "./types";
import TreePlotRenderer from "./TreePlotRenderer/index";
import { useDataAssembler } from "./DataAssembler/DataAssemblerHooks";
import { PlotErrorOverlay } from "./PlotErrorOverlay";
import type DataAssembler from "./DataAssembler/DataAssembler";

export interface GroupTreePlotProps {
    id: string;
    edgeMetadataList: EdgeMetadata[];
    nodeMetadataList: NodeMetadata[];
    datedTrees: DatedTree[];
    selectedEdgeKey: string;
    selectedNodeKey: string;
    selectedDateTime: string;
}

// TODO: Should be dynamic instead
const CONTAINER_HEIGHT = 700;
const CONTAINER_WIDTH = 938;

export const GroupTreePlot: React.FC<GroupTreePlotProps> = (
    props: GroupTreePlotProps
) => {
    let errorMsg = "";
    const [prevDate, setPrevDate] = React.useState<string | null>(null);

    // Storing a copy of the last successfully assembeled data to render when data becomes invalid
    const lastValidDataAssembler = React.useRef<DataAssembler | null>(null);

    const dataAssembler = useDataAssembler(
        props.datedTrees,
        props.edgeMetadataList,
        props.nodeMetadataList
    );

    if (dataAssembler === null) {
        errorMsg = "Invalid data for assembler";
    } else if (dataAssembler !== lastValidDataAssembler.current) {
        lastValidDataAssembler.current = dataAssembler;
    }

    if (dataAssembler && props.selectedDateTime !== prevDate) {
        try {
            dataAssembler.setActiveDate(props.selectedDateTime);
            setPrevDate(props.selectedDateTime);
        } catch (error) {
            errorMsg = (error as Error).message;
        }
    }

    return (
        <svg height={CONTAINER_HEIGHT} width={CONTAINER_WIDTH}>
            {lastValidDataAssembler.current && (
                <TreePlotRenderer
                    dataAssembler={lastValidDataAssembler.current}
                    primaryEdgeProperty={props.selectedEdgeKey}
                    primaryNodeProperty={props.selectedNodeKey}
                    width={CONTAINER_WIDTH}
                    height={CONTAINER_HEIGHT}
                />
            )}

            {errorMsg && <PlotErrorOverlay message={errorMsg} />}
        </svg>
    );
};

GroupTreePlot.displayName = "GroupTreePlot";
