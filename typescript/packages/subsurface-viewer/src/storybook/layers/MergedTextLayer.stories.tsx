import React from "react";
import { Meta, Story, StoryObj } from "@storybook/react";
import { MergedTextLayer, MergedTextLayerProps } from "../../layers/wells/layers/mergedTextLayer";
import { AxesLayer } from "../../layers";
import SubsurfaceViewer, { ViewsType } from "../../SubsurfaceViewer";

const stories: Meta = {
    title: "SubsurfaceViewer / MergedTextLayer",
    parameters: {
        docs: {
            description: {
                component: "Layer that merges labels",
            },
            story: {
                height: "700px",
            },
        },
    },
};

const AXES_LAYERS = [
    new AxesLayer({
        id: "axes-layer-3d",
        bounds: [450000, 6781000, 0, 464000, 6791000, 3500],
    }),
];

const DEFAULT_VIEWS: ViewsType = {
    layout: [1, 2],
    viewports: [
        {
            id: "view_1",
            show3D: false,
            layerIds: ["merged-labels"],
        },
        {
            id: "view_2",
            show3D: true,
            layerIds: ["axes-layer-3d", "merged-labels"],
        },
    ],
};

const LABEL_DATA = [
    { text: "Well A", position: [461000, 6786000, 0] },
    { text: "Well B", position: [460000, 6785000, -1000] },
    { text: "Well C", position: [460000, 6785000, -1009] },
    { text: "Well D", position: [460000, 6785000, -1009] },
];

export const Default: StoryObj = {
    render: () => {
        const labelLayer = new MergedTextLayer({
            id: "merged-labels",
            data: LABEL_DATA,
        });

        const propsWithLayers = {
            id: "default",
            layers: [...AXES_LAYERS, labelLayer],
            views: DEFAULT_VIEWS,
        };

        return <SubsurfaceViewer {...propsWithLayers} />;
    },
};

export const MergeRadius: StoryObj<MergedTextLayerProps> = {
    render: (args) => {
        const labelLayer = new MergedTextLayer({
            ...args,
            id: "merged-labels",
            data: LABEL_DATA,
        });

        const propsWithLayers = {
            id: "default",
            layers: [...AXES_LAYERS, labelLayer],
            views: DEFAULT_VIEWS,
        };

        return <SubsurfaceViewer {...propsWithLayers} />;
    },
    args: {
        mergeRadius: 100,
        background: true,
        getBackgroundColor: [200, 200, 200, 200],
        getBorderColor: [0, 0, 0, 255],
        getSize: 20,
        getBorderWidth: 2,
        mergeLabels: true,
        getColor: [100, 0, 0, 255],
    },
    argTypes: {
        mergeRadius: {
            control: {
                type: "range",
                min: 1,
                max: 2000,
                step: 1,
            },
        },
    },
};

export default stories;
