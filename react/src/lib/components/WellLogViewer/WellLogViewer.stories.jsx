import React from "react";
import WellLogViewer from "./WellLogViewer";
import { argTypesWellLogViewerProp } from "./WellLogViewer";
import { colorTables } from "@emerson-eps/color-tables";
//import { ColorTable } from "./components/ColorTableTypes";
const exampleColorTable = colorTables; /*as unknown as ColorTable[]*/ // equivalent types, should be merged

const ComponentCode =
    '<WellLogViewer id="WellLogViewer" \r\n' +
    "    horizontal=false \r\n" +
    '    welllog={require("../../../demo/example-data/L898MUD.json")[0]} \r\n' +
    '    template={require("../../../demo/example-data/welllog_template_1.json")} \r\n' +
    "    colorTables={colorTables} \r\n" +
    "/>";

import { axisTitles, axisMnemos } from "./utils/axes";

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
        ...argTypesWellLogViewerProp,
        id: {
            description:
                "The ID of this component, used to identify dash components in callbacks. The ID needs to be unique across all of the components in an app.",
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

const wellpick = {
    wellpick: require("../../../demo/example-data/wellpicks.json")[0],
    name: "HORIZON",
    colorTables: exampleColorTable,
    color: "Stratigraphy",
};

import { defaultRightPanel } from "./components/DefaultWellLogViewerRightPanel";
import WellLogZoomSlider from "./components/WellLogZoomSlider";
import WellLogInfoPanel from "./components/WellLogInfoPanel";
import WellLogScaleSelector from "./components/WellLogScaleSelector";
//import WellLogAxesPanel from "./components/WellLogAxesPanel";

export const Default = Template.bind({});
Default.args = {
    id: "Well-Log-Viewer",
    horizontal: false,
    welllog: require("../../../demo/example-data/L898MUD.json")[0],
    template: require("../../../demo/example-data/welllog_template_1.json"),
    colorTables: exampleColorTable,
    wellpick: wellpick,
    axisTitles: axisTitles,
    axisMnemos: axisMnemos,
    viewTitle: true, // show default welllog view title (a wellname from the welllog)
    options: {
        hideTrackTitle: false,
        hideTrackLegend: false,
    },
    readoutOptions: {
        allTracks: false,
        grouping: "by_track",
    },
};

export const Horizontal = Template.bind({});
Horizontal.args = {
    id: "Well-Log-Viewer-Horizontal",
    horizontal: true,
    welllog:
        require("../../../demo/example-data/WL_RAW_AAC-BHPR-CAL-DEN-GR-MECH-NEU-NMR-REMP_MWD_3.json")[0],
    template: require("../../../demo/example-data/welllog_template_2.json"),
    colorTables: exampleColorTable,
    wellpick: wellpick,
    axisTitles: axisTitles,
    axisMnemos: axisMnemos,
    viewTitle: true, // show default welllog view title (a wellname from the welllog)

    layout: {
        left: defaultRightPanel,
    },
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
    colorTables: exampleColorTable,
    wellpick: wellpick,
    axisTitles: axisTitles,
    axisMnemos: axisMnemos,
    viewTitle: true, // show default welllog view title (a wellname from the welllog)

    layout: {
        header: (parent) => (
            <div style={{ paddingBottom: "5px" }}>
                <WellLogScaleSelector
                    label="Scale value:"
                    callbacksManager={parent.callbacksManager}
                />
            </div>
        ),
        right: (parent) => (
            <div style={{ width: "255px" }}>
                <WellLogInfoPanel
                    header="Readout"
                    callbacksManager={parent.callbacksManager}
                    readoutOptions={parent.props.readoutOptions}
                />
            </div>
        ),
        bottom: (parent) => (
            <WellLogZoomSlider
                label="Zoom:"
                callbacksManager={parent.callbacksManager}
                max={parent.props.options?.maxContentZoom}
            />
        ),
    },
};
Discrete.parameters = {
    docs: {
        description: {
            story: "An example showing the tracks with discrete logs.",
        },
    },
};
