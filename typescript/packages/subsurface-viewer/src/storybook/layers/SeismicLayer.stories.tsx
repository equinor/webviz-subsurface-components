import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import SubsurfaceViewer, {
    type SubsurfaceViewerProps,
} from "../../SubsurfaceViewer";

import { default3DViews, defaultStoryParameters } from "../sharedSettings";
import { replaceNonJsonArgs, convertUndefNull } from "../sharedHelperFunctions";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Seismic Layer",
    tags: ["no-dom-test"],
    args: {
        // Add some common controls for all the stories.
        triggerHome: 0,
    },
};
export default stories;

function preprocessProps(
    props: SubsurfaceViewerProps,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nonJsonLayerProps: Record<string, any>
): SubsurfaceViewerProps {
    convertUndefNull(props.layers as unknown as Record<string, unknown>);
    return replaceNonJsonArgs(props, nonJsonLayerProps);
}

const cage = {
    origin: [-2808.4, -6505.9, 1071.3],
    edgeU: [-275.5, 11609.4, 0],
    edgeV: [6234.6, 147.9, 0],
    edgeW: [0, 0, 1303],
};

/*
 Vertices of a section in the seismic data.
 ^  P01  P11
 |
 Y
 |  P00  P10   
 +---X--->

 sectionZ0Vertices= [ P00, P10, P01, P11 ]
 */
const sectionZ0Vertices = [
    -2808.4, -6505.9, 1071.3, 3426.2, -6358.0, 1071.3, -3083.9, 5103.5, 1071.3,
    3150.7, 5251.4, 1071.3,
];
const sectionZ0TexCoords = [0, 0, 1, 0, 0, 1, 1, 1];
const sectionZ0Indices = [0, 1, 2, 3];

const section0Props = {
    topology: "triangle-strip",
    vertices: sectionZ0Vertices,
    vertexIndices: { value: sectionZ0Indices, size: 4 },
};
const section0TexProps = {
    ...section0Props,
    texCoords: sectionZ0TexCoords,
    valueMap: {
        width: 115,
        height: 103,
        values: "seismic_Z0_115_103.float32",
    },
};

const seismicBounds = [-3083.9, -6505.9, -1071.3, 3426.2, 5251.4, -2374.3];

// ---------In-place array data handling (storybook fails to rebuild non JSon data)--------------- //
const seismicCageLayerId = "seismic_cage_layer";
const seismicSectionsLayerId = "seismic_section_layer";

const nonJsonLayerArgs = {
    //     [seismicCageLayerId]: {
    //         polylinePoints: new Float32Array(cagePoints),
    //         startIndices: new Uint32Array(cageStartIndices),
    //     },
};

// Small example using polylinesLayer.
const seismicCageLayer = {
    "@@type": "SeismicLayer",
    id: seismicCageLayerId,
    cage: {
        ...cage,
        color: [0, 200, 100],
        widthUnits: "pixels",
        lineWidth: 3,
    },
    ZIncreasingDownwards: true,
};

const colormapSetup = {
    valueRange: [-1, 1],
    clampRange: [-1, 1],
    clampColor: [0, 255, 0, 200],
    undefinedColor: [255, 0, 0, 200],
    smooth: false,
};

const seismicSectionsLayer = {
    ...seismicCageLayer,
    id: seismicSectionsLayerId,
    seismicFences: [section0TexProps],
    showMesh: false,
    colormap: { colormapName: "seismic" },
    colormapSetup: colormapSetup,
};

const smallAxesLayer = {
    "@@type": "AxesLayer",
    id: "small_axes_layer",
    bounds: seismicBounds,
    ZIncreasingDownwards: false,
};

export const SeismicCage: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "seismic_cage",
        layers: [smallAxesLayer, seismicCageLayer],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Display the cage of seismic.",
            },
        },
    },
};

export const SeismicSections: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "seismic_sections",
        layers: [smallAxesLayer, seismicSectionsLayer],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Display the cage of seismic.",
            },
        },
    },
    render: (args: SubsurfaceViewerProps) => (
        <SubsurfaceViewer {...preprocessProps(args, nonJsonLayerArgs)} />
    ),
};

const seismicSectionsWithMaterialLayer = {
    ...seismicSectionsLayer,
    id: "seismic_sections_with_material",
    material: {
        ambient: 0.35,
        diffuse: 0.9,
        shininess: 32,
        specularColor: [38, 38, 38],
    },
    render: (args: SubsurfaceViewerProps) => (
        <SubsurfaceViewer {...preprocessProps(args, nonJsonLayerArgs)} />
    ),
};

export const SeismicSectionsWithMaterial: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "seismic_sections",
        layers: [smallAxesLayer, seismicSectionsWithMaterialLayer],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Display the cage of seismic.",
            },
        },
    },
    render: (args: SubsurfaceViewerProps) => (
        <SubsurfaceViewer {...preprocessProps(args, nonJsonLayerArgs)} />
    ),
};
