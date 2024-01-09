import type { Meta, StoryObj } from "@storybook/react";

import SubsurfaceViewer from "../../SubsurfaceViewer";

import {
    default3DViews,
    hillshadingLayer,
    hugin2DBounds,
} from "../sharedSettings";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/Map3DLayer",
    args: {
        // Add a reset button for all the stories.
        // Somehow, I do not manage to add the triggerHome to the general "unset" controls :/
        triggerHome: 0,
    },
};
export default stories;

// Map3DLayer. Properties encoded in RGB.
const meshMapLayer = {
    "@@type": "Map3DLayer",
    id: "mesh-layer",
    mesh: "hugin_depth_25_m_normalized_margin.png",
    meshValueRange: [2782, 3513],
    frame: {
        origin: [432205, 6475078],
        count: [229, 291],
        increment: [25, 25],
        rotDeg: 0,
    },
    propertyTexture: "kh_netmap_25_m_normalized_margin.png",
    propertyValueRange: [-3071, 41048],
    contours: [0, 100.0],
    isContoursDepth: true,
    colorMapName: "Physics",
};

// Volve kh netmap data, flat surface
export const KhMapFlat: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "kh-map-flat",
        resources: {
            propertyMap: "./volve_property_normalized.png",
            depthMap: "./volve_hugin_depth_normalized.png",
        },
        bounds: [432150, 6475800, 439400, 6481500],
        layers: [
            {
                "@@type": "ColormapLayer",
                id: "property_map",
                valueRange: [-3071, 41048],
                bounds: [432150, 6475800, 439400, 6481500],
                image: "@@#resources.propertyMap",
            },
            {
                ...hillshadingLayer,
                valueRange: [2725, 3397],
                bounds: [432150, 6475800, 439400, 6481500],
                opacity: 0.6,
            },
        ],
    },
    parameters: {
        docs: {
            description: {
                story: "An example showing a kh property layer and a depth map hillshading layer.",
            },
            inlineStories: false,
            iframeHeight: 500,
        },
    },
};

export const KhMapMesh: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "kh-mesh-map",
        layers: [{ ...meshMapLayer }],
        bounds: hugin2DBounds,
        views: default3DViews,
    },
};
