import { colorTables } from "@emerson-eps/color-tables";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import React from "react";

import type { Template as TemplateType } from "./WellLogTemplateTypes";
import WellLogViewWithScroller from "./WellLogViewWithScroller";
import type { WellLogViewWithScrollerProps } from "./WellLogViewWithScroller";
import { argTypesWellLogViewScrollerProp } from "./WellLogViewWithScroller";
import { axisTitles, axisMnemos } from "../utils/axes";
import type { ColormapFunction } from "../utils/color-function";

import wellLog898MudJson from "../../../../../example-data/L898MUD.json";
import templateJson1 from "../../../../../example-data/welllog_template_1.json";

const exampleColormapFunctions = colorTables as ColormapFunction[];

const ComponentCode =
    '<WellLogViewWithScroller id="WellLogViewWithScroller" \r\n' +
    "    horizontal=false \r\n" +
    '    welllog={require("../../../../../example-data/L898MUD.json")[0]} \r\n' +
    '    template={require("../../../../../example-data/welllog_template_1.json")} \r\n' +
    "    colorMapFunctions={exampleColormapFunctions} \r\n" +
    "/>";

const stories: Meta<WellLogViewWithScrollerProps> = {
    component: WellLogViewWithScroller,
    title: "WellLogViewer/Components/WellLogViewWithScroller",
    parameters: {
        docs: {
            description: {
                component:
                    "The component add scrollbars to WellLogView component to make tracks and plots scrollable by scrollbars.",
            },
        },
        componentSource: {
            code: ComponentCode,
            language: "javascript",
        },
    },
    args: {
        // must be explicitely set starting storybook V 8
        onCreateController: fn(),
        onInfo: fn(),
        onTrackScroll: fn(),
        onTrackSelection: fn(),
        onContentRescale: fn(),
        onContentSelection: fn(),
    },
    argTypes: argTypesWellLogViewScrollerProp,
};
export default stories;

const Template = (args: WellLogViewWithScrollerProps) => {
    return (
        <div
            style={{ height: "92vh", display: "flex", flexDirection: "column" }}
        >
            <div style={{ width: "100%", height: "100%" }}>
                <WellLogViewWithScroller {...args} />
            </div>
        </div>
    );
};

export const Default: StoryObj<typeof Template> = {
    args: {
        horizontal: false,
        wellLogSets: wellLog898MudJson,
        template: templateJson1 as TemplateType,
        viewTitle: "Well '" + wellLog898MudJson[0].header.well + "'",
        colorMapFunctions: exampleColormapFunctions,
        axisTitles: axisTitles,
        axisMnemos: axisMnemos,
        options: {
            checkDatafileSchema: true,
        },
    },
    render: (args) => <Template {...args} />,
};
