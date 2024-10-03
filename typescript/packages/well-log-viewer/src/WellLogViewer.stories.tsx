import type { Meta, StoryObj } from "@storybook/react";
import _ from "lodash";
import React from "react";

import WellLogViewer, {
    argTypesWellLogViewerProp,
    type WellLogViewerProps,
} from "./WellLogViewer";

import type { Info } from "./components/InfoTypes";
import type {
    Template,
    TemplateTrack,
} from "./components/WellLogTemplateTypes";
import type { WellLogSet } from "./components/WellLogTypes";
import type WellLogView from "./components/WellLogView";
import type {
    TrackMouseEvent,
    WellLogController,
} from "./components/WellLogView";

import exampleData from "../../../../example-data/deckgl-map.json";
import wellLogsJson from "../../../../example-data/volve_logs.json";
import templateJson from "../../../../example-data/welllog_template_2.json";
import colorTablesJson from "../../../../example-data/wellpick_colors.json";
import wellPicks from "../../../../example-data/wellpicks.json";

import type { MapAndWellLogViewerProps } from "./Storybook/examples/MapAndWellLogViewer";
import { MapAndWellLogViewer } from "./Storybook/examples/MapAndWellLogViewer";
import { axisMnemos, axisTitles } from "./utils/axes";
import type { ColorTable } from "./components/ColorTableTypes";

const wellLogs = wellLogsJson as unknown as WellLogSet[];
const template = templateJson as unknown as Template;
const colorTables = colorTablesJson as unknown as ColorTable[];

const ComponentCode =
    '<WellLogViewer id="WellLogViewer" \r\n' +
    "    horizontal=false \r\n" +
    '    welllog={require("../../../../example-data/L898MUD.json")[0]} \r\n' +
    '    template={require("../../../../example-data/welllog_template_1.json")} \r\n' +
    "    colorTables={colorTables} \r\n" +
    "/>";

const stories: Meta = {
    // @ts-expect-error TS2322
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
export default stories;

function fillInfo(controller: WellLogController | undefined) {
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
    const infoRef = React.useRef();
    const setInfo = function (info: string) {
        // @ts-expect-error TS2339
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
    const onContentRescale = React.useCallback(() => {
        setInfo(fillInfo(controller));
    }, [controller]);
    const onContentSelection = React.useCallback(() => {
        setInfo(fillInfo(controller));
    }, [controller]);
    const handleClick = () => {
        if (controller) {
            controller.setControllerDefaultZoom();
        }
    };
    const [checked, setChecked] = React.useState(false);
    const handleChange = () => {
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
                    // @ts-expect-error TS2322
                    onTrackMouseEvent={checked ? onTrackMouseEventCustom : null}
                />
            </div>
            <div style={{ display: "inline-flex" }}>
                {/*
                 // @ts-expect-error TS2322 */}
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

const wellpick = {
    wellpick: wellPicks[0],
    name: "HORIZON",
    colorTables: colorTables,
    color: "Stratigraphy",
};

export const Default: StoryObj<typeof StoryTemplate> = {
    args: {
        id: "Well-Log-Viewer",
        horizontal: false,
        welllog: require("../../../../example-data/L898MUD.json")[0], // eslint-disable-line
        template: require("../../../../example-data/welllog_template_1.json"), // eslint-disable-line
        colorTables: colorTables,
        // @ts-expect-error TS2322
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

export const ColorByFunctionTBD: StoryObj<typeof StoryTemplate> = {
    args: {
        id: "Well-Log-Viewer",
        horizontal: false,
        welllog: require("../../../../example-data/L898MUD.json")[0], // eslint-disable-line
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
                        // @ts-expect-error TS2739
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
                    type: "gradientfill", // Is this the correct type for using color function?
                    // @ts-expect-error TS2322
                    colorTable: (value: number) =>
                        value < 100 ? [1, 0, 0] : [[0, 1, 1]],
                    color: "green",
                },
            ],
        },
        colorTables: colorTables,
        // @ts-expect-error TS2322
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

export const Horizontal: StoryObj<typeof StoryTemplate> = {
    args: {
        id: "Well-Log-Viewer-Horizontal",
        horizontal: true,
        welllog:
            require("../../../../example-data/WL_RAW_AAC-BHPR-CAL-DEN-GR-MECH-NEU-NMR-REMP_MWD_3.json")[0], // eslint-disable-line
        template: require("../../../../example-data/welllog_template_2.json"), // eslint-disable-line
        colorTables: colorTables,
        // @ts-expect-error TS2322
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
        id: "Well-Log-Viewer-OnInfoFilled",
        horizontal: true,
        welllog:
            require("../../../../example-data/WL_RAW_AAC-BHPR-CAL-DEN-GR-MECH-NEU-NMR-REMP_MWD_3.json")[0], // eslint-disable-line
        template: require("../../../../example-data/welllog_template_2.json"), // eslint-disable-line

        colorTables: colorTables,
        // @ts-expect-error TS2322

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

function CustomInfoPanel(props: { infos: Info[] }) {
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

const drawing_layer = exampleData[0].layers.find(
    (item) => item["@@type"] === "DrawingLayer"
);
if (drawing_layer) drawing_layer.visible = false;

const wells_layer = exampleData[0].layers.find(
    (item) => item["@@type"] === "WellsLayer"
);
if (wells_layer) {
    wells_layer.logName = "ZONE_MAIN"; //
    wells_layer.logColor = "Stratigraphy"; //"Stratigraphy";
}

export const Discrete: StoryObj<typeof StoryTemplate> = {
    args: {
        id: "Well-Log-Viewer-Discrete",
        horizontal: false,
        welllog: require("../../../../example-data/volve_logs.json")[0], // eslint-disable-line
        template: require("../../../../example-data/welllog_template_2.json"), // eslint-disable-line
        colorTables: colorTables,
        // @ts-expect-error TS2322
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

export const MultipleWellLog: StoryObj<typeof StoryTemplate> = {
    args: {
        id: "Well-Log-Viewer-Discrete",
        horizontal: false,
        welllog: [
            wellLogs[0],
            {
                // Sharing the discrete config across all logs for simplicity
                metadata_discrete: {
                    FLAG_EXAMPLE: {
                        attributes: ["color", "code"],
                        objects: {
                            // @ts-expect-error Type in project is wrong
                            no: [[244, 237, 255, 255], 0],
                            // @ts-expect-error Type in project is wrong
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
                ],
                data: [
                    [3800, null],
                    [3870, 0],
                    [4000, 1],
                ],
            },
        ],

        template: _.assign({}, template, {
            tracks: [
                {
                    plots: [
                        {
                            name: "FLAG_EXAMPLE",
                            type: "stacked",
                        },
                    ],
                },
                template.tracks[1],
            ] as TemplateTrack[],
        }),
        colorTables: colorTables,
        wellpick: undefined,
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

export const MapAndWellLogViewerStory: StoryObj<
    typeof MapAndWellLogViewerStoryComp
> = {
    args: {
        ...exampleData[0],
        // @ts-expect-error TS2322
        colorTables: colorTables,
        id: "MapAndWellLog", // redefine id from exampleData[0]
    },
    tags: ["no-test"],
    render: (args) => <MapAndWellLogViewerStoryComp {...args} />,
};
