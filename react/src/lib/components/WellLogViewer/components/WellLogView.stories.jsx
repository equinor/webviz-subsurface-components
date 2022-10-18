import React from "react";
import WellLogView from "./WellLogView";
import { argTypesWellLogViewProp } from "./WellLogView";

const ComponentCode =
    '<WellLogView id="WellLogView" \r\n' +
    "    horizontal=false \r\n" +
    '    welllog={require("../../../../demo/example-data/L898MUD.json")[0]} \r\n' +
    '    template={require("../../../../demo/example-data/welllog_template_1.json")} \r\n' +
    '    colorTables={require("../../../../demo/example-data/color-tables.json")} \r\n' +
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

export const Default = Template.bind({});
Default.args = {
    id: "Well-Log-View",
    horizontal: false,
    welllog: require("../../../../demo/example-data/L898MUD.json")[0],
    template: require("../../../../demo/example-data/welllog_template_1.json"),
    colorTables: require("../../../../demo/example-data/color-tables.json"),
    axisTitles: axisTitles,
    axisMnemos: axisMnemos,
};

export const Discrete = Template.bind({});
Discrete.args = {
    id: "Well-Log-View-Discrete",
    horizontal: false,
    welllog: require("../../../../demo/example-data/volve_logs.json")[0],
    template: require("../../../../demo/example-data/welllog_template_2.json"),
    colorTables: require("../../../../demo/example-data/color-tables.json"),
    axisTitles: axisTitles,
    axisMnemos: axisMnemos,
};
