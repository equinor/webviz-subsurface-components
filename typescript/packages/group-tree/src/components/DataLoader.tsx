/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import type { PropsWithChildren, ReactNode } from "react";
import React, { useMemo } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { createReduxStore } from "../redux/store";
import type { Data, DataInfos, UISettings } from "../redux/types";

interface Props {
    id: string;
    data: Data;
    edge_options: DataInfos;
    node_options: DataInfos;
    initial_index: [number, number];
    children: ReactNode;
}

export const DataContext = React.createContext<Data>([]);

const DataProvider: React.FC<Props> = ({
    children,
    id,
    data,
    edge_options,
    node_options,
    initial_index,
}: PropsWithChildren<Props>) => {
    const preloadedState = useMemo(() => {
        // Use "initial_index" from previous data if it refers to a valid date otherwise use first date.
        const idx1 = initial_index?.[0];
        const idx2 = initial_index?.[1];
        const initialDateTime =
            data.length > idx1 && data[idx1].dates.length > idx2
                ? data[idx1].dates[idx2]
                : data[0].dates[0];

        const initialFlowRate =
            edge_options?.length > 0 ? edge_options[0].name : "";

        const intialNodeInfo =
            node_options?.length > 0 ? node_options[0].name : "";

        return {
            id: id,
            ui: {
                currentDateTime: initialDateTime,
                currentFlowRate: initialFlowRate,
                currentNodeInfo: intialNodeInfo,
            } as UISettings,
        };
    }, [id, data]);

    const store = useMemo(
        () => createReduxStore(preloadedState),
        [preloadedState]
    );

    return (
        <DataContext.Provider value={data}>
            <ReduxProvider store={store}>{children}</ReduxProvider>
        </DataContext.Provider>
    );
};

export default DataProvider;
