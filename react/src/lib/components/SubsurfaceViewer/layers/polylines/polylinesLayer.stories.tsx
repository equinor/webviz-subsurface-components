import React from "react";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import { ComponentStory, ComponentMeta } from "@storybook/react";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / FaultSticks Layer",
} as ComponentMeta<typeof SubsurfaceViewer>;

const defaultParameters = {
    docs: {
        inlineStories: false,
        iframeHeight: 500,
    },
};

// Small example using triangleLayer.
const faultSticksLayer = {
    "@@type": "FaultSticksLayer",
    id: "fault-sticks-layer",

    /*eslint-disable */
    polylinePoints: [ 
                    0,  0,  0,   // Vertex 1, x, y, z
                    10,  0,  0,  // Vertex 2, x, y, z
                    10, 10, 0,
                    10, 10, 8,
                    
                    -8, 0,   5,
                    -5, -5,  5, 
                    -5, -5,  0,
                    ],    
    /*eslint-enable */
    startIndices: [0, 4],
    color: [0, 100, 100],

    widthUnits: "pixels",
    linesWidth: 10,

    ZIncreasingDownwards: true,
};

const axesLayer = {
    "@@type": "AxesLayer",
    id: "axes_small",
    bounds: [-10, -10, 0, 20, 10, 10],
};

export const SmallFaultSticksLayer: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    return <SubsurfaceViewer {...args} />;
};

SmallFaultSticksLayer.args = {
    id: "map",
    layers: [axesLayer, faultSticksLayer],
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

SmallFaultSticksLayer.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Both mesh and property data given as native javascript arrays (as opposed to URL).",
        },
    },
};

const sideSize = 10000;
const pointsCount = 100000;

const hugeFaultSticksLayer = {
    "@@type": "FaultSticksLayer",
    id: "fault-sticks-layer",

    /*eslint-disable */
    polylinePoints: Array(pointsCount * 3).fill(0).map (() => Math.random () * sideSize),    
    startIndices: [0],
    color: [0, 100, 100],

    widthUnits: "pixels",
    linesWidth: 1,

    ZIncreasingDownwards: true,    
};

const hugeAxesLayer = {
    "@@type": "AxesLayer",
    id: "axes_huge",
    bounds: [0, 0, 0, sideSize, sideSize, sideSize],
};

export const HugeFaultSticksLayer: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    return <SubsurfaceViewer {...args} />;
};

HugeFaultSticksLayer.args = {
    id: "map",
    layers: [hugeAxesLayer, hugeFaultSticksLayer],
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

HugeFaultSticksLayer.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Both mesh and property data given as native javascript arrays (as opposed to URL).",
        },
    },
};
