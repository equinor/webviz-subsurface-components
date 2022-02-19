import React from "react";
import SyncLogViewer from "./SyncLogViewer";

export default {
    component: SyncLogViewer,
    title: "WellLogViewer/Demo/ SyncLogViewer",
    argTypes: {
        id: {
            description:
                "The ID of this component, used to identify dash components in callbacks. The ID needs to be unique across all of the components in an app.",
        },
        welllogs: {
            description: "Array of JSON objects describing well log data.",
        },
        templates: {
            description: "Array of track template data.",
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
        syncTrackPos: {
            description: "Synchronize first visible track",
            defaultValue: false,
        },
        syncContentDomain: {
            description: "Synchronize visible content domain",
            defaultValue: false,
        },
        syncContentSelection: {
            description: "Synchronize content selection",
            defaultValue: false,
        },
        syncTemplate: {
            description: "Synchronize templates in the views",
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
                <SyncLogViewer
                    id="SyncLogViewer"
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
    id: "Sync-Log-Viewer",
    syncTrackPos: true,
    syncContentDomain: true,
    syncContentSelection: true,
    syncTemplate: true,
    horizontal: false,

    hideTitles: false,
    hideLegend: false,
    welllogs: [
        require("../../../demo/example-data/L898MUD.json"),
        require("../../../demo/example-data/L916MUD.json"),
    ],
    templates: [
        require("../../../demo/example-data/synclog_template.json"),
        require("../../../demo/example-data/synclog_template.json"),
    ],
    colorTables: require("../../../demo/example-data/color-tables.json"),
};
