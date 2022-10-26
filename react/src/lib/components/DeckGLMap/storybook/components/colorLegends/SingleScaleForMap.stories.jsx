import React from "react";
import { ContinuousLegend, colorTables } from "@emerson-eps/color-tables";
import DeckGLMap from "../../../DeckGLMap";

export default {
    component: DeckGLMap,
    title: "DeckGLMap/Components/ColorLegends/SingleScaleForMap",
};

const defaultProps = {
    id: "DeckGlMap",
    resources: {
        propertyMap:
            "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/master/react/src/demo/example-data/propertyMap.png",
    },
    bounds: [432150, 6475800, 439400, 6481500],
};

const layers = [
    {
        "@@type": "ColormapLayer",
        image: "@@#resources.propertyMap",
        rotDeg: 0,
        bounds: [432205, 6475078, 437720, 6481113],
        valueRange: [2782, 3513],
        colorMapRange: [2782, 3513],
    },
];

// prop for legend
const min = 0;
const max = 0.35;
const dataObjectName = "Legend";
const position = [16, 10];
const horizontal = true;
const invertLegend = false;

// 4 maps with same color scale for all maps
const mapWithScaleTemplate = (args) => {
    const updatedLayerData = [
        {
            ...args.layers[0],
            colorMapName: args.colorName,
        },
    ];
    return (
        <div>
            <div
                style={{
                    float: "right",
                    zIndex: 999,
                    opacity: 1,
                    position: "relative",
                }}
            >
                <ContinuousLegend {...args} />
            </div>
            <DeckGLMap {...args} layers={updatedLayerData} />
        </div>
    );
};

export const SingleScaleForMap = mapWithScaleTemplate.bind({});

SingleScaleForMap.args = {
    min,
    max,
    dataObjectName,
    position,
    horizontal,
    colorTables,
    colorName: "Rainbow",
    layers,
    ...defaultProps,
    legend: {
        visible: false,
    },
    zoom: -5,
    invertLegend,
    views: {
        layout: [2, 2],
        showLabel: true,
        viewports: [
            {
                id: "view_1",
                name: "Colormap layer 1",
                show3D: false,
                layerIds: ["colormap-layer"],
            },
            {
                id: "view_2",
                name: "Colormap layer 2",
                show3D: false,
                layerIds: ["colormap-layer"],
            },
            {
                id: "view_3",
                name: "Colormap layer 3",
                show3D: false,
                layerIds: ["colormap-layer"],
            },
            {
                id: "view_4",
                name: "Colormap layer 4",
                show3D: false,
                layerIds: ["colormap-layer"],
            },
        ],
    },
};

SingleScaleForMap.parameters = {
    docs: {
        description: {
            story: "Four maps with same color scale for all maps",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};
