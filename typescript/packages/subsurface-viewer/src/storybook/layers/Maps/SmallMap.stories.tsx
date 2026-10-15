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

/* prettier-ignore */
const map_4x5_meshData = new Float32Array([
    1.6, 1.7, 1.8, 1.9, 
    1.2, Number.NaN, 1.4, 1.5,
    0.8, 0.9, 1.0, 1.1,
    0.4, 0.5, 0.6, 0.7,
    0.0, 0.1, 0.2, 0.3,
]);

/* prettier-ignore */
const categoricalColormap = [
    255,   0,   0,
      0, 255,   0,
      0,   0, 255,
    255, 255,   0,
      0, 255, 255,
    255,   0, 255,
    125,   0,   0,
      0, 125,   0,
      0,   0, 125,
    200, 200,   0,
      0, 200, 200,
    200,   0, 200,
];

// This layer has as (nx-1)*(ny-1) property values and depth values are nx*ny
// hence each cell will have constant color.
const categoricalPropertiesLayerNodeCenter = {
    "@@type": "MapLayer",
    "@@typedArraySupport": true,
    id: "categorical-layer",

    // One depth per node
    meshData: map_4x5_meshData,

    undefinedPropertyValue: 999,

    // One property per node. Note: will cause a resampling of the mesh
    // to match a property per cell.
    /* prettier-ignore */
    propertiesData: new Uint16Array([
        0,  1,  2, 999,
        3,  4,  5, 999,
        6,  7,  8, 999,
        9, 10, 11, 999,
        999, 999, 999, 999,
    ]),

    // discretePropertyValueNames: [
    //     { code: 0, name: "Zero" },
    //     { code: 1, name: "One" },
    //     { code: 2, name: "Two" },
    // ],

    /* prettier-ignore */
    colorMapFunction: new Uint8Array(categoricalColormap),

    frame: {
        origin: [0, 0],
        count: [4, 5],
        increment: [1, 1],
        rotDeg: 0,
    },

    gridLines: true,
    material: false,
};

const categoricalColorFunc = (value: number) => {
    const index = Math.round(11 * value);
    return [
        categoricalColormap[index * 3],
        categoricalColormap[index * 3 + 1],
        categoricalColormap[index * 3 + 2],
    ];
};

// This layer has as (nx-1)*(ny-1) property values and depth values are nx*ny hence each cell will be fixed in color.
const categoricalPropertiesLayerCellCenter = {
    "@@type": "MapLayer",
    "@@typedArraySupport": true,
    id: "categorical-layer",

    // One depth per node
    /* prettier-ignore */
    meshData: map_4x5_meshData,

    undefinedPropertyValue: 999,
    undefinedPropertyColor: [40, 40, 40],

    // One property per cell.
    /* prettier-ignore */
    propertiesData: new Uint16Array([
        0,   1,  2,
        3,   4,  5,
        6, 999,  8,
        9,  10, 11,
        // 10: code not in discretePropertyValueNames hence will use undefinedPropertyColor.
    ]),
    //colorMapRange: [0, 11],

    /* prettier-ignore */
    discretePropertyValueNames: [
        { code: 0, name: "Zero" },
        { code: 1, name: "One" },
        { code: 2, name: "Two" },
        { code: 3, name: "Three" },
        { code: 4, name: "Four" },
        { code: 5, name: "Five", color: [255, 128, 0] }, // Explicit color overrides the color table and color function.
        { code: 6, name: "Six" },
        { code: 7, name: "Seven" },
        { code: 8, name: "Eight" },
        { code: 9, name: "Nine" },
        { code: 123, name: "123" },
        { code: 11, name: "Eleven" },
    ],

    /* prettier-ignore */
    //colorMapFunction: categoricalColorFunc,
    colorMapFunction: new Uint8Array(categoricalColormap),

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
        layers: [
            axes_lite,
            categoricalPropertiesLayerNodeCenter,
            northArrowLayer,
        ],
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
                story: "Small academic example of cell-centered categorical map, with a 4 x 5 mesh.",
            },
        },
    },
};

export const CellCenterSmallCategoricalPropMap: StoryObj<
    typeof SubsurfaceViewer
> = {
    args: {
        id: "map",
        layers: [
            axes_lite,
            categoricalPropertiesLayerCellCenter,
            northArrowLayer,
        ],
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
                story: "Small academic example of cell-centered categorical map, with a 4 x 5 mesh.",
            },
        },
    },
};
