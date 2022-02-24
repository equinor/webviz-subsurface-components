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

import { onTrackMouseEvent } from "./utils/edit-track";
import { fillInfos } from "./utils/fill-info";
import { LogViewer } from "@equinor/videx-wellog";

import { Info, InfoOptions } from "./components/InfoTypes";

interface Props {
    welllog: WellLog;
    template: Template;
    colorTables: ColorTable[];
    horizontal?: boolean;

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
    infos: Info[];

    sliderValue: number; // value for zoom slider
}

class WellLogViewer extends Component<Props, State> {
    public static propTypes: Record<string, unknown>;

    controller: WellLogController | null;

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

            sliderValue: 4.0,
        };

        this.controller = null;

        this.collapsedTrackIds = [];

        this.collapsedTrackIds = [];

        this.onCreateController = this.onCreateController.bind(this);

        this.onInfo = this.onInfo.bind(this);

        this.onChangePrimaryAxis = this.onChangePrimaryAxis.bind(this);

        this.onContentRescale = this.onContentRescale.bind(this);
        this.onContentSelection = this.onContentSelection.bind(this);
        this.onTemplateChanged = this.onTemplateChanged.bind(this);

        this.onZoomSliderChange = this.onZoomSliderChange.bind(this);

        this.onInfoGroupClick = this.onInfoGroupClick.bind(this);
    }

    componentDidMount(): void {
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
            this.props.welllog !== prevProps.welllog ||
            this.props.template !== prevProps.template /*||
            this.props.colorTables !== prevProps.colorTables*/
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
            this.updateReadoutPanel();
        }
    }

    updateReadoutPanel(): void {
        const controller = this.controller;
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
    onCreateController(controller: WellLogController): void {
        this.controller = controller;
        if (this.props.onCreateController)
            // set callback to component's caller
            this.props.onCreateController(controller);

        this.setControllerZoom();
    }
    // callback function from WellLogView
    onContentRescale(): void {
        this.setSliderValue();
        if (this.props.onContentRescale) this.props.onContentRescale();
    }
    // callback function from WellLogView
    onContentSelection(): void {
        this.setSliderValue();
        if (this.props.onContentSelection) this.props.onContentSelection();
    }
    onTemplateChanged(): void {
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
        const controller = this.controller;
        if (controller) {
            controller.zoomContent(value);
        }
    }

    // set zoom value to slider
    setSliderValue(): void {
        this.setState((state: Readonly<State>) => {
            if (!this.controller) return null;
            const zoom = this.controller.getContentZoom();
            if (Math.abs(Math.log(state.sliderValue / zoom)) < 0.01)
                return null;
            return { sliderValue: zoom };
        });
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

        this.updateReadoutPanel();

        if (this.controller)
            this.controller.selectContent(
                this.controller.getContentSelection()
            ); // force to update readout panel
    }

    render(): ReactNode {
        const maxContentZoom = 256;
        return (
            <div style={{ height: "100%", width: "100%", display: "flex" }}>
                <WellLogViewWithScroller
                    welllog={this.props.welllog}
                    template={this.props.template}
                    colorTables={this.props.colorTables}
                    horizontal={this.props.horizontal}
                    hideTitles={this.props.hideTitles}
                    hideLegend={this.props.hideLegend}
                    maxVisibleTrackNum={this.props.horizontal ? 3 : 5}
                    maxContentZoom={maxContentZoom}
                    primaryAxis={this.state.primaryAxis}
                    axisTitles={axisTitles}
                    axisMnemos={axisMnemos}
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
     * Hide titles of the track. Default is false
     */
    hideTitles: PropTypes.bool,

    /**
     * Hide legends of the track. Default is false
     */
    hideLegend: PropTypes.bool,

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
