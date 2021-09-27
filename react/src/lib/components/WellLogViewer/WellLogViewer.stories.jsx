import React from "react";
import WellLogViewer from "./WellLogViewer";

export default {
    component: WellLogViewer,
    title: "WellLogViewer/Demo",
};

const Template = (args) => {
    return (
        <div style={{ height: "80vh", display: "flex" }}>
            <div style={{ width: "100%", flex: 1 }}>
                <WellLogViewer id="WellLogViewer" {...args} />
            </div>
        </div>
    );
};

export const Example1Vertical = Template.bind({});
Example1Vertical.args = {
    horizontal: false,
    welllog: require("../../../demo/example-data/L898MUD.json"),
    template: require("../../../demo/example-data/welllog_template_1.json"),
};

export const Example1Template2 = Template.bind({});
Example1Template2.args = {
    horizontal: true,
    welllog: require("../../../demo/example-data/L898MUD.json"),
    template: require("../../../demo/example-data/welllog_template_2.json"),
};

export const Example2Vertical = Template.bind({});
Example2Vertical.args = {
    horizontal: false,
    welllog: require("../../../demo/example-data/WL_RAW_AAC-BHPR-CAL-DEN-GR-MECH-NEU-NMR-REMP_MWD_3.json"),
    template: require("../../../demo/example-data/welllog_template_1.json"),
};
