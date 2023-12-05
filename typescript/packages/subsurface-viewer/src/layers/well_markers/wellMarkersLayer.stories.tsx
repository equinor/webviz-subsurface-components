import React from "react";
import { create, all } from "mathjs";

import type { StoryFn, Meta } from "@storybook/react";
import SubsurfaceViewer from "../../SubsurfaceViewer";

import type { WellMarkerDataT } from "./wellMarkersLayer";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/Well Markers Layer",
} as Meta<typeof SubsurfaceViewer>;

const Template: StoryFn<typeof SubsurfaceViewer> = (args) => (
    <SubsurfaceViewer {...args} />
);

const parameters = {
    docs: {
        description: {
            story: "Well Markers Layer.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

const math = create(all, { randomSeed: "1984" });

type TRandomNumberFunc = (max: number) => number;

const randomFunc = ((): TRandomNumberFunc => {
    if (math?.random) {
        return (max: number) => {
            const val = math.random?.(max);
            return val ? val : 0.0;
        };
    }
    return (max: number) => Math.random() * max;
})();

const generateMarkers = (): WellMarkerDataT[] => {
    const N = 40;
    const M = 40;

    const dN = (2 * Math.PI) / N;
    const dM = (5 * Math.PI) / M;

    const res: WellMarkerDataT[] = [];

    for (let i = 0; i < N; ++i) {
        for (let j = 0; j < M; ++j) {
            const x = -N / 2 + i;
            const y = -M / 2 + j;
            const az = dN * i;
            const incl = dM * j;

            const z = 5 * (Math.sin(incl) * Math.cos(az));
            res.push({
                position: [x, y, z],
                azimuth: (az * 180.0) / Math.PI,
                inclination: (Math.asin(Math.cos(incl)) * 180.0) / Math.PI,
                color: [randomFunc(255), randomFunc(255), randomFunc(255), 100],
                outlineColor: [0, 0, 100, 255],
                size: 0.02 * Math.sqrt(x * x + y * y),
            });
        }
    }
    return res;
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
    id: "well-markers-tttt",
    layers: [
        {
            "@@type": "AxesLayer",
            id: "well-markers-axes",
            bounds: [-25, -25, -25, 25, 25, 25],
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
            shape: "circle",
            sizeUnits: "common",
            data: generateMarkers(),
        },
    ],
};
WellMarkers.parameters = parameters;
