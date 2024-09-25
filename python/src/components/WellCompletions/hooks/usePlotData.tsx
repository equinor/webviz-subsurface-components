import { isEqual } from "lodash";
import { useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import { DataContext } from "../components/DataLoader";
import type { WellCompletionsState } from "../redux/store";
import type { Well } from "../redux/types";
import { computeDataToPlot, createAttributePredicate } from "../utils/dataUtil";
import {
    createWellNameRegexMatcher,
    populateSubzonesArray,
} from "@webviz/well-completions-plot";
import type { PlotData, Zone } from "@webviz/well-completions-plot";
import { createSortFunction } from "../utils/sort";

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
    const wellNameRegexMatcher = useMemo(
        () => createWellNameRegexMatcher(wellSearchText),
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
                          wellNameRegexMatcher(well.name) &&
                          wellAttributePredicate(well)
                  )
                : [],
        [data, wellNameRegexMatcher, wellAttributePredicate]
    );
    const filteredSubzones = useMemo(() => {
        const allSubzones: Zone[] = [];
        for (const zone of data.stratigraphy) {
            populateSubzonesArray(zone, allSubzones);
        }

        const filteredZoneSet = new Set(filteredZones);
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
                hideZeroCompletions,
                data.units
            ),
        [
            filteredSubzones,
            filteredWells,
            timeIndexRange,
            timeAggregation,
            hideZeroCompletions,
            data.units,
        ]
    );
    // Finally sort the wells
    const sortFunction = useMemo(() => createSortFunction(sortBy), [sortBy]);
    return useMemo((): PlotData => {
        return {
            stratigraphy: dataToPlot.stratigraphy,
            wells: Array.from(dataToPlot.wells).sort(sortFunction),
            units: dataToPlot.units,
        };
    }, [dataToPlot, sortFunction]);
};
