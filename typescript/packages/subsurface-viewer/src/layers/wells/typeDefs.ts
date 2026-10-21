import type { Accessor, Color } from "@deck.gl/core";
import type {
    Feature,
    FeatureCollection,
    GeometryCollection,
    Position,
} from "geojson";
import type { BinaryFeatureCollection } from "@loaders.gl/schema";

import type { NumberPair } from "../typeDefs";
import type {
    ExtendedLayerProps,
    LayerPickInfo,
    ReportBoundingBoxAction,
} from "../utils/deckglTools";
import type { ColormapFunctionType } from "../utils/colormapTools";

import type { WellLabelLayerProps } from "./layers/wellLabelLayer";
import type { FlatWellMarkersLayerProps } from "./layers/flatWellMarkersLayer";

export type GeoJsonWellProperties = {
    name: string;
    md: number[][];
    color?: Color;
    perforations?: PerforationProperties[];
    screens?: ScreenProperties[];
    formations?: FormationProperties[];
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

export type FormationProperties = {
    name: string;
    mdEnter: number;
    mdExit: number;
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

export interface WellsLayerProps extends ExtendedLayerProps {
    /**
     * Well data to render; described as a single GeoJSON feature collection, which each individual well as a distinct feature.
     *
     * Accepted data formats:
     * * A javascript object.
     * * A binary/flat GeoJSON object
     * * A url string pointing to external GeoJSON data.
     * * A promise returning GeoJSON data.
     */
    // String, binary and promise is handled internally in Deck.gl to load external data.
    // The typing here matches the type used in GeoJsonLayer (but with a more strict feature definition)
    data:
        | string
        | WellFeatureCollection
        | BinaryFeatureCollection
        | Promise<WellFeatureCollection | BinaryFeatureCollection>;

    pointRadiusScale: number;
    lineWidthScale: number;
    outline: boolean;
    selectedWell: string;
    logData: string | LogCurveDataType[];
    logName: string;
    logColor: string;
    logrunName: string;
    logRadius: number;
    logCurves: boolean;
    /** Control to refine the well path by super sampling it using a spline interpolation.
     * The well path between each pair of original vertices is split into sub-segments along the spline
     * interpolation.
     * The number of new sub-segments between each pair of original vertices is specified by refine
     * and defaults to 5 if refine is true.
     */
    refine: boolean | number;
    wellHeadStyle: WellHeadStyleAccessor;
    colorMappingFunction: ColormapFunctionType;
    lineStyle: LineStyleAccessor;

    /**
     * @deprecated use wellLabel instead
     */
    wellNameVisible?: boolean;

    /**
     * @deprecated use wellLabel instead
     * It true place name at top, if false at bottom.
     * If given as a number between 0 and 100,  will place name at this percentage of trajectory from top.
     */
    wellNameAtTop?: boolean | number;

    /**
     * @deprecated use wellLabel instead
     */
    wellNameSize?: number;

    /**
     * @deprecated use wellLabel instead
     */
    wellNameColor?: Color;
    /**
     * If true will prevent well name cluttering by not displaying overlapping names.
     * default false.
     * @deprecated use wellLabel instead
     */
    hideOverlappingWellNames?: boolean;

    isLog: boolean;
    depthTest: boolean;

    /**  If true means that input z values are interpreted as depths.
     * For example depth of z = 1000 corresponds to -1000 on the z axis. Default true.
     */
    ZIncreasingDownwards: boolean;

    /**  If true means that a simplified representation of the wells will be drawn.
     *   Useful for example during panning and rotation to gain speed.
     */
    simplifiedRendering: boolean;

    /** Sectional projection of data */
    section?: boolean | AbscissaTransform;

    // Non public properties:
    reportBoundingBox?: React.Dispatch<ReportBoundingBoxAction>;

    wellLabel?: Partial<WellLabelLayerProps>;

    /* --- Screens and perforations --- --- --- --- ---*/
    markers?: {
        /** Enables simple line markers at the start and end of screen sections.
         *
         * @remarks These markers are currently only designed for 2D, so they are not guaranteed to look nice in 3D
         */
        showScreens?: boolean;
        /**
         * Renders screen sections of the trajectory as dashed segments.
         *
         * @remarks If enabled, the COLORS sub-layer will be replaced by the SCREEN_TRAJECTORY sub-layer!
         */
        showScreenTrajectoryAsDash?: boolean;

        /** Enables visualization of trajectory perforations.
         *
         * @remarks These markers are currently only designed for 2D, so they are not guaranteed to look nice in 3D
         */
        showPerforations?: boolean;

        /** Specifies colors of markers at a per-marker basis */
        getMarkerColor?: FlatWellMarkersLayerProps<WellFeature>["getMarkerColor"];

        /** Specifies the dash factor for screen sections. */
        getScreenDashArray?: DashAccessor;
    };

    /* --- Filtering -- --- --- --- --- --- --- --- --- */
    /** Enables well filtering  */
    enableFilters: boolean;
    /** Filter wells by measured depth (MD).
     * - Return [min, max] to show only the portion of the well between these MD values
     * - Return [max, min] (inverted) to show everything OUTSIDE this range
     * - Return undefined or [-1, -1] to show the entire well
     * Multiple ranges are additive
     *
     * @remarks To make sure trajectories paths disappear at the correct point, each
     * range value will inject a point into the path array; meaning layers will recompute
     * each time this is changed
     */
    mdFilterRange: Accessor<WellFeature, [number, number] | [number, number][]>;

    /**
     * Filters trajectory paths to formation sections.
     */
    formationFilter: Accessor<WellFeature, string[]>;

    /** Filters wells based on name */
    wellNameFilter: string[];

    /** Shows a simple trajectory in place of filtered sections. If color is not specified, a light gray will be used */
    showFilterTrajectoryGhost: boolean | Color;
}
