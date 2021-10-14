import { Icon } from "@equinor/eds-core-react";
import {
    brush,
    color_palette,
    pie_chart,
    waves,
    change_history,
    turbine,
} from "@equinor/eds-icons";

// (this needs only be done once)
Icon.add({ brush, color_palette, pie_chart, waves, change_history, turbine });

export type DrawMode =
    | "view"
    | "modify"
    | "drawPoint"
    | "drawLineString"
    | "drawPolygon";

export const DrawModes = [
    { id: "view", displayName: "View" },
    { id: "modify", displayName: "Edit" },
    { id: "drawPoint", displayName: "Create point" },
    { id: "drawLineString", displayName: "Create polyline" },
    { id: "drawPolygon", displayName: "Create polygon" },
] as const;

export const SliderTypeProps = [
    { id: "opacity", displayName: "Opacity", min: 0, max: 100, step: 1 },
] as const;

export const ToggleTypeProps = [
    { id: "logCurves", displayName: "Log curves" },
] as const;

export const MenuTypeProps = [
    { id: "mode", displayName: "Draw mode" },
] as const;

export const NumericTypeProps = [
    { id: "lineWidthScale", displayName: "Trajectory thickness" },
    { id: "logRadius", displayName: "Log radius" },
    { id: "pointRadiusScale", displayName: "Well head radius" },
    { id: "lineWidthMinPixels", displayName: "Line thickness" },
] as const;

export const LayerIcons = {
    ColormapLayer: "color_palette",
    Hillshading2DLayer: "change_history",
    WellsLayer: "turbine",
    PieChartLayer: "pie_chart",
    GridLayer: "pie_chart",
    FaultPolygonsLayer: "waves",
    DrawingLayer: "brush",
};

export type LayerType = keyof typeof LayerIcons;
