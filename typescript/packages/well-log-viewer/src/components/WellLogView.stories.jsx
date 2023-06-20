import React from "react";
import WellLogView from "./WellLogView";
import { argTypesWellLogViewProp } from "./WellLogView";
import { colorTables } from "@emerson-eps/color-tables";

const ComponentCode =
    '<WellLogView id="WellLogView" \r\n' +
    "    horizontal=false \r\n" +
    '    welllog={require("../../../../demo/example-data/L898MUD.json")[0]} \r\n' +
    '    template={require("../../../../demo/example-data/welllog_template_1.json")} \r\n' +
    "    colorTables={colorTables} \r\n" +
    "/>";

import { axisTitles, axisMnemos } from "../utils/axes";

export default {
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

const Template = (args) => {
    return (
        <div style={{ height: "92vh" }}>
            <div style={{ width: "100%", height: "100%" }}>
                <WellLogView id="WellLogView" {...args} />
            </div>
        </div>
    );
};

const welllogDefault = require("../../../../demo/example-data/L898MUD.json")[0];

export const Default = Template.bind({});
Default.args = {
    id: "Well-Log-View",
    horizontal: false,
    welllog: welllogDefault,
    template: require("../../../../demo/example-data/welllog_template_1.json"),
    viewTitle: (
        <div>
            <i>Well</i> <b>{welllogDefault.header.well}</b>
        </div>
    ),
    colorTables: colorTables,
    axisTitles: axisTitles,
    axisMnemos: axisMnemos,
};

const welllogDiscrete =
    require("../../../../demo/example-data/volve_logs.json")[0];

export const Discrete = Template.bind({});
Discrete.args = {
    id: "Well-Log-View-Discrete",
    horizontal: false,
    welllog: welllogDiscrete,
    template: require("../../../../demo/example-data/welllog_template_2.json"),
    viewTitle: "Well '" + welllogDiscrete.header.well + "'",
    colorTables: colorTables,
    axisTitles: axisTitles,
    axisMnemos: axisMnemos,
    options: {
        checkDatafileSchema: true,
    },
};
