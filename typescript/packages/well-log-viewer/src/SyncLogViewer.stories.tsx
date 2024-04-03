/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { colorTables } from "@emerson-eps/color-tables";
//import { ColorTable } from "./components/ColorTableTypes";
const exampleColorTable = colorTables; /*as unknown as ColorTable[]*/ // equivalent types, should be merged
const wellpickColorTable = require("../../../../example-data/wellpick_colors.json"); // eslint-disable-line
import { ToggleButton } from "@mui/material";

import SyncLogViewer, { argTypesSyncLogViewerProp } from "./SyncLogViewer";

const ComponentCode =
    '<SyncLogViewer id="SyncLogViewer" \r\n' +
    "    syncTrackPos==true \r\n" +
    "    syncContentDomain=true \r\n" +
    "    syncContentSelection=true \r\n" +
    "    syncTemplate=true \r\n" +
    "    horizontal=false \r\n" +
    "    welllog={[ \r\n" +
    '       require("../../../../example-data/L898MUD.json")[0], \r\n' +
    '       require("../../../../example-data/L916MUD.json")[0], \r\n' +
    "    ]} \r\n" +
    "    template={[ \r\n" +
    '       require("../../../../example-data/synclog_template.json"), \r\n' +
    '       require("../../../../example-data/synclog_template.json"), \r\n' +
    "    } \r\n" +
    "    colorTables={colorTables} \r\n" +
    "/>";

import type { WellLog } from "./components/WellLogTypes";
import { axisMnemos, axisTitles } from "./utils/axes";

const stories: Meta = {
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
                "Set to true or to spacers width or to array of spacer widths if WellLogSpacers should be used",
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
    tags: ["no-screenshot-test"],
};
export default stories;

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
        (iWellLog, controller) => {
            if (iWellLog === 0) setController(controller);
        },
        [controller]
    );
    const onContentRescale = React.useCallback(
        (iWellLog) => {
            if (iWellLog === 0) setInfo(fillInfo(controller));
        },
        [controller]
    );
    const onContentSelection = React.useCallback(
        (/*iWellLog*/) => {
            /*if(iWellLog===0)*/ setInfo(fillInfo(controller));
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
    require("../../../../example-data/patterns/Anhydrite.gif"),
    require("../../../../example-data/patterns/Bitumenious.gif"),
    require("../../../../example-data/patterns/Browncoal.gif"),
    require("../../../../example-data/patterns/Calcareous_dolostone.gif"),
    require("../../../../example-data/patterns/Chalk.gif"),
    require("../../../../example-data/patterns/Clay.gif"),
    require("../../../../example-data/patterns/Coal.gif"),
    require("../../../../example-data/patterns/Conglomerate.gif"),
    require("../../../../example-data/patterns/Diamond_lines.gif"),
    require("../../../../example-data/patterns/Dolomitic_limestone.gif"),
    require("../../../../example-data/patterns/Dolostone.gif"),
    require("../../../../example-data/patterns/Downward_lines.gif"),
    require("../../../../example-data/patterns/Dykes_and_sills.gif"),
    require("../../../../example-data/patterns/EmptyFile.gif"),
    require("../../../../example-data/patterns/Fissile_mud.gif"),
    require("../../../../example-data/patterns/Fissile_silt.gif"),
    require("../../../../example-data/patterns/Grid_lines.gif"),
    require("../../../../example-data/patterns/Gypsum.gif"),
    require("../../../../example-data/patterns/Gypsum_anhydrite_unspecified.gif"),
    require("../../../../example-data/patterns/Halite.gif"),
    require("../../../../example-data/patterns/Horizontal_dashed.gif"),
    require("../../../../example-data/patterns/Horizontal_lines.gif"),
    require("../../../../example-data/patterns/Intrusive.gif"),
    require("../../../../example-data/patterns/Limestone.gif"),
    require("../../../../example-data/patterns/Mafic_plutonic.gif"),
    require("../../../../example-data/patterns/Marl.gif"),
    require("../../../../example-data/patterns/Metamorphic.gif"),
    require("../../../../example-data/patterns/Mud.gif"),
    require("../../../../example-data/patterns/Raster.gif"),
    require("../../../../example-data/patterns/Salt_general.gif"),
    require("../../../../example-data/patterns/Sand.gif"),
    require("../../../../example-data/patterns/Sediment_breccia.gif"),
    require("../../../../example-data/patterns/Shale.gif"),
    require("../../../../example-data/patterns/Silicic_plutonic.gif"),
    require("../../../../example-data/patterns/Silt.gif"),
    require("../../../../example-data/patterns/Tuffitt.gif"),
    require("../../../../example-data/patterns/Upward_lines.gif"),
    require("../../../../example-data/patterns/Vertical_bitumenious.gif"),
    require("../../../../example-data/patterns/Vertical_calcareous_dolostone.gif"),
    require("../../../../example-data/patterns/Vertical_chalk.gif"),
    require("../../../../example-data/patterns/Vertical_claystone.gif"),
    require("../../../../example-data/patterns/Vertical_dashed.gif"),
    require("../../../../example-data/patterns/Vertical_dolomitic_limestone.gif"),
    require("../../../../example-data/patterns/Vertical_dolostone.gif"),
    require("../../../../example-data/patterns/Vertical_fissile_mudstone.gif"),
    require("../../../../example-data/patterns/Vertical_fissile_siltstone.gif"),
    require("../../../../example-data/patterns/Vertical_limestone.gif"),
    require("../../../../example-data/patterns/Vertical_lines.gif"),
    require("../../../../example-data/patterns/Vertical_marl.gif"),
    require("../../../../example-data/patterns/Vertical_shale.gif"),
    require("../../../../example-data/patterns/Vertical_tuffitt.gif"),
    require("../../../../example-data/patterns/Vulcanic.gif"),
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

export const Default: StoryObj<typeof Template> = {
    args: {
        id: "Sync-Log-Viewer",
        syncTrackPos: true,
        syncContentDomain: true,
        syncContentSelection: true,
        syncTemplate: true,
        horizontal: false,

        welllogs: [
            require("../../../../example-data/L898MUD.json")[0], // eslint-disable-line
            require("../../../../example-data/L916MUD.json")[0], // eslint-disable-line
            require("../../../../example-data/Lis1.json")[0], // eslint-disable-line
        ],
        templates: [
            require("../../../../example-data/synclog_template.json"), // eslint-disable-line
            require("../../../../example-data/synclog_template.json"), // eslint-disable-line
        ],
        colorTables: colorTables,
        wellpicks: [
            {
                wellpick: require("../../../../example-data/wellpicks.json")[0], // eslint-disable-line
                name: "HORIZON",
                colorTables: require("../../../../example-data/wellpick_colors.json"), // eslint-disable-line
                color: "Stratigraphy",
            },
            {
                wellpick: require("../../../../example-data/wellpicks.json")[1], // eslint-disable-line
                name: "HORIZON",
                colorTables: require("../../../../example-data/wellpick_colors.json"), // eslint-disable-line
                color: "Stratigraphy",
            },
            {
                wellpick: require("../../../../example-data/wellpicks.json")[0], // eslint-disable-line
                name: "HORIZON",
                colorTables: require("../../../../example-data/wellpick_colors.json"), // eslint-disable-line
                color: "Stratigraphy",
            },
        ],
        patternsTable: {
            patternSize: 24,
            patternImages: patternImages,
            names: patternNamesEnglish,
        },
        patterns: require("../../../../example-data/horizon_patterns.json"), // eslint-disable-line

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
    },
    render: (args) => <Template {...args} />,
};

import WellLogInfoPanel from "./components/WellLogInfoPanel";
import WellLogZoomSlider from "./components/WellLogZoomSlider";
import WellLogScaleSelector from "./components/WellLogScaleSelector";
import WellInfoIcon from "@mui/icons-material/FormatListBulleted"; // WaterDrop ShowChart, SearchSharp

export const CustomLayout = Template.bind({});
CustomLayout.args = {
    ...Default.args,
    wellpicks: undefined,
    syncContentDomain: false,
    id: "Well-Log-Viewer-Discrete",
    readoutOptions: {
        grouping: "by_track",
    },
    layout: {
        right: (parent: SyncLogViewer) => (
            <div className="side-panel">
                <div style={{ paddingBottom: "5px" }}>
                    <WellLogScaleSelector
                        label="Scale value:"
                        callbacksManager={parent.callbacksManagers[0]}
                    />
                </div>
                {parent.props.welllogs?.map((welllog, iWellLog) => (
                    <WellLogInfoPanel
                        key={iWellLog}
                        header={
                            <>
                                <span
                                    style={{
                                        fontSize: "18px",
                                        verticalAlign: "middle",
                                        paddingRight: "4px",
                                    }}
                                >
                                    <WellInfoIcon fontSize="inherit" />
                                </span>
                                <i>{welllog.header.well}</i>
                            </>
                        }
                        readoutOptions={parent.props.readoutOptions}
                        callbacksManager={parent.callbacksManagers[iWellLog]}
                    />
                ))}
            </div>
        ),
        bottom: (parent: SyncLogViewer) => (
            <div
                className="side-panel"
                style={{ minWidth: "100%", maxWidth: "100%" }}
            >
                <WellLogZoomSlider
                    label="Zoom:"
                    max={parent.props.welllogOptions?.maxContentZoom}
                    callbacksManager={parent.callbacksManagers[0]}
                />
            </div>
        ),
    },
};
CustomLayout.parameters = {
    docs: {
        description: {
            story: "An example custom component layout.",
        },
    },
};

Default.tags = ["no-screenshot-test"];

const TemplateWithSelection = (args) => {
    const [showWell1, setShowWell1] = React.useState(true);
    const [showWell2, setShowWell2] = React.useState(true);
    const [showWell3, setShowWell3] = React.useState(true);

    const filtered: WellLog[] = [];
    if (showWell1) {
        filtered.push(args.welllogs[0]);
    }
    if (showWell2) {
        filtered.push(args.welllogs[1]);
    }
    if (showWell3) {
        filtered.push(args.welllogs[2]);
    }

    const argsWithSelection = {
        ...args,
        welllogs: filtered,
    };

    return (
        <div
            style={{ height: "92vh", display: "flex", flexDirection: "column" }}
        >
            <div style={{ flexDirection: "row" }}>
                <ToggleButton
                    value="check"
                    selected={showWell1}
                    onChange={() => {
                        setShowWell1(!showWell1);
                    }}
                >
                    Well 1
                </ToggleButton>
                <ToggleButton
                    value="check"
                    selected={showWell2}
                    onChange={() => {
                        setShowWell2(!showWell2);
                    }}
                >
                    Well 2
                </ToggleButton>
                <ToggleButton
                    value="check"
                    selected={showWell3}
                    onChange={() => {
                        setShowWell3(!showWell3);
                    }}
                >
                    Well 3
                </ToggleButton>
            </div>
            <div style={{ width: "100%", height: "100%", flex: 1 }}>
                <SyncLogViewer id="SyncLogViewer" {...argsWithSelection} />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const args = require("../../../../example-data/facies3wells.json");

export const DiscreteLogs: StoryObj<typeof TemplateWithSelection> = {
    args: args,
    render: (args) => <TemplateWithSelection {...args} />,
};
