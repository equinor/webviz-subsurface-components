import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import WellLogView from "./WellLogView";
import type { WellLogSet } from "./WellLogTypes";
import type { WellLogViewProps } from "./WellLogView";
import { argTypesWellLogViewProp } from "./WellLogView";
import { colorTables } from "@emerson-eps/color-tables";
import type { ColorMapFunction } from "./ColorMapFunction";
const exampleColorMapFunctions = colorTables as ColorMapFunction[];

import L898MUD from "../../../../../example-data/L898MUD.json";
import volve_logs from "../../../../../example-data/volve_logs.json";
const wellLogDefault = L898MUD[0];
const wellLogDiscrete = volve_logs[0] as unknown as WellLogSet;
// import type { WellLog } from "./WellLogTypes";

const ComponentCode =
    '<WellLogView id="WellLogView" \r\n' +
    "    horizontal=false \r\n" +
    '    welllog={require("../../../../../example-data/L898MUD.json")[0]} \r\n' +
    '    template={require("../../../../../example-data/welllog_template_1.json")} \r\n' +
    "    colorMapFunctions={exampleColorMapFunctions} \r\n" +
    "/>";

import { axisTitles, axisMnemos } from "../utils/axes";

const stories: Meta = {
    // @ts-expect-error TS2322
    component: WellLogView,
    title: "WellLogViewer/Components/WellLogView",
    parameters: {
        docs: {
            description: {
                component:
                    "WellLogView is a basic react component to wrap [videx-wellog](https://github.com/equinor/videx-wellog) library for drawing well log data",
            },
        },
        componentSource: {
            code: ComponentCode,
            language: "javascript",
        },
    },
    argTypes: {
        ...argTypesWellLogViewProp,
        id: {
            description:
                "The ID of this component, used to identify dash components in callbacks. The ID needs to be unique across all of the components in an app.",
        },
    },
};
export default stories;

const Template = (args: WellLogViewProps) => {
    return (
        <div style={{ height: "92vh" }}>
            <div style={{ width: "100%", height: "100%" }}>
                <WellLogView id="WellLogView" {...args} />
            </div>
        </div>
    );
};

export const Default: StoryObj<typeof Template> = {
    args: {
        //id: "Well-Log-View",
        horizontal: false,
        welllog: wellLogDefault,
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        template: require("../../../../../example-data/welllog_template_1.json"),
        viewTitle: (
            <div>
                <i>Well</i> <b>{wellLogDefault.header.well}</b>
            </div>
        ),
        colorMapFunctions: exampleColorMapFunctions,
        axisTitles: axisTitles,
        axisMnemos: axisMnemos,
    },
    render: (args) => <Template {...args} />,
};

export const Discrete: StoryObj<typeof Template> = {
    args: {
        //id: "Well-Log-View-Discrete",
        horizontal: false,
        welllog: wellLogDiscrete as WellLogSet,
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        template: require("../../../../../example-data/welllog_template_2.json"),
        viewTitle: "Well '" + wellLogDiscrete.header.well + "'",
        colorMapFunctions: exampleColorMapFunctions,
        axisTitles: axisTitles,
        axisMnemos: axisMnemos,
        options: {
            checkDatafileSchema: true,
        },
    },
    render: (args) => <Template {...args} />,
};
