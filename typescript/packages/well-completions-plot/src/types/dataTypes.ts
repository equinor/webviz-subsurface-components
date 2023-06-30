export type AttributeType = string | number | boolean | undefined;
export enum SortDirection {
    Ascending = "Ascending",
    Descending = "Descending",
}
export enum SortBy {
    Name = "well name",
    StratigraphyDepth = "stratigraphy depth",
    CompletionDate = "earliest comp date",
}

export interface Zone {
    name: string;
    color: string;
    subzones?: Zone[];
}

export interface WellInfo {
    name: string;
    earliestCompDateIndex: number;
    attributes: Record<string, AttributeType>;
}

export interface Units {
    kh: {
        unit: string;
        decimalPlaces: number;
    };
}

export interface CompletionPlotData {
    zoneIndex: number;
    open: number;
    shut: number;
    khMean: number;
    khMin: number;
    khMax: number;
}

export interface WellPlotData extends WellInfo {
    completions: CompletionPlotData[];
}

export interface PlotData {
    stratigraphy: Zone[];
    wells: WellPlotData[];
    units: Units;
}
