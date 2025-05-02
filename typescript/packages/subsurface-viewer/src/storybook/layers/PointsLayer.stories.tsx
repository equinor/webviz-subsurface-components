import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import SubsurfaceViewer from "../../SubsurfaceViewer";

import { default3DViews, defaultStoryParameters } from "../sharedSettings";
import {
    createMathWithSeed,
    replaceNonJsonArgs,
} from "../sharedHelperFunctions";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Points Layer",
    args: {
        // Add some common controls for all the stories.
        triggerHome: 0,
    },
};
export default stories;

/*eslint-disable */
const smallPointsData = [
    0,  0,  5,  // Vertex 1, x, y, z
    10, 0,  5,  // Vertex 2, x, y, z
    10, 10, 5,  // Vertex 3, x, y, z
    0,  10, 0,  // Vertex 4, x, y, z
    5,  -5, 10, // Vertex 5, x, y, z
    11, -4, 6,  // Vertex 6, x, y, z
    11, 0,  7,  // Vertex 7, x, y, z
    17, 0,  8,  // Vertex 8, x, y, z
];
/*eslint-enable */

const smallPointsTypedDataLayerPoints = new Float32Array(smallPointsData);

// Huge example using PointsLayer.
const sideSize = 10000;
const pointsCount = 100000;

const math = createMathWithSeed("1234");

const hugePointsData = Array(pointsCount * 3)
    .fill(0)
    .map(() => math.random(sideSize));

// ---------In-place array data handling (storybook fails to rebuild non JSon data)--------------- //
const smallPointsTypedDataLayerId = "small_points_typed_data_layer";
const hugePointsTypedDataLayerId = "huge_points_typed_data_layer";

const nonJsonLayerArgs = {
    [smallPointsTypedDataLayerId]: {
        pointsData: new Float32Array(smallPointsData),
    },
    [hugePointsTypedDataLayerId]: {
        pointsData: new Float32Array(hugePointsData),
    },
};

// Small example using PointsLayer.
const smallPointsLayer = {
    "@@type": "PointsLayer",
    id: "small_points_layer",
    pointsData: smallPointsData,
    color: [255, 0, 100],
    pointRadius: 10,
    radiusUnits: "pixels",
    ZIncreasingDownwards: true,
};

const smallAxesLayer = {
    "@@type": "AxesLayer",
    id: "small_axes_layer",
    bounds: [-10, -10, 0, 20, 15, 10],
};

export const SmallPointsLayer: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "small-points",
        layers: [smallAxesLayer, smallPointsLayer],
        bounds: [-20, -20, 20, 20],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Point coordinates are given as native JavaScript array.",
            },
        },
    },
};

const smallPointsTypedDataLayer = {
    "@@type": "PointsLayer",
    id: smallPointsTypedDataLayerId,
    "@@typedArraySupport": true,
    pointsData: smallPointsTypedDataLayerPoints,
    color: [0, 100, 255],
    pointRadius: 10,
    radiusUnits: "pixels",
    ZIncreasingDownwards: true,
};

export const SmallPointsLayerTypedArrayInput: StoryObj<
    typeof SubsurfaceViewer
> = {
    args: {
        id: "small-points-typeddata",
        layers: [smallAxesLayer, smallPointsTypedDataLayer],
        bounds: [-20, -20, 20, 20],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Point coordinates are given as JavaScript typed array.",
            },
        },
    },
    render: (args) => (
        <SubsurfaceViewer {...replaceNonJsonArgs(args, nonJsonLayerArgs)} />
    ),
};

// Huge example using PointsLayer.
const hugePointsLayer = {
    "@@type": "PointsLayer",
    id: hugePointsTypedDataLayerId,
    "@@typedArraySupport": true,
    pointsData: hugePointsData,
    color: [255, 100, 100],
    pointRadius: 1,
    radiusUnits: "pixels",
    ZIncreasingDownwards: true,
};

const hugeAxesLayer = {
    "@@type": "AxesLayer",
    id: "huge_axes_layer",
    bounds: [0, 0, 0, sideSize, sideSize, sideSize],
};

export const HugePointsLayer: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "huge-points-map",
        layers: [hugeAxesLayer, hugePointsLayer],
        bounds: [0, 0, sideSize, sideSize],
        coords: {
            visible: false,
        },
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Point coordinates are randomly generated in runtime and given as native JavaScript array.",
            },
        },
    },
    render: (args) => (
        <SubsurfaceViewer {...replaceNonJsonArgs(args, nonJsonLayerArgs)} />
    ),
    tags: ["no-test"],
};
