import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { OrbitView, OrthographicView } from "@deck.gl/core";
import type { MergedTextLayerProps } from "../../layers/wells/layers/mergedTextLayer";
import { MergedTextLayer } from "../../layers/wells/layers/mergedTextLayer";
import { AxesLayer } from "../../layers";
import type { ViewsType } from "../../SubsurfaceViewer";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import { LABEL_MERGE_RADIUS_ARGTYPES } from "../constant/argTypes";

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
            viewType: OrthographicView,
            layerIds: ["merged-labels"],
        },
        {
            id: "view_2",
            viewType: OrbitView,
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
        ...LABEL_MERGE_RADIUS_ARGTYPES,
    },
};

export default stories;
