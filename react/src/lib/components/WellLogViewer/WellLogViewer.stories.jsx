import React from "react";
import WellLogViewer from "./WellLogViewer";

export default {
    component: WellLogViewer,
    title: "WellLogViewer/Demo",
    argTypes: {
        id: {
            description:
                "The ID of this component, used to identify dash components in callbacks. The ID needs to be unique across all of the components in an app.",
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
        horizontal: {
            description: "Orientation of the track plots on the screen.",
            defaultValue: false,
        },
        readoutOptions: {
            description:
                "Options for readout panel.<br/>" +
                "allTracks: boolean — Show not only visible tracks,<br/>" +
                "grouping: string — How group values.",
            defaultValue: {
                allTracks: false,
                grouping: "by_track",
            },
        },
        domain: {
            description: "Initial visible interval of the log data.",
        },
        selection: {
            description: "Initial selected interval of the log data.",
        },
    },
};

const Template = (args) => {
    const [controller, setController] = React.useState(null);
    const [info, setInfo] = React.useState("");
    const onCreateController = React.useCallback(
        (controller) => {
            setController(controller);
        },
        [controller]
    );
    const onContentRescale = React.useCallback(() => {
        if (!controller) {
            setInfo("-");
            return;
        }
        const baseDomain = controller.getContentBaseDomain();
        const domain = controller.getContentDomain();
        const selection = controller.getContentSelection();
        setInfo(
            "total: [" +
                baseDomain[0].toFixed(0) +
                ", " +
                baseDomain[1].toFixed(0) +
                "], " +
                "visible: [" +
                domain[0].toFixed(0) +
                ", " +
                domain[1].toFixed(0) +
                "]" +
                (selection[0] !== undefined
                    ? ", selected: [" +
                      selection[0].toFixed(0) +
                      (selection[1] !== undefined
                          ? ", " + selection[1].toFixed(0)
                          : "") +
                      "]"
                    : "")
        );
    }, [controller]);

    return (
        <div
            style={{ height: "92vh", display: "flex", flexDirection: "column" }}
        >
            <div style={{ width: "100%", height: "100%", flex: 1 }}>
                <WellLogViewer
                    id="WellLogViewer"
                    {...args}
                    onCreateController={onCreateController}
                    onContentRescale={onContentRescale}
                />
            </div>
            <div style={{ width: "100%", flex: 0 }}>{info}</div>
        </div>
    );
};

export const Example1Vertical = Template.bind({});
Example1Vertical.args = {
    id: "Well-Log-Viewer",
    horizontal: false,
    welllog: require("../../../demo/example-data/L898MUD.json"),
    template: require("../../../demo/example-data/welllog_template_1.json"),
    colorTables: require("../../../demo/example-data/color-tables.json"),
};

export const Example1Template2 = Template.bind({});
Example1Template2.args = {
    id: "Well-Log-Viewer2",
    horizontal: true,
    welllog: require("../../../demo/example-data/L898MUD.json"),
    template: require("../../../demo/example-data/welllog_template_2.json"),
    colorTables: require("../../../demo/example-data/color-tables.json"),
};

export const Example2Vertical = Template.bind({});
Example2Vertical.args = {
    id: "Well-Log-Viewer3",
    horizontal: false,
    welllog: require("../../../demo/example-data/WL_RAW_AAC-BHPR-CAL-DEN-GR-MECH-NEU-NMR-REMP_MWD_3.json"),
    template: require("../../../demo/example-data/welllog_template_1.json"),
    colorTables: require("../../../demo/example-data/color-tables.json"),
};
