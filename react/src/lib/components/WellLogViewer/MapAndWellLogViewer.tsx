import React from "react";
import PropTypes from "prop-types";

import { WeakValidationMap } from "react";
import SubsurfaceViewer from "../SubsurfaceViewer";
import { SubsurfaceViewerProps } from "../SubsurfaceViewer";
import { Color } from "@deck.gl/core/typed";

import { WellsLayer } from "../SubsurfaceViewer/layers";
import {
    Template,
    TemplateTrack,
    TemplatePlot,
    TemplatePlotTypes,
} from "./components/WellLogTemplateTypes";

import { WellLog } from "./components/WellLogTypes";
const welllogs =
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("../../../demo/example-data/volve_logs.json") as WellLog[];

const template =
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("../../../demo/example-data/welllog_template_2.json") as Template;

import { ColorTable } from "./components/ColorTableTypes";

import { MapMouseEvent } from "../SubsurfaceViewer/components/Map";

import WellLogInfoPanel from "./components/WellLogInfoPanel";
import WellLogViewWithScroller from "./components/WellLogViewWithScroller";
import { axisTitles, axisMnemos } from "./utils/axes";
import { getDiscreteMeta, indexOfElementByName } from "./utils/tracks";
import { deepCopy } from "./utils/deepcopy";

import { WellLogViewOptions } from "./components/WellLogView";
import { isEqualRanges } from "./components/WellLogView";

import { CallbackManager } from "./components/CallbackManager";

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

interface Props extends SubsurfaceViewerProps {
    /**
     * Options for well log view
     */
    welllogOptions?: WellLogViewOptions;
}

interface State {
    wellIndex: number | undefined;
    editedData?: Record<string, unknown>;

    layers?: Record<string, unknown>[];

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

const wellpick = {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    wellpick: require("../../../demo/example-data/wellpicks.json")[0],
    name: "HORIZON",
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    colorTables: require("../../../demo/example-data/wellpick_colors.json"),
    color: "Stratigraphy",
};

export class MapAndWellLogViewer extends React.Component<Props, State> {
    public static propTypes?: WeakValidationMap<Props> | undefined;
    callbacksManager: CallbackManager;

    constructor(props: Props, state: State) {
        super(props, state);
        this.state = {
            wellIndex: undefined,
            editedData: props.editedData,
            layers: props.layers,
        };
        this.onContentSelection = this.onContentSelection.bind(this);
        this.onTrackScroll = this.onTrackScroll.bind(this);

        this.onMapMouseEvent = this.onMapMouseEvent.bind(this);

        this.callbacksManager = new CallbackManager(() => {
            return this.state.wellIndex === undefined
                ? undefined
                : welllogs[this.state.wellIndex];
        });
    }
    componentDidUpdate(prevProps: Props, prevState: State): void {
        if (this.props.editedData !== prevProps.editedData) {
            this.setState({ editedData: this.props.editedData });
            0;
        }
        if (!isEqualRanges(this.state.selection, prevState.selection)) {
            const controller = this.callbacksManager.controller;
            if (controller && this.state.selection) {
                controller.selectContent([
                    this.state.selection[0],
                    this.state.selection[1],
                ]);
            }
        }
    }
    componentWillUnmount(): void {
        this.callbacksManager.unregisterAll();
    }

    onContentSelection(): void {
        this.callbacksManager.onContentSelection();

        const controller = this.callbacksManager.controller;
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
        const controller = this.callbacksManager.controller;
        if (!controller) return;
        const iTrack = controller.getTrackScrollPos();
        if (iTrack >= 0) {
            const template = controller.getTemplate();
            const track = template.tracks[iTrack];
            if (track) {
                const templatePlot = track.plots[0];
                if (templatePlot) {
                    const wells_layer = this.props.layers?.find(
                        (item) => item["@@type"] === "WellsLayer"
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
                        //(wells_layer.context as DeckGLLayerContext).userData.colorTables=colorTables;

                        const layers = deepCopy(this.props.layers);
                        this.setState({ layers: layers });

                        /*
                        // Force to rerender ColorLegend after
                        setTimeout(() => {
                            const layers = deepCopy(this.props.layers);
                            this.setState({ layers: layers });
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

                const controller = this.callbacksManager.controller;
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

                    //if (wellsLayer)
                    //    wellsLayer.setSelection(event.wellname, [event.md, undefined]);
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
                                    ? welllogs[wellIndex]
                                    : undefined
                            }
                            template={template}
                            colorTables={this.props.colorTables as ColorTable[]}
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
                                this.callbacksManager.onCreateController
                            }
                            onInfo={this.callbacksManager.onInfo}
                            onContentSelection={this.onContentSelection}
                            onTrackScroll={this.onTrackScroll}
                        />
                    </div>
                    <WellLogInfoPanel
                        header="Readout"
                        callbacksManager={this.callbacksManager}
                    />
                </div>
            </div>
        );
    }
}

const WellLogViewOptions_propTypes = PropTypes.shape({
    /**
     * The maximum zoom value
     */
    maxContentZoom: PropTypes.number,
    /**
     * The maximum number of visible tracks
     */
    maxVisibleTrackNum: PropTypes.number,
    /**
     * Validate JSON datafile against schema
     */
    checkDatafileSchema: PropTypes.bool,
    /**
     * Hide titles of the track. Default is false
     */
    hideTrackTitle: PropTypes.bool,
    /**
     * Hide legends of the track. Default is false
     */
    hideTrackLegend: PropTypes.bool,
});

MapAndWellLogViewer.propTypes = {
    ...SubsurfaceViewer.propTypes,

    /**
     * WellLogView additional options
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    welllogOptions: WellLogViewOptions_propTypes as any /*PropTypes.object,*/,
};
