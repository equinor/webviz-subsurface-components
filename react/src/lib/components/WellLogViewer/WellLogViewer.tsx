import React, { Component } from "react";

import PropTypes from "prop-types";

import WellLogLayout, { ViewerLayout } from "./components/WellLogLayout";
import { defaultRightPanel } from "./components/DefaultWellLogViewerRightPanel";

import WellLogViewWithScroller from "./components/WellLogViewWithScroller";
import { WellLogViewWithScrollerProps } from "./components/WellLogViewWithScroller";
import { argTypesWellLogViewScrollerProp } from "./components/WellLogViewWithScroller";
//import { _propTypesWellLogView } from "./components/WellLogView";

import { shouldUpdateWellLogView } from "./components/WellLogView";

import { WellLogController } from "./components/WellLogView";

import { getAvailableAxes } from "./utils/tracks";

import { onTrackMouseEvent } from "./utils/edit-track";

import { CallbackManager } from "./components/CallbackManager";

import { InfoOptions } from "./components/InfoTypes";

export interface WellLogViewerProps extends WellLogViewWithScrollerProps {
    readoutOptions?: InfoOptions; // options for readout

    layout?: ViewerLayout<WellLogViewer>;

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
}

class WellLogViewer extends Component<WellLogViewerProps, State> {
    public static propTypes: Record<string, unknown>;

    callbacksManager: CallbackManager;

    constructor(props: WellLogViewerProps) {
        super(props);

        this.state = {
            primaryAxis: this.getDefaultPrimaryAxis(), //"md"
        };

        this.callbacksManager = new CallbackManager(() => this.props.welllog);

        this.onCreateController = this.onCreateController.bind(this);

        this.onContentRescale = this.onContentRescale.bind(this);
        this.onContentSelection = this.onContentSelection.bind(this);
        this.onTemplateChanged = this.onTemplateChanged.bind(this);
    }

    // callback function from WellLogView
    onCreateController(controller: WellLogController): void {
        this.callbacksManager.onCreateController(controller);
        this.props.onCreateController?.(controller); // call callback to component's caller
    }
    // callback function from WellLogView
    onContentRescale(): void {
        this.callbacksManager.onContentRescale();
        this.props.onContentRescale?.(); // call callback to component's caller
    }
    // callback function from WellLogView
    onContentSelection(): void {
        this.callbacksManager.onContentSelection();
        this.props.onContentSelection?.(); // call callback to component's caller
    }
    onTemplateChanged(): void {
        this.props.onTemplateChanged?.(); // call callback to component's caller
    }

    onChangePrimaryAxis(value: string): void {
        this.callbacksManager.onChangePrimaryAxis(value);
    }

    componentDidMount(): void {
        this.onContentRescale();
    }

    componentWillUnmount(): void {
        this.callbacksManager.unregisterAll();
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
            this.setState({
                primaryAxis: this.getDefaultPrimaryAxis(),
            });
        }
    }

    setPrimaryAxis(value: string): void {
        this.setState({ primaryAxis: value });
        this.onChangePrimaryAxis(value);
    }
    getPrimaryAxis(): string {
        return this.state.primaryAxis;
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

    render(): JSX.Element {
        return (
            <WellLogLayout
                parent={this}
                center={
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
                        onCreateController={this.onCreateController}
                        onInfo={this.callbacksManager.onInfo}
                        onContentRescale={this.onContentRescale}
                        onContentSelection={this.onContentSelection}
                        onTemplateChanged={this.onTemplateChanged}
                    />
                }
                layout={this.props.layout}
                defaultRightPanel={defaultRightPanel}
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
