import React, { Component } from "react";

import PropTypes from "prop-types";

import WellLogViewWithScroller from "./components/WellLogViewWithScroller";
import { WellLogViewWithScrollerProps } from "./components/WellLogViewWithScroller";
import { argTypesWellLogViewScrollerProp } from "./components/WellLogViewWithScroller";
//import { _propTypesWellLogView } from "./components/WellLogView";

import { shouldUpdateWellLogView } from "./components/WellLogView";

import { WellLogController } from "./components/WellLogView";
import WellLogView from "./components/WellLogView";

import DefaultRightPanel from "./components/DefaultRightPanel";

import { getAvailableAxes } from "./utils/tracks";

import { onTrackMouseEvent } from "./utils/edit-track";
import { LogViewer } from "@equinor/videx-wellog";

import { InfoOptions } from "./components/InfoTypes";

export interface ViewerLayout {
    header?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    left?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    right?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    top?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    bottom?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    footer?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
}

export interface WellLogViewerProps extends WellLogViewWithScrollerProps {
    readoutOptions?: InfoOptions; // options for readout

    layout?: ViewerLayout;

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

function defaultRightPanel(parent: WellLogViewer) {
    return <DefaultRightPanel parent={parent} />;
}

class WellLogViewer extends Component<WellLogViewerProps, State> {
    public static propTypes: Record<string, unknown>;

    controller: WellLogController | null;

    onInfoCallbacks: ((
        x: number,
        logController: LogViewer,
        iFrom: number,
        iTo: number
    ) => void)[];
    onContentRescaleCallbacks: (() => void)[];
    onContentSelectionCallbacks: (() => void)[];
    onChangePrimaryAxisCallbacks: ((primaryAxis: string) => void)[];

    //[key: string]: string;

    registerCallback<CallbackFunction>(
        name: string,
        callback: CallbackFunction
    ): void {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const table = this[name + "Callbacks"];
        if (table) table.push(callback);
        else
            console.log(
                "WellLogViewer.registerCallback: " + name + "s" + " not found"
            );
    }
    unregisterCallback<CallbackFunction>(
        name: string,
        callback: CallbackFunction
    ): void {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const table = this[name + "Callbacks"];
        if (table)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this[name + "Callbacks"] = table.filter(
                (p: CallbackFunction) => p !== callback
            );
        else
            console.log(
                "WellLogViewer.unregisterCallback: " +
                    name +
                    "Callbacks" +
                    " not found"
            );
    }

    constructor(props: WellLogViewerProps) {
        super(props);

        this.state = {
            primaryAxis: this.getDefaultPrimaryAxis(), //"md"
        };

        this.controller = null;

        this.onInfoCallbacks = [];
        this.onContentRescaleCallbacks = [];
        this.onContentSelectionCallbacks = [];
        this.onChangePrimaryAxisCallbacks = [];

        this.onCreateController = this.onCreateController.bind(this);

        this.onInfo = this.onInfo.bind(this);

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
        /*
        this.onInfos.length = 0;
        this.onContentRescales.length = 0;
        this.onContentSelections.length = 0;
        */
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
        for (const onInfo of this.onInfoCallbacks)
            onInfo(x, logController, iFrom, iTo);
    }
    // callback function from WellLogView
    onCreateController(controller: WellLogController): void {
        this.controller = controller;
        this.props.onCreateController?.(controller); // call callback to component's caller
    }
    // callback function from WellLogView
    onContentRescale(): void {
        for (const onContentRescale of this.onContentRescaleCallbacks)
            onContentRescale();
        this.props.onContentRescale?.(); // call callback to component's caller
    }
    // callback function from WellLogView
    onContentSelection(): void {
        for (const onContentSelection of this.onContentSelectionCallbacks)
            onContentSelection();
        this.props.onContentSelection?.(); // call callback to component's caller
    }
    onTemplateChanged(): void {
        this.props.onTemplateChanged?.(); // call callback to component's caller
    }

    setPrimaryAxis(value: string): void {
        this.setState({ primaryAxis: value });
        for (const onChangePrimaryAxis of this.onChangePrimaryAxisCallbacks)
            onChangePrimaryAxis(value);
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

    createPanel(
        panel?: JSX.Element | ((parent: WellLogViewer) => JSX.Element)
    ): JSX.Element | null {
        if (typeof panel == "function") return panel(this);
        if (typeof panel == "object") return panel; // JSX.Element
        return null;
    }

    render(): JSX.Element {
        let header: JSX.Element | null;
        let left: JSX.Element | null;
        let right: JSX.Element | null;
        let top: JSX.Element | null;
        let bottom: JSX.Element | null;
        let footer: JSX.Element | null;
        const layout = this.props.layout;
        if (!layout) {
            // use default layout with default right panel
            header = null;
            left = null;
            right = this.createPanel(defaultRightPanel);
            top = null;
            bottom = null;
            footer = null;
        } else {
            header = this.createPanel(layout.header);
            left = this.createPanel(layout.left);
            right = this.createPanel(layout.right);
            top = this.createPanel(layout.top);
            bottom = this.createPanel(layout.bottom);
            footer = this.createPanel(layout.footer);
        }

        return (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {header && (
                    <div style={{ flex: "0", width: "100%" }}>{header}</div>
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
                    {left && (
                        <div style={{ flex: "0", height: "100%" }}>{left}</div>
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
                        {top && <div style={{ flex: "0" }}>{top}</div>}
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
                        {bottom && <div style={{ flex: "0" }}>{bottom}</div>}
                    </div>
                    {right && (
                        <div style={{ flex: "0", height: "100%" }}>{right}</div>
                    )}
                </div>
                {footer && (
                    <div style={{ flex: "0", width: "100%" }}>{footer}</div>
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
