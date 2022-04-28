import React from "react";
import { ReactNode } from "react";
import DeckGLMap from "../DeckGLMap";
import { DeckGLMapProps } from "../DeckGLMap";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const template = require("../../../demo/example-data/welllog_template_2.json");
import { WellLog } from "./components/WellLogTypes";
const welllogs =
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("../../../demo/example-data/volve_logs.json") as WellLog[];

// eslint-disable-next-line @typescript-eslint/no-var-requires
const colorTables = require("@emerson-eps/color-tables/src/component/color-tables.json");
//const colorTables = require("../../../demo/example-data/color-tables.json");

import { WellLogController } from "./components/WellLogView";
import { LogViewer } from "@equinor/videx-wellog";
import { Info } from "./components/InfoTypes";
import { MapMouseEvent } from "../DeckGLMap/components/Map";

//import AxisSelector from "./components/AxisSelector";
import InfoPanel from "./components/InfoPanel";
//import ZoomSlider from "./components/ZoomSlider";
import WellLogViewWithScroller from "./components/WellLogViewWithScroller";
import { axisTitles, axisMnemos } from "./utils/axes";
import { fillInfos } from "./utils/fill-info";
import { getDiscreteMeta } from "./utils/tracks";

import {
    TemplateTrack,
    TemplatePlotTypes,
} from "./components/WellLogTemplateTypes";

type Props = DeckGLMapProps;

interface State {
    wellIndex: number | undefined;
    infos: Info[];
    controller?: WellLogController;
    editedData?: Record<string, unknown>;

    layers?: Record<string, unknown>[];

    wellName: string | undefined;
}

function findLog(controller: WellLogController, logName: string): number {
    const template = controller.getTemplate();
    return template.tracks.findIndex(
        (track) => track.plots[0]?.name === logName
    );
}

function detectType(welllog: WellLog, logName: string): TemplatePlotTypes {
    if (welllog) {
        const meta = getDiscreteMeta(welllog, logName); // non-standard extention
        if (meta) return "stacked";
    }
    return "line";
}

export class MapAndWellLogViewer extends React.Component<Props, State> {
    constructor(props: Props, state: State) {
        super(props, state);
        this.state = {
            wellIndex: undefined,
            infos: [],
            editedData: props.editedData,
            layers: props.layers,
            wellName: undefined,
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
        //const baseDomain = controller.getContentBaseDomain();
        //const domain = controller.getContentDomain();
        //const selection = controller.getContentSelection();
        //console.log(selection);
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
                        let colorTable = templatePlot.colorTable;
                        if (templatePlot.style) {
                            //styles(plot.style)
                            //colorTable = style.colorTable;
                        } else colorTable = templatePlot.colorTable;

                        if (colorTable) wells_layer["logColor"] = colorTable; // "Stratigraphy"; // "Colors_set_1"
                        const layers = JSON.parse(
                            JSON.stringify(this.props.layers)
                        );
                        this.setState({ layers: layers });

                        // Force to rerender ColorLegend after
                        setTimeout(() => {
                            const layers = JSON.parse(
                                JSON.stringify(this.props.layers)
                            );
                            this.setState({ layers: layers });
                        }, 200);
                    }
                }
            }
        }
    }

    onMouseEvent(event: MapMouseEvent): void {
        if (event.type == "click")
            console.log(
                "type =",
                event.type,
                " x =",
                event.x,
                " y =",
                event.y,
                " wellname =",
                event.wellname,
                " md =",
                event.md,
                " tvd =",
                event.tvd
            );
        if (event.wellname !== undefined) {
            if (event.type == "click") {
                const iWell = welllogs.findIndex(
                    (welllog) => welllog.header.well === event.wellname
                );
                this.setState((state: Readonly<State>) => {
                    if (state.wellIndex === iWell) return null;
                    return {
                        wellIndex: iWell,
                        wellName: event.wellname,
                    };
                });

                const controller = this.state.controller;
                if (controller) {
                    const info = event.infos.find(
                        (info) => info.layer?.id === "wells-layer"
                    );
                    if (info && info.layer) {
                        const logName = info.layer.props?.logName;
                        {
                            let iTrack = findLog(controller, logName);
                            if (iTrack < 0) {
                                // add missed TemplatTrack for the givet logName
                                //const welllog = info.object is Feature or WellLog;
                                const welllog = welllogs[iWell];
                                const type: TemplatePlotTypes = detectType(
                                    welllog,
                                    logName
                                );
                                const templateNew = JSON.parse(
                                    JSON.stringify(
                                        /*controller.getTemplate()*/ template
                                    )
                                );
                                const templateTrack: TemplateTrack = {
                                    title: logName,
                                    plots: [
                                        {
                                            name: logName,
                                            type: type,
                                            color: "red",
                                        },
                                    ],
                                };
                                templateNew.tracks.push(templateTrack);

                                controller.setTemplate(templateNew);

                                iTrack = findLog(controller, logName);
                            }
                            controller.scrollTrackTo(iTrack);
                        }

                        //layer.props.logrunName
                    }
                }
            }
            if (event.md !== undefined && this.state.controller)
                this.state.controller.selectContent([event.md, undefined]);
        }
    }
    render(): ReactNode {
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
                            colorTables={colorTables}
                            setProps={(
                                updatedProps: Record<string, unknown>
                            ) => {
                                this.setState({
                                    editedData: updatedProps[
                                        "editedData"
                                    ] as any,
                                });
                            }}
                            onMouseEvent={this.onMouseEvent}
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
                            flex: "1 1",
                            height: "90%",
                            minWidth: "25px",
                            width: "100%",
                        }}
                    >
                        <div className="welllogview-error">
                            {this.state.wellIndex === -1
                                ? "No well logs for the well '" +
                                  this.state.wellName +
                                  "'"
                                : ""}
                        </div>
                        <WellLogViewWithScroller
                            welllog={
                                this.state.wellIndex !== undefined
                                    ? welllogs[this.state.wellIndex]
                                    : undefined
                            }
                            template={template}
                            colorTables={
                                colorTables
                                //this.props.colorTables as ColorTable[]
                            }
                            maxVisibleTrackNum={1}
                            primaryAxis={"md"}
                            axisTitles={axisTitles}
                            axisMnemos={axisMnemos}
                            onInfo={this.onInfo}
                            onCreateController={this.onCreateController}
                            onContentSelection={this.onContentSelection}
                            onTrackScroll={this.onTrackScroll}
                        ></WellLogViewWithScroller>
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
                        {/*<AxisSelector
                            header="Primary scale"
                        />*/}
                        <InfoPanel header="Readout" infos={this.state.infos} />
                        {/*<div style={{ paddingLeft: "10px", display: "flex" }}>
                            <span>Zoom:</span>
                            <span
                                style={{
                                    flex: "1 1 100px",
                                    padding: "0 20px 0 10px",
                                }}
                            >
                            <ZoomSlider />
                            </span>
                        </div>*/}
                    </div>
                </div>
            </div>
        );
    }
}
