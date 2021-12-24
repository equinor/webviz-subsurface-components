import React, { Component, ReactNode } from "react";

import PropTypes from "prop-types";

import WellLogView from "./components/WellLogView";
import { TrackMouseEvent } from "./components/WellLogView";
import InfoPanel from "./components/InfoPanel";
import AxisSelector from "./components/AxisSelector";

import ZoomSlider from "./components/ZoomSlider";

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
///////////

import { fillInfos } from "./utils/fill-info";
import { LogViewer } from "@equinor/videx-wellog";

import { Info, InfoOptions } from "./components/InfoTypes";

interface Props {
    welllog: WellLog[];
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

class SyncLogViewer extends Component<Props, State> {
    public static propTypes: Record<string, unknown>;

    controller: (WellLogController | null)[];
    scroller: (Scroller | null)[];

    collapsedTrackIds: (string | number)[];

    onCreateControllerBind: ((controller: WellLogController) => void)[];
    onScrollerScrollBind: ((x: number, y: number) => void)[];
    onTrackScrollBind: (() => void)[];
    onContentRescaleBind: (() => void)[];

    constructor(props: Props) {
        super(props);

        const _axes = this.props.welllog.map((welllog) =>
            getAvailableAxes(welllog, axisMnemos)
        );
        const axes = _axes[0];
        let primaryAxis = axes[0];
        this.props.template.scale.primary = "tvd"; //!!!!!
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

        this.controller = [null, null];
        this.scroller = [null, null];

        this.collapsedTrackIds = [];

        this.onCreateControllerBind = [
            this.onCreateController.bind(this, 0),
            this.onCreateController.bind(this, 1),
        ];

        this.onInfo = this.onInfo.bind(this);

        this.onChangePrimaryAxis = this.onChangePrimaryAxis.bind(this);

        this.onScrollerScrollBind = [
            this.onScrollerScroll.bind(this, 0),
            this.onScrollerScroll.bind(this, 1),
        ];
        this.onTrackScrollBind = [
            this.onTrackScroll.bind(this, 0),
            this.onTrackScroll.bind(this, 1),
        ];

        this.onContentRescaleBind = [
            this.onContentRescale.bind(this, 0),
            this.onContentRescale.bind(this, 1),
        ];

        this.onZoomSliderChange = this.onZoomSliderChange.bind(this);

        this.onInfoGroupClick = this.onInfoGroupClick.bind(this);
    }

    componentDidMount(): void {
        this.setScrollerPosAndZoom(0);
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
            this.props.template !== prevProps.template /*||
            this.props.colorTables !== prevProps.colorTables*/
        ) {
            const _axes = this.props.welllog.map((welllog) =>
                getAvailableAxes(welllog, axisMnemos)
            );
            const axes = _axes[0];
            let primaryAxis = axes[0];
            this.props.template.scale.primary = "tvd"; //!!!!!
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
            this.updateReadoutPanel();
        }
    }

    updateReadoutPanel(): void {
        const controller = this.controller[0];
        if (controller)
            controller.selectContent(controller.getContentSelection()); // force to update readout panel
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
    onCreateController(iView: number, controller: WellLogController): void {
        this.controller[iView] = controller;
        if (this.props.onCreateController)
            // set callback to component's caller
            this.props.onCreateController(controller);

        this.setControllerZoom();
        this.setScrollerPosAndZoom(iView);
        //this.setSliderZoom();
    }
    // callback function from WellLogView
    onTrackScroll(iView: number): void {
        this.setScrollerPosAndZoom(iView);
    }
    // callback function from WellLogView
    onContentRescale(iView: number): void {
        this.setScrollerPosAndZoom(iView);
        this.setSliderZoom();

        const controller = this.controller[iView];
        if (controller) {
            const selection = controller.getContentSelection();
            for (const _controller of this.controller) {
                if (!_controller || _controller == controller) continue;
                _controller.selectContent(selection);
            }
        }
        if (this.props.onContentRescale) this.props.onContentRescale();
    }

    // callback function from Axis selector
    onChangePrimaryAxis(value: string): void {
        this.setState({ primaryAxis: value });
    }
    // callback function from Zoom slider
    onZoomSliderChange(value: number): void {
        const controller = this.controller[0]; // master
        if (controller) {
            controller.zoomContent(value);

            //const baseDomain = controller.getContentBaseDomain();
            const domain = controller.getContentDomain();
            for (const _controller of this.controller) {
                if (!_controller || _controller == controller) continue;
                _controller.zoomContentTo(domain);
            }
        }
    }
    // callback function from Scroller
    onScrollerScroll(iView: number, x: number, y: number): void {
        const controller = this.controller[iView];
        if (controller) {
            const fContent = this.props.horizontal ? x : y; // fraction
            controller.scrollContentTo(fContent);

            const posMax = controller.getTrackScrollPosMax();
            let posTrack = (this.props.horizontal ? y : x) * posMax;
            posTrack = Math.round(posTrack);
            controller.scrollTrackTo(posTrack);

            const domain = controller.getContentDomain();
            for (const _controller of this.controller) {
                if (!_controller || _controller == controller) continue;
                if (!iView) _controller.zoomContentTo(domain);
                _controller.scrollTrackTo(posTrack);
            }
        }
    }

    setSliderZoom(): void {
        if (!this.controller[0]) return;
        const zoom = this.controller[0].getContentZoom();

        if (Math.abs(Math.log(this.state.contentZoom / zoom)) > 0.01) {
            this.setState({ contentZoom: zoom }); // for Zoom slider
        }
    }

    setScrollerPosAndZoom(iView: number): void {
        let x: number, y: number;
        let xZoom: number, yZoom: number;
        /*for (let iView = 0; iView < this.controller.length; iView++)*/ {
            const scroller = this.scroller[iView];
            if (!scroller) return; //continue;
            const controller = this.controller[iView];
            if (!controller) {
                x = y = 0.0;
                xZoom = yZoom = 1.0;
            } else {
                const fContent = controller.getContentScrollPos(); // fraction

                /*let f;
                {
                    const [b1, b2] = controller.getContentBaseDomain();
                    const [d1, d2] = controller.getContentDomain();
                    const w = b2 - b1 - (d2 - d1);
                    f = w ? (d1 - b1) / w : 0;
                }*/

                //const baseDomain = controller.getContentBaseDomain();
                const domain = controller.getContentDomain();
                for (const _controller of this.controller) {
                    if (!_controller || _controller == controller) continue;
                    _controller.zoomContentTo(domain);
                }

                const fTrack = controller.getTrackScrollPosMax()
                    ? controller.getTrackScrollPos() /
                      controller.getTrackScrollPosMax()
                    : 0.0; // fraction
                x = this.props.horizontal ? fContent : fTrack;
                y = this.props.horizontal ? fTrack : fContent;

                const contentZoom = controller.getContentZoom();
                const trackZoom = controller.getTrackZoom();
                xZoom = this.props.horizontal ? contentZoom : trackZoom;
                yZoom = this.props.horizontal ? trackZoom : contentZoom;
            }

            if (scroller) {
                scroller.zoom(xZoom, yZoom);
                scroller.scrollTo(x, y);
            }
        }
    }

    setControllerZoom(): void {
        for (const controller of this.controller) {
            if (!controller) continue;
            if (this.props.domain) controller.zoomContentTo(this.props.domain);
        }
    }
    setControllerSelection(): void {
        for (const controller of this.controller) {
            if (!controller) continue;
            if (this.props.selection)
                controller.selectContent(this.props.selection);
        }
    }
    onInfoGroupClick(trackId: string | number): void {
        const i = this.collapsedTrackIds.indexOf(trackId);
        if (i < 0) this.collapsedTrackIds.push(trackId);
        else delete this.collapsedTrackIds[i];

        this.updateReadoutPanel();
    }

    render(): ReactNode {
        const maxContentZoom = 256;
        return (
            <div style={{ height: "100%", width: "100%", display: "flex" }}>
                <Scroller
                    //style={{ height: "100%", flex: "1 1 auto" }}
                    ref={(el) => (this.scroller[0] = el as Scroller)}
                    onScroll={this.onScrollerScrollBind[0]}
                >
                    <WellLogView
                        welllog={this.props.welllog[0]}
                        template={this.props.template}
                        colorTables={this.props.colorTables}
                        horizontal={this.props.horizontal}
                        maxVisibleTrackNum={this.props.horizontal ? 2 : 3}
                        maxContentZoom={maxContentZoom}
                        primaryAxis={this.state.primaryAxis}
                        axisTitles={axisTitles}
                        axisMnemos={axisMnemos}
                        onInfo={this.onInfo}
                        onCreateController={this.onCreateControllerBind[0]}
                        onTrackMouseEvent={onTrackMouseEvent}
                        onTrackScroll={this.onTrackScrollBind[0]}
                        onContentRescale={this.onContentRescaleBind[0]}
                    />
                </Scroller>
                <Scroller
                    //style={{ height: "100%", flex: "1 1 auto" }}
                    ref={(el) => (this.scroller[1] = el as Scroller)}
                    onScroll={this.onScrollerScrollBind[1]}
                >
                    <WellLogView
                        welllog={this.props.welllog[1]}
                        template={this.props.template}
                        colorTables={this.props.colorTables}
                        horizontal={this.props.horizontal}
                        maxVisibleTrackNum={this.props.horizontal ? 2 : 3}
                        maxContentZoom={maxContentZoom}
                        primaryAxis={this.state.primaryAxis}
                        axisTitles={axisTitles}
                        axisMnemos={axisMnemos}
                        onInfo={this.onInfo}
                        onCreateController={this.onCreateControllerBind[1]}
                        onTrackMouseEvent={onTrackMouseEvent}
                        onTrackScroll={this.onTrackScrollBind[1]}
                        onContentRescale={this.onContentRescaleBind[1]}
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
                            <ZoomSlider
                                value={this.state.contentZoom}
                                max={maxContentZoom}
                                onChange={this.onZoomSliderChange}
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
SyncLogViewer.propTypes = {
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

export default SyncLogViewer;
