/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { ToggleButton } from "@mui/material";
import { colorTables } from "@emerson-eps/color-tables";
import type { ColorMapFunction } from "./components/ColorMapFunction";

import wellpicksJson from "../../../../example-data/wellpicks.json";
import wellpickColorTablesJson from "../../../../example-data/wellpick_colors.json";

const exampleColorMapFunctions = colorTables as ColorMapFunction[];
const wellpickColorMapFunctions = wellpickColorTablesJson as ColorMapFunction[];
// const wellpickColorTable = wellpickColorTableJson as unknown as ColorMapFunction[];
const wellpicks = wellpicksJson as unknown as WellLogSet[];
// const exampleColorTable = colorTables as unknown as ColorMapFunction[];

import horizonPatternsJson from "../../../../example-data/horizon_patterns.json";

import SyncLogViewer, { argTypesSyncLogViewerProp } from "./SyncLogViewer";
import type { SyncLogViewerProps } from "./SyncLogViewer";
import type WellLogView from "./components/WellLogView";

import type {
    WellLogController,
    TrackMouseEvent,
    WellPickProps,
} from "./components/WellLogView";

const ComponentCode =
    "<SyncLogViewer id='SyncLogViewer' \r\n" +
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
    "    colorMapFunctions={colorMapFunctions} \r\n" +
    "/>";

import { axisMnemos, axisTitles } from "./utils/axes";

const stories: Meta = {
    // @ts-expect-error TS2322
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
        colorMapFunctions: {
            description: "Prop containing color function/table data.",
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
                "The view title. Set desired string or react element or true for default value from well log file",
        },
        layout: {
            description:
                "Side panels layout (default is layout with default right panel",
        },
    },
    tags: ["no-screenshot-test"],
};
export default stories;

function fillInfo(controller: WellLogController | undefined): string {
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

const Template = (args: SyncLogViewerProps) => {
    const infoRef = React.useRef<HTMLDivElement | null>(null);
    const setInfo = function (info: string): void {
        if (infoRef.current) infoRef.current.innerHTML = info;
    };

    const [controllers, setControllers] = React.useState<WellLogController[]>(
        []
    ); // all WellLogs

    const onCreateController = React.useCallback(
        (_iWellLog: number, controller: WellLogController): void => {
            setControllers((prev) => [...prev, controller]);
        },
        []
    );
    const onDeleteController = React.useCallback(
        (_iWellLog: number, controller: WellLogController): void => {
            setControllers((prev) => prev.filter((c) => c !== controller));
        },
        []
    );
    const onContentRescale = React.useCallback(
        (iWellLog: number): void => {
            if (iWellLog === 0) setInfo(fillInfo(controllers[0]));
        },
        [controllers]
    );
    const onContentSelection = React.useCallback(
        (/*iWellLog*/): void => {
            /*if(iWellLog===0)*/ setInfo(fillInfo(controllers[0]));
        },
        [controllers]
    );
    const handleClick = function (): void {
        for (const ctrl of controllers) {
            if (ctrl) ctrl.setControllerDefaultZoom();
        }
    };
    const [checked, setChecked] = React.useState(false);
    const handleChange = (): void => {
        setChecked(!checked);
    };
    /* eslint-disable */ // no-unused-vars
    function onTrackMouseEventCustom(
        _wellLogView: WellLogView,
        _ev: TrackMouseEvent
    ): void {
        //custom function to disable the context menu
    }
    /* eslint-enable */ // no-unused-vars

    return (
        <div
            style={{ height: "92vh", display: "flex", flexDirection: "column" }}
        >
            <div style={{ width: "100%", height: "100%", flex: 1 }}>
                <SyncLogViewer
                    id="SyncLogViewer"
                    {...args}
                    onCreateController={onCreateController}
                    onDeleteController={onDeleteController}
                    onContentRescale={onContentRescale}
                    onContentSelection={onContentSelection}
                    onTrackMouseEvent={
                        checked ? onTrackMouseEventCustom : undefined
                    }
                />
            </div>
            {/* Print info for the first WellLog */}
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div ref={infoRef}></div>
                <label style={{ marginLeft: 10 }}>disable context menu</label>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={handleChange}
                    title="Disable context menu"
                />
                <button onClick={handleClick} style={{ marginLeft: 10 }}>
                    Reset
                </button>
            </div>
        </div>
    );
};

/* eslint-disable @typescript-eslint/no-require-imports */
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
/* eslint-enable @typescript-eslint/no-require-imports */

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

const exampleWellPicks: WellPickProps[] = [
    {
        wellpick: wellpicks[0],
        name: "HORIZON",
        colorMapFunctions: wellpickColorMapFunctions,
        colorMapFunctionName: "Stratigraphy",
    },
    {
        wellpick: wellpicks[1],
        name: "HORIZON",
        colorMapFunctions: wellpickColorMapFunctions,
        colorMapFunctionName: "Stratigraphy",
    },
    {
        wellpick: wellpicks[0],
        name: "HORIZON",
        colorMapFunctions: wellpickColorMapFunctions,
        colorMapFunctionName: "Stratigraphy",
    },
];

export const Default: StoryObj<typeof Template> = {
    args: {
        //id: "Sync-Log-Viewer",
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
        colorMapFunctions: exampleColorMapFunctions,
        wellpicks: exampleWellPicks,
        patternsTable: {
            patternSize: 24,
            patternImages: patternImages,
            patternNames: patternNamesEnglish,
        },
        // @ts-expect-error Can't be bothered to fix this
        patterns: horizonPatternsJson,

        wellpickFlatting: ["Hor_2", "Hor_4"],

        spacers: [80, 66],
        wellDistances: {
            units: "m",
            distances: [2048.3, 512.7],
        },

        axisTitles: axisTitles,
        axisMnemos: axisMnemos,

        viewTitles: true, // show default well log view titles (a wellname from the well log)

        welllogOptions: {
            wellpickColorFill: true,
            wellpickPatternFill: true,
            hideCurrentPosition: false,
            hideSelectionInterval: false,
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
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import type { WellLogSet } from "./components/WellLogTypes";

const iconStyle = {
    fontSize: "18px",
    verticalAlign: "middle",
    paddingRight: "4px",
};

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
        // function to create react component
        right: (parent: SyncLogViewer) => (
            <div className="side-panel">
                <div style={{ paddingBottom: "5px" }}>
                    <WellLogScaleSelector
                        label="Scale value:"
                        round={true}
                        callbackManager={parent.callbackManagers[0]}
                    />
                </div>
                {parent.wellLogCollections?.map((wellLog, iWellLog) => (
                    <WellLogInfoPanel
                        key={iWellLog}
                        header={
                            <>
                                <span style={iconStyle}>
                                    <WellInfoIcon fontSize="inherit" />
                                </span>
                                <i>{wellLog[0]?.header.well}</i>
                            </>
                        }
                        readoutOptions={parent.props.readoutOptions}
                        callbackManager={parent.callbackManagers[iWellLog]}
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
                    callbackManager={parent.callbackManagers[0]}
                />
            </div>
        ),

        // react component
        left: (
            <>
                <div
                    style={{
                        textOrientation: "mixed",
                        writingMode: "vertical-rl",
                        fontSize: "10pt",
                        paddingTop: "20px",
                        paddingLeft: "5px",
                    }}
                >
                    Depth
                </div>
                <ArrowDownwardIcon />
            </>
        ),

        // simple text
        header: "Customized layout example",
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

const TemplateWithSelection = (args: SyncLogViewerProps) => {
    const { welllogs = [], ...restOfArgs } = args;

    const [showWell1, setShowWell1] = React.useState(true);
    const [showWell2, setShowWell2] = React.useState(true);
    const [showWell3, setShowWell3] = React.useState(true);

    const [controllers, setControllers] = React.useState<WellLogController[]>(
        []
    ); // all WellLogs

    const onCreateController = React.useCallback(
        (iWellLog: number, controller: WellLogController) => {
            setControllers((prev) => [...prev, controller]);
        },
        []
    );
    const onDeleteController = React.useCallback(
        (iWellLog: number, controller: WellLogController) => {
            setControllers((prev) => prev.filter((c) => c !== controller));
        },
        []
    );

    const filtered: (WellLogSet[] | WellLogSet)[] = [];

    if (showWell1 && welllogs[0]) filtered.push(welllogs[0]);
    if (showWell2 && welllogs[1]) filtered.push(welllogs[1]);
    if (showWell3 && welllogs[2]) filtered.push(welllogs[2]);

    const handleClick = function (): void {
        for (const ctrl of controllers) {
            if (ctrl) ctrl.setControllerDefaultZoom();
        }
    };

    const argsWithSelection: SyncLogViewerProps = {
        ...restOfArgs,
        welllogs: filtered,
    };

    return (
        <div
            style={{ height: "92vh", display: "flex", flexDirection: "column" }}
        >
            <div style={{ flexDirection: "row" }}>
                <ToggleButton
                    value="check"
                    selected={showWell1 && !!welllogs[0]}
                    onChange={(): void => {
                        if (!welllogs[1]) alert("No args.welllogs[0]");
                        setShowWell1(!showWell1);
                    }}
                >
                    Well 1
                </ToggleButton>
                <ToggleButton
                    value="check"
                    selected={showWell2 && !!welllogs[1]}
                    onChange={(): void => {
                        if (!welllogs[1]) alert("No args.welllogs[1]");
                        setShowWell2(!showWell2);
                    }}
                >
                    Well 2
                </ToggleButton>
                <ToggleButton
                    value="check"
                    selected={showWell3 && !!welllogs[2]}
                    onChange={(): void => {
                        if (!welllogs[2]) alert("No args.welllogs[2]");
                        setShowWell3(!showWell3);
                    }}
                >
                    Well 3
                </ToggleButton>
                <button onClick={handleClick} style={{ float: "right" }}>
                    Reset
                </button>
            </div>
            <div style={{ width: "100%", height: "100%", flex: 1 }}>
                <SyncLogViewer
                    id="SyncLogViewer2"
                    {...argsWithSelection}
                    onCreateController={onCreateController}
                    onDeleteController={onDeleteController}
                />
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const args = require("../../../../example-data/facies3wells.json");

export const DiscreteLogs: StoryObj<typeof TemplateWithSelection> = {
    args: args,
    render: (args) => <TemplateWithSelection {...args} />,
};

import syncTemplateJson from "../../../../example-data/synclog_template.json";
import L898MUDJson from "../../../../example-data/L898MUD.json";
import L916MUDJson from "../../../../example-data/L916MUD.json";
import type { Template as TemplateType } from "./components/WellLogTemplateTypes";

const verySimpleTemplate: TemplateType = {
    name: "Something simple",
    scale: syncTemplateJson.scale,
    tracks: [
        {
            title: "MDOA + BAD_CONT",
            plots: [
                {
                    name: "MDOA",
                    type: "line",
                    color: "green",
                },
                {
                    name: "BAD_CONT",
                    color: "blue",
                    type: "area",
                },
            ],
        },

        {
            title: "",
            plots: [
                {
                    name: "FLAG_EXAMPLE",
                    color: "red",
                    type: "stacked",
                },
            ],
        },
    ],
};

export const LogsWithDifferentSets: StoryObj<typeof Template> = {
    render: (args) => <Template {...args} />,
    parameters: {
        docs: {
            story: "An example of two synced well logs, each including a second log with a different sampling rate",
        },
    },
    args: {
        axisTitles: axisTitles,
        axisMnemos: axisMnemos,
        syncContentSelection: true,
        viewTitles: true,
        spacers: [80, 66],
        wellDistances: {
            units: "m",
            distances: [2048.3, 512.7],
        },
        templates: [verySimpleTemplate, verySimpleTemplate],
        wellLogCollections: [
            [
                ...L916MUDJson,
                {
                    header: L916MUDJson[0].header,
                    curves: [
                        {
                            name: "DEPT",
                            description: null,
                            quantity: null,
                            unit: "M",
                            valueType: "float",
                            dimensions: 1,
                        },
                        {
                            name: "DVER",
                            description: "continuous",
                            quantity: "m",
                            unit: "m",
                            valueType: "float",
                            dimensions: 1,
                        },

                        {
                            name: "FLAG_EXAMPLE",
                            description: "discrete with different sampling",
                            quantity: "DISC",
                            unit: "DISC",
                            valueType: "integer",
                            dimensions: 1,
                        },
                    ],
                    data: [
                        [2966, 2254.3, null],
                        [3297, 2533.72, 0],
                        [4123, 3251.07, 1],
                    ],
                    metadata_discrete: {
                        FLAG_EXAMPLE: {
                            attributes: ["color", "code"],
                            objects: {
                                no: [[244, 237, 255, 255], 0],
                                yes: [[255, 171, 178, 255], 1],
                            },
                        },
                    },
                },
            ],
            [
                ...L898MUDJson,
                {
                    header: L898MUDJson[0].header,
                    curves: [
                        {
                            name: "DEPT",
                            description: null,
                            quantity: null,
                            unit: "M",
                            valueType: "float",
                            dimensions: 1,
                        },
                        {
                            name: "DVER",
                            description: "continuous",
                            quantity: "m",
                            unit: "m",
                            valueType: "float",
                            dimensions: 1,
                        },

                        {
                            name: "BAD_CONT",
                            description: "continuous with different sampling",
                            quantity: "m",
                            unit: "m",
                            valueType: "integer",
                            dimensions: 1,
                        },
                    ],
                    data: [
                        [2977, 2263.39, 0.1],
                        [3606, 2792.98, 4],
                        [4129, 3256.31, 2],
                    ],
                },
            ],
        ],
    },
};
