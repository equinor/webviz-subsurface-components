import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { ViewFooter, SubsurfaceViewerDashWrapper } from "../..";

export default {
    component: SubsurfaceViewerDashWrapper,
    title: "DeckGLMap / SubsurfaceViewerDashWrapper",
} as ComponentMeta<typeof SubsurfaceViewerDashWrapper>;

const mapLayer = {
    "@@type": "MapLayer",
    id: "hugin",
    meshUrl: "hugin_depth_25_m.float32",
    frame: {
        origin: [432150, 6475800],
        count: [291, 229],
        increment: [25, 25],
        rotDeg: 0,
    },
    propertiesUrl: "kh_netmap_25_m.float32",
    contours: [0, 100],
    material: false,
};

const DashWrapperTemplate: ComponentStory<
    typeof SubsurfaceViewerDashWrapper
> = (args) => <SubsurfaceViewerDashWrapper {...args} />;

export const DashWrapperViewAnnotation = DashWrapperTemplate.bind({});

DashWrapperViewAnnotation.args = {
    id: "dash_annotation",
    layers: [
        mapLayer,
        {
            ...mapLayer,
            id: "kh_netmap",
            propertiesUrl: "hugin_depth_25_m.float32",
        },
    ],
    views: {
        layout: [1, 2],
        showLabel: true,
        viewports: [
            {
                id: "view_1",
                layerIds: ["hugin"],
            },
            {
                id: "view_2",
                layerIds: ["kh_netmap"],
            },
        ],
    },
    annotation: {
        view_1: <ViewFooter>Hugin</ViewFooter>,
        view_2: <ViewFooter>kH Netmap</ViewFooter>,
    },
};
