/* eslint-disable prettier/prettier */
import React from "react";

import type { StoryFn, Meta } from "@storybook/react";
import SubsurfaceViewer from "../../SubsurfaceViewer";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/WellMarkers",
} as Meta<typeof SubsurfaceViewer>;

const Template: StoryFn<typeof SubsurfaceViewer> = (args) => (
    <SubsurfaceViewer {...args} />
);

const parameters = {
    docs: {
        description: {
            story: "Simgrid.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

export const WellMarkers = Template.bind({});

WellMarkers.args = {
    bounds: [-25, -25, 50, 30],
    views: {
        layout: [1, 1] as [number, number],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
    id: "well-markers-tttttt",
    layers: [
        {
            "@@type": "AxesLayer",
            id: "well-markers-axes",
            bounds: [-15, -15, -15, 40, 20, 15],
            ZIncreasingDownwards: false,            
        },
        {
            "@@type": "NorthArrow3DLayer",
            id: "north-arrow-layer",
        },
        {
            "@@type": "WellMarkersLayer",
            id: "well-markers-1",
            pickable: false,
            data: [
                {position: [0.0, 0.0, 0.0], inclination: 0},
                {position: [0.0, 0.0, 0.0], inclination: 45},
                {position: [0.0, 0.0, 0.0], inclination: 90}
            ]
        },

    ],
};
WellMarkers.parameters = parameters;
