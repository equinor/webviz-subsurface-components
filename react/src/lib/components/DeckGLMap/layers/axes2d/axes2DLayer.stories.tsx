import React from "react";
import DeckGLMap from "../../DeckGLMap";
import { ComponentStory, ComponentMeta } from "@storybook/react";

export default {
    component: DeckGLMap,
    title: "DeckGLMap / Axes2D",
} as ComponentMeta<typeof DeckGLMap>;

const layerProps = {
    marginH: 100, // Horizontal margin (in pixels)
    marginV: 40, // Vertical margin (in pixels)
};

const meshMapLayerPng = {
    "@@type": "MapLayer",
    id: "mesh-layer",
    meshUrl: "hugin_depth_25_m.png",
    frame: {
        origin: [432150, 6475800],
        count: [291, 229],
        increment: [25, 25],
        rotDeg: 0,
    },
    propertiesUrl: "kh_netmap_25_m.png",
    contours: [0, 100],
    isContoursDepth: true,
    gridLines: false,
    material: true,
    smoothShading: true,
    colorMapName: "Physics",
};

const axes_hugin = {
    "@@type": "AxesLayer",
    id: "axes-layer2",
    bounds: [432150, 6475800, -3500, 439400, 6481500, 0],
};

const axes2D = {
    "@@type": "Axes2DLayer",
    id: "axes-layer2D",
    ...layerProps,
};

export const Base: ComponentStory<typeof DeckGLMap> = (args) => {
    return <DeckGLMap {...args} />;
};

Base.args = {
    id: "map",
    layers: [axes_hugin, meshMapLayerPng, axes2D],

    bounds: [432150, 6475800, 439400, 6481500],
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                zoom: -3.5,
                show3D: false,
            },
        ],
    },
};
