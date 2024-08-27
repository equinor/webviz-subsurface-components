import React, { Component } from "react";

import PropTypes from "prop-types";

import WellLogLayout from "./components/WellLogLayout";
import type { ViewerLayout } from "./components/WellLogLayout";
import defaultLayout from "./components/DefaultWellLogViewerLayout";

import WellLogViewWithScroller from "./components/WellLogViewWithScroller";
import type { WellLogViewWithScrollerProps } from "./components/WellLogViewWithScroller";
import { argTypesWellLogViewScrollerProp } from "./components/WellLogViewWithScroller";
//import { _propTypesWellLogView } from "./components/WellLogView";

import { shouldUpdateWellLogView } from "./components/WellLogView";

import type {
    WellLogController,
    TrackMouseEvent,
} from "./components/WellLogView";
import type WellLogView from "./components/WellLogView";

import { getAvailableAxes, toggleId } from "./utils/tracks";

import { onTrackMouseEventDefault } from "./utils/edit-track";

import { CallbackManager } from "./components/CallbackManager";

import type { Info, InfoOptions } from "./components/InfoTypes";
import type { LogViewer } from "@equinor/videx-wellog";
import { fillInfos } from "./utils/fill-info";

export interface WellLogViewerProps extends WellLogViewWithScrollerProps {
    readoutOptions?: InfoOptions; // options for readout

    layout?: ViewerLayout<WellLogViewer>;

    // callbacks
    onContentRescale?: () => void;
    onContentSelection?: () => void;
    onTemplateChanged?: () => void;

    onInfoFilled?: (computedInfo: Info[]) => void;
    onTrackMouseEvent?: (wellLogView: WellLogView, ev: TrackMouseEvent) => void;

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
    layout: {
        description:
            "Side panels layout (default is layout with default right panel",
    },
    // callbacks...
};

interface State {
    primaryAxis: string; // for WellLogView
}

export default class WellLogViewer extends Component<
    WellLogViewerProps,
    State
> {
    public static propTypes: Record<string, unknown>;

    callbackManager: CallbackManager;
    collapsedTrackIds: (string | number)[];

    constructor(props: WellLogViewerProps) {
        super(props);

        this.state = {
            primaryAxis: this.getDefaultPrimaryAxis(), //"md"
        };

        this.callbackManager = new CallbackManager(() => this.props.welllog);
        this.collapsedTrackIds = [];

        this.onCreateController = this.onCreateController.bind(this);

        this.onInfo = this.onInfo.bind(this);
        this.onContentRescale = this.onContentRescale.bind(this);
        this.onContentSelection = this.onContentSelection.bind(this);
        this.onTemplateChanged = this.onTemplateChanged.bind(this);
        this.fillInfo = this.fillInfo.bind(this);
        this.onInfoGroupClick = this.onInfoGroupClick.bind(this);

        this.onChangePrimaryAxis = this.onChangePrimaryAxis.bind(this);

        this.callbackManager.registerCallback(
            "onInfoGroupClick",
            this.onInfoGroupClick,
            true
        );

        if (props.onInfoFilled) {
            this.callbackManager.registerCallback(
                "onInfoFilled",
                props.onInfoFilled
            );
        }
    }

    onInfoGroupClick(info: Info): void {
        const collapsedTrackIds = this.collapsedTrackIds;
        /* 
        const controller = this.props.callbackManager.controller;
        if (controller) { // info.trackId could be for another controller so map iTrack to trackid for the curent controller
            const wellLogView = controller as WellLogView;
            const logController = wellLogView.logController;
            const tracks = logController?.tracks;
            if (tracks) {
                let iTrack = 0;
                for (const track of tracks) {
                    if (isScaleTrack(track)) continue;
                    if (info.iTrack == iTrack) {
                        toggleId(collapsedTrackIds, track.id);
                        break;
                    }
                    iTrack++;
                }
            }
        }
        else*/ {
            // old code
            toggleId(collapsedTrackIds, info.trackId);
        }
        this.callbackManager.updateInfo(); // force to get onInfo call from WellLogView
    }

    // callback function from WellLogView
    onCreateController(controller: WellLogController): void {
        this.callbackManager.onCreateController(controller);
        this.props.onCreateController?.(controller); // call callback to component's caller
    }
    // callback function from WellLogView
    onContentRescale(): void {
        this.callbackManager.onContentRescale();
        this.props.onContentRescale?.(); // call callback to component's caller
    }
    // callback function from WellLogView
    onContentSelection(): void {
        this.callbackManager.onContentSelection();
        this.props.onContentSelection?.(); // call callback to component's caller
    }
    // callback function from WellLogView
    onTemplateChanged(): void {
        this.callbackManager.onTemplateChanged();
        this.props.onTemplateChanged?.(); // call callback to component's caller
    }
    // callback function from Axis selector
    onChangePrimaryAxis(value: string): void {
        this.setState({ primaryAxis: value });
        this.callbackManager.onChangePrimaryAxis(value);
    }

    onInfo(x: number, logController: LogViewer, iFrom: number, iTo: number) {
        this.callbackManager.onInfo(x, logController, iFrom, iTo);
        this.props.onInfo?.(x, logController, iFrom, iTo);

        this.fillInfo(x, logController, iFrom, iTo);
    }

    fillInfo(x: number, logController: LogViewer, iFrom: number, iTo: number) {
        if (this.callbackManager.onInfoFilledCallbacks.length < 1) return;

        const infoOptions = this.props.readoutOptions;

        const interpolatedData = fillInfos(
            x,
            logController,
            iFrom,
            iTo,
            this.collapsedTrackIds,
            infoOptions
        );

        this.callbackManager.onInfoFilled(interpolatedData);
    }

    componentDidMount(): void {
        this.onContentRescale();
        const controller = this.callbackManager?.controller;
        if (controller) {
            const trackPos = controller.getTrackScrollPos();
            controller.scrollTrackTo(trackPos);
        }
    }

    componentWillUnmount(): void {
        this.callbackManager.unregisterAll();
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
            this.props.primaryAxis !== prevProps.primaryAxis
        ) {
            const value = this.getDefaultPrimaryAxis();
            this.onChangePrimaryAxis(value);
        }
    }

    getPrimaryAxis(): string {
        return this.state.primaryAxis;
    }
    getDefaultPrimaryAxis(): string {
        if (this.props.primaryAxis) return this.props.primaryAxis;

        const axes = getAvailableAxes(
            this.props.welllog,
            this.props.axisMnemos
        );
        let primaryAxis = axes[0];
        const template = this.props.template;
        if (template) {
            const scale = template.scale;
            if (scale) {
                let primary = scale.primary;
                if (!primary) primary = "tvd"; //!!!!!
                if (primary && axes) {
                    if (axes.indexOf(primary) >= 0) primaryAxis = primary;
                }
            }
        }
        return primaryAxis;
    }

    render(): JSX.Element {
        return (
            <WellLogLayout
                parent={this}
                center={
                    <WellLogViewWithScroller
                        welllog={this.props.welllog}
                        viewTitle={this.props.viewTitle}
                        template={this.props.template}
                        colorTables={this.props.colorTables}
                        wellpick={this.props.wellpick}
                        patternsTable={this.props.patternsTable}
                        patterns={this.props.patterns}
                        horizontal={this.props.horizontal}
                        axisTitles={this.props.axisTitles}
                        axisMnemos={this.props.axisMnemos}
                        domain={this.props.domain}
                        selection={this.props.selection}
                        primaryAxis={this.state.primaryAxis}
                        options={this.props.options}
                        // callbacks
                        onInfo={this.onInfo}
                        onCreateController={this.onCreateController}
                        onTrackMouseEvent={
                            this.props.onTrackMouseEvent ||
                            onTrackMouseEventDefault
                        }
                        onContentRescale={this.onContentRescale}
                        onContentSelection={this.onContentSelection}
                        onTemplateChanged={this.onTemplateChanged}
                    />
                }
                layout={this.props.layout || defaultLayout}
            />
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
    colorTables: PropTypes.any, //.isRequired,

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
