import React from "react";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import { ComponentStory, ComponentMeta } from "@storybook/react";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Triangle Layer",
} as ComponentMeta<typeof SubsurfaceViewer>;

const defaultParameters = {
    docs: {
        inlineStories: false,
        iframeHeight: 500,
    },
};

const northArrowLayer = {
    "@@type": "NorthArrow3DLayer",
    id: "north-arrow-layer",
};

// Small example using triangleLayer.
const triangleLayer = {
    "@@type": "TriangleLayer",
    id: "triangle-layer",

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


    triangleData: [2, 1, 0,   // Indexs' to first triangle.
                   3, 2, 0,   // ... 
                   1, 4, 0,  
                   6, 7, 5],


    color: [100, 100, 255],      // Surface color.
    gridLines: true,             // If true will draw lines around triangles.
    material: true,              // If true will use triangle normals for shading.
    smoothShading: true,         // If true will use vertex calculated mean normals for shading.
    //contours: [0, 1],          // If used will display contour lines.
    /*eslint-enable */
};

const axesLayer = {
    "@@type": "AxesLayer",
    id: "axes_small",
    bounds: [-10, -10, -10, 20, 10, 0],
};

export const SmallTriangleLayer: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    return <SubsurfaceViewer {...args} />;
};

SmallTriangleLayer.args = {
    id: "map",
    layers: [axesLayer, triangleLayer, northArrowLayer],
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

SmallTriangleLayer.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Both mesh and property data given as native javascript arrays (as opposed to URL).",
        },
    },
};
