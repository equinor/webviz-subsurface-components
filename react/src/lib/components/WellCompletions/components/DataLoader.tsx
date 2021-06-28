import React, { PropsWithChildren, useMemo } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { createReduxStore } from "../redux/store";
import { Data, UISettings, Zone } from "../redux/types";
import { findSubzones, preprocessData } from "../utils/dataUtil";

interface Props {
    id: string;
    data: Data;
}
const defaultData = {
    version: "",
    units: {
        kh: {
            unit: "",
            decimalPlaces: 2,
        },
    },
    stratigraphy: [],
    wells: [],
    timeSteps: [],
};
export const DataContext = React.createContext<Data>(defaultData);
/**
 * A data loading layer to ready the input data and redux store
 */
const DataProvider: React.FC<Props> = ({
    children,
    id,
    data,
}: PropsWithChildren<Props>) => {
    const allSubzones = useMemo(() => {
        const subzones: Zone[] = [];
        data.stratigraphy.forEach((zone) => findSubzones(zone, subzones));
        return subzones.map((zone) => zone.name);
    }, [data.stratigraphy]);

    const preloadedState = useMemo(() => {
        //Setup attributes
        const attributeKeys = new Set<string>();
        data.wells.forEach((well) =>
            Object.keys(well.attributes).forEach((key) =>
                attributeKeys.add(key)
            )
        );
        return {
            id: id,
            ui: {
                timeIndexRange: [0, 0] as [number, number],
                wellsPerPage: 25,
                currentPage: 1,
                timeAggregation: "None",
                isDrawerOpen: false,
                wellSearchText: "",
                filteredZones: allSubzones,
                hideZeroCompletions: false,
                sortBy: {},
                filterByAttributes: [],
            } as UISettings,
            attributes: { attributeKeys: Array.from(attributeKeys) },
        };
    }, [id, data.wells, allSubzones]);

    const store = useMemo(
        () => createReduxStore(preloadedState),
        [preloadedState]
    );

    const preprocessedData = useMemo(
        () => preprocessData(allSubzones, data),
        [allSubzones, data]
    );

    return (
        <DataContext.Provider value={preprocessedData}>
            <ReduxProvider store={store}>{children}</ReduxProvider>
        </DataContext.Provider>
    );
};

export default DataProvider;
