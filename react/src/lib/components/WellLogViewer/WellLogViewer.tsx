import React, { Component, ReactNode } from "react";

import PropTypes from "prop-types";

import WellLogView from "./components/WellLogView";
import { TrackEvent } from "./components/WellLogView";
import InfoPanel from "./components/InfoPanel";
import AxisSelector from "./components/AxisSelector";

import Slider from "@material-ui/core/Slider"; // for Zoom value selector

import { WellLog } from "./components/WellLogTypes";
import { Template } from "./components/WellLogTemplateTypes";
import { ColorTable } from "./components/ColorTableTypes";

import { WellLogController } from "./components/WellLogView";

import Scroller from "./components/Scroller";

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

import ReactDOM from "react-dom";
import { SimpleMenu, editPlots } from "./components/LocalMenus";
import { Plot } from "@equinor/videx-wellog";

function onTrackEvent(wellLogView: WellLogView, ev: TrackEvent) {
    const track = ev.track;
    console.log(ev.area, ev.type);
    if (ev.type === "click") {
        wellLogView.selectTrack(track, !wellLogView.isTrackSelected(track)); // toggle selection
    } else if (ev.type === "dblclick") {
        wellLogView.selectTrack(track, true);
        /*if (ev.area !== "title")*/ {
            const plot: Plot | null = ev.plot;
            if (!plot) editPlots(ev.element, wellLogView, ev.track);
            else wellLogView.editPlot(ev.element, ev.track, plot);
        }
    } else if (ev.type === "contextmenu") {
        wellLogView.selectTrack(track, true);
        const el: HTMLElement = document.createElement("div");
        el.style.width = "10px";
        el.style.height = "3px";
        ev.element.appendChild(el);
        ReactDOM.render(
            <SimpleMenu
                type={ev.area}
                anchorEl={el}
                wellLogView={wellLogView}
                track={track}
            />,
            el
        );
    }
}
///////////
function valueLabelFormat(value: number /*, index: number*/): string {
    return value.toFixed(Number.isInteger(value) || value > 20 ? 0 : 1);
}

import { Info } from "./components/InfoTypes";

interface Props {
    welllog: WellLog;
    template: Template;
    colorTables: ColorTable[];
    horizontal?: boolean;
}
interface State {
    axes: string[]; // axes available in welllog
    primaryAxis: string;
    infos: Info[];

    zoomContent: number;
}

class WellLogViewer extends Component<Props, State> {
    public static propTypes: Record<string, unknown>;

    controller: WellLogController | null;
    scroller: Scroller | null;

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

            zoomContent: 1.0,
        };

        this.controller = null;
        this.scroller = null;

        this.onCreateController = this.onCreateController.bind(this);

        this.onInfo = this.onInfo.bind(this);

        this.onChangePrimaryAxis = this.onChangePrimaryAxis.bind(this);

        this.onScrollerScroll = this.onScrollerScroll.bind(this);
        this.onScrollTrackPos = this.onScrollTrackPos.bind(this);

        this.onZoomContent = this.onZoomContent.bind(this);

        this.onZoomSliderChange = this.onZoomSliderChange.bind(this);
    }

    componentDidMount(): void {
        this._enableScroll();
    }

    componentDidUpdate(prevProps: Props): void {
        if (
            this.props.welllog !== prevProps.welllog ||
            this.props.template !== prevProps.template ||
            this.props.colorTables !== prevProps.colorTables
        ) {
            const axes = getAvailableAxes(this.props.welllog, axisMnemos);
            let primaryAxis = axes[0];
            if (this.props.template && this.props.template.scale.primary) {
                if (axes.indexOf(this.props.template.scale.primary) < 0) {
                    if (this.props.welllog === prevProps.welllog) return; // nothing to update
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

    // callback function from WellLogView
    onInfo(infos: Info[]): void {
        this.setState({
            infos: infos,
        });
    }
    // callback function from WellLogView
    onCreateController(controller: WellLogController): void {
        this.controller = controller;
        this._enableScroll();
    }
    // callback function from WellLogView
    onScrollTrackPos(/*pos: number*/): void {
        this._enableScroll();
    }
    // callback function from WellLogView
    onZoomContent(zoom: number): boolean {
        this._enableScroll();

        let ret = false;
        if (Math.abs(Math.log(this.state.zoomContent / zoom)) > 0.01) {
            this.setState({ zoomContent: zoom }); // for Zoom slider
            ret = true;
        }
        return ret;
    }
    // callback function from Axis selector
    onChangePrimaryAxis(value: string): void {
        this.setState({ primaryAxis: value });
    }
    // callback function from Zoom slider
    onZoomSliderChange(
        event: React.ChangeEvent<Record<string, unknown>>,
        value: number | number[]
    ): void {
        event;
        if (this.controller && typeof value === "number") {
            const zoomContent = 2 ** value;
            this.controller.zoomContent(zoomContent);
        }
    }
    // callback function from Scroller
    onScrollerScroll(x: number, y: number): void {
        if (this.controller) {
            const fContent = this.props.horizontal ? x : y; // fraction
            this.controller.scrollContentTo(fContent);

            const posMax = this.controller.getTrackScrollPosMax();
            let posTrack = (this.props.horizontal ? y : x) * posMax;
            posTrack = Math.round(posTrack);
            this.controller.scrollTrackTo(posTrack);
        }
    }

    _enableScroll(): void {
        let x, y;
        let xZoom, yZoom;
        if (!this.controller) {
            x = y = 0.0;
            xZoom = yZoom = 1.0;
        } else {
            const fContent = this.controller.getContentScrollPos(); // fraction
            const fTrack = this.controller.getTrackScrollPosMax()
                ? this.controller.getTrackScrollPos() /
                  this.controller.getTrackScrollPosMax()
                : 0.0; // fraction
            x = this.props.horizontal ? fContent : fTrack;
            y = this.props.horizontal ? fTrack : fContent;

            const zoomContent = this.controller.getContentZoom();
            const zoomTrack =
                this.controller._graphTrackMax() /
                this.controller._maxTrackNum();

            xZoom = this.props.horizontal ? zoomContent : zoomTrack;
            yZoom = this.props.horizontal ? zoomTrack : zoomContent;
        }
        if (this.scroller) {
            this.scroller.zoom(xZoom, yZoom);
            this.scroller.scrollTo(x, y);
        }
    }

    render(): ReactNode {
        const maxContentZoom = 256;
        return (
            <div style={{ height: "100%", width: "100%", display: "flex" }}>
                <Scroller
                    //style={{ height: "100%", flex: "1 1 auto" }}
                    ref={(el) => (this.scroller = el as Scroller)}
                    onScroll={this.onScrollerScroll}
                >
                    <WellLogView
                        welllog={this.props.welllog}
                        template={this.props.template}
                        colorTables={this.props.colorTables}
                        horizontal={this.props.horizontal}
                        maxTrackNum={this.props.horizontal ? 3 : 5}
                        maxContentZoom={maxContentZoom}
                        primaryAxis={this.state.primaryAxis}
                        axisTitles={axisTitles}
                        axisMnemos={axisMnemos}
                        onInfo={this.onInfo}
                        onCreateController={this.onCreateController}
                        onTrackEvent={onTrackEvent}
                        onScrollTrackPos={this.onScrollTrackPos}
                        onZoomContent={this.onZoomContent}
                    />
                </Scroller>
                <div style={{ flex: "0, 0, 280px" }}>
                    <AxisSelector
                        header="Primary scale"
                        axes={this.state.axes}
                        axisLabels={axisTitles}
                        value={this.state.primaryAxis}
                        onChange={this.onChangePrimaryAxis}
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
                                value={Math.log2(this.state.zoomContent)}
                                min={0}
                                step={0.5}
                                max={Math.log2(maxContentZoom)}
                                scale={(x) => 2 ** x}
                                defaultValue={0}
                                onChange={this.onZoomSliderChange}
                                valueLabelDisplay="auto"
                                aria-labelledby="non-linear-slider"
                                getAriaValueText={valueLabelFormat}
                                valueLabelFormat={valueLabelFormat}
                            />
                        </span>
                    </div>
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

    // TODO: Add documentation
    welllog: PropTypes.array,

    // TODO: Add documentation
    template: PropTypes.object,
};

export default WellLogViewer;
