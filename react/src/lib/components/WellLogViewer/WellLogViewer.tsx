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

    header?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    left?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    right?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    top?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    bottom?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    footer?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);

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
    primaryAxis: string; // for WellLogView

    header: JSX.Element | null;
    left: JSX.Element | null;
    right: JSX.Element | null;
    top: JSX.Element | null;
    bottom: JSX.Element | null;
    footer: JSX.Element | null;
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

function getScale(
    scale: number,
    values: number[]
): {
    shouldAddCustomValue: boolean;
    scale: number;
} {
    // get nearest value in the list
    let nearestScale: number | undefined = undefined;
    if (values.length) {
        nearestScale = values[values.length - 1];
        for (let i = 1; i < values.length; i++) {
            if (scale < (values[i - 1] + values[i]) * 0.5) {
                nearestScale = values[i - 1];
                break;
            }
        }
    }

    // make a "round value"
    const r = // "round" step
        scale > 5000
            ? 1000
            : scale > 2000
            ? 500
            : scale > 1000
            ? 200
            : scale > 500
            ? 100
            : scale > 200
            ? 50
            : scale > 100
            ? 20
            : scale > 50
            ? 10
            : scale > 20
            ? 5
            : scale > 10
            ? 2
            : 1;
    scale = Number((scale / r).toFixed(0)) * r;

    return { shouldAddCustomValue: nearestScale !== scale, scale: scale };
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
    values?: number[];
}
interface WellLogScaleSelectorState {
    scale: number; // value for scale combo
}

export class WellLogScaleSelector extends Component<
    WellLogScaleSelectorProps,
    WellLogScaleSelectorState
> {
    static defValues: number[] = [
        100, 200, 500, 1000 /* 1 cm == 10 m */, 2000, 5000, 10000, 20000, 50000,
    ];
    constructor(
        props: WellLogScaleSelectorProps,
        state: WellLogScaleSelectorState
    ) {
        super(props, state);

        this.state = {
            scale: 1.0,
        };

        this.props.parent.onContentRescales.push(
            this.onContentRescale.bind(this)
        );

        this.onScaleChange = this.onScaleChange.bind(this);
    }
    componentWillUnmount(): void {
        //this.props.parent.onContentRescales.length=0;
    }

    // callback function from Vertical Scale combobox
    onScaleChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        event.preventDefault();
        const zoom =
            getBaseVertScale(
                this.props.parent.controller,
                this.props.parent.props.horizontal
            ) / parseFloat(event.target.value);
        this.props.parent.controller?.zoomContent(zoom);
    }

    onContentRescale(): void {
        this.setState((state: Readonly<WellLogScaleSelectorState>) => {
            const controller = this.props.parent.controller;
            if (!controller) return null;
            const zoomValue = controller.getContentZoom();
            const baseVertScale = getBaseVertScale(
                this.props.parent.controller,
                this.props.parent.props.horizontal
            );
            const scale = baseVertScale / zoomValue;
            if (Math.abs(state.scale - scale) < 1) return null;
            return {
                scale: scale,
            };
        });
    }

    render(): JSX.Element {
        const values = this.props.values
            ? this.props.values
            : WellLogScaleSelector.defValues;
        const { shouldAddCustomValue, scale } = getScale(
            this.state.scale,
            values
        );
        return (
            <div style={{ paddingLeft: "10px", display: "flex" }}>
                {this.props.label && <span>{this.props.label}</span>}
                <span style={{ paddingLeft: "10px" }}>
                    <select onChange={this.onScaleChange} value={scale}>
                        {shouldAddCustomValue && (
                            <option key={scale} value={scale}>
                                {"1:" + scale}
                            </option>
                        )}
                        {values.map((scale) => (
                            <option key={scale} value={scale}>
                                {"1:" + scale}
                            </option>
                        ))}
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
        const width = "255px"; // default width for InfoPanel
        return (
            <div
                style={{
                    flexDirection: "column",
                    height: "100%",
                    width: width,
                    minWidth: width,
                    maxWidth: width,
                }}
            >
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
    defaultRight?: JSX.Element | ((parent: WellLogViewer) => JSX.Element); // default panet if props.right not given (props.right===undefined)

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

        this.defaultRight = (parent) => <RightPanel parent={parent} />;

        this.state = {
            primaryAxis: this.getPrimaryAxis(), //"md"

            header: this.createPanel(this.props.header),
            left: this.createPanel(this.props.left),
            right: this.createPanel(
                this.props.right === undefined
                    ? this.defaultRight
                    : this.props.right
            ),
            top: this.createPanel(this.props.top),
            bottom: this.createPanel(this.props.bottom),
            footer: this.createPanel(this.props.footer),
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
        if (this.props.header !== prevProps.header)
            this.setState({ header: this.createPanel(this.props.header) });
        if (this.props.left !== prevProps.left)
            this.setState({ left: this.createPanel(this.props.left) });
        if (this.props.right !== prevProps.right)
            this.setState({
                right: this.createPanel(
                    this.props.right === undefined
                        ? this.defaultRight
                        : this.props.right
                ),
            });
        if (this.props.top !== prevProps.top)
            this.setState({ top: this.createPanel(this.props.top) });
        if (this.props.bottom !== prevProps.bottom)
            this.setState({ bottom: this.createPanel(this.props.bottom) });
        if (this.props.footer !== prevProps.footer)
            this.setState({ footer: this.createPanel(this.props.footer) });

        if (
            this.props.welllog !== prevProps.welllog ||
            this.props.template !== prevProps.template ||
            this.props.axisMnemos !== prevProps.axisMnemos ||
            this.props.primaryAxis !== prevProps.primaryAxis
        ) {
            this.setState({
                primaryAxis: this.getPrimaryAxis(),
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

    getPrimaryAxis(): string {
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
                    flexDirection: "column",
                }}
            >
                {this.state.header && (
                    <div style={{ flex: "0", width: "100%" }}>
                        {this.state.header}
                    </div>
                )}
                <div
                    style={{
                        flex: "1",
                        height: "0%",
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
                {this.state.footer && (
                    <div style={{ flex: "0", width: "100%" }}>
                        {this.state.footer}
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
