import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { View } from "@deck.gl/core/typed";

import SubsurfaceViewer from "../../SubsurfaceViewer";
import type { ViewsType } from "../../components/Map";

import {
    default2DViews,
    hugin2DBounds,
    hugin25mKhNetmapMapLayerPng,
} from "../sharedSettings";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Axes2DLayer",
};
export default stories;

const layerProps = {
    marginH: 80, // Horizontal margin (in pixels)
    marginV: 30, // Vertical margin (in pixels)
    isLeftRuler: true,
    isRightRuler: false,
    isBottomRuler: true,
    isTopRuler: false,
    backgroundColor: [155, 155, 155, 255],
};

const axes2DLayer = {
    "@@type": "Axes2DLayer",
    id: "axes-layer2D",
    ...layerProps,
};

export const Base: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [hugin25mKhNetmapMapLayerPng, axes2DLayer],

        bounds: hugin2DBounds,
        views: default2DViews,
    },
};

export const ColoredTextAndBackGround: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [
            hugin25mKhNetmapMapLayerPng,
            // Yellow background, blue text.
            {
                ...axes2DLayer,
                axisColor: [100, 100, 255],
                backgroundColor: [255, 255, 100],
            },
        ],

        bounds: hugin2DBounds,
        views: default2DViews,
    },
};

//===========================================================
const MatrixStory = () => {
    const views: ViewsType = {
        layout: [2, 2],
        marginPixels: 10,
        viewports: [
            {
                id: "view_1",
                show3D: false,
                layerIds: [],
                isSync: false,
            },
            {
                id: "view_2",
                show3D: false,
                layerIds: [],
                isSync: false,
            },
            {
                id: "view_3",
                show3D: false,
                layerIds: [],
                isSync: false,
            },
            {
                id: "view_4",
                show3D: false,
                layerIds: [],
                isSync: false,
            },
        ],
    };

    return (
        <SubsurfaceViewer
            id={"test"}
            layers={[hugin25mKhNetmapMapLayerPng, axes2DLayer]}
            views={views}
            bounds={hugin2DBounds}
        >
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                /* @ts-expect-error */
                <View id="view_1"></View>
            }
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                /* @ts-expect-error */
                <View id="view_2"></View>
            }
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                /* @ts-expect-error */
                <View id="view_3"></View>
            }
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                /* @ts-expect-error */
                <View id="view_4"></View>
            }
        </SubsurfaceViewer>
    );
};

export const Matrix: StoryObj<typeof MatrixStory> = {
    render: () => <MatrixStory />,
};
