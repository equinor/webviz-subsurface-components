import PropTypes from "prop-types";
import type React from "react";
export type AttributeType = string | number | boolean | undefined;
export declare enum SortDirection {
    Ascending = "Ascending",
    Descending = "Descending"
}
export declare enum SortBy {
    Name = "well name",
    StratigraphyDepth = "stratigraphy depth",
    CompletionDate = "earliest comp date"
}
export declare const SortByEnumToStringMapping: {
    "well name": string;
    "stratigraphy depth": string;
    "earliest comp date": string;
};
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
interface UnitInfo {
    unit: string;
    decimalPlaces: number;
}
export interface Units {
    kh: UnitInfo;
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
export declare const ZonePropTypes: PropTypes.Validator<NonNullable<PropTypes.InferProps<React.WeakValidationMap<Zone>>>>;
export declare const AttributeTypePropType: PropTypes.Requireable<NonNullable<string | number | boolean | null | undefined>>;
export declare const WellInfoPropType: PropTypes.Requireable<PropTypes.InferProps<{
    name: PropTypes.Validator<string>;
    earliestCompDateIndex: PropTypes.Validator<number>;
    attributes: PropTypes.Validator<{
        [x: string]: NonNullable<string | number | boolean | null | undefined> | null | undefined;
    }>;
}>>;
export declare const UnitsPropType: PropTypes.Requireable<PropTypes.InferProps<{
    kh: PropTypes.Validator<NonNullable<PropTypes.InferProps<{
        unit: PropTypes.Validator<string>;
        decimalPlaces: PropTypes.Validator<number>;
    }>>>;
}>>;
export {};
