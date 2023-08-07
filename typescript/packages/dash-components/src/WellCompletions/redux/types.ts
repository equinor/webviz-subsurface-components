import PropTypes from "prop-types";

import {
    AttributeTypePropType,
    SortDirection,
    Units,
    UnitsPropType,
    WellInfo,
    Zone,
    ZonePropTypes,
} from "../../../../well-completions-plot/src/types/dataTypes";

export interface Data {
    version: string;
    units: Units;
    stratigraphy: Zone[];
    wells: Well[];
    timeSteps: string[];
}

export interface Well extends WellInfo {
    completions: Record<string, Completions>;
}

export interface Completions {
    t: number[];
    open: number[];
    shut: number[];
    khMean: number[];
    khMin: number[];
    khMax: number[];
}

export const TimeAggregations = {
    None: (arr: number[]): number => arr[arr.length - 1],
    Max: (arr: number[]): number => Math.max(...arr),
    Average: (arr: number[]): number =>
        arr.reduce((a, b) => a + b) / arr.length,
};
export type TimeAggregation = keyof typeof TimeAggregations;

export interface Attributes {
    attributeKeys: string[];
}

export interface UISettings {
    // Display
    timeIndexRange: [number, number];
    wellsPerPage: number;
    currentPage: number;
    timeAggregation: TimeAggregation;
    sortBy: Record<string, SortDirection>;
    isDrawerOpen: boolean;
    // Filter
    filteredZones: string[];
    wellSearchText: string;
    hideZeroCompletions: boolean;
    filterByAttributes: string[];
}

// -------------------  PropTypes -------------------------

export const CompletionsPropType = PropTypes.shape({
    t: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    open: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    shut: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    khMean: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    khMin: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    khMax: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
});

export const WellPropType = PropTypes.shape({
    name: PropTypes.string.isRequired,
    earliestCompDateIndex: PropTypes.number.isRequired,
    attributes: PropTypes.objectOf(AttributeTypePropType.isRequired).isRequired,
    completions: PropTypes.objectOf(CompletionsPropType.isRequired).isRequired,
});

export const DataPropType = PropTypes.shape({
    version: PropTypes.string.isRequired,
    units: UnitsPropType.isRequired,
    stratigraphy: PropTypes.arrayOf(ZonePropTypes).isRequired,
    wells: PropTypes.arrayOf(WellPropType.isRequired).isRequired,
    timeSteps: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
});
