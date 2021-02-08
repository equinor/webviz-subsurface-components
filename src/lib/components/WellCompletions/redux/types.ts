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
    completions: Record<string, Completions>;
    type: string;
    region: string;
}

export interface Completions {
    t: number[];
    f: number[];
}

export const RangeModes = {
    "First Step": arr => arr[0],
    "Last Step": arr => arr[arr.length - 1],
    Max: arr => Math.max(...arr),
    Average: arr => arr.reduce((a, b) => a + b) / arr.length,
};
export type RangeMode = keyof typeof RangeModes;

export interface UISettings {
    timeIndexRange: [number, number];
    animating: boolean;
    rangeDisplayMode: RangeMode;
    filteredZones: string[];
    wellSearchText: string;
    hideZeroCompletions: boolean;
}
