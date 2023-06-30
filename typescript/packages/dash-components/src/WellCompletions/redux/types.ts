import {
    SortDirection,
    Units,
    WellInfo,
    Zone,
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
