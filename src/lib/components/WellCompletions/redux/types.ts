export interface Data {
    stratigraphy: Zone[];
    wells: Well[];
    timeSteps: string[];
}
export interface Zone {
    name: string;
    color: string;
}
export interface Well {
    name: string;
    earliestCompDateIndex: number;
    completions: Record<string, Completions>;
    attributes: Record<string, any>;
}

export interface Completions {
    t: number[];
    f: number[];
}

export const RangeModes = {
    "First Step": (arr) => arr[0],
    "Last Step": (arr) => arr[arr.length - 1],
    Max: (arr) => Math.max(...arr),
    Average: (arr) => arr.reduce((a, b) => a + b) / arr.length,
};
export type RangeMode = keyof typeof RangeModes;

export type SortDirection = "Ascending" | "Descending";
export interface Attributes {
    attributeKeys: string[];
}
export interface UISettings {
    timeIndexRange: [number, number];
    wellsPerPage: number;
    currentPage: number;
    rangeDisplayMode: RangeMode;
    filteredZones: string[];
    wellSearchText: string;
    hideZeroCompletions: boolean;
    sortBy: Record<string, SortDirection>;
}
