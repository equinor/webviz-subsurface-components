import React from "react";
import WellLogView from "./WellLogView";

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
        id: {
            description:
                "The ID of this component, used to identify dash components in callbacks. The ID needs to be unique across all of the components in an app.",
        },
        horizontal: {
            description: "Orientation of the track plots on the screen.",
            defaultValue: false,
        },
        welllog: {
            description: "JSON object describing well log data.",
        },
        template: {
            description: "Prop containing track template data.",
        },
        colorTables: {
            description: "Prop containing color table data.",
        },
        wellpick: {
            description: "Well Picks data",
        },
        primaryAxis: {
            description: "primaryAxis",
            defaultValue: "md",
        },
        maxVisibleTrackNum: {
            description: "maxVisibleTrackNum",
            defaultValue: 4,
        },
        maxContentZoom: {
            description: "maxContentZoom",
            defaultValue: 256,
        },
        checkDatafileSchema: {
            description: "Validate JSON datafile against schema",
            defaultValue: false,
        },
        hideTitles: {
            description: "Hide Titles on the tracks",
            defaultValue: false,
        },
        hideLegend: {
            description: "Hide Legends on the tracks",
            defaultValue: false,
        },
        axisMnemos: {
            description: "axisMnemos",
            defaultValue: axisMnemos,
        },
        axisTitles: {
            description: "axisTitles",
            defaultValue: axisTitles,
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
    horizontal: false,
    welllog: require("../../../../demo/example-data/L898MUD.json")[0],
    template: require("../../../../demo/example-data/welllog_template_1.json"),
    colorTables: require("../../../../demo/example-data/color-tables.json"),
};

export const Discrete = Template.bind({});
Discrete.args = {
    horizontal: false,
    welllog: require("../../../../demo/example-data/volve_logs.json")[0],
    template: require("../../../../demo/example-data/welllog_template_2.json"),
    colorTables: require("../../../../demo/example-data/color-tables.json"),
};
