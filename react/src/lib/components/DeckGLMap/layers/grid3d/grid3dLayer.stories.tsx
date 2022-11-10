import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import DeckGLMap from "../../DeckGLMap";

export default {
    component: DeckGLMap,
    title: "DeckGLMap/Experimental Grid3D",
} as ComponentMeta<typeof DeckGLMap>;

type NumberQuad = [number, number, number, number];

const Template: ComponentStory<typeof DeckGLMap> = (args) => (
    <DeckGLMap {...args} />
);

const defaultProps = {
    bounds: [6063, 1551, 17489, 14440] as NumberQuad,
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
const grid3dLayer = {
    "@@type": "Grid3DLayer",
    id: "Grid3DLayer",
    pointsUrl: "vtk-grid/points.json",
    polysUrl: "vtk-grid/polys.json",
    propertiesUrl: "vtk-grid/scalar.json",
    material: true,
    colorMapName: "Rainbow",
    scaleZ: 5,
};

const axes = {
    "@@type": "AxesLayer",
    id: "axes-layer2",
    bounds: [6063, 1551, -10027, 17489, 14440, -7837],
};

export const Grid3D = Template.bind({});
Grid3D.args = {
    ...defaultProps,
    id: "grid-3d",
    layers: [axes, grid3dLayer],
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

// Intersection story.
const intersection_axes = {
    "@@type": "AxesLayer",
    id: "axes-layer2",
    bounds: [463256, 5930542.5, -9060, 464465, 5932768, -7999],
};

const intersection = {
    "@@type": "Grid3DLayer",
    id: "Grid3DLayer",
    pointsUrl: "vtk-grid/intersection_points.json",
    polysUrl: "vtk-grid/intersection_polys.json",
    propertiesUrl: "vtk-grid/intersection_scalar.json",
    material: true,
    colorMapName: "Rainbow",
    scaleZ: 5,
};

export const Intersection = Template.bind({});
Intersection.args = {
    ...defaultProps,
    id: "grid-3d",
    layers: [intersection_axes, intersection],
};

Intersection.parameters = {
    docs: {
        description: {
            story: "3D grid intersection geometry using vtk polydata format.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};
