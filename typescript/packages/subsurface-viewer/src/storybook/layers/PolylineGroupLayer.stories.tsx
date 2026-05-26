import type { Color, Position } from "@deck.gl/core";
import { OrbitView, OrthographicView, View } from "@deck.gl/core";
import { PolygonLayer } from "@deck.gl/layers";
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { SectionView } from "../../views/sectionView";

import { Axes2DLayer, MapLayer } from "../../layers";
import AxesLayer from "../../layers/axes/axesLayer";
import type {
    BinaryPolylines,
    Polyline,
    PolylineGroup,
} from "../../layers/polyline_group/polylineGroupLayer";
import { PolylineGroupLayer } from "../../layers/polyline_group/polylineGroupLayer";
import { useAbscissaTransform } from "../../layers/wells/hooks/useAbscissaTransform";
import WellsLayer from "../../layers/wells/wellsLayer";
import type { ViewsType } from "../../SubsurfaceViewer";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import {
    annotationClasses,
    AnnotationRoot,
    defaultStoryParameters,
} from "../sharedSettings";
import { getRgba } from "../util/color";
import { useSyntheticWellCollection } from "../util/wellSynthesis";
import type { BoundingBox2D, Point2D } from "../../utils";
import { Play } from "../util/play";

const STORIES: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Polyline Group Layer",
};
export default STORIES;

/**
 * Creates a deck.gl {@link View} element with annotation children.
 *
 * Must be called as a plain function inside `{}`, never as JSX, so that React
 * never attempts to invoke the `View` class constructor as a function component.
 * `SubsurfaceViewer` consumes the returned element from its `children` prop
 * directly, bypassing React's reconciler.
 *
 * @param id - The viewport id that this View should match.
 * @param children - Annotation content rendered inside the View overlay.
 */
function annotateView(
    id: string,
    children: React.ReactNode
): React.ReactElement {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error -- View accepts children at runtime but lacks the type
    return <View id={id}>{children}</View>;
}

// ---------------------------------------------------------------------------
// Shared axes layer
// ---------------------------------------------------------------------------

const AXES_LAYER = new AxesLayer({
    id: "axes-layer",
    name: "Axes",
    bounds: [-2, -2, 0, 16, 18, 10],
});

// Shared polyline path geometry reused across stories that demonstrate
// multi-group behaviour. The exact coordinates are not semantically
// significant — any set of distinct paths would serve the same purpose.
const VIS_GROUP_A_PATHS: Position[][] = [
    [
        [0, 0, 0],
        [6, 0, 3],
        [12, 0, 6],
    ],
    [
        [0, 3, 0],
        [6, 3, 4],
        [12, 3, 7],
    ],
];
const VIS_GROUP_B_PATHS: Position[][] = [
    [
        [0, 7, 0],
        [6, 7, 5],
        [12, 7, 8],
    ],
    [
        [0, 10, 0],
        [6, 10, 3],
        [12, 10, 6],
    ],
];
const VIS_GROUP_C_PATHS: Position[][] = [
    [
        [0, 14, 0],
        [6, 14, 2],
        [12, 14, 5],
    ],
];

// Stable bounds constant — inline array literals would create a new object on
// every render, causing SubsurfaceViewer to reset the camera.
const BOUNDS_WIDE = [-2, -2, 16, 18] as [number, number, number, number];

// Two viewports side by side: 3D OrbitView on the left, 2D OrthographicView
// on the right. Defined at module level so its identity is stable.
const DUAL_VIEWS: ViewsType = {
    layout: [1, 2] as [number, number],
    viewports: [
        { id: "view_3d", viewType: OrbitView },
        { id: "view_2d", viewType: OrthographicView },
    ],
};

// Two viewports for the section-path story: 3D OrbitView on the left,
// SectionView on the right.
// No global bounds — the 3D view auto-fits from dataBoundingBox3d with the
// default rotationX:45 (a natural side-angled view). The section view centres
// explicitly on the abscissa/depth geometry.
const SECTION_VIEWS: ViewsType = {
    layout: [1, 2] as [number, number],
    viewports: [
        {
            id: "view_3d",
            viewType: OrbitView,
            layerIds: ["axes-3d-section", "section-layer"],
        },
        {
            id: "view_section",
            viewType: SectionView,
            layerIds: ["axes-2d-section", "section-layer"],
            // Centre on the section content: abscissa mid-point (12) and
            // depth mid-point (5). Zoom fits the ~26×12 abscissa/depth extent.
            target: [12, -5] as [number, number],
            zoom: 4.5,
        },
    ],
};

// ---------------------------------------------------------------------------
// Shared scene data — used by PickablePolylines and GroupLevelStyling stories.
//
// Group A occupies x ∈ [0, 10], y ∈ [0,  6] (lower half of the scene).
// Group B occupies x ∈ [0, 10], y ∈ [10, 16] (upper half, separated by a gap).
// ---------------------------------------------------------------------------

const GROUP_A_PATHS: Position[][] = [
    [
        [0, 0, 2],
        [4, 0, 3],
        [8, 0, 4],
        [10, 0, 5],
    ],
    [
        [0, 3, 4],
        [4, 3, 5],
        [8, 3, 6],
        [10, 3, 7],
    ],
    [
        [0, 6, 6],
        [4, 6, 7],
        [8, 6, 8],
        [10, 6, 9],
    ],
];

const GROUP_B_PATHS: Position[][] = [
    [
        [0, 10, 2],
        [4, 10, 3],
        [8, 10, 4],
        [10, 10, 5],
    ],
    [
        [0, 13, 4],
        [4, 13, 5],
        [8, 13, 6],
        [10, 13, 7],
    ],
    [
        [0, 16, 6],
        [4, 16, 7],
        [8, 16, 8],
        [10, 16, 9],
    ],
];

const GROUP_STYLING_BOUNDS = [-1, -1, 12, 18] as [
    number,
    number,
    number,
    number,
];

const GROUP_STYLING_AXES_LAYER = new AxesLayer({
    id: "axes-group-styling",
    name: "Axes",
    bounds: [-1, -1, 0, 12, 18, 10],
});

/**
 * Returns a Storybook `parameters` object with the standard docs config.
 * Avoids repeating `...defaultStoryParameters.docs` in every story.
 */
function storyDocs(story: string) {
    return {
        docs: {
            ...defaultStoryParameters.docs,
            description: { story },
        },
    };
}

/**
 * Returns `[dashLength, gapLength]`, or `undefined` when `dashLength` is 0
 * (solid line). Extracted to avoid repeating the ternary in every wrapper.
 */
function mkDash(
    dashLength: number,
    gapLength: number
): [number, number] | undefined {
    return dashLength > 0 ? [dashLength, gapLength] : undefined;
}

// ---------------------------------------------------------------------------
// Story 1: Pickable with group/polyline info in tooltip
// ---------------------------------------------------------------------------

// Views for the Pickable story. The 2D (right) viewport is centred on
// polyline a-2 (Group A, y = 3) so that the automated play function can
// reliably pick the centre of that viewport.
const PICKABLE_VIEWS: ViewsType = {
    layout: [1, 2] as [number, number],
    viewports: [
        { id: "view_3d", viewType: OrbitView },
        {
            id: "view_2d",
            viewType: OrthographicView,
            // Centre on the midpoint of polyline a-2: x = 5, y = 3.
            target: [5, 3] as [number, number],
            zoom: 5,
        },
    ],
};

const PICKABLE_LAYER = new PolylineGroupLayer({
    id: "pickable-layer",
    name: "Pickable Groups",
    data: [
        {
            id: "group-a",
            name: "Group A",
            color: [255, 140, 0, 255],
            width: 10,
            polylines: GROUP_A_PATHS.map((path, i) => ({
                id: `a-${i + 1}`,
                path,
            })),
        },
        {
            id: "group-b",
            name: "Group B",
            color: [160, 32, 240, 255],
            width: 10,
            polylines: GROUP_B_PATHS.map((path, i) => ({
                id: `b-${i + 1}`,
                path,
            })),
        },
    ],
    pickable: true,
    widthUnits: "pixels",
    ZIncreasingDownwards: true,
});

export const PickablePolylines: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "polyline-group-pickable",
        pickingRadius: 8,
        layers: [GROUP_STYLING_AXES_LAYER, PICKABLE_LAYER],
        views: PICKABLE_VIEWS,
    },
    parameters: storyDocs(
        "Pickable polylines. Hover over a line to see its group name, polyline id, and depth in the info card."
    ),
    play: async () => {
        const canvas = await Play.activateCanvas();

        if (!canvas) {
            return;
        }

        // DUAL_VIEWS layout [1, 2]: the 2D OrthographicView occupies the right
        // half of the story canvas, centred at world position (5, 3) — the
        // midpoint of polyline a-2.  Moving to 3/4 of the canvas width places
        // the cursor at the centre of that viewport.
        const pickPosition = {
            clientX: canvas.clientLeft + (canvas.clientWidth * 3) / 4,
            clientY: canvas.clientTop + canvas.clientHeight / 2,
        };

        await Play.pick(canvas, pickPosition);
    },
    render: (args) => (
        <AnnotationRoot>
            <SubsurfaceViewer {...args}>
                {annotateView(
                    "view_3d",
                    <>
                        <h2 className={annotationClasses.annotation}>
                            3D view [x, y, z]
                        </h2>
                        <p className={annotationClasses.annotation}>
                            Hover over a line to see its group name and polyline
                            id in the info card.
                        </p>
                    </>
                )}
                {annotateView(
                    "view_2d",
                    <h2 className={annotationClasses.annotation}>
                        2D top view [x, y]
                    </h2>
                )}
            </SubsurfaceViewer>
        </AnnotationRoot>
    ),
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
    segments: Position[][],
    color?: Color,
    width?: number
): BinaryPolylines => {
    const flat: number[] = [];
    const starts: number[] = [];
    for (const seg of segments) {
        starts.push(flat.length / 3);
        for (const [x, y, z] of seg) flat.push(x, y, z);
    }

    let colors: Uint8Array | undefined;
    if (color) {
        // Number of vertices = flat.length / 3
        const nVerts = flat.length / 3;
        colors = new Uint8Array(nVerts * 4);
        for (let i = 0; i < nVerts; ++i) {
            colors.set(color, i * 4);
        }
    }
    let widths: Float32Array | undefined;
    if (width !== undefined) {
        const nVerts = flat.length / 3;
        widths = new Float32Array(nVerts);
        widths.fill(width);
    }

    return {
        positions: new Float32Array(flat),
        startIndices: new Uint32Array(starts),
        colors,
        widths,
    };
};

const BINARY_GROUPS: PolylineGroup[] = [
    {
        id: "contour-100",
        name: "Contour 100 m",
        polylines: makeBinary(
            [
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
            ],
            [220, 80, 80, 255],
            2
        ),
    },
    {
        id: "contour-200",
        name: "Contour 200 m",
        polylines: makeBinary(
            [
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
            ],
            [80, 180, 80, 255],
            2
        ),
    },
    {
        id: "contour-300",
        name: "Contour 300 m",
        polylines: makeBinary(
            [
                [
                    [0, 0, 9],
                    [5, 2, 9],
                    [10, 5, 9],
                    [14, 8, 9],
                ],
            ],
            [80, 80, 220, 255],
            2
        ),
    },
];

type BinaryVisibilityArgs = {
    hiddenGroupIds: string[];
};

const BinaryWrapper = ({ hiddenGroupIds = [] }: BinaryVisibilityArgs) => {
    const layer = new PolylineGroupLayer({
        id: "binary-polylines-layer",
        name: "Contours (binary)",
        data: BINARY_GROUPS,
        pickable: true,
        widthUnits: "pixels",
        ZIncreasingDownwards: true,
        hiddenGroups: new Set<string | number>(hiddenGroupIds),
    });

    return (
        <AnnotationRoot>
            <SubsurfaceViewer
                id="polyline-group-binary"
                layers={[
                    new AxesLayer({
                        id: "axes-layer-binary",
                        name: "Axes",
                        bounds: [-2, -2, 0, 18, 16, 12],
                    }),
                    layer,
                ]}
                bounds={[-2, -2, 18, 16]}
                views={DUAL_VIEWS}
                pickingRadius={8}
            >
                {annotateView(
                    "view_3d",
                    <h2 className={annotationClasses.annotation}>
                        3D view [x, y, z]
                    </h2>
                )}
                {annotateView(
                    "view_2d",
                    <h2 className={annotationClasses.annotation}>
                        2D top view [x, y]
                    </h2>
                )}
            </SubsurfaceViewer>
        </AnnotationRoot>
    );
};

export const BinaryPolylinesFormat: StoryObj<typeof BinaryWrapper> = {
    args: {
        hiddenGroupIds: [],
    },
    argTypes: {
        hiddenGroupIds: {
            name: "Hidden groups",
            control: { type: "check" },
            options: ["contour-100", "contour-200", "contour-300"],
        },
    },
    parameters: storyDocs(
        [
            "Contour lines supplied in the **BinaryPolylines** format.",
            "Each group's `polylines` is `{ positions: Float32Array, startIndices: Uint32Array }`",
            "instead of a `Polyline[]` array.",
            "This avoids per-polyline object allocation and is ideal for large datasets.",
            "Group-level `color` and `width` are still applied; per-polyline overrides are not",
            "available in binary mode.",
        ].join(" ")
    ),
    render: (args) => <BinaryWrapper {...args} />,
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

const VISIBILITY_DATA: PolylineGroup[] = [
    {
        id: "alpha",
        name: "Alpha",
        color: [220, 60, 60, 255],
        width: 4,
        polylines: [
            { id: "a1", path: VIS_GROUP_A_PATHS[0] },
            { id: "a2", path: VIS_GROUP_A_PATHS[1] },
        ],
    },
    {
        id: "beta",
        name: "Beta",
        color: [60, 180, 60, 255],
        width: 4,
        polylines: [
            { id: "b1", path: VIS_GROUP_B_PATHS[0] },
            { id: "b2", path: VIS_GROUP_B_PATHS[1] },
        ],
    },
    {
        id: "gamma",
        name: "Gamma",
        color: [60, 60, 220, 255],
        width: 4,
        polylines: [{ id: "g1", path: VIS_GROUP_C_PATHS[0] }],
    },
];

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
    alphaColor = "rgba(220, 60, 60, 1)",
    betaColor = "rgba(60, 180, 60, 1)",
    gammaColor = "rgba(60, 60, 220, 1)",
}: VisibilityArgs) => {
    const groupColors: Record<string, string> = {
        alpha: alphaColor,
        beta: betaColor,
        gamma: gammaColor,
    };
    const data: PolylineGroup[] = VISIBILITY_DATA.map((g) => {
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
        <AnnotationRoot>
            <SubsurfaceViewer
                id="polyline-group-visibility"
                layers={[AXES_LAYER, layer]}
                bounds={BOUNDS_WIDE}
                views={DUAL_VIEWS}
            >
                {annotateView(
                    "view_3d",
                    <h2 className={annotationClasses.annotation}>
                        3D view [x, y, z]
                    </h2>
                )}
                {annotateView(
                    "view_2d",
                    <h2 className={annotationClasses.annotation}>
                        2D top view [x, y]
                    </h2>
                )}
            </SubsurfaceViewer>
        </AnnotationRoot>
    );
};

export const VisibilityFiltering: StoryObj<typeof VisibilityWrapper> = {
    args: {
        hiddenGroupIds: [],
        hiddenPolylineIds: [],
        alphaColor: "rgba(220, 60, 60, 1)",
        betaColor: "rgba(60, 180, 60, 1)",
        gammaColor: "rgba(60, 60, 220, 1)",
    },
    argTypes: {
        alphaColor: { name: "Alpha color" },
        betaColor: { name: "Beta color" },
        gammaColor: { name: "Gamma color" },
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
    parameters: storyDocs(
        [
            "Toggle group and polyline visibility at runtime using the",
            "`hiddenGroups` and `hiddenPolylines` props.",
            "Visibility changes are applied **GPU-side** — the flattened data buffer is",
            "never rebuilt, making this approach efficient for large datasets.",
            "A group hidden via `hiddenGroups` hides all its polylines regardless of",
            "`hiddenPolylines`. Per-polyline hiding requires `Polyline[]` format with `id`s set.",
        ].join(" ")
    ),
    render: (args) => <VisibilityWrapper {...args} />,
};

// ---------------------------------------------------------------------------
// Story 6: Section-path rendering (abscissa / depth space)
// ---------------------------------------------------------------------------
//
// When `sectionPath` is provided the polyline coordinates are interpreted as
// [abscissa, depth] pairs:
//   - abscissa : cumulative distance along the fence
//   - depth    : positive = down when ZIncreasingDownwards is true
//
// Left viewport (OrbitView)  – abscissa values are projected back onto the
//                              fence, giving a 3D "fence diagram".
// Right viewport (SectionView) – paths are rendered flat in abscissa/depth
//                                 space, identical to a classic well section.
//
// The fence below is an L-shape: 12 m east then 12 m north, total length 24 m.

// L-shaped fence:  (0,0) → (12,0) → (12,12)
const SECTION_PATH: Point2D[] = [
    [0, 0],
    [12, 0],
    [12, 12],
];

const SECTION_GROUPS: PolylineGroup[] = [
    {
        id: "horizon-a",
        name: "Horizon A",
        color: [220, 60, 60, 255],
        width: 3,
        // abscissa ranges roughly 0–12 (first leg of the fence)
        polylines: [
            {
                id: "ha-1",
                path: [
                    [0, 2, 0],
                    [4, 3, 0],
                    [8, 2.5, 0],
                    [12, 3, 0],
                ] as Position[],
            },
        ],
    },
    {
        id: "horizon-b",
        name: "Horizon B",
        color: [60, 180, 60, 255],
        width: 3,
        // abscissa ranges roughly 12–24 (second leg of the fence)
        polylines: [
            {
                id: "hb-1",
                path: [
                    [12, 5, 0],
                    [16, 5.5, 0],
                    [20, 6, 0],
                    [24, 6.5, 0],
                ] as Position[],
            },
        ],
    },
    {
        id: "fault-1",
        name: "Fault 1",
        color: [80, 80, 220, 255],
        width: 2,
        // spans both legs
        polylines: [
            {
                id: "f1-1",
                path: [
                    [6, 1, 0],
                    [6, 9, 0],
                ] as Position[],
            },
            {
                id: "f1-2",
                path: [
                    [18, 3, 0],
                    [18, 9, 0],
                ] as Position[],
            },
        ],
    },
];

export const SectionViewRendering: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "polyline-group-section",
        layers: [
            new AxesLayer({
                id: "axes-3d-section",
                name: "Axes 3D",
                bounds: [0, 0, 0, 12, 12, 10],
            }),
            new Axes2DLayer({
                id: "axes-2d-section",
                name: "Axes 2D",
            }),
            new PolylineGroupLayer({
                id: "section-layer",
                name: "Section Horizons",
                data: SECTION_GROUPS,
                sectionPath: SECTION_PATH,
                pickable: true,
                widthUnits: "pixels",
                ZIncreasingDownwards: true,
            }),
        ],
        views: SECTION_VIEWS,
        pickingRadius: 8,
    },
    parameters: storyDocs(
        [
            "Demonstrates the `sectionPath` prop. Each path point is `[abscissa, depth]`",
            "where `abscissa` is the cumulative distance along the fence.",
            "The **left** viewport (OrbitView) projects the abscissa back onto the",
            "L-shaped world-space fence, producing a 3-D fence diagram.",
            "The **right** viewport (SectionView) renders the paths flat in",
            "abscissa/depth space, giving a classic cross-section view.",
        ].join(" ")
    ),
    render: (args) => (
        <AnnotationRoot>
            <SubsurfaceViewer {...args}>
                {annotateView(
                    "view_3d",
                    <>
                        <h2 className={annotationClasses.annotation}>
                            3D fence diagram [x, y, z]
                        </h2>
                        <p className={annotationClasses.annotation}>
                            Abscissa values are projected back onto the L-shaped
                            world-space fence.
                        </p>
                    </>
                )}
                {annotateView(
                    "view_section",
                    <>
                        <h2 className={annotationClasses.annotation}>
                            Section view [abscissa, depth]
                        </h2>
                        <p className={annotationClasses.annotation}>
                            Paths rendered flat in abscissa/depth space.
                        </p>
                    </>
                )}
            </SubsurfaceViewer>
        </AnnotationRoot>
    ),
};

// ---------------------------------------------------------------------------
// Story 7: Group-level styling — color, width and dash pattern
// ---------------------------------------------------------------------------
//
// Three groups — Horizons, Faults, Markers — each with independent color,
// line width and dash pattern. Both OrbitView (left) and OrthographicView
// (right) are shown simultaneously using DUAL_VIEWS.
//
// Dash patterns are stored as `dashArray: [dashLength, gapLength]` directly
// on each PolylineGroup object. The `getGroupDashArray` layer prop reads them
// back, which also enables PathStyleExtension internally. Setting dashLength
// to 0 leaves a group's lines solid.
//
type GroupStylingArgs = {
    groupAColor: string;
    groupAWidth: number;
    groupADashLength: number;
    groupAGapLength: number;
    groupBColor: string;
    groupBWidth: number;
    groupBDashLength: number;
    groupBGapLength: number;
    highPrecisionDash: boolean;
};

const GroupStylingWrapper = ({
    groupAColor = "rgba(224, 80, 80, 1)",
    groupAWidth = 3,
    groupADashLength = 0,
    groupAGapLength = 4,
    groupBColor = "rgba(80, 192, 80, 1)",
    groupBWidth = 4,
    groupBDashLength = 0,
    groupBGapLength = 4,
    highPrecisionDash = false,
}: GroupStylingArgs) => {
    const data: PolylineGroup[] = [
        {
            id: "group-a",
            name: "Group A",
            color: getRgba(groupAColor),
            width: groupAWidth,
            dashArray: mkDash(groupADashLength, groupAGapLength),
            polylines: GROUP_A_PATHS.map((path) => ({ path })),
        },
        {
            id: "group-b",
            name: "Group B",
            color: getRgba(groupBColor),
            width: groupBWidth,
            dashArray: mkDash(groupBDashLength, groupBGapLength),
            polylines: GROUP_B_PATHS.map((path) => ({ path })),
        },
    ];

    return (
        <AnnotationRoot>
            <SubsurfaceViewer
                id="polyline-group-styling"
                layers={[
                    GROUP_STYLING_AXES_LAYER,
                    new PolylineGroupLayer({
                        id: "group-styling-layer",
                        name: "Group Styling",
                        data,
                        widthUnits: "pixels",
                        ZIncreasingDownwards: true,
                        // Reading dashArray from the group object and returning it
                        // here enables PathStyleExtension inside the layer.
                        getGroupDashArray: (g: PolylineGroup) =>
                            g.dashArray ?? null,
                        highPrecisionDash,
                    }),
                ]}
                bounds={GROUP_STYLING_BOUNDS}
                views={DUAL_VIEWS}
            >
                {annotateView(
                    "view_3d",
                    <h2 className={annotationClasses.annotation}>
                        3D view [x, y, z]
                    </h2>
                )}
                {annotateView(
                    "view_2d",
                    <h2 className={annotationClasses.annotation}>
                        2D top view [x, y]
                    </h2>
                )}
            </SubsurfaceViewer>
        </AnnotationRoot>
    );
};

export const GroupLevelStyling: StoryObj<typeof GroupStylingWrapper> = {
    args: {
        groupAColor: "rgba(224, 80, 80, 1)",
        groupAWidth: 3,
        groupADashLength: 0,
        groupAGapLength: 4,
        groupBColor: "rgba(80, 192, 80, 1)",
        groupBWidth: 4,
        groupBDashLength: 0,
        groupBGapLength: 4,
        highPrecisionDash: false,
    },
    argTypes: {
        groupAColor: { name: "Group A — color" },
        groupAWidth: {
            name: "Group A — width (px)",
            control: { type: "range", min: 1, max: 20, step: 1 },
        },
        groupADashLength: {
            name: "Group A — dash length (0 = solid)",
            control: { type: "range", min: 0, max: 40, step: 1 },
        },
        groupAGapLength: {
            name: "Group A — gap length",
            control: { type: "range", min: 1, max: 40, step: 1 },
        },
        groupBColor: { name: "Group B — color" },
        groupBWidth: {
            name: "Group B — width (px)",
            control: { type: "range", min: 1, max: 20, step: 1 },
        },
        groupBDashLength: {
            name: "Group B — dash length (0 = solid)",
            control: { type: "range", min: 0, max: 40, step: 1 },
        },
        groupBGapLength: {
            name: "Group B — gap length",
            control: { type: "range", min: 1, max: 40, step: 1 },
        },
        highPrecisionDash: {
            name: "High-precision dash",
            control: { type: "boolean" },
        },
    },
    parameters: storyDocs(
        [
            "Two groups of three polylines — **Group A** (lower half) and **Group B** (upper half) —",
            "separated by a gap in world space.",
            "Both the **OrbitView** (left) and **OrthographicView** (right) are shown.",
            "",
            "Each group has independently controlled **color**, **width** and **dash pattern**.",
            "Set *dash length* > 0 to enable dashing for that group; *gap length* controls",
            "the space between dashes. A *dash length* of 0 keeps the lines solid.",
            "",
            "Enable **high-precision dash** for sharper dash edges at segment joins",
            "(slightly higher GPU cost).",
        ].join(" ")
    ),
    render: (args) => <GroupStylingWrapper {...args} />,
};

// ---------------------------------------------------------------------------
// Story 8: Per-polyline style overrides — color, width and dash pattern
// ---------------------------------------------------------------------------
//
// Same two-group, three-polyline layout as GroupLevelStyling. Each group has
// a group-level color, width and dash pattern that all three of its polylines
// inherit. The **middle polyline** in each group (A2 / B2) can be overridden
// individually, demonstrating the resolution cascade:
//   polyline.color > group.color > defaultGroupColor

type PolylineOverrideArgs = {
    groupAColor: string;
    groupAWidth: number;
    groupADashLength: number;
    groupAGapLength: number;
    a2Color: string;
    a2Width: number;
    a2DashLength: number;
    a2GapLength: number;
    groupBColor: string;
    groupBWidth: number;
    groupBDashLength: number;
    groupBGapLength: number;
    b2Color: string;
    b2Width: number;
    b2DashLength: number;
    b2GapLength: number;
    highPrecisionDash: boolean;
};

const PolylineOverrideWrapper = ({
    groupAColor = "rgba(224, 80, 80, 1)",
    groupAWidth = 3,
    groupADashLength = 0,
    groupAGapLength = 4,
    a2Color = "rgba(224, 192, 48, 1)",
    a2Width = 7,
    a2DashLength = 12,
    a2GapLength = 4,
    groupBColor = "rgba(80, 192, 80, 1)",
    groupBWidth = 3,
    groupBDashLength = 0,
    groupBGapLength = 4,
    b2Color = "rgba(48, 144, 208, 1)",
    b2Width = 7,
    b2DashLength = 6,
    b2GapLength = 6,
    highPrecisionDash = false,
}: PolylineOverrideArgs) => {
    const data: PolylineGroup[] = [
        {
            id: "group-a",
            name: "Group A",
            color: getRgba(groupAColor),
            width: groupAWidth,
            dashArray: mkDash(groupADashLength, groupAGapLength),
            polylines: [
                { id: "a1", path: GROUP_A_PATHS[0] },
                {
                    id: "a2",
                    path: GROUP_A_PATHS[1],
                    color: getRgba(a2Color),
                    width: a2Width,
                    dashArray: mkDash(a2DashLength, a2GapLength),
                },
                { id: "a3", path: GROUP_A_PATHS[2] },
            ],
        },
        {
            id: "group-b",
            name: "Group B",
            color: getRgba(groupBColor),
            width: groupBWidth,
            dashArray: mkDash(groupBDashLength, groupBGapLength),
            polylines: [
                { id: "b1", path: GROUP_B_PATHS[0] },
                {
                    id: "b2",
                    path: GROUP_B_PATHS[1],
                    color: getRgba(b2Color),
                    width: b2Width,
                    dashArray: mkDash(b2DashLength, b2GapLength),
                },
                { id: "b3", path: GROUP_B_PATHS[2] },
            ],
        },
    ];

    return (
        <AnnotationRoot>
            <SubsurfaceViewer
                id="polyline-override-styling"
                layers={[
                    GROUP_STYLING_AXES_LAYER,
                    new PolylineGroupLayer({
                        id: "polyline-override-layer",
                        name: "Polyline Overrides",
                        data,
                        widthUnits: "pixels",
                        ZIncreasingDownwards: true,
                        getGroupDashArray: (g) => g.dashArray ?? null,
                        getPolylineDashArray: (p) => p.dashArray ?? null,
                        highPrecisionDash,
                    }),
                ]}
                bounds={GROUP_STYLING_BOUNDS}
                views={DUAL_VIEWS}
            >
                {annotateView(
                    "view_3d",
                    <h2 className={annotationClasses.annotation}>
                        3D view [x, y, z]
                    </h2>
                )}
                {annotateView(
                    "view_2d",
                    <h2 className={annotationClasses.annotation}>
                        2D top view [x, y]
                    </h2>
                )}
            </SubsurfaceViewer>
        </AnnotationRoot>
    );
};

export const PolylineLevelStyling: StoryObj<typeof PolylineOverrideWrapper> = {
    args: {
        groupAColor: "rgba(224, 80, 80, 1)",
        groupAWidth: 3,
        groupADashLength: 0,
        groupAGapLength: 4,
        a2Color: "rgba(224, 192, 48, 1)",
        a2Width: 7,
        a2DashLength: 12,
        a2GapLength: 4,
        groupBColor: "rgba(80, 192, 80, 1)",
        groupBWidth: 3,
        groupBDashLength: 0,
        groupBGapLength: 4,
        b2Color: "rgba(48, 144, 208, 1)",
        b2Width: 7,
        b2DashLength: 6,
        b2GapLength: 6,
        highPrecisionDash: false,
    },
    argTypes: {
        groupAColor: { name: "Group A — color" },
        groupAWidth: {
            name: "Group A — width (px)",
            control: { type: "range", min: 1, max: 20, step: 1 },
        },
        groupADashLength: {
            name: "Group A — dash length (0 = solid)",
            control: { type: "range", min: 0, max: 40, step: 1 },
        },
        groupAGapLength: {
            name: "Group A — gap length",
            control: { type: "range", min: 1, max: 40, step: 1 },
        },
        a2Color: { name: "A2 override — color" },
        a2Width: {
            name: "A2 override — width (px)",
            control: { type: "range", min: 1, max: 20, step: 1 },
        },
        a2DashLength: {
            name: "A2 override — dash length (0 = solid)",
            control: { type: "range", min: 0, max: 40, step: 1 },
        },
        a2GapLength: {
            name: "A2 override — gap length",
            control: { type: "range", min: 1, max: 40, step: 1 },
        },
        groupBColor: { name: "Group B — color" },
        groupBWidth: {
            name: "Group B — width (px)",
            control: { type: "range", min: 1, max: 20, step: 1 },
        },
        groupBDashLength: {
            name: "Group B — dash length (0 = solid)",
            control: { type: "range", min: 0, max: 40, step: 1 },
        },
        groupBGapLength: {
            name: "Group B — gap length",
            control: { type: "range", min: 1, max: 40, step: 1 },
        },
        b2Color: { name: "B2 override — color" },
        b2Width: {
            name: "B2 override — width (px)",
            control: { type: "range", min: 1, max: 20, step: 1 },
        },
        b2DashLength: {
            name: "B2 override — dash length (0 = solid)",
            control: { type: "range", min: 0, max: 40, step: 1 },
        },
        b2GapLength: {
            name: "B2 override — gap length",
            control: { type: "range", min: 1, max: 40, step: 1 },
        },
        highPrecisionDash: {
            name: "High-precision dash",
            control: { type: "boolean" },
        },
    },
    parameters: storyDocs(
        [
            "Same two-group, three-polyline layout as *Group Level Styling*.",
            "Each group has group-level **color**, **width** and **dash pattern** that",
            "all three of its polylines inherit by default.",
            "",
            "The **middle polyline** in each group (A2 / B2) carries individual",
            "`Polyline.color`, `.width` and `.dashArray` overrides, demonstrating the",
            "resolution cascade: polyline property → group property → layer default.",
            "",
            "Both the **OrbitView** (left) and **OrthographicView** (right) are shown.",
        ].join(" ")
    ),
    render: (args) => <PolylineOverrideWrapper {...args} />,
};

// ---------------------------------------------------------------------------
// Story 9: Discontinuous polylines — horizons cut by faults
// ---------------------------------------------------------------------------
//
// A polyline's `path` can be a `PolylineGroup` instead of `Position[]`.
// In that case the group's `polylines` define disjoint segments that share
// the same logical identity (id, picking, visibility).
//
// Use case: a seismic horizon cut by two faults into three separate segments.
// Each segment is a full `Polyline` and may carry its own `color`, `width`,
// and `dashArray` overrides — enabling, for example, highlighting the segment
// that lies in the footwall of a specific fault.
//
// The scene below contains:
//   • Red horizon ("horizon-red")  — 3 segments; middle segment is yellow.
//   • Green horizon ("horizon-green") — 3 segments; all at group color.
//   • Fault group — 2 solid blue vertical fault-trace polylines (normal paths).
//
// hiddenPolylineIds: toggling a horizon id hides ALL its segments at once,
// because each FlatEntry carries `_polyline = parentPolyline` (root id).

const DISC_AXES_LAYER = new AxesLayer({
    id: "axes-disc",
    name: "Axes",
    bounds: [-1, -1, 0, 14, 7, 8],
});

// Two normal (dip-slip) faults at x = 4 and x = 9.
// The throw is a depth (Z) offset: the hanging-wall block (right of each fault)
// is displaced *downward* by Z_THROW_F1 / Z_THROW_F2.
// Each horizon lies at a constant Y throughout — there is no horizontal
// (Y-direction) displacement — so the faults are truly vertical: they extend
// in the Z direction and appear as vertical sticks in the 3D view.
//
// Each fault is represented by two vertical sticks, one at each horizon's Y,
// so the stick visually pierces the horizon at the fault plane.
const FAULT_X1 = 4;
const FAULT_X2 = 9;
const Z_THROW_F1 = 1.5; // downward depth-throw at fault 1
const Z_THROW_F2 = 1.0; // downward depth-throw at fault 2

const RED_Y = 1; // Y position of the red horizon
const GREEN_Y = 5; // Y position of the green horizon

const DISC_GROUPS: PolylineGroup[] = [
    {
        id: "horizons",
        name: "Horizons",
        polylines: [
            {
                id: "horizon-red",
                // No top-level path Position[] — path is a PolylineGroup.
                color: [210, 60, 60, 255],
                width: 3,
                path: {
                    polylines: [
                        // Segment 1: footwall (left of fault 1)
                        {
                            path: [
                                [0, RED_Y, 1.0],
                                [FAULT_X1, RED_Y, 1.5],
                            ],
                        },
                        // Segment 2 (middle, highlighted yellow):
                        // thrown down by Z_THROW_F1 at fault 1.
                        {
                            color: [220, 200, 30, 255],
                            path: [
                                [FAULT_X1, RED_Y, 1.5 + Z_THROW_F1],
                                [FAULT_X2, RED_Y, 3.2],
                            ],
                        },
                        // Segment 3: thrown down again by Z_THROW_F2 at fault 2.
                        {
                            path: [
                                [FAULT_X2, RED_Y, 3.2 + Z_THROW_F2],
                                [13, RED_Y, 4.7],
                            ],
                        },
                    ],
                },
            },
            {
                id: "horizon-green",
                color: [60, 180, 60, 255],
                width: 3,
                path: {
                    polylines: [
                        {
                            path: [
                                [0, GREEN_Y, 3.5],
                                [FAULT_X1, GREEN_Y, 4.0],
                            ],
                        },
                        {
                            path: [
                                [FAULT_X1, GREEN_Y, 4.0 + Z_THROW_F1],
                                [FAULT_X2, GREEN_Y, 5.7],
                            ],
                        },
                        {
                            path: [
                                [FAULT_X2, GREEN_Y, 5.7 + Z_THROW_F2],
                                [13, GREEN_Y, 7.2],
                            ],
                        },
                    ],
                },
            },
        ],
    },
    {
        id: "faults",
        name: "Faults",
        color: [80, 80, 220, 255],
        width: 2,
        polylines: [
            // Each fault is represented by two vertical sticks — one at each
            // horizon's Y — spanning from above the footwall cut to below the
            // hanging-wall cut.  The sticks are vertical (varying Z only).
            {
                id: "fault-1-red",
                path: [
                    [FAULT_X1, RED_Y, 0.5],
                    [FAULT_X1, RED_Y, 3.8],
                ],
            },
            {
                id: "fault-1-green",
                path: [
                    [FAULT_X1, GREEN_Y, 3.0],
                    [FAULT_X1, GREEN_Y, 6.2],
                ],
            },
            {
                id: "fault-2-red",
                path: [
                    [FAULT_X2, RED_Y, 2.2],
                    [FAULT_X2, RED_Y, 4.8],
                ],
            },
            {
                id: "fault-2-green",
                path: [
                    [FAULT_X2, GREEN_Y, 4.7],
                    [FAULT_X2, GREEN_Y, 7.5],
                ],
            },
        ],
    },
];

type DiscontinuousArgs = {
    hiddenPolylineIds: string[];
    redColor: string;
    redWidth: number;
    greenColor: string;
    greenWidth: number;
    faultColor: string;
};

const DiscontinuousPolylinesView = ({
    hiddenPolylineIds = [],
    redColor = "rgba(210, 60, 60, 1)",
    redWidth = 3,
    greenColor = "rgba(60, 180, 60, 1)",
    greenWidth = 3,
    faultColor = "rgba(80, 80, 220, 1)",
}: DiscontinuousArgs) => {
    const data: PolylineGroup[] = [
        {
            ...DISC_GROUPS[0],
            polylines: [
                {
                    ...(DISC_GROUPS[0].polylines as Polyline[])[0],
                    color: getRgba(redColor),
                    width: redWidth,
                },
                {
                    ...(DISC_GROUPS[0].polylines as Polyline[])[1],
                    color: getRgba(greenColor),
                    width: greenWidth,
                },
            ],
        },
        {
            ...DISC_GROUPS[1],
            color: getRgba(faultColor),
        },
    ];

    const layer = new PolylineGroupLayer({
        id: "disc-layer",
        name: "Discontinuous Horizons",
        data,
        pickable: true,
        widthUnits: "pixels",
        ZIncreasingDownwards: true,
        hiddenPolylines: new Set<string | number>(hiddenPolylineIds),
    });

    return (
        <AnnotationRoot>
            <SubsurfaceViewer
                id="polyline-group-disc"
                layers={[DISC_AXES_LAYER, layer]}
                views={DUAL_VIEWS}
            >
                {annotateView(
                    "view_3d",
                    <>
                        <h2 className={annotationClasses.annotation}>
                            3D view [x, y, z]
                        </h2>
                        <p className={annotationClasses.annotation}>
                            Angled view — Z-throw depth offset is visible as
                            vertical steps at the fault planes.
                        </p>
                    </>
                )}
                {annotateView(
                    "view_2d",
                    <h2 className={annotationClasses.annotation}>
                        2D top view [x, y]
                    </h2>
                )}
            </SubsurfaceViewer>
        </AnnotationRoot>
    );
};

export const DiscontinuousPolylines: StoryObj<
    typeof DiscontinuousPolylinesView
> = {
    args: {
        hiddenPolylineIds: [],
        redColor: "rgba(210, 60, 60, 1)",
        redWidth: 3,
        greenColor: "rgba(60, 180, 60, 1)",
        greenWidth: 3,
        faultColor: "rgba(80, 80, 220, 1)",
    },
    argTypes: {
        hiddenPolylineIds: {
            name: "Hidden horizons",
            control: { type: "check" },
            options: ["horizon-red", "horizon-green"],
        },
        redColor: { name: "Red horizon — color" },
        redWidth: {
            name: "Red horizon — width (px)",
            control: { type: "range", min: 1, max: 20, step: 1 },
        },
        greenColor: { name: "Green horizon — color" },
        greenWidth: {
            name: "Green horizon — width (px)",
            control: { type: "range", min: 1, max: 20, step: 1 },
        },
        faultColor: { name: "Fault color" },
    },
    parameters: storyDocs(
        [
            "Demonstrates **discontinuous polylines** — a single logical polyline",
            "whose `path` is a `PolylineGroup` of disjoint segments.",
            "",
            "Two horizons (**red** and **green**) are each cut into three segments",
            "by two normal faults. The throw is a **depth (Z) offset** on the",
            "hanging-wall block, so the faults are truly vertical in 3D.",
            "The middle segment of the red horizon carries a **yellow**",
            "per-segment color override, demonstrating that individual segments",
            "can be independently styled (e.g. for highlighting).",
            "",
            "Each fault is shown as two **vertical blue sticks** — one per horizon",
            "Y position — piercing the horizon at its throw point.",
            "",
            "Toggling a horizon in *Hidden horizons* hides **all its segments**",
            "simultaneously, because all segments share the same root `Polyline` id.",
            "**Hover** over any segment to see the root horizon name and depth in the",
            "info card — picking always returns the root `Polyline`, not the segment.",
        ].join(" ")
    ),
    render: (args) => <DiscontinuousPolylinesView {...args} />,
};

// ---------------------------------------------------------------------------
// Story 10: Horizons on a well-derived section path
// ---------------------------------------------------------------------------
//
// Demonstrates using `sectionPath` with a fence computed dynamically from
// real well trajectories rather than a hard-coded geometry.
//
// A small synthetic well field (6 wells) is ordered by the nearest-neighbour
// abscissa transform (`useAbscissaTransform`).  The resulting world-space path
// is passed to `PolylineGroupLayer.sectionPath` as a 2-D XY fence.
// Horizon polylines are expressed in [abscissa, depth] space; the layer
// automatically:
//   • projects abscissa back to world XY in the OrbitView (3-D fence diagram)
//   • renders abscissa/depth as-is in the SectionView (classic cross-section)
//
// The deeper horizon (green) is a simple dipping polyline.
// The shallower horizon (red) is discontinuous — cut by a normal fault at
// 45 % along the section — with the hanging-wall segment highlighted yellow,
// reusing the `path: PolylineGroup` approach from Story 9.
//
// The two WellsLayer instances share the same well data, but only one applies
// `section: transform`; filterSubLayer on the PolylineGroupLayer ensures each
// sub-layer renders in the correct viewport.

const WELL_HORIZON_3D_BOUNDS: [number, number, number, number] = [
    450000, 6781000, 464000, 6791000,
];

/**
 * Resample a polyline expressed in [abscissa, depth, 0] space by inserting
 * intermediate points at every sectionPath breakpoint abscissa that falls
 * strictly within each segment's abscissa range.
 *
 * Without this, the 3-D projection renders a straight world-space line between
 * the projected endpoints of each segment, cutting through space instead of
 * following the fence bends. With it, every kink in the fence gets a sample
 * point and the 3-D path drapes correctly onto the fence curtain.
 */
function resampleAlongFence(pts: Position[], cumDist: number[]): Position[] {
    if (pts.length < 2) return pts;
    const result: Position[] = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
        const a0 = pts[i][0];
        const d0 = pts[i][1];
        const a1 = pts[i + 1][0];
        const d1 = pts[i + 1][1];
        const span = a1 - a0;
        if (span !== 0) {
            for (const ab of cumDist) {
                if (ab > a0 && ab < a1) {
                    const t = (ab - a0) / span;
                    result.push([ab, d0 + t * (d1 - d0), 0]);
                }
            }
        }
        result.push(pts[i + 1]);
    }
    return result;
}

const WellSectionHorizonWrapper: React.FC = () => {
    // 6 wells drawn from 6 distinct head positions so the section path is clear.
    const wellData = useSyntheticWellCollection(6, 6, {
        sampleCount: 20,
        segmentLength: 150,
        dipDeviationMagnitude: 10,
    });

    // useAbscissaTransform provides:
    //   transform — passed to WellsLayer.section; sets path as a side-effect
    //   path      — the world-space 3-D trajectory of the ordered well chain
    const { transform, path } = useAbscissaTransform();

    // sectionPath for PolylineGroupLayer is the 2-D XY projection of the
    // world-space section path produced by the abscissa transform.
    const sectionPath = React.useMemo<Point2D[]>(
        () => path.map((p) => [p[0], p[1]]),
        [path]
    );

    // Cumulative length of the 2-D fence = max abscissa value.
    const abscissaMax = React.useMemo(() => {
        if (sectionPath.length < 2) return 0;
        let sum = 0;
        for (let i = 1; i < sectionPath.length; i++) {
            const dx = sectionPath[i][0] - sectionPath[i - 1][0];
            const dy = sectionPath[i][1] - sectionPath[i - 1][1];
            sum += Math.sqrt(dx * dx + dy * dy);
        }
        return sum;
    }, [sectionPath]);

    // One planar vertical quad per path segment forms the fence curtain.
    // Each quad is [topLeft, topRight, bottomRight, bottomLeft] in world XYZ.
    // deck.gl's earcut triangualtion uses dim=3 and picks the XZ or YZ
    // projection plane (never XY, which degenerates to a line for a vertical
    // quad), so each quad tessellates into exactly 2 triangles correctly.
    //
    // path z values are already inverted (ZIncreasingDownwards causes
    // WellsLayer to negate z before calling the abscissa transform):
    //   surface ≈ z = 0; deepest point ≈ z = −3000.
    const fenceQuads = React.useMemo<Position[][]>(() => {
        if (path.length < 2) return [];
        const zValues = path.map((p) => p[2] ?? 0);
        const zTop = Math.max(...zValues) + 100; // 100 m above shallowest
        const zBottom = Math.min(...zValues) - 100; // 100 m below deepest
        const quads: Position[][] = [];
        for (let i = 0; i < path.length - 1; i++) {
            const p1 = path[i];
            const p2 = path[i + 1];
            quads.push([
                [p1[0], p1[1], zTop],
                [p2[0], p2[1], zTop],
                [p2[0], p2[1], zBottom],
                [p1[0], p1[1], zBottom],
            ]);
        }
        return quads;
    }, [path]);

    // Horizon geometry in [abscissa, depth, 0] space.
    // Depths are positive-downward; ZIncreasingDownwards:true on the layer
    // negates them so they appear below the surface in section/3D views.
    // Horizon data is computed once abscissaMax is known (requires one
    // render cycle after wells are processed by the section transform).
    const horizonData = React.useMemo<PolylineGroup[]>(() => {
        if (abscissaMax === 0) return [];

        // Build cumulative-distance breakpoints matching sectionPath nodes.
        // resampleAlongFence inserts a sample point at each breakpoint that
        // falls inside a segment, so the 3-D projection follows every kink in
        // the fence instead of drawing a straight line between endpoints.
        const cumDist: number[] = [0];
        for (let i = 1; i < sectionPath.length; i++) {
            const dx = sectionPath[i][0] - sectionPath[i - 1][0];
            const dy = sectionPath[i][1] - sectionPath[i - 1][1];
            cumDist.push(cumDist[i - 1] + Math.sqrt(dx * dx + dy * dy));
        }

        const L = abscissaMax;
        const faultAbs = L * 0.45; // fault cut at 45 % along section
        const zThrow = 300; // depth throw (m) on hanging-wall

        return [
            {
                id: "well-horizons",
                name: "Horizons",
                polylines: [
                    {
                        // Shallower horizon — cut by a fault.
                        id: "horizon-shallow",
                        color: [210, 60, 60, 255],
                        width: 3,
                        path: {
                            polylines: [
                                {
                                    // Footwall segment (left of fault)
                                    path: resampleAlongFence(
                                        [
                                            [0, 1500, 0],
                                            [
                                                faultAbs,
                                                1500 + faultAbs * 0.015,
                                                0,
                                            ],
                                        ],
                                        cumDist
                                    ),
                                },
                                {
                                    // Hanging-wall segment (right of fault),
                                    // thrown down by zThrow, highlighted yellow.
                                    color: [220, 200, 30, 255],
                                    path: resampleAlongFence(
                                        [
                                            [
                                                faultAbs,
                                                1500 +
                                                    faultAbs * 0.015 +
                                                    zThrow,
                                                0,
                                            ],
                                            [L, 1500 + L * 0.015 + zThrow, 0],
                                        ],
                                        cumDist
                                    ),
                                },
                            ],
                        },
                    },
                    {
                        // Deeper continuous horizon.
                        id: "horizon-deep",
                        color: [60, 180, 60, 255],
                        width: 3,
                        path: resampleAlongFence(
                            [
                                [0, 2600, 0],
                                [L * 0.33, 2600 + L * 0.33 * 0.012, 0],
                                [L * 0.67, 2600 + L * 0.67 * 0.012, 0],
                                [L, 2600 + L * 0.012, 0],
                            ],
                            cumDist
                        ),
                    },
                ],
            },
        ];
    }, [abscissaMax, sectionPath]);

    const views = React.useMemo<ViewsType>(
        () => ({
            layout: [1, 2],
            viewports: [
                {
                    id: "view-3d",
                    viewType: OrbitView,
                    layerIds: [
                        "wells-3d",
                        "axes-3d-wh",
                        "horizon-layer",
                        "fence-layer",
                    ],
                },
                {
                    id: "view-section",
                    viewType: SectionView,
                    // Target the centre of the section content once abscissaMax
                    // is known.  x = mid-abscissa; y = -(mid-depth) in deck.gl
                    // space (ZIncreasingDownwards negates depth).
                    target: [abscissaMax > 0 ? abscissaMax / 2 : 1500, -2050],
                    zoom: -4,
                    layerIds: ["wells-section", "axes-2d-wh", "horizon-layer"],
                },
            ],
        }),
        [abscissaMax]
    );

    return (
        <AnnotationRoot>
            <SubsurfaceViewer
                id="well-section-horizons"
                bounds={WELL_HORIZON_3D_BOUNDS}
                views={views}
                layers={[
                    // 3-D well trajectories in world space (no section transform).
                    new WellsLayer({
                        id: "wells-3d",
                        data: wellData,
                        wellHeadStyle: { size: 3 },
                        ZIncreasingDownwards: true,
                    }),
                    // Wells unfolded to [abscissa, depth] section space.
                    new WellsLayer({
                        id: "wells-section",
                        data: wellData,
                        section: transform,
                        ZIncreasingDownwards: true,
                    }),
                    // Horizon polylines projected via sectionPath.
                    // filterSubLayer routes paths-3d → OrbitView, paths-section → SectionView.
                    new PolylineGroupLayer({
                        id: "horizon-layer",
                        name: "Section Horizons",
                        data: horizonData,
                        sectionPath,
                        pickable: true,
                        widthUnits: "pixels",
                        ZIncreasingDownwards: true,
                    }),
                    new AxesLayer({
                        id: "axes-3d-wh",
                        // Data-space bounds (z positive = depth downward);
                        // AxesLayer with ZIncreasingDownwards:true (default) negates
                        // z internally, matching the wells rendered at deck.gl z ≤ 0.
                        bounds: [450000, 6781000, 0, 464000, 6791000, 3000],
                    }),
                    new Axes2DLayer({ id: "axes-2d-wh" }),
                    // Vertical fence curtain — 3-D only (OrbitView).
                    // PolygonLayer is a composite; its fill sub-layer id is 'fill'.
                    // Passing _full3d:true via _subLayerProps makes earcut compare
                    // XY/XZ/YZ projected areas and pick the largest, so each
                    // vertical quad (zero XY area) tessellates correctly in XZ/YZ.
                    new PolygonLayer<Position[]>({
                        id: "fence-layer",
                        data: fenceQuads,
                        getPolygon: (d) => d,
                        filled: true,
                        getFillColor: [100, 160, 220, 90],
                        stroked: true,
                        getLineColor: [80, 130, 200, 200],
                        lineWidthMinPixels: 1,
                        // Propagate _full3d to the SolidPolygonLayer fill sub-layer.
                        _subLayerProps: {
                            fill: { _full3d: true },
                        },
                    }),
                ]}
            >
                {annotateView(
                    "view-3d",
                    <>
                        <h2 className={annotationClasses.annotation}>
                            3D fence diagram [x, y, z]
                        </h2>
                        <p className={annotationClasses.annotation}>
                            Well trajectories and horizon polylines projected
                            onto the world-space fence curtain.
                        </p>
                    </>
                )}
                {annotateView(
                    "view-section",
                    <>
                        <h2 className={annotationClasses.annotation}>
                            Section view [abscissa, depth]
                        </h2>
                        <p className={annotationClasses.annotation}>
                            Horizon paths rendered flat in abscissa/depth space,
                            aligned to the well order.
                        </p>
                    </>
                )}
            </SubsurfaceViewer>
        </AnnotationRoot>
    );
};

export const HorizonsOnWellSectionPath: StoryObj<
    typeof WellSectionHorizonWrapper
> = {
    parameters: storyDocs(
        [
            "Demonstrates `sectionPath` with a **dynamically computed fence** derived",
            "from real well trajectories.",
            "",
            "Six synthetic wells are ordered by the nearest-neighbour abscissa transform",
            "(`useAbscissaTransform`). The world-space path of the ordered well chain is",
            "passed to `PolylineGroupLayer.sectionPath` as a 2-D XY fence.",
            "",
            "Horizon polylines are expressed in **`[abscissa, depth]`** space:",
            "- The **left viewport** (OrbitView) projects each abscissa value back onto",
            "  the world-space fence, producing a 3-D fence diagram that drapes across",
            "  the well field.",
            "- The **right viewport** (SectionView) renders the paths flat in",
            "  abscissa/depth space — a classic cross-section aligned to the well order.",
            "",
            "The **red (shallow) horizon** is discontinuous, cut by a normal fault at",
            "45 % along the section (same `path: PolylineGroup` pattern as Story 9).",
            "The hanging-wall segment is highlighted **yellow**.",
            "The **green (deep) horizon** is a simple dipping polyline.",
            "",
            "Hover any horizon segment to see its id and depth in the info card.",
        ].join(" ")
    ),
    render: () => <WellSectionHorizonWrapper />,
};

// ---------------------------------------------------------------------------
// Story 11: Front-to-back polyline ordering in orthographic and section views
// ---------------------------------------------------------------------------
//
// Three line groups cross each other at the centre of a [0, 10] × [0, 10]
// coordinate space:
//   Red  : diagonal from (1, 1) to (9, 9)
//   Green: diagonal from (1, 9) to (9, 1)
//   Blue : horizontal  from (1, 5) to (9, 5)
// All three lines intersect at (5, 5).
//
// LEFT column — 2-D coordinates [x, y], no Z component.
//   All paths share the same implicit depth (0), so deck.gl draws them in
//   data order.  Blue (listed last) is painted on top at every intersection,
//   regardless of intent.
//
// RIGHT column — 3-D coordinates [x, y, z].
//   ZIncreasingDownwards: true maps z = 0 to the front (surface) and larger
//   z values away from the viewer.  Red is assigned z = 0 (front), Green
//   z = 2, Blue z = 4 (back).  Red wins every depth-test intersection
//   independent of data order.
//
// TOP row    — OrthographicView (plan / top-down view)
// BOTTOM row — SectionView (cross-section; y = depth increasing downward)
//   In the section views the Red line reads as a dipping horizon, Green as
//   an anti-dip horizon, and Blue as a flat horizon.

const ORDERING_DATA_2D: PolylineGroup[] = [
    {
        id: "red",
        name: "Red (data-order: first → behind)",
        color: [220, 60, 60, 255],
        width: 8,
        polylines: [
            {
                id: "r1",
                path: [
                    [1, 1],
                    [9, 9],
                ],
            },
        ],
    },
    {
        id: "green",
        name: "Green (data-order: second)",
        color: [60, 180, 60, 255],
        width: 8,
        polylines: [
            {
                id: "g1",
                path: [
                    [1, 9],
                    [9, 1],
                ],
            },
        ],
    },
    {
        id: "blue",
        name: "Blue (data-order: last → on top)",
        color: [60, 100, 220, 255],
        width: 8,
        polylines: [
            {
                id: "b1",
                path: [
                    [1, 5],
                    [9, 5],
                ],
            },
        ],
    },
];

const ORDERING_DATA_3D: PolylineGroup[] = [
    {
        id: "red",
        name: "Red (z=0 — front)",
        color: [220, 60, 60, 255],
        width: 8,
        polylines: [
            {
                id: "r1",
                path: [
                    [1, 1, 0],
                    [9, 9, 0],
                ],
            },
        ],
    },
    {
        id: "green",
        name: "Green (z=2)",
        color: [60, 180, 60, 255],
        width: 8,
        polylines: [
            {
                id: "g1",
                path: [
                    [1, 9, 2],
                    [9, 1, 2],
                ],
            },
        ],
    },
    {
        id: "blue",
        name: "Blue (z=4 — back)",
        color: [60, 100, 220, 255],
        width: 8,
        polylines: [
            {
                id: "b1",
                path: [
                    [1, 5, 4],
                    [9, 5, 4],
                ],
            },
        ],
    },
];

const ORDERING_BOUNDS: BoundingBox2D = [-0.5, -0.5, 10.5, 10.5];

const ORDERING_VIEWS: ViewsType = {
    layout: [2, 2],
    viewports: [
        {
            id: "ortho-unordered",
            viewType: OrthographicView,
            layerIds: ["axes-ordering", "ordering-2d-layer"],
        },
        {
            id: "ortho-ordered",
            viewType: OrthographicView,
            layerIds: ["axes-ordering", "ordering-3d-layer"],
        },
        {
            id: "section-unordered",
            viewType: SectionView,
            layerIds: ["axes-ordering", "ordering-2d-layer"],
        },
        {
            id: "section-ordered",
            viewType: SectionView,
            layerIds: ["axes-ordering", "ordering-3d-layer"],
        },
    ],
};

export const PolylineOrdering: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "polyline-ordering",
        layers: [
            new Axes2DLayer({ id: "axes-ordering" }),
            new PolylineGroupLayer({
                id: "ordering-2d-layer",
                name: "Unordered polylines (2D coordinates)",
                data: ORDERING_DATA_2D,
                pickable: true,
                widthUnits: "pixels",
                ZIncreasingDownwards: true,
            }),
            new PolylineGroupLayer({
                id: "ordering-3d-layer",
                name: "Ordered polylines (3D coordinates)",
                data: ORDERING_DATA_3D,
                pickable: true,
                widthUnits: "pixels",
                ZIncreasingDownwards: true,
            }),
        ],
        bounds: ORDERING_BOUNDS,
        views: ORDERING_VIEWS,
    },
    parameters: storyDocs(
        [
            "Demonstrates front-to-back ordering of overlapping polylines.",
            "Three line groups — **Red**, **Green**, **Blue** — all cross at (5, 5).",
            "",
            "**Left column — unordered:** 2-D coordinates `[x, y]`, no Z component.",
            "All paths share the same implicit depth (0), so deck.gl uses data order",
            "to resolve overlaps: **Blue** (listed last) is painted on top at every",
            "intersection, regardless of intent.",
            "",
            "**Right column — ordered:** 3-D coordinates `[x, y, z]`.",
            "`ZIncreasingDownwards: true` maps z = 0 to the front and larger z away",
            "from the viewer. Red is z = 0 (front), Green z = 2, Blue z = 4 (back).",
            "**Red** wins every intersection via the depth test, independent of data order.",
            "",
            "**Top row** — OrthographicView (plan / top-down view).",
            "**Bottom row** — SectionView (cross-section; y = depth increasing downward).",
            "In the section views Red reads as a dipping horizon, Green as an anti-dip",
            "horizon, and Blue as a flat horizon at mid-depth.",
            "The ordering behaviour is identical in both view types.",
        ].join(" ")
    ),
    render: (args) => (
        <AnnotationRoot>
            <SubsurfaceViewer {...args}>
                {annotateView(
                    "ortho-unordered",
                    <>
                        <h2 className={annotationClasses.annotation}>
                            Orthographic — unordered (2D)
                        </h2>
                        <p className={annotationClasses.annotation}>
                            Blue paints last → appears on top
                        </p>
                    </>
                )}
                {annotateView(
                    "ortho-ordered",
                    <>
                        <h2 className={annotationClasses.annotation}>
                            Orthographic — ordered (3D z)
                        </h2>
                        <p className={annotationClasses.annotation}>
                            Red z=0 → wins depth test
                        </p>
                    </>
                )}
                {annotateView(
                    "section-unordered",
                    <>
                        <h2 className={annotationClasses.annotation}>
                            Section — unordered (2D)
                        </h2>
                        <p className={annotationClasses.annotation}>
                            Blue paints last → appears on top
                        </p>
                    </>
                )}
                {annotateView(
                    "section-ordered",
                    <>
                        <h2 className={annotationClasses.annotation}>
                            Section — ordered (3D z)
                        </h2>
                        <p className={annotationClasses.annotation}>
                            Red z=0 → wins depth test
                        </p>
                    </>
                )}
            </SubsurfaceViewer>
        </AnnotationRoot>
    ),
};

// ---------------------------------------------------------------------------
// Story 13: Depth test — polyline vs. horizon surface
//
// Two side-by-side orthographic views show the same scene: a Gaussian-bump
// horizon surface and a horizontal yellow polyline running at z = 5.
//   Left  (depthTest: false) — polyline ignores the depth buffer, always on top
//   Right (depthTest: true)  — depth test enabled; the polyline is occluded
//       wherever the surface is shallower than z = 5 (the warm-coloured centre
//       region), and visible where the surface is deeper (the cool outer ring).
//
// The surface uses elevation as its own colour map:
//   orange-red (v=0, z≈2, shallow)  →  purple (v=0.5, z=5)  →  blue (v=1, z≈8)
// A single contour ring is drawn at z = 5 (the intersection depth) so the
// depth-test boundary is clearly visible on the surface itself.
// ---------------------------------------------------------------------------

// Grid dimensions: 50×50 nodes at 0.2 world-unit spacing → 0..9.8 extent.
const DT_N = 50;
const DT_DX = 0.2; // world units per cell

/**
 * Build the Gaussian-bump height-field.
 * z ranges from ~2 (centre) to ~8 (boundary).
 * The polyline runs at z = 5, so it intersects the surface at a circle of
 * radius ≈ 11.77 index units (≈ 2.35 world units) around the grid centre.
 */
function makeDtHorizon(): number[] {
    const cx = (DT_N - 1) / 2; // 24.5
    const cy = (DT_N - 1) / 2;
    const sigma2 = 10 * 10; // σ = 10 index units = 2 world units
    const result: number[] = [];
    for (let j = 0; j < DT_N; j++) {
        for (let i = 0; i < DT_N; i++) {
            const di = i - cx;
            const dj = j - cy;
            result.push(8 - 6 * Math.exp(-(di * di + dj * dj) / (2 * sigma2)));
        }
    }
    return result;
}

const DT_HORIZON_MESH = makeDtHorizon();
const DT_WORLD_MAX = (DT_N - 1) * DT_DX; // 9.8
const DT_MID = DT_WORLD_MAX / 2; // 4.9

// Horizontal polyline through the grid centre at constant depth z = 5.
const DT_POLYLINE_DATA: PolylineGroup[] = [
    {
        id: "dt-line",
        name: "Polyline at z=5",
        color: [255, 230, 0, 255],
        width: 8,
        polylines: [
            {
                id: "dt-h",
                path: [
                    [0, DT_MID, 5],
                    [DT_WORLD_MAX, DT_MID, 5],
                ] as Position[],
            },
        ],
    },
];

const DT_HORIZON_LAYER = new MapLayer({
    id: "dt-horizon",
    frame: {
        origin: [0, 0],
        count: [DT_N, DT_N],
        increment: [DT_DX, DT_DX],
        rotDeg: 0,
    },
    // Using the same array for mesh (geometry) and properties (colour input).
    meshData: DT_HORIZON_MESH,
    propertiesData: DT_HORIZON_MESH,
    // Smooth warm→cool gradient: orange-red at shallow depths, blue at deep.
    colorMapFunction: (v: number) => [
        Math.round(240 - 220 * v), // 240 → 20  (red)
        80, // constant green
        Math.round(20 + 220 * v), // 20  → 240 (blue)
    ],
    colorMapRange: [2, 8],
    material: false, // pure colormap, no lighting shading
    ZIncreasingDownwards: true,
    gridLines: false,
    // Single contour ring at z = 5 — the exact intersection depth.
    // The next contour would be at z = 105 (outside data range), so only
    // one ring appears.
    contours: [5, 100],
    isContoursDepth: true,
});

const DT_VIEWS: ViewsType = {
    layout: [1, 3],
    viewports: [
        // OrbitView MUST be first: buildViewStates processes viewports in order
        // and mutates the shared scaledCamera object. Putting the 3D view first
        // ensures target / zoom are computed from the 3D bounding box; the two
        // OrthographicViews then reuse those values unchanged.
        {
            id: "dt-3d",
            viewType: OrbitView,
            layerIds: ["dt-horizon", "dt-polyline-on"],
        },
        {
            id: "dt-off",
            viewType: OrthographicView,
            layerIds: ["dt-horizon", "dt-polyline-off"],
        },
        {
            id: "dt-on",
            viewType: OrthographicView,
            layerIds: ["dt-horizon", "dt-polyline-on"],
        },
    ],
};

export const DepthTestVsHorizon: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "depth-test-demo",
        layers: [
            DT_HORIZON_LAYER,
            // depthTest: false — polyline always rendered on top of everything.
            new PolylineGroupLayer({
                id: "dt-polyline-off",
                name: "Polyline (depthTest: false)",
                data: DT_POLYLINE_DATA,
                widthUnits: "pixels",
                ZIncreasingDownwards: true,
                depthTest: false,
            }),
            // depthTest: true (default) — polyline participates in depth test;
            // hidden where the surface is shallower than z = 5.
            new PolylineGroupLayer({
                id: "dt-polyline-on",
                name: "Polyline (depthTest: true)",
                data: DT_POLYLINE_DATA,
                widthUnits: "pixels",
                ZIncreasingDownwards: true,
                depthTest: true,
            }),
        ],
        views: DT_VIEWS,
    },
    parameters: storyDocs(
        [
            "Demonstrates the effect of `depthTest` on a polyline rendered over a horizon surface.",
            "",
            "The surface is a Gaussian bump: minimum depth ~2 at the centre, ~8 at the boundary.",
            "The yellow polyline runs horizontally through the grid centre at z = 5.",
            "A contour ring at z = 5 marks the exact depth-test boundary on the surface.",
            "",
            "**Left — 3D view (`depthTest: true`):** the same scene in an OrbitView,",
            "showing the bump geometry and the polyline intersection in three dimensions.",
            "",
            "**Centre — `depthTest: false`:** the polyline ignores the depth buffer and is always",
            "painted on top, crossing the full width of the surface.",
            "",
            "**Right — `depthTest: true`:** the depth values written by the MapLayer are",
            "respected. Where the surface is shallower than z = 5 (roughly the inner 2.4-unit",
            "radius, shown in warm colours), the surface occludes the polyline.",
            "Outside that ring the surface is deeper and the polyline is visible.",
        ].join(" ")
    ),
    render: (args) => (
        <AnnotationRoot>
            <SubsurfaceViewer {...args}>
                {annotateView(
                    "dt-3d",
                    <>
                        <h2 className={annotationClasses.annotation}>
                            3D view (depthTest: true)
                        </h2>
                        <p className={annotationClasses.annotation}>
                            Orbit to see the bump geometry
                        </p>
                    </>
                )}
                {annotateView(
                    "dt-off",
                    <>
                        <h2 className={annotationClasses.annotation}>
                            depthTest: false
                        </h2>
                        <p className={annotationClasses.annotation}>
                            Polyline always on top
                        </p>
                    </>
                )}
                {annotateView(
                    "dt-on",
                    <>
                        <h2 className={annotationClasses.annotation}>
                            depthTest: true
                        </h2>
                        <p className={annotationClasses.annotation}>
                            Polyline hidden behind shallow surface
                        </p>
                    </>
                )}
            </SubsurfaceViewer>
        </AnnotationRoot>
    ),
};
