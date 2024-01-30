import type { Meta, StoryObj } from "@storybook/react";

import SubsurfaceViewer from "../../SubsurfaceViewer";

import {
    default2DViews,
    default3DViews,
    defaultStoryParameters,
    hugin2DBounds,
    huginAxes3DLayer,
    northArrowLayer,
} from "../sharedSettings";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / North Arrow Layer",
};
export default stories;

const white = [255, 255, 255, 255];

const defaultArgs = {
    id: "map",
    bounds: hugin2DBounds,
    layers: [huginAxes3DLayer, northArrowLayer],
    views: default3DViews,
};

export const NorthArrow3d: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...defaultArgs,
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Example using north arrow in 3D.",
            },
        },
    },
};

export const NorthArrow2dDarkMode: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...defaultArgs,
        layers: [
            { ...huginAxes3DLayer, labelColor: white, axisColor: white },
            { ...northArrowLayer, color: white },
        ],
        views: default2DViews,
        scale: {
            visible: true,
            cssStyle: { color: "white" },
        },
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Example using north arrow in 2D Dark Mode.",
            },
        },
        backgrounds: { default: "dark" },
    },
};
