import type { Meta, StoryObj } from "@storybook/react";

import { all, create } from "mathjs";

import SubsurfaceViewer from "../../SubsurfaceViewer";

import { default3DViews, defaultStoryParameters } from "../sharedSettings";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Points Layer",
    args: {
        // Add a reset button for all the stories.
        // Somehow, I do not manage to add the triggerHome to the general "unset" controls :/
        triggerHome: 0,
    },

    // Disable automatic testing of stories that use this tag.
    tags: ["no-test"],
};
export default stories;

/*eslint-disable */
const smallPointsData = [
    0,
    0,
    5, // Vertex 1, x, y, z
    10,
    0,
    5, // Vertex 2, x, y, z
    10,
    10,
    5, // ...
    0,
    10,
    0,
    5,
    -5,
    10,
    11,
    -4,
    6,
    11,
    0,
    7,
    17,
    0,
    8,
];
/*eslint-enable */

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
    id: "small_points_typed_data_layer",
    "@@typedArraySupport": true,
    pointsData: new Float32Array(smallPointsData),
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
};

// Huge example using PointsLayer.
const sideSize = 10000;
const pointsCount = 100000;

const math = create(all, { randomSeed: "1234" });

type TRandomNumberFunc = () => number;

const randomFunc = ((): TRandomNumberFunc => {
    if (math?.random) {
        return () => {
            const val = math.random?.(sideSize);
            return val ? val : 0.0;
        };
    }
    return () => Math.random() * sideSize;
})();

const hugePointsLayer = {
    "@@type": "PointsLayer",
    id: "huge_points_layer",
    pointsData: Array(pointsCount * 3)
        .fill(0)
        .map(() => randomFunc()),
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
    tags: ["no-test"],
};
