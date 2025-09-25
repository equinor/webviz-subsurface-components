import type { Color } from "@deck.gl/core";
import type { Feature, GeometryCollection, FeatureCollection } from "geojson";
import type { LayerPickInfo } from "../utils/layerTools";
import type { NumberPair, StyleAccessorFunction } from "../types";

export type GeoJsonWellProperties = {
    name: string;
    md: number[][];
    color?: Color;
};

export type WellFeature = Feature<GeometryCollection, GeoJsonWellProperties>;
export type WellFeatureCollection = FeatureCollection<
    GeometryCollection,
    GeoJsonWellProperties
> & {
    // ? This is used in the example volve-well feature-collection, but is not part of the standard. Should we include it?
    unit?: string;
};

export interface WellsPickInfo extends LayerPickInfo<WellFeature> {
    featureType?: string;
    logName: string;
}

export interface LogCurveDataType {
    header: {
        name: string;
        well: string;
    };
    curves: {
        name: string;
        description: string;
    }[];
    data: number[][];
    metadata_discrete: Record<
        string,
        {
            attributes: unknown;
            objects: Record<string, [Color, number]>;
        }
    >;
}

export type ColorAccessor = Color | StyleAccessorFunction | undefined;
export type SizeAccessor = number | StyleAccessorFunction | undefined;
export type DashAccessor =
    | boolean
    | NumberPair
    | StyleAccessorFunction
    | undefined;

export type LineStyleAccessor = {
    color?: ColorAccessor;
    dash?: DashAccessor;
    width?: SizeAccessor;
};
export type WellHeadStyleAccessor = {
    color?: ColorAccessor;
    size?: SizeAccessor;
};
