import "react";

import type { Meta, StoryObj } from "@storybook/react-webpack5";

import SubsurfaceViewer from "../../SubsurfaceViewer";

import { default3DViews, defaultStoryParameters } from "../sharedSettings";

import { getPropsInjectorComponent } from "../sharedHelperComponents";

const SubsurfaceViewerPropsInjector = getPropsInjectorComponent(
    getInjectedProps,
    SubsurfaceViewer
);

const stories: Meta = {
    component: SubsurfaceViewerPropsInjector,
    title: "SubsurfaceViewer / GpGl Layers",
    args: {
        // Add some common controls for all the stories.
        triggerHome: 0,
    },
};
export default stories;

// ---------Layers and data--------------- //

/*
 Vertices of a section in the seismic data.
 ^  P01  P11
 |
 Y
 |  P00  P10   
 +---X--->

 sectionZ0Vertices= [ P00, P10, P01, P11 ]
 */
/* prettier-ignore */
const sectionZ0Vertices = [
    -2808.4, -6505.9, 1071.3,
     3426.2, -6358,   1071.3,
    -3083.9,  5103.5, 1071.3,
     3150.7,  5251.4, 1071.3,
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
const section0NaNTexProps = {
    ...section0Props,
    texCoords: sectionZ0TexCoords,
    valueMap: {
        width: 115,
        height: 103,
        values: "seismicNaN_Z0_115_103.float32",
    },
};

const section0MeshProps = {
    topology: "line-strip",
    vertices: sectionZ0Vertices,
    vertexIndices: { value: sectionZ0Indices },
};

const bounds = [-3083.9, -6505.9, -1071.3, 3426.2, 5251.4, -2374.3];

// ---------In-place array data handling (storybook fails to rebuild non JSon data)--------------- //
const njTextureLayerId = "nj_texture_layer";
const njTextureNaNLayerId = "nj_texture_nan_layer";

const injectedProps = {
    [njTextureLayerId]: {
        valueMappedTriangles: [
            {
                vertices: new Float32Array(sectionZ0Vertices),
                texCoords: new Float32Array(sectionZ0TexCoords),
                vertexIndices: {
                    value: new Uint32Array(sectionZ0Indices),
                },
            },
        ],
    },
    [njTextureNaNLayerId]: {
        valueMappedTriangles: [
            {
                vertices: new Float32Array(sectionZ0Vertices),
                texCoords: new Float32Array(sectionZ0TexCoords),
                vertexIndices: {
                    value: new Uint32Array(sectionZ0Indices),
                },
            },
        ],
    },
};

function getInjectedProps() {
    return injectedProps;
}

const njSection0TexProps = {
    topology: "triangle-strip",
    vertices: "vertices proxy",
    texCoords: "texCoords proxy",
    valueMap: {
        width: 115,
        height: 103,
        values: "seismic_Z0_115_103.float32",
    },
    vertexIndices: {
        value: new Uint32Array(sectionZ0Indices),
    },
};

// Small example using polylinesLayer.
const noTextureLayer = {
    "@@type": "GpglValueMappedSurfaceLayer",
    id: "no_texture_layer",
    valueMappedTriangles: [section0Props],
    color: [100, 100, 255],
    showMesh: true,
    ZIncreasingDownwards: true,
};

const colormapSetup = {
    valueRange: [-1, 1],
    clampRange: undefined,
    clampColor: undefined,
    undefinedColor: [255, 0, 0, 200],
    smooth: true,
};

const textureLayer = {
    "@@type": "GpglValueMappedSurfaceLayer",
    id: "texture_layer",
    valueMappedTriangles: [section0TexProps],
    colormap: { colormapName: "seismic" },
    colormapSetup: colormapSetup,
    showMesh: false,
    ZIncreasingDownwards: true,
};

const textureWithMeshLayer = {
    ...textureLayer,
    id: "texture_with_mesh_layer",
    triangleMeshes: [section0MeshProps],
    showMesh: true,
};

const njTextureLayer = {
    "@@type": "GpglValueMappedSurfaceLayer",
    "@@typedArraySupport": true,
    id: njTextureLayerId,
    valueMappedTriangles: [njSection0TexProps],
    colormap: { colormapName: "seismic" },
    colormapSetup: colormapSetup,
    showMesh: true,
    ZIncreasingDownwards: true,
};

const smallAxesLayer = {
    "@@type": "AxesLayer",
    id: "small_axes_layer",
    bounds: bounds,
    ZIncreasingDownwards: false,
    pickable: false,
};

export const GpglWithoutTexture: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "gpgl_texture",
        layers: [smallAxesLayer, noTextureLayer],
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

export const GpglValueMap: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "gpgl_texture",
        layers: [smallAxesLayer, textureLayer],
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

export const GpglTextureWithExplicitMesh: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "gpgl_texture",
        layers: [smallAxesLayer, textureWithMeshLayer],
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

const textureWithMaterialLayer = {
    ...textureLayer,
    id: "texture_with_material_layer",
    material: {
        ambient: 0.35,
        diffuse: 0.9,
        shininess: 32,
        specularColor: [38, 38, 38],
    },
};

export const GpglValueMapWithMaterial: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "gpgl_texture",
        layers: [smallAxesLayer, textureWithMaterialLayer],
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

export const TypedArrayGpglTexture: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "njTextureLayerId",
        layers: [smallAxesLayer, njTextureLayer],
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

const nanTextureLayer = {
    "@@type": "GpglValueMappedSurfaceLayer",
    id: "texture_layer",
    valueMappedTriangles: [section0NaNTexProps],
    colormap: { colormapName: "seismic" },
    colormapSetup: colormapSetup,
    showMesh: false,
    ZIncreasingDownwards: true,
};

export const GpglValueMapWithNan: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "gpgl_texture",
        layers: [smallAxesLayer, nanTextureLayer],
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
