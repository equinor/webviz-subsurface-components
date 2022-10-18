import React from "react";
import WellLogViewWithScroller from "./WellLogViewWithScroller";
import { argTypesWellLogViewScrollerProp } from "./WellLogViewWithScroller";

const ComponentCode =
    '<WellLogViewWithScroller id="WellLogViewWithScroller" \r\n' +
    "    horizontal=false \r\n" +
    '    welllog={require("../../../../demo/example-data/L898MUD.json")[0]} \r\n' +
    '    template={require("../../../../demo/example-data/welllog_template_1.json")} \r\n' +
    '    colorTables={require("../../../../demo/example-data/color-tables.json")} \r\n' +
    "/>";

import { axisTitles, axisMnemos } from "../utils/axes";

export default {
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
    argTypes: {
        ...argTypesWellLogViewScrollerProp,
        id: {
            description:
                "The ID of this component, used to identify dash components in callbacks. The ID needs to be unique across all of the components in an app.",
        },
    },
};

const Template = (args) => {
    return (
        <div
            style={{ height: "92vh", display: "flex", flexDirection: "column" }}
        >
            <div style={{ width: "100%", height: "100%" }}>
                <WellLogViewWithScroller
                    id="WellLogViewWithScroller"
                    {...args}
                />
            </div>
        </div>
    );
};

export const Default = Template.bind({});
Default.args = {
    id: "Well-Log-Viewer-With-Scroller",
    horizontal: false,
    welllog: require("../../../../demo/example-data/L898MUD.json")[0],
    template: require("../../../../demo/example-data/welllog_template_1.json"),
    colorTables: require("../../../../demo/example-data/color-tables.json"),
    axisTitles: axisTitles,
    axisMnemos: axisMnemos,
};
