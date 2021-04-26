export interface Data {
    version: string;
    units: Units;
    stratigraphy: Zone[];
    wells: Well[];
    timeSteps: string[];
}

export interface Units {
    kh: {
        unit: string;
        decimalPlaces: number;
    };
}
export interface Zone {
    name: string;
    color: string;
}

export interface WellInfo {
    name: string;
    earliestCompDateIndex: number;
    attributes: Record<string, AttributeType>;
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

export const RangeModes = {
    "First Step": (arr: number[]): number => arr[0],
    "Last Step": (arr: number[]): number => arr[arr.length - 1],
    Max: (arr: number[]): number => Math.max(...arr),
    Average: (arr: number[]): number =>
        arr.reduce((a, b) => a + b) / arr.length,
};
export type RangeMode = keyof typeof RangeModes;

export type SortDirection = "Ascending" | "Descending";
export interface Attributes {
    attributeKeys: string[];
}

export type AttributeType = string | number | boolean | undefined;
export interface UISettings {
    // Display
    timeIndexRange: [number, number];
    wellsPerPage: number;
    currentPage: number;
    rangeDisplayMode: RangeMode;
    sortBy: Record<string, SortDirection>;
    // Filter
    filteredZones: string[];
    wellSearchText: string;
    hideZeroCompletions: boolean;
    filterByAttributes: string[];
}
