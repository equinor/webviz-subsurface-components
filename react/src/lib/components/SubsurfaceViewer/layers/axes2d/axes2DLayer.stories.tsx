import React from "react";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { View } from "../../../..";
import { ViewsType } from "../../components/Map";

type NumberQuad = [number, number, number, number];

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Axes2D",
} as ComponentMeta<typeof SubsurfaceViewer>;

const layerProps = {
    marginH: 80, // Horizontal margin (in pixels)
    marginV: 30, // Vertical margin (in pixels)
    isLeftRuler: true,
    isRightRuler: false,
    isBottomRuler: true,
    isTopRuler: false,
    backgroundColor: [155, 155, 155, 255],
};

const meshMapLayerPng = {
    "@@type": "MapLayer",
    id: "mesh-layer",
    meshUrl: "hugin_depth_25_m.png",
    frame: {
        origin: [432150, 6475800],
        count: [291, 229],
        increment: [25, 25],
        rotDeg: 0,
    },
    propertiesUrl: "kh_netmap_25_m.png",
    contours: [0, 100],
    isContoursDepth: true,
    gridLines: false,
    material: true,
    smoothShading: true,
    colorMapName: "Physics",
};

const axes2D = {
    "@@type": "Axes2DLayer",
    id: "axes-layer2D",
    ...layerProps,
};

export const Base: ComponentStory<typeof SubsurfaceViewer> = (args) => {
    return <SubsurfaceViewer {...args} />;
};

Base.args = {
    id: "map",
    layers: [meshMapLayerPng, axes2D],

    bounds: [432150, 6475800, 439400, 6481500],
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: false,
            },
        ],
    },
};

export const ColoredTextAndBackGround: ComponentStory<
    typeof SubsurfaceViewer
> = (args) => {
    return <SubsurfaceViewer {...args} />;
};

ColoredTextAndBackGround.args = {
    id: "map",
    layers: [
        meshMapLayerPng,
        // Yellow background, blue text.
        {
            ...axes2D,
            axisColor: [100, 100, 255],
            backgroundColor: [255, 255, 100],
        },
    ],

    bounds: [432150, 6475800, 439400, 6481500],
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: false,
            },
        ],
    },
};

//===========================================================
const MatrixStory = () => {
    const views: ViewsType = {
        layout: [2, 2],
        viewports: [
            {
                id: "view_1",
                show3D: false,
                layerIds: ["mesh-layer", "axes-layer2D"],
                isSync: false,
            },
            {
                id: "view_2",
                show3D: false,
                layerIds: ["mesh-layer", "axes-layer2D"],
                isSync: false,
            },
            {
                id: "view_3",
                show3D: false,
                layerIds: ["mesh-layer", "axes-layer2D"],
                isSync: false,
            },
            {
                id: "view_4",
                show3D: false,
                layerIds: ["mesh-layer", "axes-layer2D"],
                isSync: false,
            },
        ],
    };

    const marginPixels = 10;
    const bounds = [432150, 6475800, 439400, 6481501] as NumberQuad;
    return (
        <SubsurfaceViewer
            id={"test"}
            layers={[meshMapLayerPng, axes2D]}
            views={views}
            bounds={bounds}
            marginPixels={marginPixels}
        >
            <View id="view_1"></View>
            <View id="view_2"></View>
            <View id="view_3"></View>
            <View id="view_4"></View>
        </SubsurfaceViewer>
    );
};

export const Matrix: ComponentStory<typeof MatrixStory> = () => {
    return <MatrixStory />;
};
