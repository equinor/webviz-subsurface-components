import type { Meta, StoryObj } from "@storybook/react";

import { create, all } from "mathjs";

import SubsurfaceViewer from "../../SubsurfaceViewer";

import { default as PolylinesLayer } from "../../layers/polylines/polylinesLayer";
import { default as AxesLayer } from "../../layers/axes/axesLayer";

import { default3DViews, defaultStoryParameters } from "../sharedSettings";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Polylines Layer",
    args: {
        // Add a reset button for all the stories.
        // Somehow, I do not manage to add the triggerHome to the general "unset" controls :/
        triggerHome: 0,
    },
};
export default stories;

// Small example using polylinesLayer.
const smallPolylinesLayer = new PolylinesLayer({
    id: "small_polylines_layer",
    /* eslint-disable */
    polylinePoints: [
        0, 0, 0, 10, 0, 0, 10, 0, 10,

        -5, -5, 4, 0, -8, 6, 5, 10, 8,
    ],
    /* eslint-enable */
    startIndices: [0, 3],
    polylinesClosed: [true, false],
    color: [0, 200, 100],

    widthUnits: "pixels",
    linesWidth: 10,
    ZIncreasingDownwards: true,
});

const smallAxesLayer = new AxesLayer({
    id: "small_axes_layer",
    bounds: [-10, -10, 0, 20, 10, 10],
});

export const SmallPolylinesLayer: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [smallAxesLayer, smallPolylinesLayer],
        bounds: [-10, -10, 17, 10],
        views: default3DViews,
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

const sideSize = 10000;
const pointsCount = 100000;

const math = create(all, { randomSeed: "1234" });

type TRandomNumberFunc = () => number;

const randomFunc = ((): TRandomNumberFunc => {
    if (math.random) {
        return () => {
            return math.random(sideSize);
        };
    }
    return () => Math.random() * sideSize;
})();

const hugePoints = new Array(pointsCount * 3).fill(0).map(() => randomFunc());

const hugePolylinesLayer = new PolylinesLayer({
    id: "huge_polylines-layer",

    polylinePoints: hugePoints,
    startIndices: [0],
    color: [0, 100, 100, 40],

    widthUnits: "pixels",
    linesWidth: 1,

    ZIncreasingDownwards: true,
});

const hugeAxesLayer = new AxesLayer({
    id: "huge_axes_layer",
    bounds: [0, 0, 0, sideSize, sideSize, sideSize],
});

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
    tags: ["no-test"],
};

export const HugeLayerTypedArrayInput: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [
            hugeAxesLayer,
            {
                "@@type": "PolylinesLayer",
                "@@typedArraySupport": true,
                id: "huge_polylines-layer-typedarrays",

                polylinePoints: new Float32Array(hugePoints),
                startIndices: new Uint32Array([0, pointsCount]),
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
    tags: ["no-test"],
};
