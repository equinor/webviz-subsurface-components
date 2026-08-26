import type { Meta, StoryObj } from "@storybook/react-webpack5";

import SubsurfaceViewer from "../../SubsurfaceViewer";

import { default3DViews, defaultStoryParameters } from "../sharedSettings";
import { createMathWithSeed } from "../sharedHelperFunctions";
import { getPropsInjectorComponent } from "../sharedHelperComponents";

const SubsurfaceViewerPropsInjector = getPropsInjectorComponent(
    getInjectedProps,
    SubsurfaceViewer
);

const stories: Meta = {
    component: SubsurfaceViewerPropsInjector,
    title: "SubsurfaceViewer / Polylines Layer",
    tags: ["no-dom-test"],
    args: {
        // Add some common controls for all the stories.
        triggerHome: 0,
    },
};
export default stories;

// ---------Layers and data--------------- //
const sideSize = 10000;
const pointsCount = 100000;

const math = createMathWithSeed("123456789");

const hugePoints = new Array(pointsCount * 3)
    .fill(0)
    .map(() => math.random(sideSize));

// ---------In-place array data handling (storybook fails to rebuild non JSon data)--------------- //
const typedDataPolylinesLayerId = "huge_polylines_typed_data_layer";
const hugePolylinesLayerId = "huge_polylines_data_layer";

const injectedProps = {
    [typedDataPolylinesLayerId]: {
        polylinePoints: new Float32Array(hugePoints),
        startIndices: new Uint32Array([0, pointsCount]),
    },
    [hugePolylinesLayerId]: {
        polylinePoints: hugePoints,
        startIndices: new Uint32Array([0, pointsCount]),
    },
};

function getInjectedProps() {
    return injectedProps;
}

// Small example using polylinesLayer.
const smallPolylinesLayer = {
    "@@type": "PolylinesLayer",
    id: "small_polylines_layer",
    polylinePoints: [
        0, 0, 0, 10, 0, 0, 10, 0, 10, -5, -5, 4, 0, -8, 6, 5, 10, 8,
    ],
    startIndices: [0, 3],
    polylinesClosed: [true, false],
    color: [0, 200, 100],

    widthUnits: "pixels",
    linesWidth: 10,
    ZIncreasingDownwards: true,
};

const smallAxesLayer = {
    "@@type": "AxesLayer",
    id: "small_axes_layer",
    bounds: [-10, -10, 0, 20, 15, 10],
};

export const SmallPolylinesLayer: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "small-polylines",
        layers: [smallAxesLayer, smallPolylinesLayer],
        bounds: [-10, -10, 17, 10],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Polyline nodes are given as native javascript array.",
            },
        },
    },
};

const hugePolylinesLayer = {
    "@@type": "PolylinesLayer",
    id: hugePolylinesLayerId,
    "@@typedArraySupport": true,

    polylinePoints: "hugePoints proxy",
    startIndices: [0],
    color: [0, 100, 100, 40],

    widthUnits: "pixels",
    linesWidth: 1,

    ZIncreasingDownwards: true,
};

const hugeAxesLayer = {
    "@@type": "AxesLayer",
    id: "huge_axes_layer",
    bounds: [0, 0, 0, sideSize, sideSize, sideSize],
};

export const HugePolylinesLayer: StoryObj<
    typeof SubsurfaceViewerPropsInjector
> = {
    args: {
        id: "map",
        layers: [hugeAxesLayer, hugePolylinesLayer],
        bounds: [0, 0, sideSize, sideSize],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Polyline nodes are randomly generated in runtime and given as native javascript arrays.",
            },
        },
    },
    tags: ["no-test"],
};

export const HugeLayerTypedArrayInput: StoryObj<
    typeof SubsurfaceViewerPropsInjector
> = {
    args: {
        id: "map",
        layers: [
            hugeAxesLayer,
            {
                "@@type": "PolylinesLayer",
                id: typedDataPolylinesLayerId,
                "@@typedArraySupport": true,

                polylinePoints: "polylinePoints proxy",
                startIndices: "startIndices proxy",
                color: [0, 100, 200, 40],

                widthUnits: "pixels",
                linesWidth: 1,

                ZIncreasingDownwards: true,
            },
        ],
        bounds: [0, 0, sideSize, sideSize],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Polyline nodes are randomly generated in runtime and given as javascript typed arrays.",
            },
        },
    },
    tags: ["no-test"],
};
