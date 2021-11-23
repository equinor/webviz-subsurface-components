import React from "react";
import WellLogViewer from "./WellLogViewer";

export default {
    component: WellLogViewer,
    title: "WellLogViewer/Demo",
};

const Template = (args) => {
    const [controller, setController] = React.useState(null);
    const [info, setInfo] = React.useState("");
    const onCreateController = React.useCallback(
        (controller) => {
            console.log("onCreateController");
            setController(controller);
        },
        [controller]
    );
    const onRescaleContent = React.useCallback(() => {
        console.log("onRescaleContent");

        setInfo(
            controller
                ? "[" +
                      controller.getContentDomain()[0].toFixed(0) +
                      ", " +
                      controller.getContentDomain()[1].toFixed(0) +
                      "]"
                : "-"
        );
    }, [controller]);
    console.log("Template.render()");
    return (
        <div
            style={{ height: "92vh", display: "flex", flexDirection: "column" }}
        >
            <div style={{ width: "100%", height: "100%", flex: 1 }}>
                <WellLogViewer
                    id="WellLogViewer"
                    {...args}
                    onCreateController={onCreateController}
                    onRescaleContent={onRescaleContent}
                />
            </div>
            <div>{"Current: " + info}</div>
        </div>
    );
};

export const Example1Vertical = Template.bind({});
Example1Vertical.args = {
    horizontal: false,
    welllog: require("../../../demo/example-data/L898MUD.json"),
    template: require("../../../demo/example-data/welllog_template_1.json"),
    colorTables: require("../../../demo/example-data/color-tables.json"),
};

export const Example1Template2 = Template.bind({});
Example1Template2.args = {
    horizontal: true,
    welllog: require("../../../demo/example-data/L898MUD.json"),
    template: require("../../../demo/example-data/welllog_template_2.json"),
    colorTables: require("../../../demo/example-data/color-tables.json"),
};

export const Example2Vertical = Template.bind({});
Example2Vertical.args = {
    horizontal: false,
    welllog: require("../../../demo/example-data/WL_RAW_AAC-BHPR-CAL-DEN-GR-MECH-NEU-NMR-REMP_MWD_3.json"),
    template: require("../../../demo/example-data/welllog_template_1.json"),
    colorTables: require("../../../demo/example-data/color-tables.json"),
};
