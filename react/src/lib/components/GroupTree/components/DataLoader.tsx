import React, { PropsWithChildren, useMemo } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { createReduxStore } from "../redux/store";
import { Data, UISettings } from "../redux/types";

interface Props {
    id: string;
    data: Data;
}

export const DataContext = React.createContext<Data>([]);

const DataProvider: React.FC<Props> = ({
    children,
    id,
    data,
}: PropsWithChildren<Props>) => {
    const preloadedState = useMemo(() => {
        const firstDateTime = data.length > 0 ? data[0].dates[0] : "";

        return {
            id: id,
            ui: {
                currentDateTime: firstDateTime,
                currentFlowRate: "oilrate",
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
