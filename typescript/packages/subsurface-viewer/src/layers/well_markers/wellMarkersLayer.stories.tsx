/* eslint-disable prettier/prettier */
import React from "react";

import type { StoryFn, Meta } from "@storybook/react";
import SubsurfaceViewer from "../../SubsurfaceViewer";

import type { WellMarkerDataT } from "./wellMarkersLayer" 

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
            pickable: true,
            shape: "triangle",
            data: [
                {position: [0.0, 0.0, 0.0], azimuth: 0, inclination: 0,  color: [0, 0, 123]},
                {position: [0.0, 0.0, 0.0], azimuth: 0, inclination: 45, color: [0, 0, 77]},
                {position: [0.0, 0.0, 0.0], azimuth: 0, inclination: 90, color: [0, 0, 44]},

                {position: [5.0, 0.0, 5.0001], azimuth: 0,  inclination: 0, color: [100, 0, 0]},
                {position: [5.0, 0.0, 5.0002], azimuth: 30, inclination: 0, color: [100, 100, 0]},
                {position: [5.0, 0.0, 5.0003], azimuth: 60, inclination: 0, color: [100, 0, 100]}
            ]            
        },

    ],
};
WellMarkers.parameters = parameters;

const generateMarkers = () : WellMarkerDataT[] => {

    const N = 40;
    const M = 40; 

    const dN = 2 * Math.PI / N;
    const dM = 5 * Math.PI / M;

    const res : WellMarkerDataT[] = [];

    for (let i = 0; i < N; ++i) {
        for (let j = 0; j < M; ++j) {
            const x = -N/2 + i;
            const y = -M/2 + j;
            const az   = dN * i;
            const incl = dM * j;

            const z = 5 * (Math.sin (incl)*Math.cos(az));
            res.push ({
                position: [x, y, z],
                azimuth: az * 180.0 / Math.PI,
                inclination: Math.asin (Math.cos(incl)) * 180.0 / Math.PI,
                color: [0, 100, 200],
            })
        }
    }
    return res;
}

export const WellMarkers2 = Template.bind({});

WellMarkers2.args = {
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
    id: "well-markers-tttt",
    layers: [
        {
            "@@type": "AxesLayer",
            id: "well-markers-axes",
            bounds: [-15, -15, -15, 15, 15, 15],
            ZIncreasingDownwards: false,            
        },
        {
            "@@type": "NorthArrow3DLayer",
            id: "north-arrow-layer",
        },
        {
            "@@type": "WellMarkersLayer",
            id: "well-markers-1",
            pickable: true,
            data: generateMarkers (),      
        },

    ],
};
WellMarkers2.parameters = parameters;
