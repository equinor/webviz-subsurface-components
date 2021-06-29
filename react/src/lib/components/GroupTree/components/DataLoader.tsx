import React, { PropsWithChildren, useMemo } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { createReduxStore } from "../redux/store";
import { Data, UISettings } from "../redux/types";

interface Props {
    id: string;
    data: Data;
}
export const DataContext = React.createContext<Data>({ iterations: {} });

const DataProvider: React.FC<Props> = ({
    children,
    id,
    data,
}: PropsWithChildren<Props>) => {
    const preloadedState = useMemo(() => {
        const iterations = Object.keys(data.iterations);
        const firstIteration = iterations.length > 0 ? iterations[0] : "";
        const dateTimes =
            firstIteration in data.iterations
                ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  Object.keys(data.iterations[firstIteration]!.trees)
                : [];
        const firstDateTime = dateTimes.length === 0 ? "" : dateTimes[0];
        return {
            id: id,
            ui: {
                currentIteration: firstIteration,
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
