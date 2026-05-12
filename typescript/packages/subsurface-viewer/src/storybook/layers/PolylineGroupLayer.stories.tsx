import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import SubsurfaceViewer from "../../SubsurfaceViewer";
import { default3DViews, defaultStoryParameters } from "../sharedSettings";
import AxesLayer from "../../layers/axes/axesLayer";
import PolylineGroupLayer from "../../layers/polyline_group/polylineGroupLayer";
import type {
    BinaryPolylines,
    PolylineGroup,
} from "../../layers/polyline_group/polylineGroupLayer";
import { getRgba } from "../util/color";

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

type BasicGroupedColorsArgs = {
    groupAColor: string;
    groupAWidth: number;
    groupBColor: string;
    groupBWidth: number;
    groupCColor: string;
    groupCWidth: number;
};

const BasicGroupedColorsWrapper = ({
    groupAColor = "#dc3232",
    groupAWidth = 3,
    groupBColor = "#32b432",
    groupBWidth = 5,
    groupCColor = "#3232dc",
    groupCWidth = 2,
}: BasicGroupedColorsArgs) => {
    const data: PolylineGroup[] = [
        {
            id: "group-a",
            name: "Group A",
            color: getRgba(groupAColor),
            width: groupAWidth,
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
            color: getRgba(groupBColor),
            width: groupBWidth,
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
            color: getRgba(groupCColor),
            width: groupCWidth,
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

    return (
        <SubsurfaceViewer
            id="polyline-group-basic"
            layers={[
                axesLayer,
                new PolylineGroupLayer({
                    id: "basic-grouped-layer",
                    name: "Basic Groups",
                    data,
                    widthUnits: "pixels",
                    ZIncreasingDownwards: true,
                }),
            ]}
            bounds={[-5, -5, 25, 15]}
            views={default3DViews}
        />
    );
};

export const BasicGroupedColors: StoryObj<typeof BasicGroupedColorsWrapper> = {
    args: {
        groupAColor: "#dc3232",
        groupAWidth: 3,
        groupBColor: "#32b432",
        groupBWidth: 5,
        groupCColor: "#3232dc",
        groupCWidth: 2,
    },
    argTypes: {
        groupAColor: { name: "Group A color", control: { type: "color" } },
        groupAWidth: {
            name: "Group A width",
            control: { type: "range", min: 1, max: 20, step: 1 },
        },
        groupBColor: { name: "Group B color", control: { type: "color" } },
        groupBWidth: {
            name: "Group B width",
            control: { type: "range", min: 1, max: 20, step: 1 },
        },
        groupCColor: { name: "Group C color", control: { type: "color" } },
        groupCWidth: {
            name: "Group C width",
            control: { type: "range", min: 1, max: 20, step: 1 },
        },
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Three groups of polylines, each with a distinct group-level color and width.",
            },
        },
    },
    render: (args) => <BasicGroupedColorsWrapper {...args} />,
};

// ---------------------------------------------------------------------------
// Story 2: Per-polyline color override
// ---------------------------------------------------------------------------

type PerPolylineColorOverrideArgs = {
    groupColor: string;
    groupWidth: number;
    line2Color: string;
    line2Width: number;
    line3Color: string;
    line3Width: number;
};

const PerPolylineColorOverrideWrapper = ({
    groupColor = "#b4b400",
    groupWidth = 3,
    line2Color = "#ff0000",
    line2Width = 3,
    line3Color = "#00dcdc",
    line3Width = 3,
}: PerPolylineColorOverrideArgs) => {
    const data: PolylineGroup[] = [
        {
            id: "group-x",
            name: "Mixed Group",
            color: getRgba(groupColor),
            width: groupWidth,
            polylines: [
                // Inherits group color
                {
                    id: "line-1",
                    path: [
                        [0, 0, 0],
                        [8, 0, 3],
                    ],
                },
                // Per-polyline color override
                {
                    id: "line-2",
                    path: [
                        [0, 4, 0],
                        [8, 4, 6],
                    ],
                    color: getRgba(line2Color),
                    width: line2Width,
                },
                // Per-polyline color override
                {
                    id: "line-3",
                    path: [
                        [0, 8, 0],
                        [8, 8, 9],
                    ],
                    color: getRgba(line3Color),
                    width: line3Width,
                },
            ],
        },
    ];

    return (
        <SubsurfaceViewer
            id="polyline-group-override"
            layers={[
                new AxesLayer({
                    id: "axes-layer-override",
                    name: "Axes",
                    bounds: [-2, -2, 0, 12, 12, 10],
                }),
                new PolylineGroupLayer({
                    id: "override-layer",
                    name: "Color Overrides",
                    data,
                    widthUnits: "pixels",
                    ZIncreasingDownwards: true,
                }),
            ]}
            bounds={[-2, -2, 12, 12]}
            views={default3DViews}
        />
    );
};

export const PerPolylineColorOverride: StoryObj<
    typeof PerPolylineColorOverrideWrapper
> = {
    args: {
        groupColor: "#b4b400",
        groupWidth: 3,
        line2Color: "#ff0000",
        line2Width: 3,
        line3Color: "#00dcdc",
        line3Width: 3,
    },
    argTypes: {
        groupColor: {
            name: "Group color (line-1 inherits)",
            control: { type: "color" },
        },
        groupWidth: {
            name: "Group width (line-1 inherits)",
            control: { type: "range", min: 1, max: 20, step: 1 },
        },
        line2Color: {
            name: "Line-2 color (override)",
            control: { type: "color" },
        },
        line2Width: {
            name: "Line-2 width (override)",
            control: { type: "range", min: 1, max: 20, step: 1 },
        },
        line3Color: {
            name: "Line-3 color (override)",
            control: { type: "color" },
        },
        line3Width: {
            name: "Line-3 width (override)",
            control: { type: "range", min: 1, max: 20, step: 1 },
        },
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "One group where individual polylines override the group color. The top and bottom lines use per-polyline colors; the middle line inherits the group color.",
            },
        },
    },
    render: (args) => <PerPolylineColorOverrideWrapper {...args} />,
};

// ---------------------------------------------------------------------------
// Story 3: Pickable with group/polyline info in tooltip
// ---------------------------------------------------------------------------

const pickableData: PolylineGroup[] = [
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
            new AxesLayer({
                id: "axes-layer-pickable",
                name: "Axes",
                bounds: [-2, -2, 0, 18, 16, 12],
            }),
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

// ---------------------------------------------------------------------------
// Story 4: BinaryPolylines format
// ---------------------------------------------------------------------------
//
// Each group's `polylines` is a BinaryPolylines object:
//   positions   – flat Float32Array [x,y,z, x,y,z, ...]
//   startIndices – Uint32Array where each entry is the *vertex* index (not
//                  byte offset) at which the corresponding polyline begins.
//
// This format avoids the overhead of many small JS objects and is well-suited
// for large datasets loaded from binary blobs or typed-array workers.

const makeBinary = (
    segments: [number, number, number][][]
): BinaryPolylines => {
    const flat: number[] = [];
    const starts: number[] = [];
    for (const seg of segments) {
        starts.push(flat.length / 3);
        for (const [x, y, z] of seg) flat.push(x, y, z);
    }
    return {
        positions: new Float32Array(flat),
        startIndices: new Uint32Array(starts),
    };
};

const binaryGroups: PolylineGroup[] = [
    {
        id: "contour-100",
        name: "Contour 100 m",
        color: [220, 80, 80, 255],
        width: 2,
        polylines: makeBinary([
            [
                [0, 0, 2],
                [4, 0, 2],
                [8, 2, 2],
                [12, 2, 2],
            ],
            [
                [0, 6, 2],
                [6, 6, 2],
                [12, 8, 2],
            ],
        ]),
    },
    {
        id: "contour-200",
        name: "Contour 200 m",
        color: [80, 180, 80, 255],
        width: 2,
        polylines: makeBinary([
            [
                [0, 0, 5],
                [4, 1, 5],
                [8, 3, 5],
                [12, 4, 5],
            ],
            [
                [0, 7, 5],
                [6, 7, 5],
                [12, 9, 5],
            ],
            [
                [2, 12, 5],
                [8, 11, 5],
                [14, 12, 5],
            ],
        ]),
    },
    {
        id: "contour-300",
        name: "Contour 300 m",
        color: [80, 80, 220, 255],
        width: 2,
        polylines: makeBinary([
            [
                [0, 0, 9],
                [5, 2, 9],
                [10, 5, 9],
                [14, 8, 9],
            ],
        ]),
    },
];

export const BinaryPolylinesFormat: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "polyline-group-binary",
        layers: [
            new AxesLayer({
                id: "axes-layer-binary",
                name: "Axes",
                bounds: [-2, -2, 0, 18, 16, 12],
            }),
            new PolylineGroupLayer({
                id: "binary-polylines-layer",
                name: "Contours (binary)",
                data: binaryGroups,
                widthUnits: "pixels",
                ZIncreasingDownwards: true,
            }),
        ],
        bounds: [-2, -2, 18, 16],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: [
                    "Contour lines supplied in the **BinaryPolylines** format.",
                    "Each group's `polylines` is `{ positions: Float32Array, startIndices: Uint32Array }`",
                    "instead of a `Polyline[]` array.",
                    "This avoids per-polyline object allocation and is ideal for large datasets.",
                    "Group-level `color` and `width` are still applied; per-polyline overrides are not",
                    "available in binary mode.",
                ].join(" "),
            },
        },
    },
};

// ---------------------------------------------------------------------------
// Story 5: GPU-side visibility filtering (hiddenGroups / hiddenPolylines)
// ---------------------------------------------------------------------------
//
// hiddenGroups  – Set of group ids whose polylines are hidden on the GPU.
// hiddenPolylines – Set of polyline ids to hide (only for Polyline[] format).
//
// Changing either Set triggers only a GPU attribute update (no re-flatten),
// making visibility toggling very cheap even for large datasets.

const visibilityData: PolylineGroup[] = [
    {
        id: "alpha",
        name: "Alpha",
        color: [220, 60, 60, 255],
        width: 4,
        polylines: [
            {
                id: "a1",
                path: [
                    [0, 0, 0],
                    [6, 0, 3],
                    [12, 0, 6],
                ],
            },
            {
                id: "a2",
                path: [
                    [0, 3, 0],
                    [6, 3, 4],
                    [12, 3, 7],
                ],
            },
        ],
    },
    {
        id: "beta",
        name: "Beta",
        color: [60, 180, 60, 255],
        width: 4,
        polylines: [
            {
                id: "b1",
                path: [
                    [0, 7, 0],
                    [6, 7, 5],
                    [12, 7, 8],
                ],
            },
            {
                id: "b2",
                path: [
                    [0, 10, 0],
                    [6, 10, 3],
                    [12, 10, 6],
                ],
            },
        ],
    },
    {
        id: "gamma",
        name: "Gamma",
        color: [60, 60, 220, 255],
        width: 4,
        polylines: [
            {
                id: "g1",
                path: [
                    [0, 14, 0],
                    [6, 14, 2],
                    [12, 14, 5],
                ],
            },
        ],
    },
];

const visibilityAxes = new AxesLayer({
    id: "axes-layer-visibility",
    name: "Axes",
    bounds: [-2, -2, 0, 16, 18, 10],
});

type VisibilityArgs = {
    hiddenGroupIds: string[];
    hiddenPolylineIds: string[];
    alphaColor: string;
    betaColor: string;
    gammaColor: string;
};

const VisibilityWrapper = ({
    hiddenGroupIds = [],
    hiddenPolylineIds = [],
    alphaColor = "#dc3c3c",
    betaColor = "#3cb43c",
    gammaColor = "#3c3cdc",
}: VisibilityArgs) => {
    const groupColors: Record<string, string> = {
        alpha: alphaColor,
        beta: betaColor,
        gamma: gammaColor,
    };
    const data: PolylineGroup[] = visibilityData.map((g) => {
        const hex = g.id != null ? groupColors[String(g.id)] : undefined;
        return hex != null ? { ...g, color: getRgba(hex) } : g;
    });
    const layer = new PolylineGroupLayer({
        id: "visibility-layer",
        name: "Visibility Demo",
        data,
        widthUnits: "pixels",
        ZIncreasingDownwards: true,
        hiddenGroups: new Set<string | number>(hiddenGroupIds),
        hiddenPolylines: new Set<string | number>(hiddenPolylineIds),
    });

    return (
        <SubsurfaceViewer
            id="polyline-group-visibility"
            layers={[visibilityAxes, layer]}
            bounds={[-2, -2, 16, 18]}
            views={default3DViews}
        />
    );
};

export const VisibilityFiltering: StoryObj<typeof VisibilityWrapper> = {
    args: {
        hiddenGroupIds: [],
        hiddenPolylineIds: [],
        alphaColor: "#dc3c3c",
        betaColor: "#3cb43c",
        gammaColor: "#3c3cdc",
    },
    argTypes: {
        alphaColor: {
            name: "Alpha color",
            control: { type: "color" },
        },
        betaColor: {
            name: "Beta color",
            control: { type: "color" },
        },
        gammaColor: {
            name: "Gamma color",
            control: { type: "color" },
        },
        hiddenGroupIds: {
            name: "Hidden groups",
            control: { type: "check" },
            options: ["alpha", "beta", "gamma"],
        },
        hiddenPolylineIds: {
            name: "Hidden polylines",
            control: { type: "check" },
            options: ["a1", "a2", "b1", "b2", "g1"],
        },
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: [
                    "Toggle group and polyline visibility at runtime using the",
                    "`hiddenGroups` and `hiddenPolylines` props.",
                    "Visibility changes are applied **GPU-side** — the flattened data buffer is",
                    "never rebuilt, making this approach efficient for large datasets.",
                    "A group hidden via `hiddenGroups` hides all its polylines regardless of",
                    "`hiddenPolylines`. Per-polyline hiding requires `Polyline[]` format with `id`s set.",
                ].join(" "),
            },
        },
    },
    render: (args) => <VisibilityWrapper {...args} />,
    tags: ["no-test"],
};
