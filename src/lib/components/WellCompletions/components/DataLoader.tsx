import React, { PropsWithChildren, useMemo } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { createReduxStore } from "../redux/store";
import { Data, UISettings } from "../redux/types";
import { preprocessData } from "../utils/dataUtil";
import { DataContext } from "../WellCompletions";

interface Props {
    id: string;
    data: Data;
}

const DataProvider: React.FC<Props> = ({
    children,
    id,
    data,
}: PropsWithChildren<Props>) => {
    const preloadedState = useMemo(() => {
        //Setup attributes
        const attributeKeys = new Set<string>();
        data.wells.forEach((well) =>
            Object.keys(well.attributes).forEach((key) =>
                attributeKeys.add(key)
            )
        );
        const timeIndexRange =
            data.timeSteps.length > 0 ? [0, data.timeSteps.length - 1] : [0, 0];
        return {
            id: id,
            ui: {
                timeIndexRange: timeIndexRange as [number, number],
                wellsPerPage: 25,
                currentPage: 1,
                rangeDisplayMode: "First Step",
                wellSearchText: "",
                filteredZones: data.stratigraphy.map((zone) => zone.name),
                hideZeroCompletions: false,
                sortBy: {},
                filterByAttributes: [],
            } as UISettings,
            attributes: { attributeKeys: Array.from(attributeKeys) },
        };
    }, [id, data]);

    const store = useMemo(() => createReduxStore(preloadedState), [
        preloadedState,
    ]);

    const preprocessedData = useMemo(() => preprocessData(data), [data]);

    return (
        <DataContext.Provider value={preprocessedData}>
            <ReduxProvider store={store}>{children}</ReduxProvider>
        </DataContext.Provider>
    );
};

export default DataProvider;
