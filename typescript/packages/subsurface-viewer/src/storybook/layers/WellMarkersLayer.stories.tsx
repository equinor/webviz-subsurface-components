import type { Meta, StoryObj } from "@storybook/react-webpack5";

import { create, all } from "mathjs";

import SubsurfaceViewer from "../../SubsurfaceViewer";

import type { WellMarkerDataT } from "../../layers/well_markers/wellMarkersLayer";

import { defaultStoryParameters } from "../sharedSettings";

import { getPropsInjectorComponent } from "../sharedHelperComponents";

const SubsurfaceViewerPropsInjector = getPropsInjectorComponent(
    getInjectedProps,
    SubsurfaceViewer
);

const stories: Meta = {
    component: SubsurfaceViewerPropsInjector,
    title: "SubsurfaceViewer / Well Markers Layer",
    tags: ["no-dom-test"],
    args: {
        // Add some common controls for all the stories.
        triggerHome: 0,
    },
};
export default stories;

// ---------Layers and data--------------- //
const math = create(all, { randomSeed: "1984" });

type TRandomNumberFunc = (max: number) => number;

const randomFunc = ((): TRandomNumberFunc => {
    if (math?.random) {
        return (max: number) => {
            return math.random(max);
        };
    }
    return (max: number) => Math.random() * max;
})();

const generateMarkers = (): WellMarkerDataT[] => {
    const N = 40;
    const M = 40;

    const dN = (2 * Math.PI) / N;
    const dM = (5 * Math.PI) / M;

    const res: WellMarkerDataT[] = [];

    for (let i = 0; i < N; ++i) {
        for (let j = 0; j < M; ++j) {
            const x = -N / 2 + i;
            const y = -M / 2 + j;
            const az = dN * i;
            const incl = dM * j;

            const z = 5 * (Math.sin(incl) * Math.cos(az));
            res.push({
                position: [x, y, z],
                azimuth: (az * 180) / Math.PI,
                inclination: (Math.asin(Math.cos(incl)) * 180) / Math.PI,
                color: [randomFunc(255), randomFunc(255), randomFunc(255), 100],
                outlineColor: [0, 0, 100, 255],
                size: 0.02 * Math.sqrt(x * x + y * y),
            });
        }
    }
    return res;
};

// ---------In-place array data handling (storybook fails to rebuild non JSon data)--------------- //
const wellMarkersLayerId = "typedData_surface_layer";

const injectedProps = {
    [wellMarkersLayerId]: {
        data: generateMarkers(),
    },
};

function getInjectedProps() {
    return injectedProps;
}

export const WellMarkers: StoryObj<typeof SubsurfaceViewerPropsInjector> = {
    args: {
        bounds: [-30, -30, 30, 30],
        views: {
            layout: [1, 1] as [number, number],
            viewports: [
                {
                    id: "view_1",
                    show3D: true,
                },
            ],
        },
        id: "well-markers-tttt",
        layers: [
            {
                "@@type": "AxesLayer",
                id: "well-markers-axes",
                bounds: [-25, -25, -25, 25, 25, 25],
                ZIncreasingDownwards: false,
            },
            {
                "@@type": "NorthArrow3DLayer",
                id: "north-arrow-layer",
            },
            {
                "@@type": "WellMarkersLayer",
                id: wellMarkersLayerId,
                pickable: true,
                shape: "circle",
                sizeUnits: "common",
                data: "data proxy",
            },
        ],
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Well Markers Layer.",
            },
        },
    },
};
