import { isEqual } from "lodash";
import { useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import { WellCompletionsState } from "../redux/store";
import { Well } from "../redux/types";
import { dataInTimeIndexRange, PlotData } from "../utils/dataUtil";
import { getRegexPredicate } from "../utils/regex";
import { createSortFunction } from "../utils/sort";
import { DataContext } from "../WellCompletions";

export const usePlotData = () => {
    //Redux states
    const data = useContext(DataContext);
    const timeIndexRange = useSelector(
        (state: WellCompletionsState) => state.ui.timeIndexRange,
        isEqual
    ) as [number, number];
    const rangeDisplayMode = useSelector(
        (state: WellCompletionsState) => state.ui.rangeDisplayMode
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
    const sortBy = useSelector(
        (state: WellCompletionsState) => state.ui.sortBy
    );
    //Memo
    const wellNameRegex = useMemo(() => getRegexPredicate(wellSearchText), [
        wellSearchText,
    ]);
    const filteredWells = useMemo(
        () =>
            data
                ? Array.from(data.wells as Well[]).filter(well =>
                      wellNameRegex(well.name)
                  )
                : [],
        [data, wellNameRegex]
    );
    const filteredStratigraphy = useMemo(
        () =>
            data
                ? data.stratigraphy.filter(
                      zone =>
                          !filteredZones || filteredZones.includes(zone.name)
                  )
                : [],
        [data, filteredZones]
    );

    const plotDataInTimeRange = useMemo(
        () =>
            dataInTimeIndexRange(
                filteredStratigraphy,
                filteredWells,
                timeIndexRange,
                rangeDisplayMode,
                hideZeroCompletions
            ),
        [
            filteredStratigraphy,
            filteredWells,
            timeIndexRange,
            rangeDisplayMode,
            hideZeroCompletions,
        ]
    );
    const sortFunction = useMemo(() => createSortFunction(sortBy), [sortBy]);
    return useMemo(() => {
        return {
            stratigraphy: plotDataInTimeRange.stratigraphy,
            wells: Array.from(plotDataInTimeRange.wells).sort(sortFunction),
        } as PlotData;
    }, [plotDataInTimeRange, sortFunction]);
};
