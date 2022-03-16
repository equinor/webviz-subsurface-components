import React from "react";
import WellLogViewer from "./WellLogViewer";

const ComponentCode =
    '<WellLogViewer id="WellLogViewer" \r\n' +
    "    horizontal=false \r\n" +
    '    welllog={require("../../../demo/example-data/L898MUD.json")[0]} \r\n' +
    '    template={require("../../../demo/example-data/welllog_template_1.json")} \r\n' +
    '    colorTables={require("../../../demo/example-data/color-tables.json")} \r\n' +
    "/>";

export default {
    component: WellLogViewer,
    title: "WellLogViewer/Demo/WellLogViewer",
    parameters: {
        docs: {
            description: {
                component:
                    "A demo component to deal with WellLogView component.",
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
        hideTitles: {
            description: "Hide titles on the tracks.",
            defaultValue: false,
        },
        hideLegend: {
            description: "Hide legends on the tracks.",
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

function fillInfo(controller) {
    if (!controller) return "-";
    const baseDomain = controller.getContentBaseDomain();
    const domain = controller.getContentDomain();
    const selection = controller.getContentSelection();
    return (
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
}

const Template = (args) => {
    const infoRef = React.useRef();
    const setInfo = function (info) {
        if (infoRef.current) infoRef.current.innerHTML = info;
    };
    const [controller, setController] = React.useState(null);
    const onCreateController = React.useCallback(
        (controller) => {
            setController(controller);
        },
        [controller]
    );
    const onContentRescale = React.useCallback(() => {
        setInfo(fillInfo(controller));
    }, [controller]);
    const onContentSelection = React.useCallback(() => {
        setInfo(fillInfo(controller));
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
                    onContentSelection={onContentSelection}
                />
            </div>
            <div ref={infoRef} style={{ width: "100%", flex: 0 }}></div>
        </div>
    );
};

export const Default = Template.bind({});
Default.args = {
    id: "Well-Log-Viewer",
    horizontal: false,
    hideTitles: false,
    hideLegend: false,
    welllog: require("../../../demo/example-data/L898MUD.json")[0],
    template: require("../../../demo/example-data/welllog_template_1.json"),
    colorTables: require("../../../demo/example-data/color-tables.json"),
};

export const Horizontal = Template.bind({});
Horizontal.args = {
    id: "Well-Log-Viewer-Horizontal",
    horizontal: true,
    welllog:
        require("../../../demo/example-data/WL_RAW_AAC-BHPR-CAL-DEN-GR-MECH-NEU-NMR-REMP_MWD_3.json")[0],
    template: require("../../../demo/example-data/welllog_template_2.json"),
    colorTables: require("../../../demo/example-data/color-tables.json"),
};
Horizontal.parameters = {
    docs: {
        description: {
            story: "An example showing horizontal orientation of the tracks.",
        },
    },
};

export const Discrete = Template.bind({});
Discrete.args = {
    id: "Well-Log-Viewer-Discrete",
    horizontal: false,
    welllog: require("../../../demo/example-data/volve_logs.json")[0],
    template: require("../../../demo/example-data/welllog_template_2.json"),
    colorTables: require("../../../demo/example-data/color-tables.json"),
};
Discrete.parameters = {
    docs: {
        description: {
            story: "An example showing the tracks with discrete logs.",
        },
    },
};
