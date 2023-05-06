/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import React from "react";
import SyncLogViewer from "./SyncLogViewer";
import { argTypesSyncLogViewerProp } from "./SyncLogViewer";
import { colorTables } from "@emerson-eps/color-tables";

const ComponentCode =
    '<SyncLogViewer id="SyncLogViewer" \r\n' +
    "    syncTrackPos==true \r\n" +
    "    syncContentDomain=true \r\n" +
    "    syncContentSelection=true \r\n" +
    "    syncTemplate=true \r\n" +
    "    horizontal=false \r\n" +
    "    welllog={[ \r\n" +
    '       require("../../../demo/example-data/L898MUD.json")[0], \r\n' +
    '       require("../../../demo/example-data/L916MUD.json")[0], \r\n' +
    "    ]} \r\n" +
    "    template={[ \r\n" +
    '       require("../../../demo/example-data/synclog_template.json"), \r\n' +
    '       require("../../../demo/example-data/synclog_template.json"), \r\n' +
    "    } \r\n" +
    "    colorTables={colorTables} \r\n" +
    "/>";

import { axisTitles, axisMnemos } from "./utils/axes";

export default {
    component: SyncLogViewer,
    title: "WellLogViewer/Demo/SyncLogViewer",
    parameters: {
        docs: {
            description: {
                component: "An example for linked WellLogView components",
            },
        },
        componentSource: {
            code: ComponentCode,
            language: "javascript",
        },
    },
    argTypes: {
        ...argTypesSyncLogViewerProp,
        /*id: {
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
        wellpickFlatting: {
            description: "Horizon names for wellpick flatting",
        },
        spacers: {
            description:
                "Set to true or to array of spaser widths if WellLogSpacers should be used",
        },
        wellDistances: {
            description: "Distanses between wells to show on the spacers",
        },
        */
        horizontal: {
            description: "Orientation of the track plots on the screen.", // defaultValue: false
        },
        syncTrackPos: {
            description: "Synchronize first visible track", // defaultValue: false
        },
        syncContentDomain: {
            description: "Synchronize visible content domain (pan and zoom)", // defaultValue: false
        },
        syncContentSelection: {
            description: "Synchronize content selection", // defaultValue: false
        },
        syncTemplate: {
            description: "Synchronize templates in the views", // defaultValue: false
        },
        welllogOptions: {
            description:
                "Options for well log view:<br/>" +
                "maxContentZoom: The maximum zoom value (default 256)<br/>" +
                "maxVisibleTrackNum: The maximum number of visible tracks<br/>" +
                "checkDatafileSchema: Validate JSON datafile against schema<br/>" +
                "hideTrackTitle: Hide titles on the tracks<br/>" +
                "hideLegend: Hide legends on the tracks.",
        },
        spacerOptions: {
            description: "Options for well log spacer",
        },
        readoutOptions: {
            description:
                "Options for readout panel.<br/>" +
                "allTracks: boolean — Show not only visible tracks,<br/>" +
                "grouping: string — How group values.",
        },
        domain: {
            description: "Initial visible interval of the log data.",
        },
        selection: {
            description: "Initial selected interval of the log data.",
        },
        viewTitles: {
            description:
                "The view title. Set desired string or react element or true for default value from welllog file",
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
    const [controller, setController] = React.useState(null); // the first WellLog
    const onCreateController = React.useCallback(
        (iView, controller) => {
            if (iView === 0) setController(controller);
        },
        [controller]
    );
    const onContentRescale = React.useCallback(
        (iView) => {
            if (iView === 0) setInfo(fillInfo(controller));
        },
        [controller]
    );
    const onContentSelection = React.useCallback(
        (/*_iView*/) => {
            /*if(iView===0)*/ setInfo(fillInfo(controller));
        },
        [controller]
    );

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
            {/* Print info for the first WellLog */}
            <div ref={infoRef} style={{ width: "100%", flex: 0 }}></div>
        </div>
    );
};

const patternImages = [
    require("../../../demo/example-data/patterns/Anhydrite.gif"),
    require("../../../demo/example-data/patterns/Bitumenious.gif"),
    require("../../../demo/example-data/patterns/Browncoal.gif"),
    require("../../../demo/example-data/patterns/Calcareous_dolostone.gif"),
    require("../../../demo/example-data/patterns/Chalk.gif"),
    require("../../../demo/example-data/patterns/Clay.gif"),
    require("../../../demo/example-data/patterns/Coal.gif"),
    require("../../../demo/example-data/patterns/Conglomerate.gif"),
    require("../../../demo/example-data/patterns/Diamond_lines.gif"),
    require("../../../demo/example-data/patterns/Dolomitic_limestone.gif"),
    require("../../../demo/example-data/patterns/Dolostone.gif"),
    require("../../../demo/example-data/patterns/Downward_lines.gif"),
    require("../../../demo/example-data/patterns/Dykes_and_sills.gif"),
    require("../../../demo/example-data/patterns/EmptyFile.gif"),
    require("../../../demo/example-data/patterns/Fissile_mud.gif"),
    require("../../../demo/example-data/patterns/Fissile_silt.gif"),
    require("../../../demo/example-data/patterns/Grid_lines.gif"),
    require("../../../demo/example-data/patterns/Gypsum.gif"),
    require("../../../demo/example-data/patterns/Gypsum_anhydrite_unspecified.gif"),
    require("../../../demo/example-data/patterns/Halite.gif"),
    require("../../../demo/example-data/patterns/Horizontal_dashed.gif"),
    require("../../../demo/example-data/patterns/Horizontal_lines.gif"),
    require("../../../demo/example-data/patterns/Intrusive.gif"),
    require("../../../demo/example-data/patterns/Limestone.gif"),
    require("../../../demo/example-data/patterns/Mafic_plutonic.gif"),
    require("../../../demo/example-data/patterns/Marl.gif"),
    require("../../../demo/example-data/patterns/Metamorphic.gif"),
    require("../../../demo/example-data/patterns/Mud.gif"),
    require("../../../demo/example-data/patterns/Raster.gif"),
    require("../../../demo/example-data/patterns/Salt_general.gif"),
    require("../../../demo/example-data/patterns/Sand.gif"),
    require("../../../demo/example-data/patterns/Sediment_breccia.gif"),
    require("../../../demo/example-data/patterns/Shale.gif"),
    require("../../../demo/example-data/patterns/Silicic_plutonic.gif"),
    require("../../../demo/example-data/patterns/Silt.gif"),
    require("../../../demo/example-data/patterns/Tuffitt.gif"),
    require("../../../demo/example-data/patterns/Upward_lines.gif"),
    require("../../../demo/example-data/patterns/Vertical_bitumenious.gif"),
    require("../../../demo/example-data/patterns/Vertical_calcareous_dolostone.gif"),
    require("../../../demo/example-data/patterns/Vertical_chalk.gif"),
    require("../../../demo/example-data/patterns/Vertical_claystone.gif"),
    require("../../../demo/example-data/patterns/Vertical_dashed.gif"),
    require("../../../demo/example-data/patterns/Vertical_dolomitic_limestone.gif"),
    require("../../../demo/example-data/patterns/Vertical_dolostone.gif"),
    require("../../../demo/example-data/patterns/Vertical_fissile_mudstone.gif"),
    require("../../../demo/example-data/patterns/Vertical_fissile_siltstone.gif"),
    require("../../../demo/example-data/patterns/Vertical_limestone.gif"),
    require("../../../demo/example-data/patterns/Vertical_lines.gif"),
    require("../../../demo/example-data/patterns/Vertical_marl.gif"),
    require("../../../demo/example-data/patterns/Vertical_shale.gif"),
    require("../../../demo/example-data/patterns/Vertical_tuffitt.gif"),
    require("../../../demo/example-data/patterns/Vulcanic.gif"),
];
const patternNamesEnglish = [
    "Anhydrite",
    "Bitumenious",
    "Browncoal",
    "Calcareous Dolostone",
    "Chalk",
    "Clay",
    "Coal",
    "Conglomerate",
    "Diamond_lines",
    "Dolomitic_limestone",
    "Dolostone",
    "Downward Lines",
    "Dykes and Sills",
    "EmptyFile",
    "Fissile Mud",
    "Fissile Silt",
    "Grid Lines",
    "Gypsum",
    "Gypsum Anhydrite Unspecified",
    "Halite",
    "Horizontal Dashed",
    "Horizontal Lines",
    "Intrusive",
    "Limestone",
    "Mafic Plutonic",
    "Marl",
    "Metamorphic",
    "Mud",
    "Raster",
    "Salt General",
    "Sand",
    "Sediment Breccia",
    "Shale",
    "Silicic Plutonic",
    "Silt",
    "Tuffitt",
    "Upward lines",
    "Vertical Bitumenious",
    "Vertical Calcareous Dolostone",
    "Vertical Chalk",
    "Vertical Claystone",
    "Vertical Dashed",
    "Vertical Dolomitic Limestone",
    "Vertical Dolostone",
    "Vertical Fissile Mudstone",
    "Vertical Fissile Siltstone",
    "Vertical Limestone",
    "Vertical Lines",
    "Vertical Marl",
    "Vertical Shale",
    "Vertical Tuffitt",
    "Vulcanic",
];

export const Default = Template.bind({});
Default.args = {
    id: "Sync-Log-Viewer",
    syncTrackPos: true,
    syncContentDomain: true,
    syncContentSelection: true,
    syncTemplate: true,
    horizontal: false,

    welllogs: [
        require("../../../demo/example-data/L898MUD.json")[0],
        require("../../../demo/example-data/L916MUD.json")[0],
        require("../../../demo/example-data/Lis1.json")[0],
    ],
    templates: [
        require("../../../demo/example-data/synclog_template.json"),
        require("../../../demo/example-data/synclog_template.json"),
    ],
    colorTables: colorTables,
    wellpicks: [
        {
            wellpick: require("../../../demo/example-data/wellpicks.json")[0],
            name: "HORIZON",
            colorTables: require("../../../demo/example-data/wellpick_colors.json"),
            color: "Stratigraphy",
        },
        {
            wellpick: require("../../../demo/example-data/wellpicks.json")[1],
            name: "HORIZON",
            colorTables: require("../../../demo/example-data/wellpick_colors.json"),
            color: "Stratigraphy",
        },
        {
            wellpick: require("../../../demo/example-data/wellpicks.json")[0],
            name: "HORIZON",
            colorTables: require("../../../demo/example-data/wellpick_colors.json"),
            color: "Stratigraphy",
        },
    ],
    patternsTable: {
        patternSize: 24,
        patternImages: patternImages,
        names: patternNamesEnglish,
    },
    patterns: require("../../../demo/example-data/horizon_patterns.json"),

    wellpickFlatting: ["Hor_2", "Hor_4"],

    spacers: [312, 255],
    wellDistances: {
        units: "m",
        distances: [2048.3, 512.7],
    },

    axisTitles: axisTitles,
    axisMnemos: axisMnemos,

    viewTitles: true, // show default welllog view titles (a wellname from the welllog)

    welllogOptions: {
        wellpickColorFill: true,
        wellpickPatternFill: true,
    },
    spacerOptions: {
        wellpickColorFill: true,
        wellpickPatternFill: true,
    },
};
