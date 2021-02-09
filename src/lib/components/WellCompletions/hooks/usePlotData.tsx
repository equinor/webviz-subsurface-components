import { isEqual } from "lodash";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { WellCompletionsState } from "../redux/store";
import { getRegexPredicate } from "../utils/regex";
import { dataInTimeIndexRange } from "./dataUtil";
export const usePlotData = () => {
    //Redux states
    const data = useSelector(
        (state: WellCompletionsState) => state.dataModel.data
    );
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
    //Memo
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
    const wellNameRegex = useMemo(() => getRegexPredicate(wellSearchText), [
        wellSearchText,
    ]);
    const filteredWells = useMemo(
        () => (data ? data.wells.filter(well => wellNameRegex(well.name)) : []),
        [data, wellNameRegex]
    );

    return useMemo(
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
};
