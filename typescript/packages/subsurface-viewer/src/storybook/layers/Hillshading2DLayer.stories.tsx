import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import SubsurfaceViewer from "../../SubsurfaceViewer";

import {
    default2DViews,
    defaultStoryParameters,
    hillshadingLayer,
    volveWellsBounds,
} from "../sharedSettings";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/HillshadingLayer",
    args: {
        // Add some common controls for all the stories.
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

// Volve kh netmap using only ColorMapLAyer
export const KhMapFlatOnlyColorMapLayer: StoryObj<typeof SubsurfaceViewer> = {
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
                hillshading: true,
                contours: true,
                heightMapUrl: "@@#resources.depthMap",
                heightValueRange: [2725, 3397],
            },
        ],
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "An example showing a kh property layer and a depth map hillshading layer using only ColorMapLayer.",
            },
        },
    },
};

const axesLayer2D = {
    "@@type": "Axes2DLayer",
    id: "axesLayer2D",
    backgroundColor: [0, 255, 255],
};

const ColorMapLayerComponent: React.FC<{
    triggerHome: number;
    contours: boolean;
    hillshading: boolean;
    contourReferencePoint: number;
    contourInterval: number;
    colorMapRange: number;
    useClampColor: boolean;
    rotDeg: number;
}> = (args) => {
    const delta = (3513 - 2782) * (1 - args.colorMapRange / 100);

    const subsurfaceViewerArgs = {
        id: "colormap",
        layers: [
            {
                "@@type": "ColormapLayer",
                image: "propertyMap.png",
                heightMapUrl: "propertyMap.png",
                rotDeg: args.rotDeg,
                bounds: [432205, 6475078, 437720, 6481113],

                colorMapName: "Rainbow",
                valueRange: [2782, 3513],
                colorMapRange: [2782 + delta, 3513],
                colorMapClampColor: args.useClampColor
                    ? [55, 55, 55]
                    : undefined,

                contours: args.contours,
                hillshading: args.hillshading,

                contourReferencePoint: args.contourReferencePoint,
                contourInterval: args.contourInterval,
            },
            axesLayer2D,
        ],

        views: default2DViews,
        triggerHome: args.triggerHome,
    };
    return <SubsurfaceViewer {...subsurfaceViewerArgs} />;
};

export const ColorMapLayer: StoryObj<typeof ColorMapLayerComponent> = {
    args: {
        hillshading: false,
        contours: false,
        contourReferencePoint: 2782,
        contourInterval: 50,
        colorMapRange: 100,
        useClampColor: false,
        rotDeg: 0,
    },
    argTypes: {
        contourInterval: {
            control: { type: "range", min: 20, max: 100, step: 1 },
        },
        colorMapRange: {
            control: { type: "range", min: 0, max: 100, step: 1 },
        },
        rotDeg: {
            control: { type: "range", min: -90, max: 90, step: 1 },
        },
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "ColorMapLayer example.",
            },
        },
    },
    render: (args) => <ColorMapLayerComponent {...args} />,
};
