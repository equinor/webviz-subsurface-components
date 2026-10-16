import type { Meta, StoryObj } from "@storybook/react-webpack5";
import type { BoundingBox2D } from "../../../utils";
import SubsurfaceViewer from "../../../SubsurfaceViewer";
import {
    default3DViews,
    defaultStoryParameters,
    northArrowLayer,
} from "../../sharedSettings";
import { Play } from "../../util/play";
import { getPropsInjectorComponent } from "../../sharedHelperComponents";

const SubsurfaceViewerPropsInjector = getPropsInjectorComponent(
    getInjectedProps,
    SubsurfaceViewer
);
const stories: Meta = {
    component: SubsurfaceViewerPropsInjector,
    title: "SubsurfaceViewer / Map Layer / Categorical Maps",
    tags: ["no-dom-test"],
    args: {
        // Add some common controls for all the stories.
        triggerHome: 0,
    },
};
export default stories;

/* prettier-ignore */
const map_4x5_meshData = [
    1.6, 1.7, 1.8, 1.9, 
    1.2, Number.NaN, 1.4, 1.5,
    0.8, 0.9, 1.0, 1.1,
    0.4, 0.5, 0.6, 0.7,
    0.0, 0.1, 0.2, 0.3,
];

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

const discretePropertyValueNames = [
    { value: 0, name: "Zero" },
    { value: 1, name: "One" },
    { value: 2, name: "Two" },
    { value: 3, name: "Three" },
    { value: 4, name: "Four" },
    { value: 5, name: "Five", color: [255, 128, 0] }, // Explicit color overrides the color table and color function.
    { value: 6, name: "Six" },
    { value: 7, name: "Seven" },
    { value: 8, name: "Eight" },
    { value: 9, name: "Nine" },
    { value: 123, name: "123" },
    { value: 11, name: "Eleven" },
];

// ---------In-place array data handling (storybook fails to rebuild non JSon data)--------------- //
const categoricalNodeLayerId = "categorical-node-layer";
const categoricalCellLayerId = "categorical-cell-layer";
const injectedProps = {
    [categoricalNodeLayerId]: {
        colorMapFunction: new Uint8Array(categoricalColormap),
    },
    [categoricalCellLayerId]: {
        colorMapFunction: new Uint8Array(categoricalColormap),
    },
};

function getInjectedProps() {
    return injectedProps;
}

// This layer has as (nx-1)*(ny-1) property values and depth values are nx*ny
// hence each cell will have constant color.
const categoricalPropertiesLayerNodeCenter = {
    "@@type": "MapLayer",
    "@@typedArraySupport": true,
    id: categoricalNodeLayerId,

    // One depth per node
    meshData: map_4x5_meshData,

    undefinedPropertyValue: 999,
    undefinedPropertyColor: [200, 40, 40],

    // One property per node. Note: will cause a resampling of the mesh
    // to match a property per cell.
    /* prettier-ignore */
    propertiesData: [
        0,  1,  2, 0,
        3,  4,  5, 999,
        6,  999,  8, 999,
        9, 10, 11, 999,
        999, 999, 999, 999,
    ],

    discretePropertyValueNames,

    colorMapFunction: "colorMapFunction proxy",

    frame: {
        origin: [0, 0],
        count: [4, 5],
        increment: [1, 1],
        rotDeg: 0,
    },

    gridLines: true,
    material: false,
};

// const categoricalColorFunc = (value: number) => {
//     const index = Math.round(11 * value);
//     return [
//         categoricalColormap[index * 3],
//         categoricalColormap[index * 3 + 1],
//         categoricalColormap[index * 3 + 2],
//     ];
// };

// This layer has as (nx-1)*(ny-1) property values and depth values are nx*ny hence each cell will be fixed in color.
const categoricalPropertiesLayerCellCenter = {
    "@@type": "MapLayer",
    "@@typedArraySupport": true,
    id: categoricalCellLayerId,

    // One depth per node
    meshData: map_4x5_meshData,

    undefinedPropertyValue: 999,
    undefinedPropertyColor: [200, 40, 40],

    // One property per cell.
    /* prettier-ignore */
    propertiesData: [
        0,   1,  2,
        3,   4,  5,
        6, 999,  8,
        9,  10, 11,
        // 10: value not in discretePropertyValueNames hence will use undefinedPropertyColor.
    ],
    //colorMapRange: [0, 11],

    discretePropertyValueNames,
    //colorMapFunction: categoricalColorFunc,
    colorMapFunction: "colorMapFunction proxy",

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
