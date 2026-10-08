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

// This layer has as (nx-1)*(ny-1) property values and depth values are nx*ny hence each cell will be fixed in color.
const cellCenterFaciesPropertiesLayer = {
    "@@type": "MapLayer",
    "@@typedArraySupport": true,
    id: "categorical-layer",

    frame: {
        origin: [-1608.620361328125, -1838],
        count: [79, 71],
        increment: [50, 50],
        rotDeg: 0,
        rotPoint: [-1608.620361328125, -1838],
    },

    // One depth per node
    meshUrl: "top_cells_z_values_79x71.float32",

    // One property per cell.
    propertiesUrl: "facies5_property_78x70.uint16",

    discretePropertyValueNames: [
        { code: 0, name: "Zero" },
        { code: 1, name: "One" },
        { code: 2, name: "Five" },
    ],

    colorMapFunction: new Uint8Array([255, 255, 0, 0, 128, 0, 255, 68, 0]),

    ZIncreasingDownwards: true,
    gridLines: true,
    material: false,
};

// This layer has as (nx)*(ny) property values and depth values are nx*ny hence each cell will be fixed in color.
const nodeCenterFaciesPropertiesLayer = {
    "@@type": "MapLayer",
    "@@typedArraySupport": true,
    id: "categorical-layer",

    frame: {
        origin: [-1608.620361328125, -1838],
        count: [79, 71],
        increment: [50, 50],
        rotDeg: 0,
        rotPoint: [-1608.620361328125, -1838],
    },

    // One depth per node
    meshUrl: "top_cells_z_values_79x71.float32",

    // One property per node.
    propertiesUrl: "facies5_property_79x71.uint16",

    discretePropertyValueNames: [
        { code: 0, name: "Zero" },
        { code: 1, name: "One" },
        { code: 2, name: "Five" },
    ],

    colorMapFunction: new Uint8Array([255, 255, 0, 0, 128, 0, 255, 68, 0]),

    ZIncreasingDownwards: true,
    gridLines: false,
    material: false,
};

const axes_categorical = {
    "@@type": "AxesLayer",
    id: "axes_categorical",
    bounds: [-1608, -1838, 2038, 2291, 1662, 1449] as BoundingBox3D,
};

export const CellCenterFaciesPropMap: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [
            axes_categorical,
            cellCenterFaciesPropertiesLayer,
            northArrowLayer,
        ],

        cameraPosition: {
            rotationOrbit: 0,
            rotationX: 90,
            zoom: [
                -1608.620361328125, -1838, -2038.382080078125,
                2291.379638671875, 1662, -1449.6324462890625,
            ] as BoundingBox3D,
            target: undefined,
        },
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

export const NodeCenterFaciesPropMap: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [
            axes_categorical,
            nodeCenterFaciesPropertiesLayer,
            northArrowLayer,
        ],

        cameraPosition: {
            rotationOrbit: 0,
            rotationX: 90,
            zoom: [
                -1608.620361328125, -1838, -2038.382080078125,
                2291.379638671875, 1662, -1449.6324462890625,
            ] as BoundingBox3D,
            target: undefined,
        },
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
