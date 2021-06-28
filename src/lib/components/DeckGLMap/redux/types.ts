import { Icon } from "@equinor/eds-core-react";
import { brush } from "@equinor/eds-icons";
Icon.add({ brush }); // (this needs only be done once)

export type DrawMode =
    | "view"
    | "modify"
    | "drawPoint"
    | "drawLineString"
    | "drawPolygon";

export const DrawModes = [
    "view",
    "modify",
    "drawPoint",
    "drawLineString",
    "drawPolygon",
] as const;

export const LayerIcons = {
    ColormapLayer: undefined,
    Hillshading2DLayer: undefined,
    WellsLayer: undefined,
    PieChartLayer: undefined,
    FaultPolygonsLayer: undefined,
    DrawingLayer: "brush",
};

export type LayerType = keyof typeof LayerIcons;
