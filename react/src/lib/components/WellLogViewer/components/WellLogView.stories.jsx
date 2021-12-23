import React from "react";
import WellLogView from "./WellLogView";

import { axisTitles, axisMnemos } from "../utils/axes";

export default {
    component: WellLogView,
    title: "WellLogViewer/Components/WellLogView",
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
            description: "Array of JSON objects describing well log data.",
        },
        template: {
            description: "Prop containing track template data.",
        },
        colorTables: {
            description: "Prop containing color table data.",
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
        <div
            style={{ height: "92vh", display: "flex", flexDirection: "column" }}
        >
            <div style={{ width: "100%", height: "100%", flex: 1 }}>
                <WellLogView
                    id="WellLogView"
                    {...args}
                    /*
                        onInfo={this.onInfo}
                        onCreateController={this.onCreateController}
                        onTrackMouseEvent={onTrackMouseEvent}
                        onTrackScroll={this.onTrackScroll}
                        onContentRescale={this.onContentRescale}
                     */
                />
            </div>
        </div>
    );
};

export const Default = Template.bind({});
Default.args = {
    horizontal: false,
    welllog: require("../../../../demo/example-data/L898MUD.json"),
    template: require("../../../../demo/example-data/welllog_template_1.json"),
    colorTables: require("../../../../demo/example-data/color-tables.json"),
};
