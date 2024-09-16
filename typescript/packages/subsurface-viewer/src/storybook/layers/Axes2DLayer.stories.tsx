import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { View } from "@deck.gl/core";

import * as d3 from "d3";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import type { ViewsType } from "../../components/Map";

import {
    default2DViews,
    hugin25mKhNetmapMapLayerPng,
    hugin2DBounds,
} from "../sharedSettings";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Axes2DLayer",
    args: {
        // Add some common controls for all the stories.
        triggerHome: 0,
    },
};
export default stories;

const layerProps = {
    marginH: 80, // Horizontal margin (in pixels)
    marginV: 30, // Vertical margin (in pixels)
    isLeftRuler: true,
    isRightRuler: false,
    isBottomRuler: true,
    isTopRuler: false,
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

export const FontSize: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "fontsize",
        layers: [
            hugin25mKhNetmapMapLayerPng,
            { ...axes2DLayer, labelFontSizePt: 9 },
        ],

        bounds: hugin2DBounds,
        views: default2DViews,
    },
};

function makeLabelFunction(a: number): string {
    // Choos exponential format with 3 digits after point.
    const label = d3.format(".3e")(a);
    //const label = d3.format(".1f")(a) // fixed decimal  KEEP
    return label;
}

export const FormatLabelFunction: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [
            {
                "@@type": "AxesLayer",
                id: "axes-layer2",
                bounds: [453150, 5925800, 50, 469400, 5939500, 100],
            },
            {
                "@@type": "Axes2DLayer",
                id: "axes-layer2D-small",
                ...layerProps,
                formatLabelFunc: makeLabelFunction,
            },
        ],
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
            {/*
             // @ts-expect-error TS2786 */}
            {<View id="view_1"></View>}
            {/*
             // @ts-expect-error TS2786 */}
            {<View id="view_2"></View>}
            {/*
             // @ts-expect-error TS2786 */}
            {<View id="view_3"></View>}
            {/*
             // @ts-expect-error TS2786 */}
            {<View id="view_4"></View>}
        </SubsurfaceViewer>
    );
};

export const Matrix: StoryObj<typeof MatrixStory> = {
    render: () => <MatrixStory />,
};
