import React, { Component } from "react";

import PropTypes from "prop-types";

import WellLogViewWithScroller from "./components/WellLogViewWithScroller";
import { WellLogViewWithScrollerProps } from "./components/WellLogViewWithScroller";
import { argTypesWellLogViewScrollerProp } from "./components/WellLogViewWithScroller";
//import { _propTypesWellLogView } from "./components/WellLogView";

import { shouldUpdateWellLogView } from "./components/WellLogView";

import InfoPanel from "./components/InfoPanel";
import AxisSelector from "./components/AxisSelector";

import ZoomSlider from "./components/ZoomSlider";

import { WellLogController } from "./components/WellLogView";
import WellLogView from "./components/WellLogView";
import { WellLog } from "./components/WellLogTypes";
import { Template } from "./components/WellLogTemplateTypes";


import { getAvailableAxes } from "./utils/tracks";

import { onTrackMouseEvent } from "./utils/edit-track";
import { fillInfos } from "./utils/fill-info";
import { LogViewer } from "@equinor/videx-wellog";

import { Info, InfoOptions } from "./components/InfoTypes";

export interface WellLogViewerProps extends WellLogViewWithScrollerProps {
    readoutOptions?: InfoOptions; // options for readout

    // callbacks
    onContentRescale?: () => void;
    onContentSelection?: () => void;
    onTemplateChanged?: () => void;

    onCreateController?: (controller: WellLogController) => void;
}

export const argTypesWellLogViewerProp = {
    ...argTypesWellLogViewScrollerProp,
    readoutOptions: {
        description:
            "Options for readout panel.<br/>" +
            "allTracks: boolean — Show not only visible tracks,<br/>" +
            "grouping: string — How group values.",
        /*
        defaultValue: {
            allTracks: false,
            grouping: "by_track",
        }
        */
    },
    // callbacks...
};

interface State {
    primaryAxis: string;
}

interface RightPanelProps {
    parent : any;
    maxContentZoom: number| undefined;

    /**
     * Object from JSON file describing single well log data.
     */
    welllog: WellLog | undefined;

    /**
     * Prop containing track template data.
     */
    template: Template;

    readoutOptions?: InfoOptions; // options for readout

    onZoomChange: (zoom: number)=>void;
}

interface RightPanelState {
    axes: string[]; // axes available in welllog
    //primaryAxis: string;
    infos: Info[];

    zoomValue: number; // value for zoom slider
}

class RightPanel extends Component<RightPanelProps, RightPanelState> {
    collapsedTrackIds: (string | number)[];

    constructor(props: RightPanelProps) {
        super(props);

        const axes = getAvailableAxes(
            this.props.parent.props.welllog,
            this.props.parent.props.axisMnemos
        );

        this.state = {
            axes: axes, //["md", "tvd"]
            infos: [],

            zoomValue: 4.0,
        };

        this.collapsedTrackIds = [];

        this.onZoomSliderChange = this.onZoomSliderChange.bind(this);
        this.onVertScaleChange = this.onVertScaleChange.bind(this);
        this.onInfoGroupClick = this.onInfoGroupClick.bind(this);
     }

    componentDidUpdate(
        prevProps: RightPanelProps /*, prevState: RightPanelState*/
    ): void {
        if (
            this.props.parent.props.welllog !== prevProps.parent.props.welllog ||
            this.props.parent.props.axisMnemos !== prevProps.parent.props.axisMnemos
        ) {
            const axes = getAvailableAxes(
                this.props.parent.props.welllog,
                this.props.parent.props.axisMnemos
            );
            this.setState({
                axes: axes,
                // will be changed by callback! infos: [],
            });
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


    // callback function from zoom slider
    onZoomSliderChange(zoom: number): void {
        if (this.props.onZoomChange) 
            this.props.onZoomChange(zoom);
    }

    // callback function from Vertical Scale combobox
    onVertScaleChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        event.preventDefault();
        const zoom = this.getBaseVertScale()/parseFloat(event.target.value);
        if (this.props.onZoomChange) 
            this.props.onZoomChange(zoom);
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

    onInfoGroupClick(trackId: string | number): void {
        const i = this.collapsedTrackIds.indexOf(trackId);
        if (i < 0) this.collapsedTrackIds.push(trackId);
        else delete this.collapsedTrackIds[i];

        this.updateReadoutPanel();
    }
   

    updateReadoutPanel()
    {        
        this.props.parent.updateReadoutPanel();
    }

    // set zoom value to slider
    setZoomValue(): void {
        this.setState((state: Readonly<RightPanelState>) => {
            if (!this.props.parent.controller) return null;
            const zoom = this.props.parent.controller.getContentZoom();
            if (Math.abs(Math.log(state.zoomValue / zoom)) < 0.01)
                return null;
            return { zoomValue: zoom };
        });
    }

    getBaseVertScale() : number {
        const controller=this.props.parent.controller;
        if(controller) {
           const base=controller.getContentBaseDomain();
           const wellLogView = controller as WellLogView;
           const logController = wellLogView.logController;
           if(logController) {
              const overlay = logController?.overlay;
              const source = overlay?.elm.node();
              if (source) {
                const clientSize=this.props.parent.props.horizontal? source.clientWidth: source.clientHeight
                const m=clientSize*(0.0254/96); // "screen" CSS height in meters
                let scale=(base[1]-base[0])/m;
                console.log("1:", scale.toFixed(0))
                return scale
              }
           }
        }
        return 16000
    }

    render(): JSX.Element {
        let vertScale = this.getBaseVertScale()/this.state.zoomValue
        let r=vertScale>2000? 500: vertScale>200? 50: vertScale>20? 5: 1;
        let _vertScale = Number((vertScale/r).toFixed(0))*r
        if(vertScale<1500) vertScale=1000
        else if(vertScale<3500) vertScale=2000
        else if(vertScale<7500) vertScale=5000
        else if(vertScale<15000) vertScale=10000
        else if(vertScale<35000) vertScale=20000
        else if(vertScale<75000) vertScale=50000
        else vertScale=100000
        return <div
            style={{
                flexDirection: "column",
                width: "100%",
                height: "100%",
            }}
        >
        <div style={{ paddingLeft: "10px", display: "flex" }}>
            <span>Scale value:</span>
            <span style={{ paddingLeft: "10px"}}>
                <select onChange={this.onVertScaleChange} value={_vertScale}>
                    {_vertScale==vertScale? null: <option value={_vertScale}>{"1:"+_vertScale}</option>}
                    <option value="1000">1:1000</option> // 1 cm == 10 m
                    <option value="2000">1:2000</option>
                    <option value="5000">1:5000</option>
                    <option value="10000">1:10000</option> // 1 cm == 100 m
                    <option value="20000">1:20000</option>
                    <option value="50000">1:50000</option>
                    <option value="100000">1:100000</option> // 1 cm == 1 km
                </select>
            </span>
        </div>

        <AxisSelector
            header="Primary scale"
            axes={this.state.axes}
            axisLabels={this.props.parent.props.axisTitles}
            value={this.props.parent.state.primaryAxis}
            onChange={this.props.parent.onChangePrimaryAxis}
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
                    value={this.state.zoomValue}
                    max={this.props.maxContentZoom}
                    onChange={this.onZoomSliderChange}
                />
            </span>
         </div>
      </div>
    }
}


class WellLogViewer extends Component<WellLogViewerProps, State> {
    public static propTypes: Record<string, unknown>;

    controller: WellLogController | null;

    right:RightPanel|null;
    

    constructor(props: WellLogViewerProps) {
        super(props);

        const axes = getAvailableAxes(
            this.props.welllog,
            this.props.axisMnemos
        );
        let primaryAxis = axes[0];
        if (this.props.template && this.props.template.scale.primary) {
            if (axes.indexOf(this.props.template.scale.primary) >= 0)
                primaryAxis = this.props.template.scale.primary;
        }
        if (this.props.primaryAxis) primaryAxis = this.props.primaryAxis;
        this.state = {
            primaryAxis: primaryAxis, //"md"
        };

        this.controller = null;

        this.right = null;

        this.onCreateController = this.onCreateController.bind(this);

        this.onInfo = this.onInfo.bind(this);

        this.onChangePrimaryAxis = this.onChangePrimaryAxis.bind(this);

        this.onContentRescale = this.onContentRescale.bind(this);
        this.onContentSelection = this.onContentSelection.bind(this);
        this.onTemplateChanged = this.onTemplateChanged.bind(this);

        this.onZoomChange = this.onZoomChange.bind(this);
    }

    componentDidMount(): void {
        this.setZoomValue();
        this.updateReadoutPanel();
    }

    shouldComponentUpdate(
        nextProps: WellLogViewerProps,
        nextState: State
    ): boolean {
        if (shouldUpdateWellLogView(this.props, nextProps)) return true;

        return (
            !Object.is(this.props, nextProps) ||
            !Object.is(this.state, nextState)
        );
    }

    componentDidUpdate(
        prevProps: WellLogViewerProps /*, prevState: State*/
    ): void {
        if (
            this.props.welllog !== prevProps.welllog ||
            this.props.template !== prevProps.template ||
            this.props.axisMnemos !== prevProps.axisMnemos ||
            this.props.primaryAxis !== prevProps.primaryAxis /*||
            this.props.colorTables !== prevProps.colorTables*/
        ) {
            const axes = getAvailableAxes(
                this.props.welllog,
                this.props.axisMnemos
            );
            let primaryAxis = axes[0];
            if (this.props.template && this.props.template.scale.primary) {
                if (axes.indexOf(this.props.template.scale.primary) >= 0) {
                    primaryAxis = this.props.template.scale.primary;
                } else if (this.props.welllog === prevProps.welllog) return; // nothing to update
            }
            if (this.props.primaryAxis) primaryAxis = this.props.primaryAxis;
            this.setState({
                primaryAxis: primaryAxis,
            });
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
        const wellLogView = this.controller as WellLogView;
        if (wellLogView)
            wellLogView.setInfo(); // reflect new values
    }

    // callback function from WellLogView
    onInfo(
        x: number,
        logController: LogViewer,
        iFrom: number,
        iTo: number
    ): void {
        this.right?.onInfo(x, logController, iFrom, iTo)
    }
    // callback function from WellLogView
    onCreateController(controller: WellLogController): void {
        this.controller = controller;
        this.props.onCreateController?.(controller); // set callback to component's caller
    }
    // callback function from WellLogView
    onContentRescale(): void {
        this.setZoomValue();
        this.props.onContentRescale?.();
    }
    // callback function from WellLogView
    onContentSelection(): void {
        this.setZoomValue();
        this.props.onContentSelection?.();
    }
    onTemplateChanged(): void {
        this.props.onTemplateChanged?.();
    }

    // callback function from Axis selector
    onChangePrimaryAxis(value: string): void {
        this.setState({ primaryAxis: value });
    }
    
    // callback function from Right Panel
    onZoomChange(zoom: number): void {
        this.controller?.zoomContent(zoom);
    }

    // set zoom value to Right Panel
    setZoomValue(): void {
        this.right?.setZoomValue();
    }

    createRightPanel(): JSX.Element {
      return <RightPanel
        ref = { (el) => this.right = el }
        parent ={this}
        maxContentZoom={this.props.options?.maxContentZoom} 
        welllog={this.props.welllog}
        template={this.props.template}
        readoutOptions={this.props.readoutOptions}

        onZoomChange={this.onZoomChange}
      />;
    }

    render(): JSX.Element {
        return (
            <div style={{ height: "100%", width: "100%", display: "flex" }}>
                <WellLogViewWithScroller
                    welllog={this.props.welllog}
                    template={this.props.template}
                    colorTables={this.props.colorTables}
                    wellpick={this.props.wellpick}
                    horizontal={this.props.horizontal}
                    primaryAxis={this.state.primaryAxis}
                    axisTitles={this.props.axisTitles}
                    axisMnemos={this.props.axisMnemos}
                    options={this.props.options}
                    onInfo={this.onInfo}
                    onCreateController={this.onCreateController}
                    onTrackMouseEvent={onTrackMouseEvent}
                    onContentRescale={this.onContentRescale}
                    onContentSelection={this.onContentSelection}
                    onTemplateChanged={this.onTemplateChanged}
                />
                <div
                    style={{
                        flex: "0, 0",
                        display: "flex",
                        height: "100%",
                        width: "255px",
                        minWidth: "255px",
                        maxWidth: "255px",
                    }}
                >
                    {this.createRightPanel()}
                </div>
            </div>
        );
    }
}

///
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

WellLogViewer.propTypes = {
    //do not work with python dash!    ..._propTypesWellLogView(), // ...WellLogViewWithScroller.propTypes,
    /**
     * The ID of this component, used to identify dash components
     * in callbacks. The ID needs to be unique across all of the
     * components in an app.
     */
    id: PropTypes.string.isRequired,

    /**
     * An object from JSON file describing well log data
     */
    welllog: PropTypes.object.isRequired,

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
     * Initial visible interval of the log data
     */
    domain: PropTypes.arrayOf(PropTypes.number),

    /**
     * Initial selected interval of the log data
     */
    selection: PropTypes.arrayOf(PropTypes.number),

    /**
     * Well picks data
     */
    wellpick: PropTypes.object,

    /**
     * Primary axis id: " md", "tvd", "time"...
     */
    primaryAxis: PropTypes.string,

    /**
     * Log mnemonics for axes
     */
    axisTitles: PropTypes.object,

    /**
     * Names for axes
     */
    axisMnemos: PropTypes.object,

    /**
     * The maximum zoom value
     */
    maxContentZoom: PropTypes.number,

    /**
     * Set to true for default titles or to array of individial welllog titles
     */
    viewTitle: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.string,
        PropTypes.object /* react element */,
    ]),

    /**
     * WellLogView additional options
     */
    options: WellLogViewOptions_propTypes /*PropTypes.object,*/,

    /**
     * Options for readout panel
     */
    readoutOptions: InfoOptions_propTypes /*PropTypes.object,*/,
};

export default WellLogViewer;
