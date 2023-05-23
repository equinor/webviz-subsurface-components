import React from "react";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import { ComponentStory, ComponentMeta } from "@storybook/react";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Polylines Layer",
} as ComponentMeta<typeof SubsurfaceViewer>;

const defaultParameters = {
    docs: {
        inlineStories: false,
        iframeHeight: 500,
    },
};

// Small example using polylinesLayer.
const polylinesLayer = {
    "@@type": "PolylinesLayer",
    id: "polylines-layer",

    /*eslint-disable */
    polylinePoints: [ 
                    0,  0,  0,   // Vertex 1, x, y, z
                    10, 0,  0,   // Vertex 2, x, y, z
                    10, 10, 0,
                    10, 10, 8,
                    
                    -8,  0, 5,
                    -5, -5, 5, 
                    -5, -5, 0,
                    -8,  0, 5
                    ],    
    /*eslint-enable */
    startIndices: [0, 4, 8],
    color: [0, 100, 100],

    widthUnits: "pixels",
    linesWidth: 10,
    depthTest: false,
    ZIncreasingDownwards: true,
};

const axesLayer = {
    "@@type": "AxesLayer",
    id: "axes_small",
    bounds: [-10, -10, 0, 20, 10, 10],
};

export const SmallPolylinesLayer: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    return <SubsurfaceViewer {...args} />;
};

SmallPolylinesLayer.args = {
    id: "map",
    layers: [axesLayer, polylinesLayer],
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
            story: "Point coordinates are given as native javascript arrays.",
        },
    },
};

const sideSize = 10000;
const pointsCount = 100000;

const hugePolylinesLayer = {
    "@@type": "PolylinesLayer",
    id: "polylines-layer",

    /*eslint-disable */
    polylinePoints: Array(pointsCount * 3).fill(0).map (() => Math.random () * sideSize),    
    startIndices: [0],
    color: [0, 100, 100, 40],

    widthUnits: "pixels",
    linesWidth: 1,

    ZIncreasingDownwards: true,    
};

const hugeAxesLayer = {
    "@@type": "AxesLayer",
    id: "axes_huge",
    bounds: [0, 0, 0, sideSize, sideSize, sideSize],
};

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
            story: "Point coordinates are given as native javascript arrays.",
        },
    },
};
