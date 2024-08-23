import React from "react";
import { styled } from "@mui/material/styles";

import type { Meta, StoryObj } from "@storybook/react";

import { omit } from "lodash";

// @ts-expect-error TS6192
import type {
    colorTablesArray,
    ContinuousLegendProps,
} from "@emerson-eps/color-tables";
import { ContinuousLegend, colorTables } from "@emerson-eps/color-tables";
import { DEFAULT_STYLE as defaultLegendStyle } from "@emerson-eps/color-tables/dist/component/Legend/constants";

import type { SubsurfaceViewerProps } from "../../../SubsurfaceViewer";
import SubsurfaceViewer from "../../../SubsurfaceViewer";

import {
    colormapLayer,
    defaultStoryParameters,
    hugin2DBounds,
} from "../../sharedSettings";

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
    bounds: hugin2DBounds,
};

const layers = [colormapLayer];

// prop for legend
const min = 0;
const max = 0.35;
const dataObjectName = "Legend";
const horizontal = true;
const reverseRange = false;
// @ts-expect-error TS2709
const colorTablesData = colorTables as colorTablesArray;

type SubsurfaceViewerWithLegendProps = SubsurfaceViewerProps &
    // @ts-expect-error TS2709
    ContinuousLegendProps;

// 4 maps with same color scale for all maps
// ContinuousLegend is overwriting the style to {"position": absolute} and cssLegendStyles :(
const SubsurfaceViewerWithLegend: React.FC<SubsurfaceViewerWithLegendProps> = (
    args
) => {
    const updatedLayerData = [
        {
            ...args.layers?.[0],
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

export const ContinuousLegendForSubsurfaceViewer: StoryObj<
    typeof SubsurfaceViewerWithLegend
> = {
    name: "ContinuousLegend For SubsurfaceViewer",
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Four maps with same color scale for all maps",
            },
        },
    },
    args: {
        min,
        max,
        dataObjectName,
        horizontal,
        colorTables: colorTablesData,
        colorName: "Rainbow",
        layers,
        ...defaultProps,
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
    },
    render: (args) => <SubsurfaceViewerWithLegend {...args} />,
};
