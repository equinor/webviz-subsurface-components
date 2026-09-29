import type { Meta, StoryObj } from "@storybook/react-webpack5";
import type { BoundingBox2D } from "../../../utils";
import SubsurfaceViewer from "../../../SubsurfaceViewer";
import {
    default3DViews,
    defaultStoryParameters,
    northArrowLayer,
} from "../../sharedSettings";
import { Play } from "../../util/play";

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
const categoricalPropertiesLayer = {
    "@@type": "MapLayer",
    "@@typedArraySupport": true,
    id: "categorical-layer",

    /*eslint-disable */
    // One depth per node
    meshData: [
        1.6, 1.7, 1.8, 1.9, 1.2, 1.3, 1.4, 1.5, 0.8, 0.9, 1.0, 1.1, 0.4, 0.5,
        0.6, 0.7, 0.0, 0.1, 0.2, 0.3,
    ],

    undefinedPropertyValue: 999,

    // One property per cell.
    propertiesData: new Uint16Array([
        0,
        1,
        2,
        3,
        999, // undefined value
        5,
        6,
        7,
        8,
        9,
        10, // code not in discretePropertyValueNames hence will use undefinedPropertyColor.
        11,
    ]),

    discretePropertyValueNames: [
        { code: 0, name: "Zero" },
        { code: 1, name: "One" }, 
        { code: 2, name: "Two" }, 
        { code: 3, name: "Three" }, 
        { code: 4, name: "Four" }, 
        { code: 5, name: "Five", color: [255, 255, 0] }, // Explicit color overrides the color table and color function.
        { code: 6, name: "Six" }, 
        { code: 7, name: "Seven" }, 
        { code: 8, name: "Eight" }, 
        { code: 9, name: "Nine" }, 
        { code: 123, name: "123" },
        { code: 11, name: "Eleven" },
    ],

    colorMapFunction: new Uint8Array([
        255, 0, 0,
        0, 255, 0,
        0, 0, 255,
        0, 0, 255,
        0, 255, 0,
        255, 0, 0,
        255, 0, 0,
        0, 255, 0,
        0, 0, 255,
        0, 0, 255,
        0, 255, 0,
        255, 0, 0,
    ]),
    /*eslint-enable */

    frame: {
        origin: [0, 0],
        count: [4, 5],
        increment: [1, 1],
        rotDeg: 0,
    },

    gridLines: true,
    material: false,
};

const axes_lite = {
    "@@type": "AxesLayer",
    id: "axes_small",
    bounds: [-1, -1, 0, 4, 5, 3],
};

export const CategoricalPropMapSmall: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [axes_lite, categoricalPropertiesLayer, northArrowLayer],
        bounds: [-1, -1, 4, 5] as BoundingBox2D,
        views: default3DViews,
    },
    play: async () => {
        const canvas = await Play.activateCanvas();

        if (!canvas) {
            return;
        }

        const pickPosition = {
            clientX:
                canvas.getBoundingClientRect().left + canvas.clientWidth / 2,
            clientY:
                canvas.getBoundingClientRect().top + canvas.clientHeight / 2,
        };

        await Play.pick(canvas, pickPosition);
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Small academic example categorical map.",
            },
        },
    },
};
