export { WellCompletionsPlot } from "./WellCompletionsPlot";

export {
    AttributeTypePropType,
    SortWellsBy,
    SortWellsByEnumToStringMapping,
    SortDirection,
    UnitsPropType,
    WellInfoPropType,
    ZonePropTypes,
} from "./types/dataTypes";
export type {
    AttributeType,
    CompletionPlotData,
    PlotData,
    Units,
    WellInfo,
    WellPlotData,
    Zone,
} from "./types/dataTypes";
export { createWellNameRegexMatcher } from "./utility-lib/stringUtils";
export {
    extractSubzones,
    areCompletionsPlotDataValuesEqual,
    populateSubzonesArray,
} from "./utility-lib/dataTypeUtils";
export {
    createGetWellPlotDataCompareValueFunction,
    compareWellPlotDataValues,
    compareWellsBySortByAndDirection,
    createSortedWells,
    createSortedWellsFromSequence,
} from "./utility-lib/wellSortUtils";
