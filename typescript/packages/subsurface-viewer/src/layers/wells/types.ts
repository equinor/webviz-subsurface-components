import type { Accessor, Color } from "@deck.gl/core";
import type {
    Feature,
    FeatureCollection,
    GeometryCollection,
    Position,
} from "geojson";
import type { NumberPair } from "../types";
import type { LayerPickInfo } from "../utils/layerTools";

export type GeoJsonWellProperties = {
    name: string;
    md: number[][];
    color?: Color;
    perforations?: PerforationProperties[];
    screens?: ScreenProperties[];
};

export type WellFeature = Feature<GeometryCollection, GeoJsonWellProperties>;
export type WellFeatureCollection = FeatureCollection<
    GeometryCollection,
    GeoJsonWellProperties
> & {
    // ? This is used in the example volve-well feature-collection, but is not part of the standard. Should we include it?
    unit?: string;
};

// TODO: Conclude what perforation and screen info that's interesting to know. So these fields are subject to change
export type PerforationProperties = {
    name: string;
    status: string;
    md: number;
    mode?: string;
    dateShot?: string;
    dateClosed?: string;
};

export type ScreenProperties = {
    name: string;
    mdStart: number;
    mdEnd: number;
    description?: string;
};

export interface WellsPickInfo extends LayerPickInfo<WellFeature> {
    featureType?: string;
    logName?: string;
    wellName?: string;
}

export type DashedSectionsLayerPickInfo = LayerPickInfo<WellFeature> & {
    dashedSectionIndex?: number;
    positionAlong?: number;
};

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
export type ColorAccessor = Accessor<Feature, Color | undefined>;
export type SizeAccessor = Accessor<Feature, number | undefined>;
export type DashAccessor = Accessor<Feature, NumberPair | boolean | undefined>;

export type WellTrajectoryAccessor = Accessor<WellFeature, Position[]>;
export type WellMdAccessor = Accessor<WellFeature, number[]>;

export type LineStyleAccessor = {
    color?: ColorAccessor;
    dash?: DashAccessor;
    width?: SizeAccessor;
};
export type WellHeadStyleAccessor = {
    color?: ColorAccessor;
    size?: SizeAccessor;
};

export type AbscissaTransform = (
    featureCollection: WellFeatureCollection
) => WellFeatureCollection;
