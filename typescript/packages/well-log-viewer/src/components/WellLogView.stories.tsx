import type { Meta, StoryObj } from "@storybook/react";
import { colorTables } from "@emerson-eps/color-tables";
import React from "react";

import WellLogView from "./WellLogView";
import type { WellLogSet } from "./WellLogTypes";
import type { Template } from "./WellLogTemplateTypes";
import type { WellLogViewProps } from "./WellLogView";
import { argTypesWellLogViewProp } from "./WellLogView";
import { axisTitles, axisMnemos } from "../utils/axes";
import type { ColormapFunction } from "../utils/color-function";

// Import example data
import L898MUD from "../../../../../example-data/L898MUD.json";
import volve_logs from "../../../../../example-data/volve_logs.json";
import viewerTemplateJson1 from "../../../../../example-data/welllog_template_1.json";
import viewerTemplateJson2 from "../../../../../example-data/welllog_template_2.json";

const wellLogDefault = L898MUD[0];
const wellLogDiscrete = volve_logs[0] as unknown as WellLogSet;

const viewerTemplate1 = viewerTemplateJson1 as Template;
const viewerTemplate2 = viewerTemplateJson2 as Template;

const exampleColormapFunctions = colorTables as ColormapFunction[];

const stories: Meta<WellLogViewProps> = {
    component: WellLogView,
    title: "WellLogViewer/Components/WellLogView",
    argTypes: argTypesWellLogViewProp,
    parameters: {
        docs: {
            description: {
                component:
                    "WellLogView is a basic react component to wrap [videx-wellog](https://github.com/equinor/videx-wellog) library for drawing well log data",
            },
        },
    },
};
export default stories;

const WrappedWellLogView = (args: WellLogViewProps) => {
    return (
        <div style={{ height: "92vh" }}>
            <WellLogView {...args} />
        </div>
    );
};

export const Default: StoryObj<typeof WrappedWellLogView> = {
    args: {
        horizontal: false,
        wellLogSets: [wellLogDefault],
        template: viewerTemplate1,
        viewTitle: (
            <div>
                <i>Well</i> <b>{wellLogDefault.header.well}</b>
            </div>
        ),
        colorMapFunctions: exampleColormapFunctions,
        axisTitles: axisTitles,
        axisMnemos: axisMnemos,
    },
    render: (args) => <WrappedWellLogView {...args} />,
};

export const Discrete: StoryObj<typeof WrappedWellLogView> = {
    args: {
        horizontal: false,
        wellLogSets: [wellLogDiscrete] as WellLogSet[],
        template: viewerTemplate2,
        viewTitle: "Well '" + wellLogDiscrete.header.well + "'",
        colorMapFunctions: exampleColormapFunctions,
        axisTitles: axisTitles,
        axisMnemos: axisMnemos,
        options: {
            checkDatafileSchema: true,
        },
    },
    render: (args) => <WrappedWellLogView {...args} />,
};
