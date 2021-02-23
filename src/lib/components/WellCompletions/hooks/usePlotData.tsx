import { isEqual } from "lodash";
import { useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import { WellCompletionsState } from "../redux/store";
import { SortDirection, SORT_BY_NAME, Well } from "../redux/types";
import { getRegexPredicate } from "../utils/regex";
import { DataContext } from "../WellCompletions";
import { dataInTimeIndexRange } from "./dataUtil";

const createSortFunction = (sortBy: Record<string, SortDirection>) => {
    return (a: Well, b: Well) => {
        for (const sort in sortBy) {
            const aAttribute =
                sort === SORT_BY_NAME ? a.name : a.attributes[sort];
            const bAttribute =
                sort === SORT_BY_NAME ? b.name : b.attributes[sort];
            if (aAttribute === bAttribute) continue;
            if (
                (sortBy[sort] === "Ascending" && aAttribute < bAttribute) ||
                (sortBy[sort] === "Descending" && aAttribute > bAttribute) ||
                bAttribute === undefined
            )
                return -1;
            else return 1;
        }
        return 0;
    };
};
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
    const sortFunction = useMemo(() => createSortFunction(sortBy), [sortBy]);
    const sortedAndFilteredWells = useMemo(
        () =>
            data
                ? Array.from(data.wells as Well[])
                      .sort(sortFunction)
                      .filter(well => wellNameRegex(well.name))
                : [],
        [data, wellNameRegex, sortFunction]
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
    return useMemo(
        () =>
            dataInTimeIndexRange(
                filteredStratigraphy,
                sortedAndFilteredWells,
                timeIndexRange,
                rangeDisplayMode,
                hideZeroCompletions
            ),
        [
            filteredStratigraphy,
            sortedAndFilteredWells,
            timeIndexRange,
            rangeDisplayMode,
            hideZeroCompletions,
        ]
    );
};
