import React, { Component, ReactNode } from "react";

import PropTypes from "prop-types";

import WellLogView from "./components/WellLogView";
import { TrackMouseEvent } from "./components/WellLogView";
import InfoPanel from "./components/InfoPanel";
import AxisSelector from "./components/AxisSelector";

import Slider from "@material-ui/core/Slider"; // for Zoom value selector

import { WellLog } from "./components/WellLogTypes";
import { Template } from "./components/WellLogTemplateTypes";
import { ColorTable } from "./components/ColorTableTypes";

import { WellLogController } from "./components/WellLogView";

import Scroller from "./components/Scroller";

import { getAvailableAxes } from "./utils/tracks";

import { axisTitles, axisMnemos } from "./utils/axes";

import ReactDOM from "react-dom";
import { Plot } from "@equinor/videx-wellog";
import { SimpleMenu, editPlots } from "./components/LocalMenus";

function onTrackMouseEvent(wellLogView: WellLogView, ev: TrackMouseEvent) {
    const track = ev.track;
    if (ev.type === "click") {
        wellLogView.selectTrack(track, !wellLogView.isTrackSelected(track)); // toggle selection
    } else if (ev.type === "dblclick") {
        wellLogView.selectTrack(track, true);
        if (ev.area === "title") {
            wellLogView.editTrack(ev.element, ev.track);
        } else {
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
///////////  for Scale Slider
function valueLabelFormat(value: number /*, index: number*/): string {
    return value.toFixed(Number.isInteger(value) || value > 20 ? 0 : 1);
}
///////////

import { fillInfos } from "./utils/fill-info";
import { LogViewer } from "@equinor/videx-wellog";

import { Info, InfoOptions } from "./components/InfoTypes";

interface Props {
    welllog: WellLog;
    template: Template;
    colorTables: ColorTable[];
    horizontal?: boolean;

    domain?: [number, number]; //  initial visible range
    selection?: [number | undefined, number | undefined]; //  initial selected range [a,b]

    readoutOptions?: InfoOptions; // options for readout

    // callbacks
    onContentRescale: () => void;
    onCreateController?: (controller: WellLogController) => void;
}
interface State {
    axes: string[]; // axes available in welllog
    primaryAxis: string;
    infos: Info[];

    contentZoom: number; // value for zoom slider
}

class WellLogViewer extends Component<Props, State> {
    public static propTypes: Record<string, unknown>;

    controller: WellLogController | null;
    scroller: Scroller | null;
    collapsedTrackIds: (string | number)[];

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

            contentZoom: 4.0,
        };

        this.controller = null;
        this.scroller = null;

        this.collapsedTrackIds = [];

        this.onCreateController = this.onCreateController.bind(this);

        this.onInfo = this.onInfo.bind(this);

        this.onChangePrimaryAxis = this.onChangePrimaryAxis.bind(this);

        this.onScrollerScroll = this.onScrollerScroll.bind(this);
        this.onTrackScroll = this.onTrackScroll.bind(this);

        this.onContentRescale = this.onContentRescale.bind(this);

        this.onZoomSliderChange = this.onZoomSliderChange.bind(this);

        this.onInfoGroupClick = this.onInfoGroupClick.bind(this);
    }

    componentDidMount(): void {
        this.setScrollerPosAndZoom();
        this.setSliderZoom();
    }

    shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
        {
            //compare (Object.keys(nextProps), Object.keys(this.props))
            for (const p in nextProps) {
                // eslint-disable-next-line
                if ((nextProps as any)[p] !== (this.props as any)[p]) {
                    //console.log(p /*, nextProps[p], this.props[p]*/);
                    return true;
                }
            }
            for (const s in nextState) {
                // eslint-disable-next-line
                if ((nextState as any)[s] !== (this.state as any)[s]) {
                    //console.log(s /*, nextState[s], this.state[s]*/);
                    return true;
                }
            }
        }
        //return true;
        return false;
    }

    componentDidUpdate(prevProps: Props /*, prevState: State*/): void {
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

        if (
            this.props.domain &&
            (!prevProps.domain ||
                this.props.domain[0] !== prevProps.domain[0] ||
                this.props.domain[1] !== prevProps.domain[1])
        ) {
            this.setControllerZoom();
        }

        if (
            this.props.selection &&
            (!prevProps.selection ||
                this.props.selection[0] !== prevProps.selection[0] ||
                this.props.selection[1] !== prevProps.selection[1])
        ) {
            this.setControllerSelection();
        }

        if (
            this.props.readoutOptions &&
            (!prevProps.readoutOptions ||
                this.props.readoutOptions.allTracks !==
                    prevProps.readoutOptions.allTracks ||
                this.props.readoutOptions.grouping !==
                    prevProps.readoutOptions.grouping)
        ) {
            if (this.controller)
                this.controller.selectContent(
                    this.controller.getContentSelection()
                ); // force to update readout panel
        }
    }

    // callback function from WellLogView
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
            this.collapsedTrackIds,
            this.props.readoutOptions
        );

        this.setState({
            infos: infos,
        });
    }
    // callback function from WellLogView
    onCreateController(controller: WellLogController): void {
        this.controller = controller;
        if (this.props.onCreateController)
            // set callback to component's caller
            this.props.onCreateController(controller);

        this.setControllerZoom();
        this.setScrollerPosAndZoom();
        //this.setSliderZoom();
    }
    // callback function from WellLogView
    onTrackScroll(): void {
        this.setScrollerPosAndZoom();
    }
    // callback function from WellLogView
    onContentRescale(): void {
        this.setScrollerPosAndZoom();
        this.setSliderZoom();
        if (this.props.onContentRescale) this.props.onContentRescale();
    }

    // callback function from Axis selector
    onChangePrimaryAxis(value: string): void {
        this.setState({ primaryAxis: value });
    }
    // callback function from Zoom slider
    onZoomSliderChange(
        _event: React.ChangeEvent<Record<string, unknown>>,
        value: number | number[]
    ): void {
        if (this.controller && typeof value === "number") {
            const zoom = 2 ** value;
            this.controller.zoomContent(zoom);
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

    setSliderZoom(): void {
        if (!this.controller) return;
        const zoom = this.controller.getContentZoom();

        if (Math.abs(Math.log(this.state.contentZoom / zoom)) > 0.01) {
            this.setState({ contentZoom: zoom }); // for Zoom slider
        }
    }

    setScrollerPosAndZoom(): void {
        if (!this.scroller) return;

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

            const contentZoom = this.controller.getContentZoom();
            const trackZoom = this.controller.getTrackZoom();
            xZoom = this.props.horizontal ? contentZoom : trackZoom;
            yZoom = this.props.horizontal ? trackZoom : contentZoom;
        }

        this.scroller.zoom(xZoom, yZoom);
        this.scroller.scrollTo(x, y);
    }

    setControllerZoom(): void {
        if (!this.controller) return;
        if (this.props.domain) this.controller.zoomContentTo(this.props.domain);
    }
    setControllerSelection(): void {
        if (!this.controller) return;
        if (this.props.selection)
            this.controller.selectContent(this.props.selection);
    }
    onInfoGroupClick(trackId: string | number): void {
        const i = this.collapsedTrackIds.indexOf(trackId);
        if (i < 0) this.collapsedTrackIds.push(trackId);
        else delete this.collapsedTrackIds[i];

        if (this.controller)
            this.controller.selectContent(
                this.controller.getContentSelection()
            ); // force to update readout panel
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
                        maxVisibleTrackNum={this.props.horizontal ? 3 : 5}
                        maxContentZoom={maxContentZoom}
                        primaryAxis={this.state.primaryAxis}
                        axisTitles={axisTitles}
                        axisMnemos={axisMnemos}
                        onInfo={this.onInfo}
                        onCreateController={this.onCreateController}
                        onTrackMouseEvent={onTrackMouseEvent}
                        onTrackScroll={this.onTrackScroll}
                        onContentRescale={this.onContentRescale}
                    />
                </Scroller>
                <div
                    style={{
                        flex: "0, 0",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        width: "255px",
                        minWidth: "255px",
                        maxWidth: "255px",
                    }}
                >
                    <AxisSelector
                        header="Primary scale"
                        axes={this.state.axes}
                        axisLabels={axisTitles}
                        value={this.state.primaryAxis}
                        onChange={this.onChangePrimaryAxis}
                    />
                    <InfoPanel
                        header="Readout"
                        onGroupClick={this.onInfoGroupClick}
                        infos={this.state.infos}
                    />
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
                                value={Math.log2(this.state.contentZoom)}
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

///
const InfoOptions_propTypes = PropTypes.shape({
    /**
     * Show not only visible tracks
     */
    allTracks: PropTypes.bool,
    /**
     * how group values. "" | "track"
     */
    grouping: PropTypes.string,
});

/*
 */
WellLogViewer.propTypes = {
    /**
     * The ID of this component, used to identify dash components
     * in callbacks. The ID needs to be unique across all of the
     * components in an app.
     */
    id: PropTypes.string.isRequired,

    /**
     * Array of JSON objects describing well log data
     */
    welllog: PropTypes.array.isRequired,

    /**
     * Prop containing track template data
     */
    template: PropTypes.object.isRequired,

    /**
     * Prop containing color table data
     */
    colorTables: PropTypes.array.isRequired,

    /**
     * Orientation of the track plots on the screen. Default is false
     */
    horizontal: PropTypes.bool,

    /**
     * Options for readout panel
     */
    readoutOptions: InfoOptions_propTypes /*PropTypes.object,*/,

    /**
     * Initial visible interval of the log data
     */
    domain: PropTypes.arrayOf(PropTypes.number),

    /**
     * Initial selected interval of the log data
     */
    selection: PropTypes.arrayOf(PropTypes.number),
};

export default WellLogViewer;
