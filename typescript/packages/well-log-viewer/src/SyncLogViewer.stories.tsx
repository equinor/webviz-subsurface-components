import React from "react";

import type { Meta, StoryObj } from "@storybook/react-webpack5";

import { ToggleButton } from "@mui/material";

import { colorTables } from "@emerson-eps/color-tables";

import {
    patternImages,
    patternNamesEnglish,
} from "./Storybook/helpers/patternImages";
import SyncLogViewer, { argTypesSyncLogViewerProp } from "./SyncLogViewer";
import type { SyncLogViewerProps } from "./SyncLogViewer";

import type { ColormapFunction } from "./utils/color-function";
import type { Pattern } from "./utils/pattern";
import type { Range } from "./utils/arrayTypes";

import type {
    WellLogController,
    TrackMouseEvent,
    WellPickProps,
} from "./components/WellLogView";

import { axisMnemos, axisTitles } from "./utils/axes";
import type WellLogView from "./components/WellLogView";
import type { Template as TemplateType } from "./components/WellLogTemplateTypes";
import type { WellLogSet } from "./components/WellLogTypes";

// Example data and templates
import horizonPatternsJson from "../../../../example-data/horizon_patterns.json";
import wellpicksJson from "../../../../example-data/wellpicks.json";
import wellpickColorTablesJson from "../../../../example-data/wellpick_colors.json";
import syncTemplateJson from "../../../../example-data/synclog_template.json";
import L898MUDJson from "../../../../example-data/L898MUD.json";
import L916MUDJson from "../../../../example-data/L916MUD.json";
import List1Json from "../../../../example-data/Lis1.json";
import facies3WellsJson from "../../../../example-data/facies3wells.json";

const exampleColormapFunctions = colorTables as ColormapFunction[];
const wellpickColormapFunctions = wellpickColorTablesJson as ColormapFunction[];
const horizonPatterns = horizonPatternsJson as Pattern[];

const syncTemplate = syncTemplateJson as TemplateType;

const wellpicks = wellpicksJson as WellLogSet[];
const L898MUD = L898MUDJson as WellLogSet[];
const L916MUD = L916MUDJson as WellLogSet[];
const List1 = List1Json as WellLogSet[];
const facies3Wells = facies3WellsJson as unknown as SyncLogViewerProps;
const {
    welllogs: facies3WellsLogs,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    wellLogCollections: discarded,
    ...facies3WellsArgs
} = facies3Wells;
const facies3WellsCollections: WellLogSet[][] = (
    facies3WellsLogs as WellLogSet[]
).map((wellLog) => [wellLog as WellLogSet]);

const facies3WellsCollectionsWithUndefined: WellLogSet[][] | undefined = [
    // [undefined] is not correclty supported in first place :/
    facies3WellsCollections[1],
    [undefined] as unknown as WellLogSet[],
    facies3WellsCollections[2],
];

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
    tags: ["no-screenshot-test"],
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

/**
 * Storybook 9 is very slow to parse huge JSON args.
 * Thus the approach to use a string name to select the well log collections to be used in the story.
 * The function getWellLogCollections() returns the well log collections based on the name.
 * The storybook args.wellLogCollections is a string name, which is used to get the well log collections.
 *
 * Note: it does not really make sense to pack some huge data structure into a storybook argument; user will never be able to
 * read/edit it.
 */
function getWellLogCollections(
    name: string | undefined
): WellLogSet[][] | undefined {
    if (name === undefined) {
        return undefined;
    }
    switch (name) {
        case "Default":
            return defaultLogCollections;
        case "DiscreteLogs":
        case "DiscreteLogsWithIndividualDomains":
            return facies3WellsCollections;
        case "DiscreteLogsWithUndefined":
            return facies3WellsCollectionsWithUndefined;
        case "LogsWithDifferentSets":
            return logsWithDifferentSetsCollections;
        case "Empty":
            return [[]];
    }
    return [];
}

type SyncLogViewerPropsWrapper = Omit<
    SyncLogViewerProps,
    "wellLogCollections"
> & {
    wellLogCollections?: string;
};

const Template = (args: SyncLogViewerPropsWrapper) => {
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
                    wellLogCollections={getWellLogCollections(
                        args.wellLogCollections
                    )}
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

const defaultLogCollections: WellLogSet[][] = [
    [L898MUD[0], L916MUD[0], List1[0]],
];

export const Default: StoryObj<typeof Template> = {
    args: {
        syncTrackPos: true,
        syncContentDomain: true,
        syncContentSelection: true,
        syncTemplate: true,
        horizontal: false,

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

        axisTitles,
        axisMnemos,

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
    // wellLogCollections is used to retrieve the well log sets from the getWellLogCollections() function
    render: (args) => <Template {...args} wellLogCollections="Default" />,
    tags: ["no-screenshot-test"],
};

export const Empty: StoryObj<typeof Template> = {
    args: {
        axisTitles,
        axisMnemos,

        viewTitles: true, // show default well log view titles (a wellname from the well log)
    },
    // wellLogCollections is used to retrieve the well log sets from the getWellLogCollections() function
    render: (args) => <Template {...args} wellLogCollections="Empty" />,
    tags: ["no-screenshot-test"],
};

type TemplateWithSelectionProps = Omit<
    SyncLogViewerProps,
    "wellLogCollections"
> & {
    wellLogCollections: string;
};

const TemplateWithSelection = (args: TemplateWithSelectionProps) => {
    const { wellLogCollections: collectionName = "", ...restOfArgs } = args;
    const allCollections: WellLogSet[][] = React.useMemo(
        () => getWellLogCollections(collectionName) ?? [],
        [collectionName]
    );

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

    const { wellLogCollections, domain, visibleRange } = React.useMemo(() => {
        const collections: WellLogSet[][] = [];
        const domain: Range | Range[] = [];
        const visibleRange: Range | Range[] = [];
        const isIndividualDomain = Array.isArray(args.domain?.[0]);
        const isIndividualRange = Array.isArray(args.visibleRange?.[0]);
        if (showWell1 && allCollections[0]) {
            collections.push(allCollections[0]);
            if (isIndividualDomain) {
                domain.push(args.domain?.[0] as Range);
            }
            if (isIndividualRange) {
                visibleRange.push(args.visibleRange?.[0] as Range);
            }
        }
        if (showWell2 && allCollections[1]) {
            collections.push(allCollections[1]);
            if (isIndividualDomain) {
                domain.push(args.domain?.[1] as Range);
            }
            if (isIndividualRange) {
                visibleRange.push(args.visibleRange?.[1] as Range);
            }
        }
        if (showWell3 && allCollections[2]) {
            collections.push(allCollections[2]);
            if (isIndividualDomain) {
                domain.push(args.domain?.[2] as Range);
            }
            if (isIndividualRange) {
                visibleRange.push(args.visibleRange?.[2] as Range);
            }
        }
        return {
            wellLogCollections: collections,
            visibleRange: isIndividualRange ? visibleRange : args.visibleRange,
            domain: isIndividualDomain ? domain : args.domain,
        };
    }, [
        args.visibleRange,
        args.domain,
        showWell1,
        allCollections,
        showWell2,
        showWell3,
    ]);

    const handleClick = function (): void {
        for (const ctrl of controllers) {
            if (ctrl) ctrl.setControllerDefaultZoom();
        }
    };

    const argsWithSelection: SyncLogViewerProps = {
        ...restOfArgs,
        domain,
        visibleRange,
        wellLogCollections,
    };

    return (
        <div
            style={{ height: "92vh", display: "flex", flexDirection: "column" }}
        >
            <div style={{ flexDirection: "row" }}>
                <ToggleButton
                    value="check"
                    selected={showWell1 && !!allCollections[0]}
                    onChange={(): void => {
                        if (!allCollections[0])
                            alert("No args.wellLogCollections[0]");
                        setShowWell1(!showWell1);
                    }}
                >
                    Well 1
                </ToggleButton>
                <ToggleButton
                    value="check"
                    selected={showWell2 && !!allCollections[1]}
                    onChange={(): void => {
                        if (!allCollections[1])
                            alert("No args.wellLogCollections[1]");
                        setShowWell2(!showWell2);
                    }}
                >
                    Well 2
                </ToggleButton>
                <ToggleButton
                    value="check"
                    selected={showWell3 && !!allCollections[2]}
                    onChange={(): void => {
                        if (!allCollections[2])
                            alert("No args.wellLogCollections[2]");
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
    args: { ...facies3WellsArgs },
    // wellLogCollections is used to retrieve the well log sets from the getWellLogCollections() function
    render: (args) => (
        <TemplateWithSelection {...args} wellLogCollections="DiscreteLogs" />
    ),
};

export const DiscreteLogsWithUndefined: StoryObj<typeof TemplateWithSelection> =
    {
        args: { ...facies3WellsArgs },
        // wellLogCollections is used to retrieve the well log sets from the getWellLogCollections() function
        render: (args) => (
            <TemplateWithSelection
                {...args}
                wellLogCollections="DiscreteLogsWithUndefined"
            />
        ),
    };

export const DiscreteLogsWithIndividualVisibleRange: StoryObj<
    typeof TemplateWithSelection
> = {
    args: {
        ...facies3WellsArgs,
        domain: undefined,

        visibleRange: [
            [3000, 5500],
            [2500, 4000],
            [1000, 4000],
        ],
        selection: [
            [3500, 3600],
            [2700, 2900],
            [3300, 3400],
        ],
        syncContentDomain: false,
        syncContentSelection: false,
        syncTrackPos: false,
    },

    render: (args) => (
        <TemplateWithSelection
            {...args}
            // wellLogCollections is used to retrieve the well log sets from the getWellLogCollections() function
            wellLogCollections="DiscreteLogsWithIndividualDomains"
        />
    ),
};

export const DiscreteLogsWithIndividualDomainAndVisibleRange: StoryObj<
    typeof TemplateWithSelection
> = {
    args: {
        ...facies3WellsArgs,
        domain: [
            [3000, 5500],
            [2500, 4000],
            [1000, 4000],
        ],
        visibleRange: [
            [3500, 5200],
            [2600, 3600],
            [1200, 3600],
        ],
        selection: [
            [3500, 3600],
            [2700, 2900],
            [3300, 3400],
        ],
        syncContentDomain: false,
        syncContentSelection: false,
        syncTrackPos: false,
    },

    render: (args) => (
        <TemplateWithSelection
            {...args}
            // wellLogCollections is used to retrieve the well log sets from the getWellLogCollections() function
            wellLogCollections="DiscreteLogsWithIndividualDomains"
        />
    ),
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

const logsWithDifferentSetsCollections: WellLogSet[][] = [
    [
        ...L916MUD,
        {
            header: L916MUD[0].header,
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
        ...L898MUD,
        {
            header: L898MUD[0].header,
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
];

export const LogsWithDifferentSets: StoryObj<typeof Template> = {
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
        axisMnemos,
        syncContentSelection: true,
        viewTitles: true,
        spacers: [80, 66],
        wellDistances: {
            units: "m",
            distances: [2048.3, 512.7],
        },
        colorMapFunctions: exampleColormapFunctions,
        templates: [verySimpleTemplate, verySimpleTemplate],
    },
    // wellLogCollections is used to retrieve the well log sets from the getWellLogCollections() function
    render: (args) => (
        <Template {...args} wellLogCollections="LogsWithDifferentSets" />
    ),
};
