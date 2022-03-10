import React, { Component, ReactNode } from "react";

import PropTypes from "prop-types";

import WellLogViewWithScroller from "./components/WellLogViewWithScroller";
import InfoPanel from "./components/InfoPanel";
import AxisSelector from "./components/AxisSelector";

import ZoomSlider from "./components/ZoomSlider";

import { WellLog } from "./components/WellLogTypes";
import { Template } from "./components/WellLogTemplateTypes";
import { ColorTable } from "./components/ColorTableTypes";

import { WellLogController } from "./components/WellLogView";

import { getAvailableAxes } from "./utils/tracks";

import { axisTitles, axisMnemos } from "./utils/axes";
import { checkMinMax } from "./utils/minmax";
function isEqDomains(d1: [number, number], d2: [number, number]): boolean {
    const eps: number = Math.abs(d1[1] - d1[0] + (d2[1] - d2[0])) * 0.00001;
    return Math.abs(d1[0] - d2[0]) < eps && Math.abs(d1[1] - d2[1]) < eps;
}

import { onTrackMouseEvent } from "./utils/edit-track";
import { fillInfos } from "./utils/fill-info";
import { LogViewer } from "@equinor/videx-wellog";

import { Info, InfoOptions } from "./components/InfoTypes";

interface Props {
    welllogs: WellLog[];
    templates: Template[];
    colorTables: ColorTable[];
    horizontal?: boolean;
    syncTrackPos?: boolean;
    syncContentDomain?: boolean;
    syncContentSelection?: boolean;
    syncTemplate?: boolean;

    hideTitles?: boolean;
    hideLegend?: boolean;

    domain?: [number, number]; //  initial visible range
    selection?: [number | undefined, number | undefined]; //  initial selected range [a,b]

    readoutOptions?: InfoOptions; // options for readout

    // callbacks
    onContentRescale?: () => void;
    onContentSelection?: () => void;
    onTemplateChanged?: () => void;

    onCreateController?: (controller: WellLogController) => void;
}
interface State {
    axes: string[]; // axes available in welllog
    primaryAxis: string;
    infos: Info[][];

    sliderValue: number; // value for zoom slider
}

class SyncLogViewer extends Component<Props, State> {
    public static propTypes: Record<string, unknown>;

    controllers: (WellLogController | null)[];

    collapsedTrackIds: (string | number)[];

    onCreateControllerBind: ((controller: WellLogController) => void)[];
    onInfoBind: ((
        x: number,
        logController: LogViewer,
        iFrom: number,
        iTo: number
    ) => void)[];

    onTrackScrollBind: (() => void)[];
    onTrackSelectionBind: (() => void)[];
    onContentRescaleBind: (() => void)[];
    onContentSelectionBind: (() => void)[];
    onTemplateChangedBind: (() => void)[];

    constructor(props: Props) {
        super(props);

        const _axes = this.props.welllogs.map((welllog: WellLog) =>
            getAvailableAxes(welllog, axisMnemos)
        );
        const axes = _axes[0];
        let primaryAxis = axes[0];
        if (this.props.templates[0]) {
            this.props.templates[0].scale.primary = "tvd"; //!!!!!
            if (
                this.props.templates[0] &&
                this.props.templates[0].scale.primary
            ) {
                if (axes.indexOf(this.props.templates[0].scale.primary) >= 0)
                    primaryAxis = this.props.templates[0].scale.primary;
            }
        }
        this.state = {
            primaryAxis: primaryAxis, //"md"
            axes: axes, //["md", "tvd"]
            infos: [[], []],

            sliderValue: 4.0,
        };

        this.controllers = [null, null];

        this.collapsedTrackIds = [];

        this.onCreateControllerBind = [
            this.onCreateController.bind(this, 0),
            this.onCreateController.bind(this, 1),
        ];

        this.onInfoBind = [
            this.onInfo.bind(this, 0),
            this.onInfo.bind(this, 1),
        ];

        this.onChangePrimaryAxis = this.onChangePrimaryAxis.bind(this);

        this.onTrackScrollBind = [
            this.onTrackScroll.bind(this, 0),
            this.onTrackScroll.bind(this, 1),
        ];

        this.onTrackSelectionBind = [
            this.onTrackSelection.bind(this, 0),
            this.onTrackSelection.bind(this, 1),
        ];

        this.onContentRescaleBind = [
            this.onContentRescale.bind(this, 0),
            this.onContentRescale.bind(this, 1),
        ];

        this.onContentSelectionBind = [
            this.onContentSelection.bind(this, 0),
            this.onContentSelection.bind(this, 1),
        ];
        this.onTemplateChangedBind = [
            this.onTemplateChanged.bind(this, 0),
            this.onTemplateChanged.bind(this, 1),
        ];

        this.onZoomSliderChange = this.onZoomSliderChange.bind(this);

        this.onInfoGroupClick = this.onInfoGroupClick.bind(this);
    }

    componentDidMount(): void {
        this.syncTrackScrollPos(0);
        this.syncContentScrollPos(0);
        this.syncContentSelection(0);
        this.setSliderValue();
    }

    shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
        return (
            !Object.is(this.props, nextProps) ||
            !Object.is(this.state, nextState)
        );
    }

    componentDidUpdate(prevProps: Props /*, prevState: State*/): void {
        if (
            this.props.welllogs !== prevProps.welllogs ||
            this.props.templates !== prevProps.templates /*||
            this.props.colorTables !== prevProps.colorTables*/
        ) {
            const _axes = this.props.welllogs.map((welllog) =>
                getAvailableAxes(welllog, axisMnemos)
            );
            const axes = _axes[0];
            let primaryAxis = axes[0];
            if (this.props.templates[0]) {
                this.props.templates[0].scale.primary = "tvd"; //!!!!!
                if (this.props.templates[0].scale.primary) {
                    if (
                        axes.indexOf(this.props.templates[0].scale.primary) < 0
                    ) {
                        if (this.props.welllogs === prevProps.welllogs) return; // nothing to update
                    } else {
                        primaryAxis = this.props.templates[0].scale.primary;
                    }
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
            this.setControllersZoom();
        }

        if (
            this.props.selection &&
            (!prevProps.selection ||
                this.props.selection[0] !== prevProps.selection[0] ||
                this.props.selection[1] !== prevProps.selection[1])
        ) {
            this.setControllersSelection();
        }

        if (
            this.props.syncContentSelection !== prevProps.syncContentSelection
        ) {
            this.syncContentSelection(0);
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
        for (const controller of this.controllers) {
            if (controller)
                controller.selectContent(controller.getContentSelection()); // force to update readout panel
        }
    }

    // callback function from WellLogView
    onInfo(
        iView: number,
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

        this.setState((state: Readonly<State>) => {
            return {
                infos: [
                    iView == 0 ? infos : state.infos[0],
                    iView == 1 ? infos : state.infos[1],
                ],
            };
        });
    }
    // callback function from WellLogView
    onCreateController(iView: number, controller: WellLogController): void {
        this.controllers[iView] = controller;
        if (this.props.onCreateController)
            // set callback to component's caller
            this.props.onCreateController(controller);

        this.setControllersZoom();
        this.syncTrackScrollPos(iView);
        this.syncContentScrollPos(iView);
        this.syncContentSelection(iView);
    }
    // callback function from WellLogView
    onTrackScroll(iView: number): void {
        this.syncTrackScrollPos(iView);
    }
    // callback function from WellLogView
    onTrackSelection(iView: number): void {
        this.syncTrackSelection(iView);
    }
    // callback function from WellLogView
    onContentRescale(iView: number): void {
        this.syncTrackScrollPos(iView);
        this.syncContentScrollPos(iView);
        this.syncContentSelection(iView);

        this.setSliderValue();
        if (this.props.onContentRescale) this.props.onContentRescale();
    }
    // callback function from WellLogView
    onContentSelection(iView: number): void {
        this.syncContentSelection(iView);
        if (this.props.onContentSelection) this.props.onContentSelection();
    }
    // callback function from WellLogView
    onTemplateChanged(iView: number): void {
        this.syncTemplate(iView);

        if (this.props.onTemplateChanged) {
            if (this.props.onTemplateChanged) this.props.onTemplateChanged();
        }
    }
    // callback function from Axis selector
    onChangePrimaryAxis(value: string): void {
        this.setState({ primaryAxis: value });
    }
    // callback function from Zoom slider
    onZoomSliderChange(value: number): void {
        const iView = 0; // master
        const controller = this.controllers[iView];
        if (controller) {
            controller.zoomContent(value);
            this.syncContentScrollPos(iView);
        }
    }
    // callback function from Scroller
    onScrollerScroll(iView: number, x: number, y: number): void {
        const controller = this.controllers[iView];
        if (controller) {
            const posMax = controller.getTrackScrollPosMax();
            let posTrack = (this.props.horizontal ? y : x) * posMax;
            posTrack = Math.round(posTrack);
            controller.scrollTrackTo(posTrack);

            const fContent = this.props.horizontal ? x : y; // fraction
            controller.scrollContentTo(fContent);

            const domain = controller.getContentDomain();
            for (const _controller of this.controllers) {
                if (!_controller || _controller == controller) continue;
                if (this.props.syncContentDomain) {
                    const _domain = _controller.getContentDomain();
                    if (!isEqDomains(_domain, domain))
                        _controller.zoomContentTo(domain);
                }
                if (this.props.syncTrackPos)
                    _controller.scrollTrackTo(posTrack);
            }
        }
    }

    // set zoom value to slider
    setSliderValue(): void {
        this.setState((state: Readonly<State>) => {
            if (!this.controllers[0]) return null;
            const zoom = this.controllers[0].getContentZoom();
            if (Math.abs(Math.log(state.sliderValue / zoom)) < 0.01)
                return null;
            return { sliderValue: zoom };
        });
    }

    syncTrackScrollPos(iView: number): void {
        const controller = this.controllers[iView];
        if (controller) {
            const trackPos = controller.getTrackScrollPos();
            for (const _controller of this.controllers) {
                if (!_controller || _controller == controller) continue;
                if (this.props.syncTrackPos)
                    _controller.scrollTrackTo(trackPos);
            }
        }
    }
    syncTrackSelection(iView: number): void {
        const controller = this.controllers[iView];
        if (controller) {
            const trackSelection = controller.getSelectedTrackIndeces();
            for (const _controller of this.controllers) {
                if (!_controller || _controller == controller) continue;
                if (this.props.syncTemplate)
                    _controller.setSelectedTrackIndeces(trackSelection);
            }
        }
    }

    getCommonContentBaseDomain(): [number, number] {
        const commonBaseDomain: [number, number] = [
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
        ];
        for (const controller of this.controllers) {
            if (!controller) continue;
            checkMinMax(commonBaseDomain, controller.getContentBaseDomain());
        }
        return commonBaseDomain;
    }

    syncContentBaseDomain(): void {
        const commonBaseDomain: [number, number] =
            this.getCommonContentBaseDomain();
        for (const controller of this.controllers) {
            if (!controller) continue;
            const baseDomain = controller.getContentBaseDomain();
            if (!isEqDomains(baseDomain, commonBaseDomain))
                controller.setContentBaseDomain(commonBaseDomain);
        }
    }

    syncContentScrollPos(iView: number): void {
        if (this.props.syncContentDomain)
            // synchronize base domains
            this.syncContentBaseDomain();
        const controller = this.controllers[iView];
        if (controller) {
            const domain = controller.getContentDomain();
            for (const _controller of this.controllers) {
                if (!_controller || _controller == controller) continue;
                if (this.props.syncContentDomain) {
                    const _domain = _controller.getContentDomain();
                    if (!isEqDomains(_domain, domain))
                        _controller.zoomContentTo(domain);
                }
            }
        }
    }

    syncContentSelection(iView: number): void {
        const controller = this.controllers[iView];
        if (controller) {
            const selection = controller.getContentSelection();
            for (const _controller of this.controllers) {
                if (!_controller || _controller == controller) continue;
                if (this.props.syncContentSelection) {
                    const _selection = _controller.getContentSelection();
                    if (
                        _selection[0] !== selection[0] ||
                        _selection[1] !== selection[1]
                    )
                        _controller.selectContent(selection);
                }
            }
        }
    }

    syncTemplate(iView: number): void {
        const controller = this.controllers[iView];
        if (controller) {
            const template = controller.getTemplate();
            for (const _controller of this.controllers) {
                if (!_controller || _controller == controller) continue;
                if (this.props.syncTemplate) _controller.setTemplate(template);
            }
        }
    }

    setControllersZoom(): void {
        for (const controller of this.controllers) {
            if (!controller) continue;
            if (this.props.domain) controller.zoomContentTo(this.props.domain);
        }
    }
    setControllersSelection(): void {
        for (const controller of this.controllers) {
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
        const maxVisibleTrackNum = this.props.horizontal ? 2 : 3;
        return (
            <div style={{ height: "100%", width: "100%", display: "flex" }}>
                <WellLogViewWithScroller
                    welllog={this.props.welllogs[0]}
                    template={this.props.templates[0]}
                    colorTables={this.props.colorTables}
                    horizontal={this.props.horizontal}
                    hideTitles={this.props.hideTitles}
                    hideLegend={this.props.hideLegend}
                    maxVisibleTrackNum={maxVisibleTrackNum}
                    maxContentZoom={maxContentZoom}
                    primaryAxis={this.state.primaryAxis}
                    axisTitles={axisTitles}
                    axisMnemos={axisMnemos}
                    onInfo={this.onInfoBind[0]}
                    onCreateController={this.onCreateControllerBind[0]}
                    onTrackMouseEvent={onTrackMouseEvent}
                    onTrackScroll={this.onTrackScrollBind[0]}
                    onTrackSelection={this.onTrackSelectionBind[0]}
                    onContentRescale={this.onContentRescaleBind[0]}
                    onContentSelection={this.onContentSelectionBind[0]}
                    onTemplateChanged={this.onTemplateChangedBind[0]}
                />
                <WellLogViewWithScroller
                    welllog={this.props.welllogs[1]}
                    template={this.props.templates[1]}
                    colorTables={this.props.colorTables}
                    horizontal={this.props.horizontal}
                    hideTitles={this.props.hideTitles}
                    hideLegend={this.props.hideLegend}
                    maxVisibleTrackNum={maxVisibleTrackNum}
                    maxContentZoom={maxContentZoom}
                    primaryAxis={this.state.primaryAxis}
                    axisTitles={axisTitles}
                    axisMnemos={axisMnemos}
                    onInfo={this.onInfoBind[1]}
                    onCreateController={this.onCreateControllerBind[1]}
                    onTrackMouseEvent={onTrackMouseEvent}
                    onTrackScroll={this.onTrackScrollBind[1]}
                    onTrackSelection={this.onTrackSelectionBind[1]}
                    onContentRescale={this.onContentRescaleBind[1]}
                    onContentSelection={this.onContentSelectionBind[1]}
                    onTemplateChanged={this.onTemplateChangedBind[1]}
                />
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
                        infos={this.state.infos[0]}
                    />
                    <br />
                    <InfoPanel
                        header="Readout"
                        onGroupClick={this.onInfoGroupClick}
                        infos={this.state.infos[1]}
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
                                value={this.state.sliderValue}
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
    welllogs: PropTypes.array.isRequired,

    /**
     * Prop containing track template data
     */
    templates: PropTypes.array.isRequired,

    /**
     * Prop containing color table data
     */
    colorTables: PropTypes.array.isRequired,

    /**
     * Orientation of the track plots on the screen. Default is false
     */
    horizontal: PropTypes.bool,

    /**
     * Hide titles of the track. Default is false
     */
    hideTitles: PropTypes.bool,

    /**
     * Hide legends of the track. Default is false
     */
    hideLegend: PropTypes.bool,

    /**
     * Synchronize the first visible track number in views
     */
    syncTrackPos: PropTypes.bool,

    /**
     * Synchronize the visible area in views
     */
    syncContentDomain: PropTypes.bool,

    /**
     * Synchronize the selection (current mouse hover) in views
     */
    syncContentSelection: PropTypes.bool,

    /**
     * Synchronize templates in views
     */
    syncTemplate: PropTypes.bool,

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
