import React from "react";
import { ReactNode } from "react";
import DeckGLMap from "../DeckGLMap";
import { DeckGLMapProps } from "../DeckGLMap";

/*
let template = {
    name: "Template LOG",
    scale: {
        primary: "tvd",
    },
    tracks: [
        {
            plots: [
                {
                    name: "ZONELOG",
                    style: "discrete",
                },
            ],
        },
    ],
    styles: [
        {
            name: "discrete",
            type: "stacked",
        },
    ],
};
*/

const welllogs = require("../../../demo/example-data/volve_logs.json");

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

type Props = DeckGLMapProps;

interface State {
    wellIndex: number;
    infos: Info[];
    controller?: WellLogController;
    editedData?: Record<string, unknown>;
}

export class MapAndWellLogViewer extends React.Component<Props, State> {
    constructor(props: Props, state: State) {
        super(props, state);
        this.state = {
            wellIndex: -1,
            infos: [],
            editedData: props.editedData,
        };
        this.onInfo = this.onInfo.bind(this);
        this.onCreateController = this.onCreateController.bind(this);
        this.onContentSelection = this.onContentSelection.bind(this);
        this.onMouseEvent = this.onMouseEvent.bind(this);
    }
    componentDidUpdate(prevProps: Props /*, prevState: State*/): void {
        if (this.props.editedData !== prevProps.editedData) {
            this.setState({ editedData: this.props.editedData });
            0;
        }
    }
    onInfo(x: number, logController: LogViewer, iFrom: number, iTo: number) {
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
                let i = 0;
                for (const welllog of welllogs) {
                    if (welllog.header.well === event.wellname) {
                        this.setState({ wellIndex: i });
                        break;
                    }
                    i++;
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
                            editedData={this.state.editedData}
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
                        <WellLogViewWithScroller
                            welllog={welllogs[this.state.wellIndex]}
                            template={
                                //template
                                require("../../../demo/example-data/welllog_template_2.json")
                            }
                            colorTables={require("../../../demo/example-data/color-tables.json")}
                            maxVisibleTrackNum={1}
                            primaryAxis={"md"}
                            axisTitles={axisTitles}
                            axisMnemos={axisMnemos}
                            onInfo={this.onInfo}
                            onCreateController={this.onCreateController}
                            onContentSelection={this.onContentSelection}
                        ></WellLogViewWithScroller>
                    </div>
                    <div
                        style={{
                            flex: "0 0",
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            width: "255px",
                            minWidth: "255px",
                            maxWidth: "255px",
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
