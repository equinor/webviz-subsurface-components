import PropTypes from "prop-types";
import React from "react";

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

// ---------------------------  PropTypes ---------------------------------------

const ZoneShape: React.WeakValidationMap<Zone> = {
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};
Object.assign(ZoneShape, {
    subzones: PropTypes.arrayOf(PropTypes.shape(ZoneShape).isRequired),
});
export const ZonePropTypes = PropTypes.shape(ZoneShape).isRequired;

export const AttributeTypePropType = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
]);

export const WellInfoPropType = PropTypes.shape({
    name: PropTypes.string.isRequired,
    earliestCompDateIndex: PropTypes.number.isRequired,
    attributes: PropTypes.objectOf(AttributeTypePropType).isRequired,
});

export const UnitsPropType = PropTypes.shape({
    kh: PropTypes.shape({
        unit: PropTypes.string.isRequired,
        decimalPlaces: PropTypes.number.isRequired,
    }).isRequired,
});
