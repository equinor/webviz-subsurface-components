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

import { getAvailableAxes } from "./utils/tracks";

import { onTrackMouseEvent } from "./utils/edit-track";
import { fillInfos } from "./utils/fill-info";
import { LogViewer } from "@equinor/videx-wellog";

import { Info, InfoOptions } from "./components/InfoTypes";

export interface WellLogViewerProps extends WellLogViewWithScrollerProps {
    readoutOptions?: InfoOptions; // options for readout

    left?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    right?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    top?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    bottom?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);

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

    left: JSX.Element | null;
    right: JSX.Element | null;
    top: JSX.Element | null;
    bottom: JSX.Element | null;
}

class WellLogZoomSliderProps {
    parent: WellLogViewer;
    label?: string;
}

interface WellLogZoomSliderState {
    zoomValue: number; // value for zoom slider
}

export class WellLogZoomSlider extends Component<
    WellLogZoomSliderProps,
    WellLogZoomSliderState
> {
    constructor(props: WellLogZoomSliderProps, state: WellLogZoomSliderState) {
        super(props, state);
        this.state = {
            zoomValue: 4.0,
        };

        this.props.parent.onContentRescales.push(
            this.onContentRescale.bind(this)
        );

        this.onZoomSliderChange = this.onZoomSliderChange.bind(this);
    }
    componentWillUnmount(): void {
        //this.props.parent.onContentRescales.length=0;
    }

    onContentRescale(): void {
        this.setZoomValue();
    }

    // callback function from zoom slider
    onZoomSliderChange(zoom: number): void {
        this.props.parent.controller?.zoomContent(zoom);
    }

    setZoomValue(): void {
        this.setState((state: Readonly<WellLogZoomSliderState>) => {
            const controller = this.props.parent.controller;
            if (!controller) return null;
            const zoom = controller.getContentZoom();
            if (Math.abs(Math.log(state.zoomValue / zoom)) < 0.01) return null;
            return {
                zoomValue: zoom,
            };
        });
    }

    render() {
        return (
            <div
                style={{
                    paddingLeft: "10px",
                    paddingTop: "5px",
                    display: "flex",
                }}
            >
                {this.props.label && <span>{this.props.label}</span>}
                <span
                    style={{
                        flex: "1",
                        padding: "0 20px 0 10px",
                    }}
                >
                    <ZoomSlider
                        value={this.state.zoomValue}
                        max={this.props.parent.props.options?.maxContentZoom}
                        onChange={this.onZoomSliderChange}
                    />
                </span>
            </div>
        );
    }
}

function getVertScale(vertScale: number): {
    _vertScale: number;
    vertScale: number;
} {
    const r =
        vertScale > 2000 ? 500 : vertScale > 200 ? 50 : vertScale > 20 ? 5 : 1;
    const _vertScale = Number((vertScale / r).toFixed(0)) * r;
    if (vertScale < 1500) vertScale = 1000;
    else if (vertScale < 3500) vertScale = 2000;
    else if (vertScale < 7500) vertScale = 5000;
    else if (vertScale < 15000) vertScale = 10000;
    else if (vertScale < 35000) vertScale = 20000;
    else if (vertScale < 75000) vertScale = 50000;
    else vertScale = 100000;
    return { _vertScale, vertScale };
}

function getBaseVertScale(
    controller: WellLogController | null,
    horizontal: boolean | undefined
): number {
    if (controller) {
        const base = controller.getContentBaseDomain();
        const wellLogView = controller as WellLogView;
        const logController = wellLogView.logController;
        if (logController) {
            const overlay = logController?.overlay;
            const source = overlay?.elm.node();
            if (source) {
                const clientSize = horizontal
                    ? source.clientWidth
                    : source.clientHeight;
                const m = clientSize * (0.0254 / 96); // "screen" CSS height in meters
                const scale = (base[1] - base[0]) / m;
                return scale;
            }
        }
    }
    return 16000;
}

interface WellLogInfoPanelProps {
    parent: WellLogViewer;
    header?: string;
}

interface WellLogInfoPanelState {
    infos: Info[];
}

export class WellLogInfoPanel extends Component<
    WellLogInfoPanelProps,
    WellLogInfoPanelState
> {
    collapsedTrackIds: (string | number)[];
    constructor(props: RightPanelProps) {
        super(props);
        this.collapsedTrackIds = [];
        this.state = {
            infos: [],
        };

        this.props.parent.onInfos.push(this.onInfo.bind(this));

        this.onInfoGroupClick = this.onInfoGroupClick.bind(this);
    }
    componentWillUnmount(): void {
        //this.props.parent.onInfos.length=0;
    }

    // callback function from WellLogView
    onInfo(
        x: number,
        logController: LogViewer,
        iFrom: number,
        iTo: number
    ): void {
        this.setState({
            infos: fillInfos(
                x,
                logController,
                iFrom,
                iTo,
                this.collapsedTrackIds,
                this.props.parent.props.readoutOptions
            ),
        });
    }

    onInfoGroupClick(trackId: string | number): void {
        const i = this.collapsedTrackIds.indexOf(trackId);
        if (i < 0) this.collapsedTrackIds.push(trackId);
        else delete this.collapsedTrackIds[i];

        this.props.parent.updateReadoutPanel(); // force to get onInfo call from WellLogView
    }

    render(): JSX.Element {
        return (
            <InfoPanel
                header={this.props.header}
                infos={this.state.infos}
                onGroupClick={this.onInfoGroupClick}
            />
        );
    }
}

interface WellLogAxesPanelProps {
    parent: WellLogViewer;
    header?: string;
}

interface WellLogAxesPanelState {
    axes: string[]; // axes available in welllog
    //primaryAxis: string;
}

export class WellLogAxesPanel extends Component<
    WellLogAxesPanelProps,
    WellLogAxesPanelState
> {
    constructor(props: RightPanelProps) {
        super(props);

        const axes = getAvailableAxes(
            this.props.parent.props.welllog,
            this.props.parent.props.axisMnemos
        );

        this.state = {
            axes: axes, //["md", "tvd"]
        };
    }

    componentDidUpdate(
        prevProps: RightPanelProps /*, prevState: RightPanelState*/
    ): void {
        if (
            this.props.parent.props.welllog !==
                prevProps.parent.props.welllog ||
            this.props.parent.props.axisMnemos !==
                prevProps.parent.props.axisMnemos
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
    }

    render(): JSX.Element {
        return (
            <AxisSelector
                header={this.props.header}
                axes={this.state.axes}
                axisLabels={this.props.parent.props.axisTitles}
                value={this.props.parent.state.primaryAxis}
                onChange={this.props.parent.onChangePrimaryAxis}
            />
        );
    }
}

interface WellLogScaleSelectorProps {
    parent: WellLogViewer;
    label?: string;
}
interface WellLogScaleSelectorState {
    baseVertScale: number; // value for scale combo
    zoomValue: number; // value for zoom slider
}

export class WellLogScaleSelector extends Component<
    WellLogScaleSelectorProps,
    WellLogScaleSelectorState
> {
    constructor(
        props: WellLogScaleSelectorProps,
        state: WellLogScaleSelectorState
    ) {
        super(props, state);

        this.state = {
            baseVertScale: 1.0, // this.getBaseVertScale()
            zoomValue: 4.0,
        };

        this.props.parent.onContentRescales.push(
            this.onContentRescale.bind(this)
        );

        this.onVertScaleChange = this.onVertScaleChange.bind(this);
    }
    componentWillUnmount(): void {
        //this.props.parent.onContentRescales.length=0;
    }

    // callback function from Vertical Scale combobox
    onVertScaleChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        event.preventDefault();
        const zoom =
            getBaseVertScale(
                this.props.parent.controller,
                this.props.parent.props.horizontal
            ) / parseFloat(event.target.value);
        this.props.parent.controller?.zoomContent(zoom);
    }

    onContentRescale(): void {
        this.setZoomValue();
    }

    setZoomValue(): void {
        this.setState((state: Readonly<WellLogScaleSelectorState>) => {
            const controller = this.props.parent.controller;
            if (!controller) return null;
            const zoomValue = controller.getContentZoom();
            const baseVertScale = getBaseVertScale(
                this.props.parent.controller,
                this.props.parent.props.horizontal
            );
            if (
                Math.abs(Math.log(state.zoomValue / zoomValue)) < 0.01 &&
                Math.abs(state.baseVertScale - baseVertScale) < 10
            )
                return null;
            return {
                baseVertScale: baseVertScale,
                zoomValue: zoomValue,
            };
        });
    }

    render(): JSX.Element {
        const { _vertScale, vertScale } = getVertScale(
            this.state.baseVertScale / this.state.zoomValue
        );
        return (
            <div style={{ paddingLeft: "10px", display: "flex" }}>
                {this.props.label && <span>{this.props.label}</span>}
                <span style={{ paddingLeft: "10px" }}>
                    <select
                        onChange={this.onVertScaleChange}
                        value={_vertScale}
                    >
                        {_vertScale == vertScale ? null : (
                            <option value={_vertScale}>
                                {"1:" + _vertScale}
                            </option>
                        )}
                        <option value="1000">1:1000</option>{" "}
                        {/* 1 cm == 10 m */}
                        <option value="2000">1:2000</option>
                        <option value="5000">1:5000</option>
                        <option value="10000">1:10000</option>{" "}
                        {/* 1 cm == 100 m */}
                        <option value="20000">1:20000</option>
                        <option value="50000">1:50000</option>
                        <option value="100000">1:100000</option>{" "}
                        {/* 1 cm == 1 km */}
                    </select>
                </span>
            </div>
        );
    }
}

interface RightPanelProps {
    parent: WellLogViewer;
}

export class RightPanel extends Component<RightPanelProps> {
    render(): JSX.Element {
        const width = "255px";
        return (
            <div
                style={{
                    flexDirection: "column",
                    width: width,
                    minWidth: width,
                    maxWidth: width,
                    height: "100%",
                }}
            >
                {/*<WellLogScaleSelector
                    label="Scale value:"
                    parent={this.props.parent}
                />*/}

                <WellLogAxesPanel
                    header="Primary scale"
                    parent={this.props.parent}
                />
                <WellLogInfoPanel header="Readout" parent={this.props.parent} />
                <WellLogZoomSlider label="Zoom:" parent={this.props.parent} />
            </div>
        );
    }
}

class WellLogViewer extends Component<WellLogViewerProps, State> {
    public static propTypes: Record<string, unknown>;

    controller: WellLogController | null;

    onInfos: ((
        x: number,
        logController: LogViewer,
        iFrom: number,
        iTo: number
    ) => void)[];
    onContentRescales: (() => void)[];
    onContentSelections: (() => void)[];

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

            left: this.createPanel(this.props.left),
            right: this.createPanel(this.props.right),
            top: this.createPanel(this.props.top),
            bottom: this.createPanel(this.props.bottom),
        };

        this.controller = null;

        this.onInfos = [];
        this.onContentRescales = [];
        this.onContentSelections = [];

        this.onCreateController = this.onCreateController.bind(this);

        this.onInfo = this.onInfo.bind(this);

        this.onChangePrimaryAxis = this.onChangePrimaryAxis.bind(this);

        this.onContentRescale = this.onContentRescale.bind(this);
        this.onContentSelection = this.onContentSelection.bind(this);
        this.onTemplateChanged = this.onTemplateChanged.bind(this);
    }

    componentDidMount(): void {
        this.onContentRescale();
        this.updateReadoutPanel();
    }
    componentWillUnmount(): void {
        // clear all callback lists
        this.onInfos.length = 0;
        this.onContentRescales.length = 0;
        this.onContentSelections.length = 0;
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
        if (this.props.left !== prevProps.left)
            this.setState({ left: this.createPanel(this.props.left) });
        if (this.props.right !== prevProps.right)
            this.setState({ right: this.createPanel(this.props.right) });
        if (this.props.top !== prevProps.top)
            this.setState({ top: this.createPanel(this.props.top) });
        if (this.props.bottom !== prevProps.bottom)
            this.setState({ bottom: this.createPanel(this.props.bottom) });

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
        if (wellLogView) wellLogView.setInfo(); // reflect new values
    }

    // callback function from WellLogView
    onInfo(
        x: number,
        logController: LogViewer,
        iFrom: number,
        iTo: number
    ): void {
        for (const onInfo of this.onInfos) onInfo(x, logController, iFrom, iTo);
    }
    // callback function from WellLogView
    onCreateController(controller: WellLogController): void {
        this.controller = controller;
        this.props.onCreateController?.(controller); // call callback to component's caller
    }
    // callback function from WellLogView
    onContentRescale(): void {
        for (const onContentRescale of this.onContentRescales)
            onContentRescale();
        /*if(this.state.right) {
          const p=this.state.right["onContentRescale"];
          if(p)
            p();
        }*/

        this.props.onContentRescale?.(); // call callback to component's caller
    }
    // callback function from WellLogView
    onContentSelection(): void {
        for (const onContentSelection of this.onContentSelections)
            onContentSelection();
        this.props.onContentSelection?.(); // call callback to component's caller
    }
    onTemplateChanged(): void {
        this.props.onTemplateChanged?.(); // call callback to component's caller
    }

    // callback function from Axis selector
    onChangePrimaryAxis(value: string): void {
        this.setState({ primaryAxis: value });
    }

    getDefaultPrimaryAxis(): string {
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
        return primaryAxis;
    }

    createPanel(
        panel?: JSX.Element | ((parent: WellLogViewer) => JSX.Element)
    ): JSX.Element | null {
        if (typeof panel == "function") return panel(this);
        if (typeof panel == "object") return panel; // JSX.Element
        return null;
    }

    render(): JSX.Element {
        return (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                }}
            >
                {this.state.left && (
                    <div style={{ flex: "0", height: "100%" }}>
                        {this.state.left}
                    </div>
                )}
                <div
                    style={{
                        flex: "1",
                        height: "100%",
                        width: "0%",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {this.state.top && (
                        <div style={{ flex: "0" }}>{this.state.top}</div>
                    )}
                    <WellLogViewWithScroller
                        welllog={this.props.welllog}
                        template={this.props.template}
                        colorTables={this.props.colorTables}
                        wellpick={this.props.wellpick}
                        horizontal={this.props.horizontal}
                        axisTitles={this.props.axisTitles}
                        axisMnemos={this.props.axisMnemos}
                        options={this.props.options}
                        primaryAxis={this.state.primaryAxis}
                        // callbacks
                        onTrackMouseEvent={onTrackMouseEvent}
                        onInfo={this.onInfo}
                        onCreateController={this.onCreateController}
                        onContentRescale={this.onContentRescale}
                        onContentSelection={this.onContentSelection}
                        onTemplateChanged={this.onTemplateChanged}
                    />
                    {this.state.bottom && (
                        <div style={{ flex: "0" }}>{this.state.bottom}</div>
                    )}
                </div>
                {this.state.right && (
                    <div style={{ flex: "0", height: "100%" }}>
                        {this.state.right}
                    </div>
                )}
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
