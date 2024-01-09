import React from "react";
import type { StoryFn, Meta } from "@storybook/react";
import { create, all } from "mathjs";

import SubsurfaceViewer from "../../SubsurfaceViewer";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Points Layer",
} as Meta<typeof SubsurfaceViewer>;

const defaultParameters = {
    docs: {
        inlineStories: false,
        iframeHeight: 500,
    },
};

// Small example using PointsLayer.
const smallPointsLayer = {
    "@@type": "PointsLayer",
    id: "small_points_layer",
    /*eslint-disable */
    pointsData:   [  0,  0,  5,  // Vertex 1, x, y, z
                    10,  0,  5,  // Vertex 2, x, y, z
                    10, 10,  5,  // ...
                     0, 10,  0,
                     5, -5, 10,
                    11, -4,  6,
                    11,  0,  7,
                    17,  0,  8
                    ],    
    /*eslint-enable */
    color: [255, 0, 100],
    pointRadius: 10,
    radiusUnits: "pixels",
    ZIncreasingDownwards: true,
};

const smallAxesLayer = {
    "@@type": "AxesLayer",
    id: "small_axes_layer",
    bounds: [-10, -10, 0, 20, 10, 10],
};

export const SmallPointsLayer: StoryFn<typeof SubsurfaceViewer> = (args) => {
    return <SubsurfaceViewer {...args} />;
};

SmallPointsLayer.args = {
    id: "small-points-map",
    layers: [smallAxesLayer, smallPointsLayer],
    bounds: [-20, -20, 20, 20],
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
};

SmallPointsLayer.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Point coordinates are given as native javascript array.",
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

export const HugePointsLayer: StoryFn<typeof SubsurfaceViewer> = (args) => {
    return <SubsurfaceViewer {...args} />;
};

HugePointsLayer.args = {
    id: "huge-points-map",
    layers: [hugeAxesLayer, hugePointsLayer],
    bounds: [0, 0, sideSize, sideSize],
    coords: {
        visible: false,
    },
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
};

HugePointsLayer.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Point coordinates are randomly generated in runtime and given as native javascript array.",
        },
    },
};
