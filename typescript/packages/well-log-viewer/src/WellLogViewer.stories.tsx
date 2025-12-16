import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within, expect } from "@storybook/test";

import React from "react";

import WellLogViewer, {
    argTypesWellLogViewerProp,
    type WellLogViewerProps,
} from "./WellLogViewer";

import type { Info } from "./components/InfoTypes";
import type { Template } from "./components/WellLogTemplateTypes";
import type { WellLogSet } from "./components/WellLogTypes";
import type WellLogView from "./components/WellLogView";
import type {
    TrackMouseEvent,
    WellLogController,
    WellPickProps,
} from "./components/WellLogView";

import type { MapAndWellLogViewerProps } from "./Storybook/examples/MapAndWellLogViewer";
import { MapAndWellLogViewer } from "./Storybook/examples/MapAndWellLogViewer";
import { axisMnemos, axisTitles } from "./utils/axes";
import type { ColormapFunction, ColorTable } from "./utils/color-function";

import exampleDeckglArgsJson from "../../../../example-data/deckgl-map.json";
import wellLogsJson from "../../../../example-data/volve_logs.json";
import wellLogl898MUDJson from "../../../../example-data/L898MUD.json";
import wellLogMWD3Json from "../../../../example-data/WL_RAW_AAC-BHPR-CAL-DEN-GR-MECH-NEU-NMR-REMP_MWD_3.json";
import templateJson1 from "../../../../example-data/welllog_template_1.json";
import templateJson2 from "../../../../example-data/welllog_template_2.json";
import wellpicksJson from "../../../../example-data/wellpicks.json";
import colorTablesJson from "../../../../example-data/wellpick_colors.json";

const exampleColorFunctions = colorTablesJson as ColormapFunction[];
const exampleColorTables = colorTablesJson as ColorTable[];

const wellLogs = wellLogsJson as unknown as WellLogSet[];
const wellLogl898MUD = wellLogl898MUDJson as WellLogSet[];
const template1 = templateJson1 as unknown as Template;
const template2 = templateJson2 as unknown as Template;

const exampleColormapFunctions: ColormapFunction[] = [
    // copy color tables and add some color functions
    ...exampleColorFunctions,
    {
        name: "Grey scale",
        func: (v: number) => [v * 255, v * 255, v * 255],
    },
    {
        name: "Red scale",
        func: (v: number) => [v * 255, 0, 0],
    },
    {
        name: "Green scale",
        func: (v: number) => [0, v * 255, 0],
    },
    {
        name: "Blue scale",
        func: (v: number) => [0, 0, v * 255],
    },
    {
        name: "Step func",
        func: (v: number) => (v < 0.5 ? [255, 0, 0] : [0, 255, 255]),
    },
];

const ComponentCode =
    '<WellLogViewer id="WellLogViewer" \r\n' +
    "    horizontal=false \r\n" +
    '    welllog={require("../../../../example-data/L898MUD.json")[0]} \r\n' +
    '    template={require("../../../../example-data/welllog_template_1.json")} \r\n' +
    "    colorMapFunctions={exampleColorMapFunctions} \r\n" +
    "/>";

const stories: Meta<WellLogViewerProps> = {
    component: WellLogViewer,
    title: "WellLogViewer/Demo/WellLogViewer",
    argTypes: argTypesWellLogViewerProp,
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

const StoryTemplate = (args: WellLogViewerProps) => {
    const infoRef = React.useRef<HTMLDivElement | null>(null);
    const setInfo = function (info: string): void {
        if (infoRef.current) infoRef.current.innerHTML = info;
    };
    const [controller, setController] = React.useState<
        WellLogController | undefined
    >(undefined);
    const onCreateController = React.useCallback(
        (controller: React.SetStateAction<WellLogController | undefined>) => {
            setController(controller);
        },
        [setController]
    );
    const onContentRescale = React.useCallback((): void => {
        setInfo(fillInfo(controller));
    }, [controller]);
    const onContentSelection = React.useCallback((): void => {
        setInfo(fillInfo(controller));
    }, [controller]);
    const handleClick = (): void => {
        if (controller) {
            controller.setControllerDefaultZoom();
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
        <div>
            <div style={{ height: "92vh", width: "100%" }}>
                <WellLogViewer
                    id="WellLogViewer"
                    {...args}
                    onCreateController={onCreateController}
                    onContentRescale={onContentRescale}
                    onContentSelection={onContentSelection}
                    onTrackMouseEvent={
                        checked ? onTrackMouseEventCustom : undefined
                    }
                />
            </div>
            <div style={{ display: "inline-flex" }}>
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

const wellpick: WellPickProps = {
    wellpick: wellpicksJson[0],
    name: "HORIZON",
    colorMapFunctions: exampleColormapFunctions,
    colorMapFunctionName: "Stratigraphy",
};

export const Default: StoryObj<typeof StoryTemplate> = {
    args: {
        //id: "Well-Log-Viewer",
        horizontal: false,
        wellLogSets: wellLogl898MUD,
        template: template1,
        colorMapFunctions: exampleColormapFunctions,
        wellpick: wellpick,
        axisTitles: axisTitles,
        axisMnemos: axisMnemos,
        viewTitle: true, // show default well log view title (a wellname from the well log)
        domain: [2500, 4000],
        selection: [3500, 3700],
        options: {
            hideTrackTitle: false,
            hideTrackLegend: false,
            hideCurrentPosition: false,
            hideSelectionInterval: false,
        },
    },
    render: (args) => <StoryTemplate {...args} />,
};

export const ColorByFunction: StoryObj<typeof StoryTemplate> = {
    args: {
        //id: "Well-Log-Viewer",
        horizontal: false,
        wellLogSets: wellLogl898MUD,
        template: {
            name: "Template 1",
            scale: {
                primary: "md",
                allowSecondary: true,
            },
            tracks: [
                {
                    title: "Multiple",
                    width: 6,
                    plots: [
                        {
                            name: "HKLA",
                            style: "HKL",
                        },
                    ],
                },
            ],
            styles: [
                {
                    name: "HKL",
                    type: "gradientfill",
                    colorMapFunctionName: "Step func",
                    inverseColorMapFunctionName: "Grey scale",
                },
            ],
        },
        colorMapFunctions: exampleColormapFunctions,
        wellpick: wellpick,
        axisTitles: axisTitles,
        axisMnemos: axisMnemos,
        viewTitle: true, // show default well log view title (a wellname from the well log)
        domain: [2500, 4000],
        selection: [3500, 3700],
        options: {
            hideTrackTitle: false,
            hideTrackLegend: false,
            hideCurrentPosition: false,
            hideSelectionInterval: false,
        },
    },
    render: (args) => <StoryTemplate {...args} />,
};

export const TrackTitleTooltip: StoryObj<typeof StoryTemplate> = {
    args: {
        horizontal: false,
        wellLogSets: [
            {
                header: {
                    name: "continuous and discrete logs",
                },
                curves: [
                    {
                        name: "MD",
                        description: "continuous",
                        quantity: "m",
                        unit: "m",
                        valueType: "float",
                        dimensions: 1,
                    },
                    {
                        name: "continuous",
                        description: "A continuous curve",
                    },
                    {
                        name: "discrete",
                        description: "A discrete curve",
                    },
                ],
                data: [
                    [0, 0, 1],
                    [1, 1, 1],
                    [2, 2, 1],
                    [3, 3, 2],
                    [4, 2, 2],
                    [5, 1, 2],
                    [6, 0, 3],
                    [7, 1, 3],
                    [8, 2, 3],
                    [9, 3, null],
                    [10, 2, null],
                ],
            },
        ],
        template: {
            name: "template",
            scale: {
                primary: "MD",
            },
            tracks: [
                {
                    title: "discrete log",
                    titleTooltip: "example discrete log track",
                    plots: [{ name: "discrete", style: "discrete" }],
                },
                {
                    title: "continuous log",
                    titleTooltip: "example continuous log track",
                    plots: [{ name: "continuous", type: "line", color: "red" }],
                },
            ],
            styles: [
                {
                    name: "discrete",
                    type: "stacked",
                    colorMapFunctionName: "Stratigraphy",
                },
            ],
        },
        colorMapFunctions: exampleColormapFunctions,
        axisTitles: axisTitles,
        axisMnemos: axisMnemos,
        viewTitle: true, // show default well log view title (a wellname from the well log)
    },
    parameters: {
        docs: {
            description: {
                story: "An example showing the tracks with continuous and discrete logs with title tooltip.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        // Assigns canvas to the component root element
        const canvas = within(canvasElement);
        await expect(canvas).toBeDefined();

        let titleDiv = canvas.getByText("discrete log");
        await expect(titleDiv).toBeDefined();
        await expect(titleDiv.title).toContain("example discrete");

        titleDiv = await canvas.findByText("continuous log");
        await expect(titleDiv).toBeDefined();
        await expect(titleDiv.title).toContain("example continuous");

        if (titleDiv) {
            await userEvent.pointer({
                target: titleDiv,
                node: titleDiv,
                offset: 2,
            });
        }
    },
    render: (args) => <StoryTemplate {...args} />,
};

export const Horizontal: StoryObj<typeof StoryTemplate> = {
    args: {
        horizontal: true,
        wellLogSets: wellLogMWD3Json,
        template: template2,
        colorMapFunctions: exampleColormapFunctions,
        wellpick: wellpick,
        axisTitles: axisTitles,
        axisMnemos: axisMnemos,
        viewTitle: true, // show default well log view title (a wellname from the well log)
    },
    parameters: {
        docs: {
            description: {
                story: "An example showing horizontal orientation of the tracks.",
            },
        },
    },
    render: (args) => <StoryTemplate {...args} />,
};

export const OnInfoFilledEvent: StoryObj<typeof StoryTemplate> = {
    args: {
        horizontal: true,
        wellLogSets: wellLogMWD3Json,
        template: template2,
        colorMapFunctions: exampleColormapFunctions,
        wellpick: wellpick,
        axisTitles: axisTitles,
        axisMnemos: axisMnemos,
        viewTitle: true, // show default well log view title (a wellname from the well log)
        layout: { right: undefined },
    },
    parameters: {
        docs: {
            description: {
                story: 'You can get the computed information at the current selection by using the "onInfoFilled" event. The event is called both externally (via the callback property), or internally (using the callback manager). This example shows an external floating panel using the callback property',
            },
        },
    },
    render: (args) => <StoryTemplateWithCustomPanel {...args} />,
};

function StoryTemplateWithCustomPanel(props: WellLogViewerProps): JSX.Element {
    const [infos, setInfos] = React.useState<Info[]>([]);
    const [showPanel, setShowPanel] = React.useState<boolean>(false);

    const handleInfoFilled = React.useCallback((newInfos: Info[]) => {
        setInfos(newInfos);
    }, []);

    return (
        <div
            // Show/hide the panel when we move the mouse away from the story
            onMouseEnter={() => setShowPanel(true)}
            onMouseLeave={() => setShowPanel(false)}
        >
            <StoryTemplate {...props} onInfoFilled={handleInfoFilled} />
            {showPanel && <CustomInfoPanel infos={infos} />}
        </div>
    );
}

function CustomInfoPanel(props: { infos: Info[] }): JSX.Element {
    const [mousePosition, setMousePosition] = React.useState({
        x: -1000,
        y: -1000,
    });
    React.useEffect(() => {
        const updateMousePos = (evt: MouseEvent) => {
            setMousePosition({ x: evt.clientX, y: evt.clientY });
        };

        window.addEventListener("mousemove", updateMousePos);
        return () => window.removeEventListener("mousemove", updateMousePos);
    }, []);

    return (
        <div
            style={{
                position: "fixed",
                left: mousePosition.x + 20,
                top: mousePosition.y + 2,
                padding: "0.25rem",
                border: "solid gray 1px",
                borderRadius: "0.25rem",
                zIndex: 9999,
                background: "white",
                pointerEvents: "none",
            }}
        >
            <div>
                {props.infos?.map((i: Info) => {
                    if (i.type === "separator") return null;
                    else
                        return (
                            <div key={i.trackId}>
                                <span style={{ fontWeight: 700 }}>
                                    {i.name}
                                </span>
                                <span> {i.value.toFixed(3)}</span>

                                <span> {i.units}</span>
                            </div>
                        );
                })}
            </div>
        </div>
    );
}

export const Discrete: StoryObj<typeof StoryTemplate> = {
    args: {
        horizontal: false,
        wellLogSets: [
            {
                ...wellLogs[0],
                curves: [
                    ...wellLogs[0].curves,
                    {
                        name: "STRING_CURVE",
                        description:
                            "A discrete curve with a string value type",
                        quantity: "DISC",
                        unit: "DISC",
                        valueType: "string",
                        dimensions: 1,
                    },
                ],
                data: wellLogs[0].data.map((d) => {
                    if ((d[0] as number) <= 3900) return [...d, "FOO"];
                    else return [...d, "BAR"];
                }),
            },
        ],
        template: {
            ...template2,
            tracks: [
                {
                    title: "string discrete",
                    plots: [{ name: "STRING_CURVE", style: "discrete" }],
                },
                ...template2.tracks,
            ],
        },
        colorMapFunctions: exampleColormapFunctions,
        wellpick: wellpick,
        axisTitles: axisTitles,
        axisMnemos: axisMnemos,
        viewTitle: true, // show default well log view title (a wellname from the well log)
    },
    parameters: {
        docs: {
            description: {
                story: "An example showing the tracks with discrete logs.",
            },
        },
    },
    render: (args) => <StoryTemplate {...args} />,
};

export const LogWithDifferentSets: StoryObj<typeof StoryTemplate> = {
    args: {
        colorMapFunctions: [],
        wellLogSets: [
            {
                header: wellLogs[0].header,
                curves: [
                    {
                        name: "MD",
                        description: "continuous",
                        quantity: "m",
                        unit: "m",
                        valueType: "float",
                        dimensions: 1,
                    },
                    {
                        name: "PORO",
                        description: "continuous",
                        quantity: "",
                        unit: "",
                        valueType: "float",
                        dimensions: 1,
                    },
                ],

                data: [
                    [3700, 45],
                    [3725, 78],
                    [3750, 12],
                    [3775, 34],
                    [3800, 89],
                    [3825, 67],
                    [3850, 90],
                    [3875, 11],
                    [3900, 78],
                    [3925, 34],
                    [3950, 56],
                    [3975, 89],
                    [4000, 67],
                    [4025, 11],
                    [4050, 45],
                    [4075, 78],
                    [4100, 34],
                    [4125, 89],
                ],
            },

            {
                // Sharing the discrete config across all logs for simplicity
                metadata_discrete: {
                    FLAG_EXAMPLE: {
                        attributes: ["color", "code"],
                        objects: {
                            no: [[244, 237, 255, 255], 0],
                            yes: [[255, 171, 178, 255], 1],
                        },
                    },
                },
                header: {
                    name: "The second log",
                    well: wellLogs[0].header.well,
                },
                curves: [
                    {
                        name: "MD",
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

                    {
                        name: "BAD_CONT",
                        description:
                            "A continuous curve with a really bad sampling rate",
                        quantity: "m",
                        unit: "m",
                        valueType: "integer",
                        dimensions: 1,
                    },
                ],
                data: [
                    [3800, null, 2],
                    [3870, 0, 2.4],
                    [4000, 1, 0.4],
                ],
            },
        ],

        template: {
            name: "aaa",
            scale: { primary: "md" },
            tracks: [
                {
                    title: "Discrete, from set 1",
                    plots: [
                        {
                            name: "FLAG_EXAMPLE",
                            type: "stacked",
                            color: "",
                        },
                    ],
                },

                {
                    title: "Continuous, from both sets",
                    plots: [
                        { name: "PORO", type: "line", color: "red" },
                        { name: "BAD_CONT", type: "line", color: "blue" },
                    ],
                },

                {
                    title: "Continuous, from set 2",
                    plots: [{ name: "PORO", type: "line", color: "red" }],
                },
            ],
        },
        axisTitles: axisTitles,
        axisMnemos: axisMnemos,
        viewTitle: true, // show default well log view title (a wellname from the well log)
    },
    parameters: {
        docs: {
            description: {
                story: "An example showing support for multiple logs (For the same well) with different sampling rates",
            },
        },
    },
    render: (args) => <StoryTemplate {...args} />,
};

const MapAndWellLogViewerStoryComp = (
    args: React.JSX.IntrinsicAttributes &
        React.JSX.IntrinsicClassAttributes<MapAndWellLogViewer> &
        Readonly<MapAndWellLogViewerProps>
) => {
    return (
        <div style={{ height: "94vh", width: "100%", display: "flex" }}>
            <MapAndWellLogViewer {...args} />
        </div>
    );
};

const exampleMapAndLogProps =
    exampleDeckglArgsJson[0] as unknown as MapAndWellLogViewerProps;

export const MapAndWellLogViewerStory: StoryObj<
    typeof MapAndWellLogViewerStoryComp
> = {
    args: {
        ...exampleMapAndLogProps,
        colorTables: exampleColorTables,
        id: "MapAndWellLog", // redefine id from exampleData[0]
    },
    tags: ["no-test"],
    render: (args) => <MapAndWellLogViewerStoryComp {...args} />,
};
