import type { Meta, StoryObj } from "@storybook/react";

import SubsurfaceViewer from "../../SubsurfaceViewer";
import { default3DViews, defaultStoryParameters } from "../sharedSettings";
import AxesLayer from "../../layers/axes/axesLayer";
import PolylineGroupLayer from "../../layers/polyline_group/polylineGroupLayer";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Polyline Group Layer",
    args: {
        triggerHome: 0,
    },
};
export default stories;

// ---------------------------------------------------------------------------
// Shared axes layer
// ---------------------------------------------------------------------------

const axesLayer = new AxesLayer({
    id: "axes-layer",
    name: "Axes",
    bounds: [-5, -5, 0, 25, 15, 12],
});

// ---------------------------------------------------------------------------
// Story 1: Basic grouped colors and widths
// ---------------------------------------------------------------------------

const groupedData = [
    {
        id: "group-a",
        name: "Group A",
        color: [220, 50, 50, 255],
        width: 3,
        polylines: [
            {
                path: [
                    [0, 0, 0],
                    [5, 0, 0],
                    [5, 5, 4],
                ],
            },
            {
                path: [
                    [0, 2, 0],
                    [8, 2, 2],
                ],
            },
        ],
    },
    {
        id: "group-b",
        name: "Group B",
        color: [50, 180, 50, 255],
        width: 5,
        polylines: [
            {
                path: [
                    [10, 0, 0],
                    [15, 0, 6],
                    [15, 8, 10],
                ],
            },
            {
                path: [
                    [10, 4, 0],
                    [20, 4, 8],
                ],
            },
        ],
    },
    {
        id: "group-c",
        name: "Group C",
        color: [50, 50, 220, 255],
        width: 2,
        polylines: [
            {
                path: [
                    [0, 10, 0],
                    [10, 10, 5],
                    [20, 10, 10],
                ],
            },
        ],
    },
];

const basicGroupedLayer = new PolylineGroupLayer({
    id: "basic-grouped-layer",
    name: "Basic Groups",
    data: groupedData,
    widthUnits: "pixels",
    ZIncreasingDownwards: true,
});

export const BasicGroupedColors: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "polyline-group-basic",
        layers: [axesLayer, basicGroupedLayer],
        bounds: [-5, -5, 25, 15],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Three groups of polylines, each with a distinct group-level color and width.",
            },
        },
    },
};

// ---------------------------------------------------------------------------
// Story 2: Per-polyline color override
// ---------------------------------------------------------------------------

const overrideData = [
    {
        id: "group-x",
        name: "Mixed Group",
        color: [180, 180, 0, 255],
        width: 3,
        polylines: [
            // Uses group color
            {
                id: "line-1",
                path: [
                    [0, 0, 0],
                    [8, 0, 3],
                ],
            },
            // Per-polyline color override (red)
            {
                id: "line-2",
                path: [
                    [0, 4, 0],
                    [8, 4, 6],
                ],
                color: [255, 0, 0, 255],
            },
            // Per-polyline color override (cyan)
            {
                id: "line-3",
                path: [
                    [0, 8, 0],
                    [8, 8, 9],
                ],
                color: [0, 220, 220, 255],
            },
        ],
    },
];

const overrideLayer = new PolylineGroupLayer({
    id: "override-layer",
    name: "Color Overrides",
    data: overrideData,
    widthUnits: "pixels",
    ZIncreasingDownwards: true,
});

export const PerPolylineColorOverride: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "polyline-group-override",
        layers: [
            new AxesLayer({ id: "axes-layer-override", name: "Axes", bounds: [-2, -2, 0, 12, 12, 10] }),
            overrideLayer,
        ],
        bounds: [-2, -2, 12, 12],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "One group where individual polylines override the group color. The top and bottom lines use per-polyline colors; the middle line inherits the group color.",
            },
        },
    },
};

// ---------------------------------------------------------------------------
// Story 3: Pickable with group/polyline info in tooltip
// ---------------------------------------------------------------------------

const pickableData = [
    {
        id: "fault-a",
        name: "Fault A",
        color: [255, 140, 0, 255],
        width: 4,
        polylines: [
            {
                id: "fa-1",
                path: [
                    [0, 0, 0],
                    [6, 2, 5],
                    [12, 0, 8],
                ],
            },
            {
                id: "fa-2",
                path: [
                    [0, 5, 0],
                    [6, 7, 4],
                    [12, 5, 6],
                ],
            },
        ],
    },
    {
        id: "fault-b",
        name: "Fault B",
        color: [160, 32, 240, 255],
        width: 4,
        polylines: [
            {
                id: "fb-1",
                path: [
                    [2, 10, 0],
                    [8, 12, 6],
                    [14, 10, 10],
                ],
            },
        ],
    },
];

const pickableLayer = new PolylineGroupLayer({
    id: "pickable-layer",
    name: "Pickable Faults",
    data: pickableData,
    pickable: true,
    widthUnits: "pixels",
    ZIncreasingDownwards: true,
});

export const PickablePolylines: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "polyline-group-pickable",
        layers: [
            new AxesLayer({ id: "axes-layer-pickable", name: "Axes", bounds: [-2, -2, 0, 18, 16, 12] }),
            pickableLayer,
        ],
        bounds: [-2, -2, 18, 16],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Pickable polylines. Hover over a line to see its group name, polyline id, and depth in the info card.",
            },
        },
    },
};
