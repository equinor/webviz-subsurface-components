import React from "react";

import type {
    DatedTree,
    EdgeData,
    EdgeMetadata,
    NodeData,
    NodeMetadata,
} from "../types";
import DataAssembler, { AssemblerEvent } from "./DataAssembler";

export function useDataAssembler(
    datedTrees: DatedTree[],
    edgeMetadataList: EdgeMetadata[],
    nodeMetadataList: NodeMetadata[]
): DataAssembler {
    const dataAssembler = React.useMemo(() => {
        const assembler = new DataAssembler(
            datedTrees,
            edgeMetadataList,
            nodeMetadataList
        );

        return assembler;
    }, [datedTrees, edgeMetadataList, nodeMetadataList]);

    return dataAssembler;
}

function makeStoreSubscriberFunc(
    assembler: DataAssembler,
    changeEvent: AssemblerEvent
) {
    return (onStoreChange: () => void) => {
        const unsub = assembler.registerEventListener(
            changeEvent,
            onStoreChange
        );

        return () => unsub;
    };
}

export function useDataAssemblerTree(assembler: DataAssembler) {
    return React.useSyncExternalStore(
        makeStoreSubscriberFunc(assembler, AssemblerEvent.TREE_CHANGED),
        () => assembler.getActiveTree()
    );
}

export function useDataAssemblerPropertyValue(
    assembler: DataAssembler,
    data: NodeData | EdgeData,
    property: string
): number | null {
    return React.useSyncExternalStore(
        makeStoreSubscriberFunc(assembler, AssemblerEvent.DATE_CHANGED),
        () => assembler.getPropertyValue(data, property)
    );
}

export function useDataAssemblerTooltip(
    assembler: DataAssembler,
    data: NodeData | EdgeData
): string {
    return React.useSyncExternalStore(
        makeStoreSubscriberFunc(assembler, AssemblerEvent.DATE_CHANGED),
        () => assembler.getTooltip(data)
    );
}
