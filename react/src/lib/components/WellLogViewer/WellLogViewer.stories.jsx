import React from "react";
import WellLogViewer from "./WellLogViewer";

export default {
    component: WellLogViewer,
    title: "WellLogViewer/Demo",
};

const Template = (args) => {
    return (
        <WellLogViewer
            id={args.id}
            welllog={args.welllog}
            template={args.template}
        />
    );
};

export const Example1 = Template.bind({});
Example1.args = {
    id: "WellLogViewer",
    welllog: require("../../../demo/example-data/L898MUD.json"),
    template: require("../../../demo/example-data/welllog_template_1.json"),
};

export const Example1Template2 = Template.bind({});
Example1Template2.args = {
    id: "WellLogViewer",
    welllog: require("../../../demo/example-data/L898MUD.json"),
    template: require("../../../demo/example-data/welllog_template_2.json"),
};

export const Example2 = Template.bind({});
Example2.args = {
    id: "WellLogViewer",
    welllog: require("../../../demo/example-data/WL_RAW_AAC-BHPR-CAL-DEN-GR-MECH-NEU-NMR-REMP_MWD_3.json"),
    template: require("../../../demo/example-data/welllog_template_1.json"),
};
