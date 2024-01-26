import React from "react";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import type { ComponentStory, ComponentMeta } from "@storybook/react";

import * as SurfacePoints from "./test_data/surfacePoints";
import * as SurfaceTriangles from "./test_data/surfaceTriangles";

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
    ZIncreasingDownwards: true,
    //contours: [0, 1],          // If used will display contour lines.
    /*eslint-enable */
};

const axesLayer = {
    "@@type": "AxesLayer",
    id: "axes_small",
    bounds: [-10, -10, 0, 20, 10, 10],
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

const flipOrientation = (triangles: number[]) => {
    const res: number[] = [];
    for (let i = 0; i < triangles.length; i += 3) {
        res.push(triangles[i]);
        res.push(triangles[i + 2]);
        res.push(triangles[i + 1]);
    }
    return res;
};

const shiftPointsByZ = (points: number[], shift: number) => {
    const res: number[] = [];
    for (let i = 0; i < points.length; i += 3) {
        res.push(points[i]);
        res.push(points[i + 1]);
        res.push(points[i + 2] + shift);
    }
    return res;
};

const upperSurfaceLayer = {
    "@@type": "TriangleLayer",
    id: "upper_surface_layer",

    /*eslint-disable */
    pointsData:  SurfacePoints.default,
    triangleData: SurfaceTriangles.default,

    color: [100, 100, 255],      // Surface color.
    gridLines: true,             // If true will draw lines around triangles.
    material: {
        ambient: 0.35,
        diffuse: 0.6,
        shininess: 100,
        specularColor: [255, 255, 255]
    },              // If true will use triangle normals for shading.
    smoothShading: true,         // If true will use vertex calculated mean normals for shading.
    ZIncreasingDownwards: true,    
    debug: true
    /*eslint-enable */
};

const lowerSurfaceLayer = {
    "@@type": "TriangleLayer",
    id: "lowers_surface_layer",

    /*eslint-disable */
    pointsData:  shiftPointsByZ(SurfacePoints.default, 1000),
    triangleData: flipOrientation(SurfaceTriangles.default),

    color: [100, 255, 100],      // Surface color.
    gridLines: true,             // If true will draw lines around triangles.
    material: {
        ambient: 0.35,
        diffuse: 0.6,
        shininess: 100,
        specularColor: [255, 255, 255]
    },              // If true will use triangle normals for shading.
    smoothShading: true,         // If true will use vertex calculated mean normals for shading.
    ZIncreasingDownwards: true,    
    debug: true
    /*eslint-enable */
};

const surfaceAxesLayer = {
    "@@type": "AxesLayer",
    id: "mandaros_axes_small",
    bounds: [-2000, -2000, 1500, 2500, 2000, 3000],
};

export const TwoSideLighting: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    return <SubsurfaceViewer {...args} />;
};

TwoSideLighting.args = {
    id: "map",
    layers: [surfaceAxesLayer, upperSurfaceLayer, lowerSurfaceLayer],
    bounds: [-2000, -2000, 2500, 2000],
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

TwoSideLighting.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Both mesh and property data given as native javascript arrays (as opposed to URL).",
        },
    },
};

const typedDataSurfaceLayer = {
    "@@type": "TriangleLayer",
    id: "typedData_surface_layer",

    /*eslint-disable */
    pointsData:  new Float32Array(SurfacePoints.default),
    triangleData: new Uint32Array(SurfaceTriangles.default),

    color: [100, 100, 255],      // Surface color.
    gridLines: true,             // If true will draw lines around triangles.
    material: {
        ambient: 0.35,
        diffuse: 0.6,
        shininess: 100,
        specularColor: [255, 255, 255]
    },              // If true will use triangle normals for shading.
    smoothShading: true,         // If true will use vertex calculated mean normals for shading.
    ZIncreasingDownwards: true,    
    /*eslint-enable */
};

export const TypedArrayInput: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    return <SubsurfaceViewer {...args} />;
};

TypedArrayInput.args = {
    id: "map",
    layers: [surfaceAxesLayer, typedDataSurfaceLayer],
    bounds: [-2000, -2000, 2500, 2000],
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
    skipLayerPropsConversion: true,
};

TypedArrayInput.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Surface data is provided as typed arrays.",
        },
    },
};
