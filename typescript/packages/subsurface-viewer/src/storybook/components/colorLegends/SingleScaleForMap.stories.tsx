import { styled } from "@mui/material/styles";
import React from "react";

import type { Meta } from "@storybook/react";

import { omit } from "lodash";

import { ContinuousLegend, colorTables } from "@emerson-eps/color-tables";
import { DEFAULT_STYLE as defaultLegendStyle } from "@emerson-eps/color-tables/dist/component/Legend/constants";

import SubsurfaceViewer from "../../../SubsurfaceViewer";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/Components/ColorLegends",
};
export default stories;

const PREFIX = "SingleScaleForMap";

const classes = {
    main: `${PREFIX}-main`,
    legend: `${PREFIX}-legend`,
};

const Root = styled("div")({
    [`& .${classes.main}`]: {
        height: 500,
        width: "100%",
        border: "1px solid black",
        position: "absolute",
    },
    [`& .${classes.legend}`]: {
        zIndex: 999,
        opacity: 1,
    },
});

// Remove the left and top keys from the default legend style
// The Legends from @emerson-eps/color-tables do overwrite the style to {"position": absolute} and cssLegendStyles prop :(
const legendStyle = omit(defaultLegendStyle, ["left", "top"]);

const defaultProps = {
    id: "SubsurfaceViewer",
    resources: {
        propertyMap: "propertyMap.png",
    },
    bounds: [432150, 6475800, 439400, 6481500],
};

const layers = [
    {
        "@@type": "ColormapLayer",
        image: "propertyMap.png",
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
const reverseRange = false;

// 4 maps with same color scale for all maps
// ContinuousLegend is overwriting the style to {"position": absolute} and cssLegendStyles :(
const SubsurfaceViewerWithLegend = (args) => {
    const updatedLayerData = [
        {
            ...args.layers[0],
            colorMapName: args.colorName,
        },
    ];
    return (
        <Root className={classes.main}>
            <div className={classes.legend}>
                <ContinuousLegend
                    cssLegendStyles={{
                        ...legendStyle,
                        right: "0vw",
                        top: "0vh",
                    }}
                    {...args}
                />
            </div>
            <SubsurfaceViewer {...args} layers={updatedLayerData} />
        </Root>
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
    reverseRange,
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

SingleScaleForMap.tags = ["no-tests"];
