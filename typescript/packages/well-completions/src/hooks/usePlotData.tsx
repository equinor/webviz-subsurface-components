import { isEqual } from "lodash";
import { useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import { DataContext } from "../components/DataLoader";
import { WellCompletionsState } from "../redux/store";
import { Well, Zone } from "../redux/types";
import {
    computeDataToPlot,
    createAttributePredicate,
    findSubzones,
    // eslint-disable-next-line prettier/prettier
    PlotData
} from "../utils/dataUtil";
import { createSortFunction } from "../utils/sort";
import { getRegexPredicate } from "../utils/stringUtil";

export const usePlotData = (): PlotData => {
    //Redux states
    const data = useContext(DataContext);
    const timeIndexRange = useSelector(
        (state: WellCompletionsState) => state.ui.timeIndexRange,
        isEqual
    ) as [number, number];
    const timeAggregation = useSelector(
        (state: WellCompletionsState) => state.ui.timeAggregation
    );
    const hideZeroCompletions = useSelector(
        (state: WellCompletionsState) => state.ui.hideZeroCompletions
    );
    const filteredZones = useSelector(
        (state: WellCompletionsState) => state.ui.filteredZones
    );
    const wellSearchText = useSelector(
        (state: WellCompletionsState) => state.ui.wellSearchText
    );
    const filterByAttributes = useSelector(
        (state: WellCompletionsState) => state.ui.filterByAttributes
    );
    const sortBy = useSelector(
        (state: WellCompletionsState) => state.ui.sortBy
    );
    //Memo
    const wellNameRegex = useMemo(
        () => getRegexPredicate(wellSearchText),
        [wellSearchText]
    );
    const wellAttributePredicate = useMemo(
        () => createAttributePredicate(filterByAttributes),
        [filterByAttributes]
    );
    const filteredWells = useMemo(
        () =>
            data
                ? Array.from(data.wells as Well[]).filter(
                      (well) =>
                          wellNameRegex(well.name) &&
                          wellAttributePredicate(well)
                  )
                : [],
        [data, wellNameRegex, wellAttributePredicate]
    );
    const filteredSubzones = useMemo(() => {
        const allSubzones: Zone[] = [];
        const filteredZoneSet = new Set(filteredZones);
        data.stratigraphy.forEach((zone) => findSubzones(zone, allSubzones));
        return allSubzones.filter((zone) => filteredZoneSet.has(zone.name));
    }, [data, filteredZones]);

    // Compute data to plot by applying time range and other settings
    const dataToPlot = useMemo(
        () =>
            computeDataToPlot(
                filteredSubzones,
                filteredWells,
                timeIndexRange,
                timeAggregation,
                hideZeroCompletions
            ),
        [
            filteredSubzones,
            filteredWells,
            timeIndexRange,
            timeAggregation,
            hideZeroCompletions,
        ]
    );
    // Finally sort the wells
    const sortFunction = useMemo(() => createSortFunction(sortBy), [sortBy]);
    return useMemo(() => {
        return {
            stratigraphy: dataToPlot.stratigraphy,
            wells: Array.from(dataToPlot.wells).sort(sortFunction),
        } as PlotData;
    }, [dataToPlot, sortFunction]);
};
