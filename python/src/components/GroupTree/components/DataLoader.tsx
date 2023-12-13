/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import type { PropsWithChildren, ReactNode } from "react";
import React, { useMemo } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { createReduxStore } from "../redux/store";
import type { UISettings } from "../redux/types";
import type {
    DatedTree,
    EdgeMetadata,
    NodeMetadata,
} from "@webviz/group-tree-plot";

export type DateTreesIndices = {
    treeIndex: number;
    dateIndex: number;
};

interface DataProviderProps {
    id: string;
    data: DatedTree[];
    edgeMetadataList: EdgeMetadata[];
    nodeMetadataList: NodeMetadata[];
    initialIndices: DateTreesIndices;
    children: ReactNode;
}

export const DataContext = React.createContext<DatedTree[]>([]);

const DataProvider: React.FC<DataProviderProps> = (
    props: PropsWithChildren<DataProviderProps>
) => {
    const preloadedState = useMemo(() => {
        // Use "initialIndices" from previous data if it refers to a valid date otherwise use first date.
        const treeIdx = props.initialIndices.treeIndex;
        const dateIdx = props.initialIndices.dateIndex;
        const hasValidIndices =
            props.data.length > treeIdx &&
            props.data[treeIdx].dates.length > dateIdx;
        const initialDateTime = hasValidIndices
            ? props.data[treeIdx].dates[dateIdx]
            : props.data[0].dates[0];

        const initialFlowRate = props.edgeMetadataList[0]?.key ?? "";
        const initialNodeInfo = props.nodeMetadataList[0]?.key ?? "";

        return {
            id: props.id,
            ui: {
                currentDateTime: initialDateTime,
                currentFlowRate: initialFlowRate,
                currentNodeInfo: initialNodeInfo,
            } as UISettings,
        };
    }, [props.id, props.data]); // Shallow compare does not detect updated data? Will useMemo actually help?

    const store = useMemo(
        () => createReduxStore(preloadedState),
        [preloadedState]
    );

    return (
        <DataContext.Provider value={props.data}>
            <ReduxProvider store={store}>{props.children}</ReduxProvider>
        </DataContext.Provider>
    );
};

export default DataProvider;
