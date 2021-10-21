import React, { Component, ReactNode } from "react";

import PropTypes from "prop-types";
import WellLogView from "./components/WellLogView";
import InfoPanel from "./components/InfoPanel";
import AxisSelector from "./components/AxisSelector";

import Slider from "@material-ui/core/Slider"; // Zoom selector

import { WellLog } from "./components/WellLogTypes";
import { Template } from "./components/WellLogTemplateTypes";
import { WellLogController } from "./components/WellLogView";

import { getAvailableAxes } from "./utils/tracks";

const axisTitles: Record<string, string> = {
    // language dependent
    md: "MD",
    tvd: "TVD",
    time: "TIME",
};

// mnemos could be case insentitive ("Depth")
const axisMnemos: Record<string, string[]> = {
    // depth based logging data
    md: [
        "DEPTH",
        "DEPT",
        "MD" /*Measured Depth*/,
        "TDEP" /*"Tool DEPth"*/,
        "MD_RKB" /*Rotary Relly Bushing*/,
    ],
    tvd: [
        "TVD" /*True Vertical Depth*/,
        "TVDSS" /*SubSea*/,
        "DVER" /*"VERtical Depth"*/,
        "TVD_MSL" /*below Mean Sea Level*/,
    ],
    //  time based logging data
    time: ["TIME"],
};

interface Props {
    welllog: WellLog;
    template: Template;
    horizontal?: boolean;
}

interface Info {
    name?: string;
    units?: string;
    color: string;
    value: string;
    type: string; // line, linestep, area, ?dot?
}
interface State {
    axes: string[]; // axes available in welllog
    primaryAxis: string;
    infos: Info[];

    zoom: number;
}

class WellLogViewer extends Component<Props, State> {
    public static propTypes: Record<string, unknown>;

    controller?: WellLogController;

    constructor(props: Props) {
        super(props);

        const axes = getAvailableAxes(this.props.welllog, axisMnemos);
        let primaryAxis = axes[0];
        if (this.props.template && this.props.template.scale.primary) {
            if (axes.indexOf(this.props.template.scale.primary) >= 0)
                primaryAxis = this.props.template.scale.primary;
        }
        this.state = {
            primaryAxis: primaryAxis, //"md"
            axes: axes, //["md", "tvd"]
            infos: [],

            zoom: 1,
        };

        this.controller = undefined;
    }

    componentDidMount(): void {
        this._enableScroll();
    }

    componentDidUpdate(prevProps: Props): void {
        if (
            this.props.welllog !== prevProps.welllog ||
            this.props.template !== prevProps.template
        ) {
            const axes = getAvailableAxes(this.props.welllog, axisMnemos);
            let primaryAxis = axes[0];
            if (this.props.template && this.props.template.scale.primary) {
                if (axes.indexOf(this.props.template.scale.primary) < 0) {
                    if (this.props.welllog === prevProps.welllog)
                        return /* false*/; // nothing to update
                } else {
                    primaryAxis = this.props.template.scale.primary;
                }
            }
            this.setState({
                primaryAxis: primaryAxis,
                axes: axes,
                // will be changed by callback! infos: [],
            });
        }
    }

    // callback function
    onInfo(infos: Info[]): void {
        this.setState({
            infos: infos,
        });
    }
    // callback function
    onCreateController(controller: WellLogController): void {
        this.controller = controller;
        this._enableScroll();
    }
    // callback function
    onScrollTrackPos(pos: number): void {
        pos;
        //console.log("setScrollTrackPos("+pos+")");
        this._enableScroll();
    }
    // callback function
    onZoom(zoom: number): void {
        //console.log("callback setZoom(" + zoom + ")", Math.abs(Math.log(this.state.zoom / zoom)));
        if (Math.abs(Math.log(this.state.zoom / zoom)) > 0.01) {
            this.setState({ zoom: zoom });
        }
    }

    onChangePrimaryAxis(value: string): void {
        this.setState({
            primaryAxis: value,
            // will be changed by callback! infos: [],
        });
    }

    // scroll buttons support DEBUG CODE
    onScrollBegin(): void {
        if (this.controller) this.controller.scrollTrackTo(0);
    }

    onScrollUp(): void {
        if (this.controller)
            this.controller.scrollTrackTo(
                this.controller.getScrollTrackPos() - 1
            );
    }
    onScrollDown(): void {
        if (this.controller)
            this.controller.scrollTrackTo(
                this.controller.getScrollTrackPos() + 1
            );
    }

    onScrollEnd(): void {
        if (this.controller)
            this.controller.scrollTrackTo(
                this.controller.getScrollTrackPosMax() - 1
            );
    }

    _enableScroll(): void {
        const pos = this.controller ? this.controller.getScrollTrackPos() : 0;
        const n = this.controller ? this.controller.getScrollTrackPosMax() : 0;
        const down = document.getElementById("buttonDown") as HTMLButtonElement;
        const up = document.getElementById("buttonUp") as HTMLButtonElement;
        if (down) {
            if (pos + 1 <= n) down.removeAttribute("disabled");
            else down.setAttribute("disabled", "true");
        }
        if (up) {
            if (pos > 0) up.removeAttribute("disabled");
            else up.setAttribute("disabled", "true");
        }
    }
    // end of scroll buttons support DEBUG CODE

    valueLabelFormat(value: number, index: number): string {
        index;
        return value.toFixed(Number.isInteger(value) || value > 20 ? 0 : 1);
    }

    getZoomValue(): number {
        return Math.log2(this.state.zoom);
    }

    handleZoomChange(
        event: React.ChangeEvent<Record<string, unknown> /*{}*/>,
        value: number | number[]
    ): void {
        event;
        if (typeof value === "number") this.setState({ zoom: 2 ** value });
    }

    render(): ReactNode {
        return (
            <div style={{ height: "100%", width: "100%", display: "flex" }}>
                <div style={{ height: "100%", flex: "1 1 auto" }}>
                    <WellLogView
                        welllog={this.props.welllog}
                        template={this.props.template}
                        horizontal={this.props.horizontal}
                        primaryAxis={this.state.primaryAxis}
                        axisTitles={axisTitles}
                        axisMnemos={axisMnemos}
                        zoom={this.state.zoom}
                        maxTrackNum={5}
                        onInfo={this.onInfo.bind(this)}
                        onCreateController={this.onCreateController.bind(this)}
                        onScrollTrackPos={this.onScrollTrackPos.bind(this)}
                        onZoom={this.onZoom.bind(this)}
                    />{" "}
                </div>
                <div style={{ flex: "0, 0, 280px" }}>
                    <AxisSelector
                        header="Primary scale"
                        axes={this.state.axes}
                        axisLabels={axisTitles}
                        value={this.state.primaryAxis}
                        onChange={this.onChangePrimaryAxis.bind(this)}
                    />
                    <InfoPanel header="Readout" infos={this.state.infos} />
                    <br />
                    <div style={{ paddingLeft: "10px", display: "flex" }}>
                        <span>Zoom:</span>
                        <span
                            style={{
                                flex: "1 1 100px",
                                padding: "0 20px 0 10px",
                            }}
                        >
                            <Slider
                                value={this.getZoomValue()}
                                min={0}
                                step={0.5}
                                max={8}
                                scale={(x) => 2 ** x}
                                defaultValue={0}
                                onChange={this.handleZoomChange.bind(this)}
                                valueLabelDisplay="auto"
                                aria-labelledby="non-linear-slider"
                                getAriaValueText={this.valueLabelFormat.bind(
                                    this
                                )}
                                valueLabelFormat={this.valueLabelFormat.bind(
                                    this
                                )}
                            />
                        </span>
                    </div>

                    {/* DEBUG code
                    <br />
                    <div style={{ paddingLeft: "10px" }}>
                        Track scrolling:{" "}
                        {this.props.horizontal ? <br /> : <span />}
                        <button
                            id="buttonUp"
                            type="button"
                            onClick={this.onScrollUp.bind(this)}
                        >
                            {this.props.horizontal ? "\u25B2" : "\u25C4"}
                        </button>
                        {this.props.horizontal ? <br /> : <span />}
                        <button
                            id="buttonDown"
                            type="button"
                            onClick={this.onScrollDown.bind(this)}
                        >
                            {this.props.horizontal ? "\u25BC" : "\u25BA"}
                        </button>
                    </div>
                    */}
                </div>
            </div>
        );
    }
}
/*
 */
WellLogViewer.propTypes = {
    /**
     * The ID of this component, used to identify dash components
     * in callbacks. The ID needs to be unique across all of the
     * components in an app.
     */
    id: PropTypes.string.isRequired,

    // TODO: Add doc
    welllog: PropTypes.array,

    // TODO: Add doc
    template: PropTypes.object,
};

export default WellLogViewer;
