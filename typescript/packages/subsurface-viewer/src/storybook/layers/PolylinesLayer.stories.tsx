import React from "react";

import type { Meta, StoryObj } from "@storybook/react-webpack5";

import SubsurfaceViewer from "../../SubsurfaceViewer";

import { default3DViews, defaultStoryParameters } from "../sharedSettings";
import {
    createMathWithSeed,
    replaceNonJsonArgs,
} from "../sharedHelperFunctions";
import { OrbitView } from "@deck.gl/core";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Polylines Layer",
    args: {
        // Add some common controls for all the stories.
        triggerHome: 0,
    },
};
export default stories;

const sideSize = 10000;
const pointsCount = 100000;

const math = createMathWithSeed("123456789");

const hugePoints = new Array(pointsCount * 3)
    .fill(0)
    .map(() => math.random(sideSize));

// ---------In-place array data handling (storybook fails to rebuild non JSon data)--------------- //
const hugePolylinesTypedDataLayerId = "huge_polylines_typed_data_layer";

const nonJsonLayerArgs = {
    [hugePolylinesTypedDataLayerId]: {
        polylinePoints: new Float32Array(hugePoints),
        startIndices: new Uint32Array([0, pointsCount]),
    },
};

// Small example using polylinesLayer.
const smallPolylinesLayer = {
    "@@type": "PolylinesLayer",
    id: "small_polylines_layer",
    /* eslint-disable */
    polylinePoints: [
        0, 0, 0, 
        10, 0, 0, 
        10, 0, 10, 
        -5, -5, 4, 
        0, -8, 6, 
        5, 10, 8,
        3, 1, 2, 
        15, 8, 10,
    ],
    /* eslint-enable */
    startIndices: [0, 3, 6],
    polylinesClosed: [true, false],
    color: [
        [255, 0, 0],
        [0, 255, 0],
        [0, 0, 255],
    ],

    widthUnits: "pixels",
    linesWidth: 10,
    ZIncreasingDownwards: true,
};

const smallPolylinesLayerSingleColor = {
    "@@type": "PolylinesLayer",
    id: "small_polylines_layer_single_color",
    /* eslint-disable */
    polylinePoints: [
        0, 0, 0, 
        10, 0, 0, 
        10, 0, 10, 
        -5, -5, 4, 
        0, -8, 6, 
        5, 10, 8,
        3, 1, 2, 
        15, 8, 10,
    ],
    startIndices: [0, 3, 6],
    polylinesClosed: [true, false],
    color: [255, 0, 0],
    widthUnits: "pixels",
    linesWidth: 10,
    ZIncreasingDownwards: true,
};

const smallAxesLayer = {
    "@@type": "AxesLayer",
    id: "small_axes_layer",
    bounds: [-10, -10, 0, 20, 15, 10],
};

export const SmallPolylinesLayer: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "small-polylines",
        layers: [smallAxesLayer, smallPolylinesLayer, smallPolylinesLayerSingleColor],
        bounds: [-10, -10, 17, 10],
        views: {
            layout: [1, 2],
            showLabel: true,
            viewports: [
                {
                    id: "view_1",
                    layerIds: [smallAxesLayer.id, smallPolylinesLayer.id],
                    viewType: OrbitView,
                },
                {
                    id: "view_2",
                    layerIds: [
                        smallAxesLayer.id,
                        smallPolylinesLayerSingleColor.id,
                    ],
                    viewType: OrbitView,
                },
            ],
        },
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Polyline nodes are given as native javascript array.",
            },
        },
    },
};

const hugePolylinesLayer = {
    "@@type": "PolylinesLayer",
    id: "huge_polylines_layer",
    polylinePoints: hugePoints,
    startIndices: [0],
    color: [0, 100, 100, 40],

    widthUnits: "pixels",
    linesWidth: 1,

    ZIncreasingDownwards: true,
};

const hugeAxesLayer = {
    "@@type": "AxesLayer",
    id: "huge_axes_layer",
    bounds: [0, 0, 0, sideSize, sideSize, sideSize],
};

export const HugePolylinesLayer: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [hugeAxesLayer, hugePolylinesLayer],
        bounds: [0, 0, sideSize, sideSize],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Polyline nodes are randomly generated in runtime and given as native javascript arrays.",
            },
        },
    },
    render: (args) => (
        <SubsurfaceViewer {...replaceNonJsonArgs(args, nonJsonLayerArgs)} />
    ),
    tags: ["no-test"],
};

export const HugeLayerTypedArrayInput: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [
            hugeAxesLayer,
            {
                "@@type": "PolylinesLayer",
                id: hugePolylinesTypedDataLayerId,
                "@@typedArraySupport": true,

                polylinePoints:
                    nonJsonLayerArgs[hugePolylinesTypedDataLayerId]
                        .polylinePoints,
                startIndices:
                    nonJsonLayerArgs[hugePolylinesTypedDataLayerId]
                        .startIndices,
                color: [0, 100, 200, 40],

                widthUnits: "pixels",
                linesWidth: 1,

                ZIncreasingDownwards: true,
            },
        ],
        bounds: [0, 0, sideSize, sideSize],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Polyline nodes are randomly generated in runtime and given as javascript typed arrays.",
            },
        },
    },
    render: (args) => (
        <SubsurfaceViewer {...replaceNonJsonArgs(args, nonJsonLayerArgs)} />
    ),
    tags: ["no-test"],
};
