import React from "react";
import { WeakValidationMap } from "react";
import DeckGLMap from "../DeckGLMap";
import { DeckGLMapProps } from "../DeckGLMap";
import { Color } from "@deck.gl/core/typed";

import { WellsLayer } from "../DeckGLMap/layers";
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

import { WellLogController } from "./components/WellLogView";
import { LogViewer } from "@equinor/videx-wellog";
import { Info } from "./components/InfoTypes";
import { MapMouseEvent } from "../DeckGLMap/components/Map";

import InfoPanel from "./components/InfoPanel";
import WellLogViewWithScroller from "./components/WellLogViewWithScroller";
import { axisTitles, axisMnemos } from "./utils/axes";
import { fillInfos } from "./utils/fill-info";
import { getDiscreteMeta, indexOfElementByName } from "./utils/tracks";
import { deepCopy } from "./utils/tracks";

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

type Props = DeckGLMapProps;

interface State {
    wellIndex: number | undefined;
    infos: Info[];
    controller?: WellLogController;
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
    constructor(props: Props, state: State) {
        super(props, state);
        this.state = {
            wellIndex: undefined,
            infos: [],
            editedData: props.editedData,
            layers: props.layers,
        };
        this.onInfo = this.onInfo.bind(this);
        this.onCreateController = this.onCreateController.bind(this);
        this.onContentSelection = this.onContentSelection.bind(this);
        this.onTrackScroll = this.onTrackScroll.bind(this);

        this.onMouseEvent = this.onMouseEvent.bind(this);
    }
    componentDidUpdate(prevProps: Props /*, prevState: State*/): void {
        if (this.props.editedData !== prevProps.editedData) {
            this.setState({ editedData: this.props.editedData });
            0;
        }
    }
    onInfo(
        x: number,
        logController: LogViewer,
        iFrom: number,
        iTo: number
    ): void {
        const infos = fillInfos(
            x,
            logController,
            iFrom,
            iTo,
            [] //this.collapsedTrackIds,
            //this.props.readoutOptions
        );

        this.setState({ infos: infos });
    }

    onCreateController(controller: WellLogController): void {
        this.setState({ controller: controller });
    }
    onContentSelection(): void {
        const controller = this.state.controller;
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
        const controller = this.state.controller;
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

                        // Force to rerender ColorLegend after
                        setTimeout(() => {
                            const layers = deepCopy(this.props.layers);
                            this.setState({ layers: layers });
                        }, 200);
                    }
                }
            }
        }
    }

    onMouseEvent(event: MapMouseEvent): void {
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

                const controller = this.state.controller;
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

                        this.state.controller?.selectContent([
                            event.md,
                            this.state.selection?.[1],
                        ]);

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
        return (
            <div style={{ height: "100%", width: "100%", display: "flex" }}>
                <div
                    style={{
                        height: "100%",
                        width: "70%",
                        position: "relative",
                    }}
                >
                    <div>
                        <DeckGLMap
                            {...this.props}
                            layers={this.state.layers}
                            editedData={this.state.editedData}
                            onMouseEvent={this.onMouseEvent}
                            selection={{
                                well: wellName,
                                selection: this.state.selection,
                            }}
                        />
                    </div>
                </div>
                <div
                    style={{
                        height: "85%",
                        width: "30%",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div
                        style={{
                            textAlign: "center",
                            flex: "0 0",
                        }}
                    >
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

                        {wellName
                            ? wellName
                            : "Select well by clicking on the map"}
                    </div>
                    <div
                        style={{
                            flex: "1 1",
                            height: "90%",
                            minWidth: "25px",
                            width: "100%",
                        }}
                    >
                        <div className="welllogview-error">
                            {wellIndex === -1
                                ? "No well logs for the well '" + wellName + "'"
                                : ""}
                        </div>
                        <WellLogViewWithScroller
                            welllog={
                                wellIndex !== undefined
                                    ? welllogs[wellIndex]
                                    : undefined
                            }
                            template={template}
                            colorTables={this.props.colorTables as ColorTable[]}
                            wellpick={wellpick}
                            maxVisibleTrackNum={1}
                            primaryAxis={"md"}
                            axisTitles={axisTitles}
                            axisMnemos={axisMnemos}
                            onInfo={this.onInfo}
                            onCreateController={this.onCreateController}
                            onContentSelection={this.onContentSelection}
                            onTrackScroll={this.onTrackScroll}
                        />
                    </div>
                    <div
                        style={{
                            flex: "0 0",
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            width: "100%",
                        }}
                    >
                        <InfoPanel header="Readout" infos={this.state.infos} />
                    </div>
                </div>
            </div>
        );
    }
}

MapAndWellLogViewer.propTypes = { ...DeckGLMap.propTypes };
