import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { colorTables } from "@emerson-eps/color-tables";
import React from "react";

import type { WellLogViewProps } from "./WellLogView";
import WellLogView, { argTypesWellLogViewProp } from "./WellLogView";

import type { WellLogSet } from "./WellLogTypes";
import type { Template } from "./WellLogTemplateTypes";
import { axisTitles, axisMnemos } from "../utils/axes";
import type { ColormapFunction } from "../utils/color-function";

// Import example data
import L898MUD from "../../../../../example-data/L898MUD.json";
import volve_logs from "../../../../../example-data/volve_logs.json";
import viewerTemplateJson1 from "../../../../../example-data/welllog_template_1.json";
import viewerTemplateJson2 from "../../../../../example-data/welllog_template_2.json";

const wellLogDefault = L898MUD[0];
const wellLogDiscrete = (volve_logs as unknown as WellLogSet[])[0];

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

/**
 * Storybook 9 is very slow to parse huge JSON args.
 * Thus the approach to use a string name to select the well log sets to be used in the story.
 * The function getWellLogSets() returns the well log sets based on the name.
 * The storybook args.wellLogSets is a string name, which is used to get the well log sets.
 *
 * Note: it does not really make sense to pack some huge data structure into a storybook argument; user will never be able to
 * read/edit it.
 */
function getWellLogSets(name: string): WellLogSet[] {
    switch (name) {
        case "Default":
            return [wellLogDefault];
        case "Discrete":
            return [wellLogDiscrete];
    }
    return [];
}

/**
 * Update wellLogSets property by a name to retrieve the well log sets from the getWellLogSets() function.
 */
type WrappedWellLogProps = Omit<WellLogViewProps, "wellLogSets"> & {
    wellLogSets: string;
};
const WrappedWellLogView = (args: WrappedWellLogProps) => {
    return (
        <div style={{ height: "92vh" }}>
            <WellLogView
                {...args}
                wellLogSets={getWellLogSets(args.wellLogSets)}
            />
        </div>
    );
};

export const Default: StoryObj<typeof WrappedWellLogView> = {
    args: {
        horizontal: false,
        template: viewerTemplate1,
        viewTitle: (
            <div>
                <i>Well</i> <b>{wellLogDefault.header.well}</b>
            </div>
        ),
        colorMapFunctions: exampleColormapFunctions,
        axisTitles,
        axisMnemos,
    },
    // wellLogSets is used to retrieve the well log sets from the getWellLogSets() function
    render: (args) => <WrappedWellLogView {...args} wellLogSets="Default" />,
};

export const Discrete: StoryObj<typeof WrappedWellLogView> = {
    args: {
        horizontal: false,
        template: viewerTemplate2,
        viewTitle: "Well '" + wellLogDiscrete.header.well + "'",
        colorMapFunctions: exampleColormapFunctions,
        axisTitles,
        axisMnemos,
        options: {
            checkDatafileSchema: true,
        },
    },
    // wellLogSets is used to retrieve the well log sets from the getWellLogSets() function
    render: (args) => <WrappedWellLogView {...args} wellLogSets="Discrete" />,
};
