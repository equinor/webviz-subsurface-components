/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import WellLogViewer, {
    argTypesWellLogViewerProp,
    type WellLogViewerProps,
} from "./WellLogViewer";

import exampleData from "../../../../example-data/deckgl-map.json";

import type { Color, LayersList } from "@deck.gl/core";
import type { SubsurfaceViewerProps } from "@webviz/subsurface-viewer";
import SubsurfaceViewer from "@webviz/subsurface-viewer";
import type { WeakValidationMap } from "react";

import type { WellsLayer } from "@webviz/subsurface-viewer/dist/layers";
import type {
    Template,
    TemplatePlot,
    TemplatePlotTypes,
    TemplateTrack,
} from "./components/WellLogTemplateTypes";

import welllogsJson from "../../../../example-data/volve_logs.json";
import type { WellLog } from "./components/WellLogTypes";
const welllogs = welllogsJson as unknown as WellLog[];

import templateJson from "../../../../example-data/welllog_template_2.json";
const template = templateJson as unknown as Template;

import type { ColorFunction } from "./components/ColorTableTypes";

import type { MapMouseEvent } from "@webviz/subsurface-viewer/dist/components/Map";

import WellLogInfoPanel from "./components/WellLogInfoPanel";
import WellLogViewWithScroller from "./components/WellLogViewWithScroller";
import { deepCopy } from "./utils/deepcopy";
import { getDiscreteMeta, indexOfElementByName } from "./utils/tracks";

import type {
    TrackMouseEvent,
    WellLogController,
    WellLogViewOptions,
} from "./components/WellLogView";
import { isEqualRanges } from "./utils/log-viewer";

import { CallbackManager } from "./components/CallbackManager";

import colorTables from "../../../../example-data/wellpick_colors.json";
const exampleColorFunctions: ColorFunction[] = [
    // copy color tables and add some color functions
    ...(colorTables as ColorFunction[]),
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
import wellPicks from "../../../../example-data/wellpicks.json";

import type { Info } from "./components/InfoTypes";
import type WellLogView from "./components/WellLogView";
import { axisMnemos, axisTitles } from "./utils/axes";

const ComponentCode =
    '<WellLogViewer id="WellLogViewer" \r\n' +
    "    horizontal=false \r\n" +
    '    welllog={require("../../../../example-data/L898MUD.json")[0]} \r\n' +
    '    template={require("../../../../example-data/welllog_template_1.json")} \r\n' +
    "    colorFunctions={exampleColorFunctions} \r\n" +
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
        [controller]
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

const wellpick = {
    wellpick: wellPicks[0],
    name: "HORIZON",
    colorFunctions: exampleColorFunctions,
    color: "Stratigraphy",
};

function getTemplatePlotColorFunction(
    template: Template,
    templatePlot: TemplatePlot
) {
    let colorFunction = templatePlot.colorFunction;
    if (!colorFunction && templatePlot.style) {
        const templateStyles = template.styles;
        if (templateStyles) {
            const iStyle = indexOfElementByName(
                templateStyles,
                templatePlot.style
            );
            if (iStyle >= 0) {
                const style = templateStyles[iStyle];
                colorFunction = style.colorFunction;
            }
        }
    }
    return colorFunction;
}

interface Props extends SubsurfaceViewerProps {
    /**
     * Options for well log view
     */
    welllogOptions?: WellLogViewOptions;
}

interface State {
    wellIndex: number | undefined;
    editedData?: Record<string, unknown>;

    layers?: LayersList;

    wellName?: string;
    selection?: [number | undefined, number | undefined];
    selPersistent?: boolean;
    wellColor?: Color; // well color
}

function findWellsLayer(event: MapMouseEvent) {
    const info = event.infos.find((info) => info.layer?.id === "wells-layer");
    return info?.layer as WellsLayer;
}

function findWellLogIndex(welllogs: WellLog[], wellName: string): number {
    return welllogs.findIndex((welllog) => welllog.header.well === wellName);
}

function findLog(template: Template, logName: string): number {
    return template.tracks.findIndex(
        (track) => track.plots[0]?.name === logName
    );
}

function detectType(welllog: WellLog, logName: string): TemplatePlotTypes {
    if (welllog) {
        const meta = getDiscreteMeta(welllog, logName); // non-standard extention of WellLog JSON file
        if (meta) return "stacked";
    }
    return "line";
}

function addTemplateTrack(
    template: Template,
    welllog: WellLog,
    logName: string
): Template {
    // add missed TemplateTrack for the given logName
    const type: TemplatePlotTypes = detectType(welllog, logName);
    const templateNew = deepCopy(template);
    const templateTrack: TemplateTrack = {
        title: logName,
        required: true, // force to show on all wells
        plots: [{ name: logName, type: type, color: "red" }],
    };
    templateNew.tracks.push(templateTrack);
    return templateNew;
}

export const Default: StoryObj<typeof StoryTemplate> = {
    args: {
        id: "Well-Log-Viewer",
        horizontal: false,
        welllog: require("../../../../example-data/L898MUD.json")[0], // eslint-disable-line
        template: require("../../../../example-data/welllog_template_1.json"), // eslint-disable-line
        colorFunctions: exampleColorFunctions,
        // @ts-expect-error TS2322
        wellpick: wellpick,
        axisTitles: axisTitles,
        axisMnemos: axisMnemos,
        viewTitle: true, // show default welllog view title (a wellname from the welllog)
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
                    colorFunction: "Step func",
                    inverseColorFunction: "Grey scale",
                },
            ],
        },
        colorFunctions: exampleColorFunctions,
        // @ts-expect-error TS2322
        wellpick: wellpick,
        axisTitles: axisTitles,
        axisMnemos: axisMnemos,
        viewTitle: true, // show default welllog view title (a wellname from the welllog)
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
        colorFunctions: exampleColorFunctions,
        // @ts-expect-error TS2322
        wellpick: wellpick,
        axisTitles: axisTitles,
        axisMnemos: axisMnemos,
        viewTitle: true, // show default welllog view title (a wellname from the welllog)
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
        colorFunctions: exampleColorFunctions,
        // @ts-expect-error TS2322
        wellpick: wellpick,
        axisTitles: axisTitles,
        axisMnemos: axisMnemos,
        viewTitle: true, // show default welllog view title (a wellname from the welllog)
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

class MapAndWellLogViewer extends React.Component<Props, State> {
    public static propTypes?: WeakValidationMap<Props> | undefined;
    callbackManager: CallbackManager;

    constructor(props: Props) {
        super(props);
        this.state = {
            wellIndex: undefined,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            editedData: props.editedData,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            layers: props.layers as LayersList,
        };
        this.onContentSelection = this.onContentSelection.bind(this);
        this.onTrackScroll = this.onTrackScroll.bind(this);

        this.onMapMouseEvent = this.onMapMouseEvent.bind(this);

        this.callbackManager = new CallbackManager(() => {
            return this.state.wellIndex === undefined
                ? undefined
                : welllogs[this.state.wellIndex];
        });
    }
    componentDidUpdate(prevProps: Props, prevState: State): void {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        if (this.props.editedData !== prevProps.editedData) {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.setState({ editedData: this.props.editedData });
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            0;
        }
        if (!isEqualRanges(this.state.selection, prevState.selection)) {
            const controller = this.callbackManager.controller;
            if (controller && this.state.selection) {
                controller.selectContent([
                    this.state.selection[0],
                    this.state.selection[1],
                ]);
            }
        }
    }
    componentWillUnmount(): void {
        this.callbackManager.unregisterAll();
    }

    onContentSelection(): void {
        this.callbackManager.onContentSelection();

        const controller = this.callbackManager.controller;
        if (!controller) return;
        const selection = controller.getContentSelection();

        // synchronize selection only from the current well
        /*if (?? === this.state.wellName)*/ {
            this.setState({
                selection: selection,
                selPersistent: selection[1] !== undefined,
            });
        }
    }
    onTrackScroll(): void {
        const controller = this.callbackManager.controller;
        if (!controller) return;
        const iTrack = controller.getTrackScrollPos();
        if (iTrack >= 0) {
            const template = controller.getTemplate();
            const track = template.tracks[iTrack];
            if (track) {
                const templatePlot = track.plots[0];
                if (templatePlot) {
                    const wells_layer =
                        // TODO: Fix this the next time the file is edited.
                        // eslint-disable-next-line react/prop-types
                        (this.props.layers as Record<string, unknown>[])?.find(
                            (item: Record<string, unknown>) =>
                                item["@@type"] === "WellsLayer"
                        );
                    if (
                        wells_layer &&
                        wells_layer["logName"] !== templatePlot.name
                    ) {
                        wells_layer["logName"] = templatePlot.name;
                        const colorTable = getTemplatePlotColorFunction(
                            template,
                            templatePlot
                        );
                        if (colorTable) wells_layer["logColor"] = colorTable;

                        // TODO: Fix this the next time the file is edited.
                        // eslint-disable-next-line react/prop-types
                        const layers = deepCopy(this.props.layers);
                        this.setState({
                            layers: layers as LayersList,
                        });

                        /*
                        // Force to rerender ColorLegend after
                        setTimeout(() => {
                            const layers = deepCopy(this.props.layers);
                            this.setState({
                                layers: layers as LayersList,
                            });
                        }, 200);
                        */
                    }
                }
            }
        }
    }

    onMapMouseEvent(event: MapMouseEvent): void {
        if (event.wellname !== undefined) {
            if (event.type == "click") {
                const iWell = findWellLogIndex(welllogs, event.wellname);
                this.setState((state: Readonly<State>) => {
                    //if (state.wellIndex === iWell) return null;

                    let selection:
                        | [number | undefined, number | undefined]
                        | undefined = undefined;
                    let selPersistent: boolean | undefined = undefined;
                    if (
                        state.wellIndex !== iWell ||
                        !state.selection ||
                        state.selPersistent
                    ) {
                        selection = [event.md, undefined];
                        selPersistent = false;
                    } else {
                        if (state.selection[1] !== undefined) {
                            // have something pinned
                            selection = [event.md, state.selection[1]];
                            selPersistent = true;
                        } else {
                            // no pinned yet
                            selection = [event.md, state.selection[0]]; // copy current to pinned
                            selPersistent = false;
                        }
                    }

                    return {
                        wellIndex: iWell,
                        wellName: event.wellname,
                        wellColor: event.wellcolor,
                        selection: selection,
                        selPersistent: selPersistent,
                    };
                });

                const controller = this.callbackManager.controller;
                if (controller) {
                    const wellsLayer = findWellsLayer(event);
                    if (wellsLayer) {
                        const template = controller.getTemplate();
                        const logName = wellsLayer.props?.logName;
                        let iTrack = findLog(template, logName);
                        if (iTrack < 0) {
                            //const welllog = info.object is Feature or WellLog;
                            const welllog = welllogs[iWell];
                            const templateNew = addTemplateTrack(
                                template,
                                welllog,
                                logName
                            );
                            controller.setTemplate(templateNew);

                            iTrack = findLog(template, logName);
                        }
                        controller.scrollTrackTo(iTrack);
                    }
                }
            }
            if (event.wellname === this.state.wellName) {
                // synchronize selection only from the current well
                if (event.md !== undefined) {
                    this.setState((state: Readonly<State>) => {
                        if (state.selPersistent) return null;
                        if (event.md === state.selection?.[0]) return null;

                        return {
                            selection: [event.md, state.selection?.[1]],
                        };
                    });
                }
            }
        }
    }

    render(): JSX.Element {
        const wellName = this.state.wellName;
        const wellColor = this.state.wellColor;
        const wellIndex = this.state.wellIndex;
        const viewTitle = (
            <div style={{ fontSize: "16px" }}>
                {wellColor && (
                    <span
                        style={{
                            color: wellColor
                                ? "rgb(" +
                                  wellColor[0] +
                                  "," +
                                  wellColor[1] +
                                  "," +
                                  wellColor[2] +
                                  ")"
                                : undefined,
                            fontSize: "small",
                        }}
                    >
                        {"\u2B24 " /*big circle*/}
                    </span>
                )}
                {wellName || "Select a well by clicking on the map"}
                {wellIndex === -1 && (
                    <div className="welllogview-error">
                        No well logs found for the well
                    </div>
                )}
            </div>
        );

        return (
            <div style={{ height: "100%", width: "100%", display: "flex" }}>
                <div
                    style={{
                        width: "70%",
                        position: "relative",
                    }}
                >
                    <div>
                        <SubsurfaceViewer
                            {...this.props}
                            // @ts-expect-error TS2322
                            layers={this.state.layers}
                            editedData={this.state.editedData}
                            onMouseEvent={this.onMapMouseEvent}
                            selection={{
                                well: wellName,
                                selection: this.state.selection,
                            }}
                        />
                    </div>
                </div>
                <div
                    style={{
                        width: "30%",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div
                        style={{
                            flex: "1",
                            height: "0%",
                            minWidth: "25px",
                            width: "100%",
                        }}
                    >
                        <WellLogViewWithScroller
                            welllog={
                                wellIndex !== undefined
                                    ? welllogs[wellIndex]
                                    : undefined
                            }
                            template={template}
                            colorFunctions={
                                // TODO: Fix this the next time the file is edited.
                                // eslint-disable-next-line react/prop-types
                                this.props.colorTables as ColorFunction[]
                            }
                            // @aspentech: This issue needs to get sorted out, there seems to be a compatibility issue with the JSON file and the prop type
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            wellpick={wellpick}
                            primaryAxis={"md"}
                            axisTitles={axisTitles}
                            axisMnemos={axisMnemos}
                            viewTitle={viewTitle}
                            options={{
                                checkDatafileSchema:
                                    // TODO: Fix this the next time the file is edited.
                                    // eslint-disable-next-line react/prop-types
                                    this.props.checkDatafileSchema,
                                maxVisibleTrackNum: 1,
                            }}
                            onCreateController={
                                this.callbackManager.onCreateController
                            }
                            onInfo={this.callbackManager.onInfo}
                            onContentSelection={this.onContentSelection}
                            onTrackScroll={this.onTrackScroll}
                        />
                    </div>
                    <WellLogInfoPanel
                        header="Readout"
                        callbackManager={this.callbackManager}
                    />
                </div>
            </div>
        );
    }
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
        colorFunctions: exampleColorFunctions,
        // @ts-expect-error TS2322
        wellpick: wellpick,
        axisTitles: axisTitles,
        axisMnemos: axisMnemos,
        viewTitle: true, // show default welllog view title (a wellname from the welllog)
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

const MapAndWellLogViewerStoryComp = (
    args: React.JSX.IntrinsicAttributes &
        React.JSX.IntrinsicClassAttributes<MapAndWellLogViewer> &
        Readonly<Props>
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
