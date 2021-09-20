import React, { PropsWithChildren, useMemo } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { createReduxStore } from "../redux/store";
import { Data, EdgeOptions, UISettings } from "../redux/types";

interface Props {
    id: string;
    data: Data;
    edge_options: EdgeOptions;
}

export const DataContext = React.createContext<Data>([]);

const DataProvider: React.FC<Props> = ({
    children,
    id,
    data,
    edge_options,
}: PropsWithChildren<Props>) => {
    const preloadedState = useMemo(() => {
        const initialDateTime = data.length > 0 ? data[0].dates[0] : "";
        const initialFlowRate =
            edge_options.length > 0 ? edge_options[0].name : "";

        return {
            id: id,
            ui: {
                currentDateTime: initialDateTime,
                currentFlowRate: initialFlowRate,
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
