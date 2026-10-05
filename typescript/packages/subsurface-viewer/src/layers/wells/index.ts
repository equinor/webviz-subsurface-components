export { default as WellsLayer } from "./wellsLayer";

export type { WellsLayerProps } from "./wellsLayer";
export type {
    ColorAccessor,
    DashAccessor,
    FormationProperties,
    GeoJsonWellProperties,
    LineStyleAccessor,
    LogCurveDataType,
    PerforationProperties,
    ScreenProperties,
    SizeAccessor,
    WellHeadStyleAccessor,
    WellsPickInfo,
} from "./types";

export type { MergedTextLayerProps } from "./layers/mergedTextLayer";
export type {
    FlatWellMarkersLayerProps,
    MarkerData,
    WellMarker,
} from "./layers/flatWellMarkersLayer";
export type {
    LabelOrientation,
    WellLabelLayer,
    WellLabelLayerData,
    WellLabelLayerProps,
} from "./layers/wellLabelLayer";

export type { MarkerType } from "./utils/markers";
export type { ScaleFactor } from "./utils/trajectory";
export { abscissaTransform } from "./utils/abscissaTransform";
export {
    getAziAndInclForSegment,
    getSegmentIndicesForMd,
    getSegmentIndicesForCoord,
    getFractionAlongSegmentForCoord,
} from "./utils/trajectory";
