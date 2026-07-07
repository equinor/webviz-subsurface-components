import "react";

import type { Meta, StoryObj } from "@storybook/react-webpack5";

import SubsurfaceViewer from "../../SubsurfaceViewer";

import { default3DViews, defaultStoryParameters } from "../sharedSettings";
import { createMathWithSeed } from "../sharedHelperFunctions";

import { getPropsInjectorComponent } from "../sharedHelperComponents";

const SubsurfaceViewerPropsInjector = getPropsInjectorComponent(
    getInjectedProps,
    SubsurfaceViewer
);

const stories: Meta = {
    component: SubsurfaceViewerPropsInjector,
    title: "SubsurfaceViewer / Points Layer",
    args: {
        // Add some common controls for all the stories.
        triggerHome: 0,
    },
};
export default stories;

// ---------Layers and data--------------- //
/* prettier-ignore */
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

// Huge example using PointsLayer.
const sideSize = 10000;
const pointsCount = 100000;

const math = createMathWithSeed("1234");

const hugePointsData = new Array(pointsCount * 3)
    .fill(0)
    .map(() => math.random(sideSize));

// ---------In-place array data handling (storybook fails to rebuild non JSon data)--------------- //
const smallDataLayerPointsTypedId = "small_points_typed_data_layer";
const hugeTypedDataPointsLayerId = "huge_points_typed_data_layer";

const injectedProps = {
    [smallDataLayerPointsTypedId]: {
        pointsData: new Float32Array(smallPointsData),
    },
    [hugeTypedDataPointsLayerId]: {
        pointsData: new Float32Array(hugePointsData),
    },
};

function getInjectedProps() {
    return injectedProps;
}

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
    id: smallDataLayerPointsTypedId,
    "@@typedArraySupport": true,
    pointsData: "pointsData proxy",
    color: [0, 100, 255],
    pointRadius: 10,
    radiusUnits: "pixels",
    ZIncreasingDownwards: true,
};

export const SmallPointsLayerTypedArrayInput: StoryObj<
    typeof SubsurfaceViewerPropsInjector
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
};

// Huge example using PointsLayer.
const hugePointsLayer = {
    "@@type": "PointsLayer",
    id: hugeTypedDataPointsLayerId,
    "@@typedArraySupport": true,
    pointsData: "pointsData proxy",
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

export const HugePointsLayer: StoryObj<typeof SubsurfaceViewerPropsInjector> = {
    args: {
        id: "huge-points-map",
        layers: [hugeAxesLayer, hugePointsLayer],
        bounds: [0, 0, sideSize, sideSize],
        showReadout: false,
        pickingDepth: 0,
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
    tags: ["no-test"],
};
