import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { create, all } from "mathjs";

import SubsurfaceViewer from "../../SubsurfaceViewer";
import { default as PointsLayer } from "./pointsLayer";
import { default as AxesLayer } from "../axes/axesLayer";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Points Layer",
} as ComponentMeta<typeof SubsurfaceViewer>;

const defaultParameters = {
    docs: {
        inlineStories: false,
        iframeHeight: 500,
    },
};

// Small example using PointsLayer.
const smallPointsLayer = new PointsLayer({
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
    color: [255, 100, 100],
    pointRadius: 10,
    radiusUnits: "pixels",
    ZIncreasingDownwards: true,
});

const smallAxesLayer = new AxesLayer({
    id: "small_axes_layer",
    bounds: [-10, -10, 0, 20, 10, 10],
});

export const SmallPointsLayer: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    return <SubsurfaceViewer {...args} />;
};

SmallPointsLayer.args = {
    id: "map",
    layers: [smallAxesLayer, smallPointsLayer],
    bounds: [-10, -10, 17, 10],
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

const hugePointsLayer = new PointsLayer({
    id: "huge_points_layer",
    pointsData: Array(pointsCount * 3)
        .fill(0)
        .map(() => randomFunc()),
    color: [255, 100, 100],
    pointRadius: 1,
    radiusUnits: "pixels",
    ZIncreasingDownwards: true,
});

const hugeAxesLayer = new AxesLayer({
    id: "huge_axes_layer",
    bounds: [0, 0, 0, sideSize, sideSize, sideSize],
});

export const HugePointsLayer: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    return <SubsurfaceViewer {...args} />;
};

HugePointsLayer.args = {
    id: "map",
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
