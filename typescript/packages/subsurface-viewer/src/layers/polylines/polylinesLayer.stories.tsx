import React from "react";
import type { ComponentStory, ComponentMeta } from "@storybook/react";
import { create, all } from "mathjs";

import SubsurfaceViewer from "../../SubsurfaceViewer";
import { default as PolylinesLayer } from "./polylinesLayer";
import { default as AxesLayer } from "../axes/axesLayer";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Polylines Layer",
    tags: ["screenshot-test"],
};

const defaultParameters = {
    docs: {
        inlineStories: false,
        iframeHeight: 500,
    },
};

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

export const SmallPolylinesLayer: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    return <SubsurfaceViewer {...args} />;
};

SmallPolylinesLayer.args = {
    id: "map",
    layers: [smallAxesLayer, smallPolylinesLayer],
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

SmallPolylinesLayer.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Polyline nodes are given as native javascript array.",
        },
    },
};

SmallPolylinesLayer.tags = ["screenshot-test"];

const sideSize = 10000;
const pointsCount = 100000;

const math = create(all, { randomSeed: "1234" });

type TRandomNumberFunc = () => number;

const randomFunc = ((): TRandomNumberFunc => {
    if (math.random) {
        return () => {
            const val = math.random?.(sideSize);
            return val ? val : 0.0;
        };
    }
    return () => Math.random() * sideSize;
})();

const hugePolylinesLayer = new PolylinesLayer({
    id: "huge_polylines-layer",

    polylinePoints: Array(pointsCount * 3)
        .fill(0)
        .map(() => randomFunc()),
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

export const HugePolylinesLayer: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    return <SubsurfaceViewer {...args} />;
};

HugePolylinesLayer.args = {
    id: "map",
    layers: [hugeAxesLayer, hugePolylinesLayer],
    bounds: [0, 0, sideSize, sideSize],
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

HugePolylinesLayer.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Polyline nodes are randomly generated in runtime and given as native javascript array.",
        },
    },
};
