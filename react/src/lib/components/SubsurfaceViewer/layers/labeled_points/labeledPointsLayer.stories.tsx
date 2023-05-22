import React from "react";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import { ComponentStory, ComponentMeta } from "@storybook/react";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / LabeledPoints Layer",
} as ComponentMeta<typeof SubsurfaceViewer>;

const defaultParameters = {
    docs: {
        inlineStories: false,
        iframeHeight: 500,
    },
};

// Small example using labeledPointsLayer.
const labeledPointsLayer = {
    "@@type": "LabeledPointsLayer",
    id: "labeledPoints-layer",

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
};

const smallAxesLayer = {
    "@@type": "AxesLayer",
    id: "axes_small",
    bounds: [-10, -10, 0, 20, 10, 10],
};

export const SmallLabeledPointsLayer: ComponentStory<
    typeof SubsurfaceViewer
> = (args) => {
    return <SubsurfaceViewer {...args} />;
};

SmallLabeledPointsLayer.args = {
    id: "map",
    layers: [smallAxesLayer, labeledPointsLayer],
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

SmallLabeledPointsLayer.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Both mesh and property data given as native javascript arrays (as opposed to URL).",
        },
    },
};

// Huge example using labeledPointsLayer.

const sideSize = 10000;
const pointsCount = 100000;

const hugePointsLayer = {
    "@@type": "LabeledPointsLayer",
    id: "labeledPoints-layer",

    /*eslint-disable */
    pointsData:  Array(pointsCount * 3).fill(0).map (() => Math.random () * sideSize),
    color: [255, 100, 100],
    pointRadius : 4,
    radiusUnits : "pixels",
    ZIncreasingDownwards: true,    
};

const hugeAxesLayer = {
    "@@type": "AxesLayer",
    id: "axes_small",
    bounds: [0, 0, 0, sideSize, sideSize, sideSize],
};

export const HugeLabeledPointsLayer: ComponentStory<
    typeof SubsurfaceViewer
> = (args) => {
    return <SubsurfaceViewer {...args} />;
};

HugeLabeledPointsLayer.args = {
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

HugeLabeledPointsLayer.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Both mesh and property data given as native javascript arrays (as opposed to URL).",
        },
    },
};



