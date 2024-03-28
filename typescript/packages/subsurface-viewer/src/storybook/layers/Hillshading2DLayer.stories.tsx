import type { Meta, StoryObj } from "@storybook/react";

import SubsurfaceViewer from "../../SubsurfaceViewer";

import {
    defaultStoryParameters,
    hillshadingLayer,
    volveWellsBounds,
} from "../sharedSettings";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/HillshadingLayer",
    args: {
        // Add a reset button for all the stories.
        // Somehow, I do not manage to add the triggerHome to the general "unset" controls :/
        triggerHome: 0,
    },
};
export default stories;

// Volve kh netmap data, flat surface
export const KhMapFlat: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "kh-map-flat",
        resources: {
            propertyMap: "./volve_property_normalized.png",
            depthMap: "./volve_hugin_depth_normalized.png",
        },
        bounds: volveWellsBounds,
        layers: [
            {
                "@@type": "ColormapLayer",
                id: "property_map",
                valueRange: [-3071, 41048],
                bounds: volveWellsBounds,
                image: "@@#resources.propertyMap",
            },
            {
                ...hillshadingLayer,
                valueRange: [2725, 3397],
                bounds: volveWellsBounds,
                opacity: 0.6,
            },
        ],
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "An example showing a kh property layer and a depth map hillshading layer.",
            },
        },
    },
};
