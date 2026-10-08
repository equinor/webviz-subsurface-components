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
        1.6, 1.7, 1.8, 1.9, 
        1.2, undefined, 1.4, 1.5,  // 1.3
        0.8, 0.9, 1.0, 1.1,
        0.4, 0.5, 0.6, 0.7,
        0.0, 0.1, 0.2, 0.3,
    ],

    undefinedPropertyValue: 999,

    // One property per node. Note: will cause a resampling of the mesh
    // to match a property per cell.
    propertiesData: new Uint16Array([
        0,
        1,
        2,
        0,
        1,
        2,
        0,
        1,
        2,
        0,
        1,
        2,
        0,
        1,
        2,
        0,
        1,
        2,
        0,
        1,
    ]),

    discretePropertyValueNames: [
        { code: 0, name: "Zero" },
        { code: 1, name: "One" }, 
        { code: 2, name: "Two" }, 
    ],

    colorMapFunction: new Uint8Array([
        255, 0, 0,
        0, 255, 0,
        0, 0, 255,
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

export const NodeCenterSmallCategoricalPropMap: StoryObj<
    typeof SubsurfaceViewer
> = {
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
