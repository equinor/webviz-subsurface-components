import type { Meta, StoryObj } from "@storybook/react-webpack5";
import type { BoundingBox3D } from "../../../utils";
import SubsurfaceViewer from "../../../SubsurfaceViewer";
import {
    default3DViews,
    defaultStoryParameters,
    northArrowLayer,
} from "../../sharedSettings";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Map Layer / Categorical Maps",
    tags: ["no-dom-test"],
    args: {
        // Add some common controls for all the stories.
        triggerHome: 0,
    },
};
export default stories;

const layerBase = {
    "@@type": "MapLayer",
    "@@typedArraySupport": true,
    frame: {
        origin: [-1608.620361328125, -1838],
        count: [79, 71],
        increment: [50, 50],
        rotDeg: 0,
        rotPoint: [-1608.620361328125, -1838],
    },

    // One depth per node
    meshData: "top_cells_z_values_79x71.float32",
    meshValueRange: [1449.6324462890625, 2038.382080078125],

    // Map display props
    gridLines: true,
    material: false,
};

// These layers have as (nx)*(ny) property values and depth values are nx*ny hence each cell will be fixed in color.
const nodeCenterContinuousPropertyLayer = {
    ...layerBase,
    id: "continuous-layer",

    // One property per node.
    propertiesData: "rings_property_79x71.float32",
};

const nodeCenterFaciesPropertyLayer = {
    ...layerBase,
    id: "categorical-layer",

    // One property per node.
    propertiesData: "facies5_property_79x71.uint16",

    discretePropertyValueNames: [
        { value: 0, name: "Zero" },
        { value: 1, name: "One" },
        { value: 5, name: "Five" },
    ],
};

// These layers have as (nx-1)*(ny-1) property values and depth values are nx*ny hence each cell will be fixed in color.
const cellCenterContinuousPropertyLayer = {
    ...layerBase,
    id: "continuous-layer",

    // One property per cell.
    propertiesData: "rings_property_78x70.float32",

    colorMapName: "Rainbow",
    colorMapRange: [-1, 1],
};

const cellCenterFaciesPropertyLayer = {
    ...layerBase,
    id: "categorical-layer",

    // One property per cell.
    propertiesData: "facies5_property_78x70.uint16",

    discretePropertyValueNames: [
        { value: 0, name: "Zero" },
        { value: 1, name: "One" },
        { value: 5, name: "Five" },
    ],
};

/* prettier-ignore */
const zoom: BoundingBox3D = [
    -1608.620361328125, -1838, -2038.382080078125,
    2291.379638671875, 1662, -1449.6324462890625,
];

const axesLayer = {
    "@@type": "AxesLayer",
    id: "axes_categorical",
    bounds: zoom,
};

const cameraPosition = {
    rotationOrbit: 0,
    rotationX: 90,
    zoom,
    target: undefined,
};

// Stories
export const NodeCenterContinuousPropMap: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [axesLayer, nodeCenterContinuousPropertyLayer, northArrowLayer],

        cameraPosition,
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Continuous map displaying node center values.",
            },
        },
    },
};

export const CellCenterContinuousPropMap: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [axesLayer, cellCenterContinuousPropertyLayer, northArrowLayer],

        cameraPosition,
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Continuous map displaying cell center values.",
            },
        },
    },
};

export const NodeCenterFaciesPropMap: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [axesLayer, nodeCenterFaciesPropertyLayer, northArrowLayer],

        cameraPosition,
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Categorical map displaying node center facies values.",
            },
        },
    },
};

export const CellCenterFaciesPropMap: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [axesLayer, cellCenterFaciesPropertyLayer, northArrowLayer],

        cameraPosition,
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Categorical map displaying cell center facies values.",
            },
        },
    },
};
