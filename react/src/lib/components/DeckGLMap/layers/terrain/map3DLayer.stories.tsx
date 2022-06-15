import React, { useState } from "react";
import DeckGLMap from "../../DeckGLMap";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { NativeSelect } from "@equinor/eds-core-react";

export default {
    component: DeckGLMap,
    title: "DeckGLMap / Map 3D Layer",
} as ComponentMeta<typeof DeckGLMap>;

const Template: ComponentStory<typeof DeckGLMap> = (args) => (
    <DeckGLMap {...args} />
);

const meshMapLayer = {
    "@@type": "Map3DLayer",
    id: "mesh-layer",
    bounds: [432205, 6475078, 437720, 6481113],
    meshMaxError: 100,
    mesh: "hugin_depth_25_m_normalized_margin.png",
    meshValueRange: [2782, 3513],
    propertyTexture: "kh_netmap_25_m_normalized_margin.png",
    propertyValueRange: [2782, 3513],
    contours: [0, 50.0],
    isContoursDepth: false,
    colorMapName: "Physics",
};


const layer = {
    ...meshMapLayer,
    isContoursDepth: true,
    colorMapFunction: (x) => [255 - x * 100, 255 - x * 100, 255 * x], // If defined this function will override the colormap.
};

export const LinearColorMap = Template.bind({});

LinearColorMap.args = {
    id: "colorMapFunction",
    layers: [
        // map layer
        layer,
    ],
    bounds: [432150, 6475800, 439400, 6481500],
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: true,
                layerIds: [],
            },
        ],
    },
};

