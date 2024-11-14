import React from "react";

import type {
    DatedTree,
    EdgeData,
    EdgeMetadata,
    NodeData,
    NodeMetadata,
} from "../types";
import DataAssembler from "./DataAssembler";

export function useDataAssembler(
    datedTrees: DatedTree[],
    edgeMetadataList: EdgeMetadata[],
    nodeMetadataList: NodeMetadata[]
): DataAssembler | null {
    const dataAssembler = React.useMemo(() => {
        if (datedTrees.length === 0) return null;

        const assembler = new DataAssembler(
            datedTrees,
            edgeMetadataList,
            nodeMetadataList
        );

        return assembler;
    }, [datedTrees, edgeMetadataList, nodeMetadataList]);

    return dataAssembler;
}

export function useDataAssemblerTree(assembler: DataAssembler) {
    return assembler.getActiveTree();
}

export function useDataAssemblerPropertyValue(
    assembler: DataAssembler,
    data: NodeData | EdgeData,
    property: string
): number | null {
    return assembler.getPropertyValue(data, property);
}

export function useDataAssemblerTooltip(
    assembler: DataAssembler,
    data: NodeData | EdgeData
): string {
    return assembler.getTooltip(data);
}
