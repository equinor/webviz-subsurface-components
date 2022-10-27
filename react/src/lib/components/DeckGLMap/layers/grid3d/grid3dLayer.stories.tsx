import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import DeckGLMap from "../../DeckGLMap";

export default {
    component: DeckGLMap,
    title: "DeckGLMap/Experimental Grid3D",
} as ComponentMeta<typeof DeckGLMap>;

const Template: ComponentStory<typeof DeckGLMap> = (args) => (
    <DeckGLMap {...args} />
);

const defaultProps = {
    bounds: [17489, 5001, 6063, 10990] as [number, number, number, number],
    views: {
        layout: [1, 1] as [number, number],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
};

// Grid 3d story
/* eslint-disable @typescript-eslint/no-var-requires */
const SCALAR = require("../../../../../demo/example-data/vtk-grid/scalar.json");
const grid3dLayer = {
    "@@type": "Grid3DLayer",
    id: "Grid3DLayer",
    data: {
        points: "https://raw.githubusercontent.com/HansKallekleiv/vtk-test/main/points.json",
        polys: "https://raw.githubusercontent.com/HansKallekleiv/vtk-test/main/polys.json",
        scalar: SCALAR,
    },
};

export const Grid3D = Template.bind({});
Grid3D.args = {
    ...defaultProps,
    id: "grid-3d",
    layers: [grid3dLayer],
};

Grid3D.parameters = {
    docs: {
        description: {
            story: "3D grid with vtk polydata.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

// 3D grid with intersection data story
const IPOINTS = require("../../../../../demo/example-data/vtk-grid/intersection_points.json");
const IPOLYS = require("../../../../../demo/example-data/vtk-grid/intersection_polys.json");

const intersectionLayer = {
    "@@type": "Grid3DLayer",
    id: "Intersection",
    data: {
        points: IPOINTS,
        polys: IPOLYS,
    },
};

export const Grid3DIntersection = Template.bind({});
Grid3DIntersection.args = {
    ...defaultProps,
    id: "grid-3d-intersection",
    layers: [intersectionLayer],
    cameraPosition: {
        zoom: -1.656,
        rotationX: -4.6246,
        rotationOrbit: -36.468,
        target: [463504.568, 5931407.307, -1557.5486],
    },
};

Grid3DIntersection.parameters = {
    docs: {
        description: {
            story: "3D grid intersection geometry using vtk polydata format.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

// Grid cell rendered with missing triangle
const withErrorData = {
    "@@type": "Grid3DLayer",
    id: "grid-layer",
    data: {
        points: [
            6063.6875, 10990.5, -1697.728515625, 6063.6901755, 10990.5,
            -1699.363037109375, 6138.490647453931, 10861.021377247758,
            -1698.79345703125, 6138.5, 10861.0, -1697.15625,

            6193.875, 11065.5, -1700.68505859375, 6193.853543980862, 11065.5,
            -1702.331787109375, 6268.8125, 10936.0, -1701.794921875, 6324.0,
            11141.0, -1712.052978515625,
        ],
        polys: [4, 0, 1, 2, 3, 4, 0, 4, 5, 1],
        scalar: [0.51, 0.51],
    },
};

export const MissingTriangle = Template.bind({});
MissingTriangle.args = {
    ...defaultProps,
    id: "grid-3d-layer",
    layers: [withErrorData],
    cameraPosition: {
        zoom: 0.5,
        rotationX: -4.6246,
        rotationOrbit: -36.468,
        target: [6193.875, 11065.5, -1700],
    },
};

Grid3DIntersection.parameters = {
    docs: {
        description: {
            story: "This renders cells with missing triangle.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};
