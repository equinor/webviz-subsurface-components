import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { ToggleButton } from "@mui/material";

import { colorTables } from "@emerson-eps/color-tables";

import {
    patternImages,
    patternNamesEnglish,
} from "./Storybook/helpers/patternImages";
import type { SyncLogViewerProps } from "./SyncLogViewer";
import SyncLogViewer, { argTypesSyncLogViewerProp } from "./SyncLogViewer";

import type { ColormapFunction } from "./utils/color-function";
import type { Pattern } from "./utils/pattern";

import type {
    TrackMouseEvent,
    WellLogController,
    WellPickProps,
} from "./components/WellLogView";

import type { Template as TemplateType } from "./components/WellLogTemplateTypes";
import type { WellLogSet } from "./components/WellLogTypes";
import type WellLogView from "./components/WellLogView";
import { axisMnemos, axisTitles } from "./utils/axes";

// Example data and templates
import L898MUDJson from "../../../../example-data/L898MUD.json";
import L916MUDJson from "../../../../example-data/L916MUD.json";
import List1Json from "../../../../example-data/Lis1.json";
import facies3WellsJson from "../../../../example-data/facies3wells.json";
import horizonPatternsJson from "../../../../example-data/horizon_patterns.json";
import syncTemplateJson from "../../../../example-data/synclog_template.json";
import wellpickColorTablesJson from "../../../../example-data/wellpick_colors.json";
import wellpicksJson from "../../../../example-data/wellpicks.json";

const exampleColormapFunctions = colorTables as ColormapFunction[];
const wellpickColormapFunctions = wellpickColorTablesJson as ColormapFunction[];
const horizonPatterns = horizonPatternsJson as Pattern[];

const syncTemplate = syncTemplateJson as TemplateType;

const wellpicks = wellpicksJson as WellLogSet[];
const L898MUD = L898MUDJson as WellLogSet[];
const L916MUD = L916MUDJson as WellLogSet[];
const List1 = List1Json as WellLogSet[];
const facies3Wells = facies3WellsJson as unknown as SyncLogViewerProps;

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

const stories: Meta = {
    component: SyncLogViewer,
    title: "WellLogViewer/Demo/SyncLogViewer",
    argTypes: argTypesSyncLogViewerProp,
    tags: ["no-dom-test"],
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
        // Custom function to disable the context menu
        // No-op on purpose
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

const exampleWellPicks: WellPickProps[] = [
    {
        wellpick: wellpicks[0],
        name: "HORIZON",
        colorMapFunctions: wellpickColormapFunctions,
        colorMapFunctionName: "Stratigraphy",
    },
    {
        wellpick: wellpicks[1],
        name: "HORIZON",
        colorMapFunctions: wellpickColormapFunctions,
        colorMapFunctionName: "Stratigraphy",
    },
    {
        wellpick: wellpicks[0],
        name: "HORIZON",
        colorMapFunctions: wellpickColormapFunctions,
        colorMapFunctionName: "Stratigraphy",
    },
];

export const Default: StoryObj<typeof Template> = {
    args: {
        syncTrackPos: true,
        syncContentDomain: true,
        syncContentSelection: true,
        syncTemplate: true,
        horizontal: false,

        welllogs: [L898MUD[0], L916MUD[0], List1[0]],
        templates: [syncTemplate, syncTemplate],
        colorMapFunctions: exampleColormapFunctions,
        wellpicks: exampleWellPicks,
        patternsTable: {
            patternSize: 24,
            patternImages: patternImages,
            patternNames: patternNamesEnglish,
        },
        patterns: horizonPatterns,

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
        (_iWellLog: number, controller: WellLogController) => {
            setControllers((prev) => [...prev, controller]);
        },
        []
    );
    const onDeleteController = React.useCallback(
        (_iWellLog: number, controller: WellLogController) => {
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
                    {...argsWithSelection}
                    onCreateController={onCreateController}
                    onDeleteController={onDeleteController}
                />
            </div>
        </div>
    );
};

export const DiscreteLogs: StoryObj<typeof TemplateWithSelection> = {
    args: facies3Wells,
    render: (args) => <TemplateWithSelection {...args} />,
};

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
            description: {
                story: "An example of two synced well logs, each including a second log with a different sampling rate",
            },
        },
    },
    args: {
        axisTitles: {
            md: "MD",
            tvd: "TVD",
            time: "TIME",
        },
        axisMnemos: axisMnemos,
        syncContentSelection: true,
        viewTitles: true,
        spacers: [80, 66],
        wellDistances: {
            units: "m",
            distances: [2048.3, 512.7],
        },
        colorMapFunctions: exampleColormapFunctions,
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
