import SubsurfaceViewer from "@webviz/subsurface-viewer";
import type { WeakValidationMap } from "react";
import React from "react";
import type { ColorTable } from "../../components/ColorTableTypes";
import WellLogInfoPanel from "../../components/WellLogInfoPanel";
import WellLogViewWithScroller from "../../components/WellLogViewWithScroller";

import { isEqualRanges } from "../../utils/log-viewer";

import { CallbackManager } from "../../components/CallbackManager";
import type {
    Template,
    TemplatePlot,
    TemplatePlotTypes,
    TemplateTrack,
} from "../../components/WellLogTemplateTypes";

import type { Color } from "@deck.gl/core";
import type {
    SubsurfaceViewerProps,
    TLayerDefinition,
} from "@webviz/subsurface-viewer";

import type { WellsLayer } from "@webviz/subsurface-viewer/dist/layers";

import type { MapMouseEvent } from "@webviz/subsurface-viewer/dist/components/Map";

import { axisMnemos, axisTitles } from "../../utils/axes";
import { deepCopy } from "../../utils/deepcopy";
import { getDiscreteMeta, indexOfElementByName } from "../../utils/tracks";

import type {
    WellLogCollection,
    WellLogSet,
} from "../../components/WellLogTypes";
import type { WellLogViewOptions } from "../../components/WellLogView";

import wellLogsJson from "../../../../../../example-data/volve_logs.json";
import templateJson from "../../../../../../example-data/welllog_template_2.json";
import colorTables from "../../../../../../example-data/wellpick_colors.json";
import wellPicks from "../../../../../../example-data/wellpicks.json";

const wellLogs = wellLogsJson as unknown as WellLogCollection;
const template = templateJson as unknown as Template;

const wellpick = {
    wellpick: wellPicks[0],
    name: "HORIZON",
    colorTables: colorTables,
    color: "Stratigraphy",
};

function getTemplatePlotColorTable(
    template: Template,
    templatePlot: TemplatePlot
) {
    let colorTable = templatePlot.colorTable;
    if (!colorTable && templatePlot.style) {
        const templateStyles = template.styles;
        if (templateStyles) {
            const iStyle = indexOfElementByName(
                templateStyles,
                templatePlot.style
            );
            if (iStyle >= 0) {
                const style = templateStyles[iStyle];
                colorTable = style.colorTable;
            }
        }
    }
    return colorTable;
}

interface State {
    wellIndex: number | undefined;
    editedData?: Record<string, unknown>;

    layers?: TLayerDefinition[];

    wellName?: string;
    selection?: [number | undefined, number | undefined];
    selPersistent?: boolean;
    wellColor?: Color; // well color
}

function findWellsLayer(event: MapMouseEvent) {
    const info = event.infos.find((info) => info.layer?.id === "wells-layer");
    return info?.layer as WellsLayer;
}

function findWellLogIndex(
    wellLog: WellLogCollection,
    wellName: string
): number {
    return wellLog.findIndex((logSet) => logSet.header.well === wellName);
}

function findLog(template: Template, logName: string): number {
    return template.tracks.findIndex(
        (track) => track.plots[0]?.name === logName
    );
}

function detectType(
    wellLogSet: WellLogSet,
    logName: string
): TemplatePlotTypes {
    if (wellLogSet) {
        const meta = getDiscreteMeta(wellLogSet, logName); // non-standard extention of WellLog JSON file
        if (meta) return "stacked";
    }
    return "line";
}

function addTemplateTrack(
    template: Template,
    wellLogSet: WellLogSet,
    logName: string
): Template {
    // add missed TemplateTrack for the given logName
    const type: TemplatePlotTypes = detectType(wellLogSet, logName);
    const templateNew = deepCopy(template);
    const templateTrack: TemplateTrack = {
        title: logName,
        required: true, // force to show on all wells
        plots: [{ name: logName, type: type, color: "red" }],
    };
    templateNew.tracks.push(templateTrack);
    return templateNew;
}

export interface MapAndWellLogViewerProps extends SubsurfaceViewerProps {
    /**
     * Options for well log view
     */
    wellLogOptions?: WellLogViewOptions;
}

export class MapAndWellLogViewer extends React.Component<
    MapAndWellLogViewerProps,
    State
> {
    public static propTypes?:
        | WeakValidationMap<MapAndWellLogViewerProps>
        | undefined;
    callbackManager: CallbackManager;

    constructor(props: MapAndWellLogViewerProps) {
        super(props);
        this.state = {
            wellIndex: undefined,
            editedData: props.editedData,
            layers: props.layers as TLayerDefinition[],
        };
        this.onContentSelection = this.onContentSelection.bind(this);
        this.onTrackScroll = this.onTrackScroll.bind(this);

        this.onMapMouseEvent = this.onMapMouseEvent.bind(this);

        this.callbackManager = new CallbackManager(() => {
            if (this.state.wellIndex === undefined) return undefined;
            const logset = wellLogs[this.state.wellIndex];

            if (logset) return [logset];
            else return [];
        });
    }
    componentDidUpdate(
        prevProps: MapAndWellLogViewerProps,
        prevState: State
    ): void {
        if (this.props.editedData !== prevProps.editedData) {
            this.setState({ editedData: this.props.editedData });
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
                    const wells_layer = (
                        this.props.layers as Record<string, unknown>[]
                    )?.find(
                        (item: Record<string, unknown>) =>
                            item["@@type"] === "WellsLayer"
                    );
                    if (
                        wells_layer &&
                        wells_layer["logName"] !== templatePlot.name
                    ) {
                        wells_layer["logName"] = templatePlot.name;
                        const colorTable = getTemplatePlotColorTable(
                            template,
                            templatePlot
                        );
                        if (colorTable) wells_layer["logColor"] = colorTable;

                        const layers = deepCopy(this.props.layers);
                        this.setState({
                            layers: layers as TLayerDefinition[],
                        });
                    }
                }
            }
        }
    }

    onMapMouseEvent(event: MapMouseEvent): void {
        console.warn("! onMapMouseEvent event is not working...");

        // TODO: This event is broken within MapViewer, and MapMouseEvent is never given with a wellname. Might need to be fixed in a PR there
        if (event.wellname !== undefined) {
            if (event.type == "click") {
                const iWell = findWellLogIndex(wellLogs, event.wellname);
                this.setState((state: Readonly<State>) => {
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
                            //const wellLog = info.object is Feature or WellLog;
                            const wellLog = wellLogs[iWell];
                            const templateNew = addTemplateTrack(
                                template,
                                wellLog,
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
                                    ? wellLogs[wellIndex]
                                    : undefined
                            }
                            template={template}
                            colorTables={this.props.colorTables as ColorTable[]}
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
