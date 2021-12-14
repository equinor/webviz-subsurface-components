import { Icon } from "@equinor/eds-core-react";
import {
    well,
    brush,
    fault,
    pie_chart,
    grid_layer,
    hill_shading,
    surface_layer,
} from "@equinor/eds-icons";

// (this needs only be done once)
Icon.add({
    well,
    brush,
    fault,
    pie_chart,
    grid_layer,
    hill_shading,
    surface_layer,
});

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
    {
        id: "opacity",
        displayName: "Opacity",
        min: 0,
        max: 100,
        step: 1,
        dependentOnProp: undefined,
    },
] as const;

export const ToggleTypeProps = [
    { id: "logCurves", displayName: "Log curves", dependentOnProp: "logData" },
] as const;

export const MenuTypeProps = [
    { id: "mode", displayName: "Draw mode", dependentOnProp: undefined },
] as const;

export const NumericTypeProps = [
    {
        id: "lineWidthScale",
        displayName: "Trajectory thickness",
        dependentOnProp: undefined,
    },
    { id: "logRadius", displayName: "Log radius", dependentOnProp: "logData" },
    {
        id: "pointRadiusScale",
        displayName: "Well head radius",
        dependentOnProp: undefined,
    },
    {
        id: "lineWidthMinPixels",
        displayName: "Line thickness",
        dependentOnProp: undefined,
    },
] as const;

export const LayerIcons = {
    ColormapLayer: "surface_layer",
    Hillshading2DLayer: "hill_shading",
    WellsLayer: "well",
    Map3DLayer: "color_palette",
    PieChartLayer: "pie_chart",
    GridLayer: "grid_layer",
    FaultPolygonsLayer: "fault",
    DrawingLayer: "brush",
};

export type LayerType = keyof typeof LayerIcons;
