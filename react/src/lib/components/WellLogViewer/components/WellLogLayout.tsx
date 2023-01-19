import React, { Component } from "react";

import { WellLogController } from "./WellLogView";
import WellLogView from "./WellLogView";
import WellLogViewer from "../WellLogViewer";

import { LogViewer } from "@equinor/videx-wellog";

export interface Props {
    parent: WellLogViewer;
    center?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);

    header?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    left?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    right?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    top?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    bottom?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    footer?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
}

interface State {
    center: JSX.Element | null;

    header: JSX.Element | null;
    left: JSX.Element | null;
    right: JSX.Element | null;
    top: JSX.Element | null;
    bottom: JSX.Element | null;
    footer: JSX.Element | null;
}

const styleHeaderFooter = { flex: "0", width: "100%" };
const styleTopBottom = { flex: "0" };
const styleLeftRight = { flex: "0", height: "100%" };

class WellLogLayout extends Component<Props, State> {
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

    constructor(props: Props) {
        super(props);

        this.state = {
            center: this.createPanel(this.props.center),

            header: this.createPanel(this.props.header),
            left: this.createPanel(this.props.left),
            right: this.createPanel(this.props.right),
            top: this.createPanel(this.props.top),
            bottom: this.createPanel(this.props.bottom),
            footer: this.createPanel(this.props.footer),
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

    componentDidUpdate(prevProps: Props /*, prevState: State*/): void {
        if (this.props.header !== prevProps.header)
            this.setState({ header: this.createPanel(this.props.header) });
        if (this.props.left !== prevProps.left)
            this.setState({ left: this.createPanel(this.props.left) });
        if (this.props.right !== prevProps.right)
            this.setState({ right: this.createPanel(this.props.right) });
        if (this.props.top !== prevProps.top)
            this.setState({ top: this.createPanel(this.props.top) });
        if (this.props.bottom !== prevProps.bottom)
            this.setState({ bottom: this.createPanel(this.props.bottom) });
        if (this.props.footer !== prevProps.footer)
            this.setState({ footer: this.createPanel(this.props.footer) });

        if (
            this.props.parent.props.readoutOptions &&
            (!prevProps.parent.props.readoutOptions ||
                this.props.parent.props.readoutOptions.allTracks !==
                    prevProps.parent.props.readoutOptions.allTracks ||
                this.props.parent.props.readoutOptions.grouping !==
                    prevProps.parent.props.readoutOptions.grouping)
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
        this.props.parent.props.onCreateController?.(controller); // call callback to component's caller
    }
    // callback function from WellLogView
    onContentRescale(): void {
        for (const onContentRescale of this.onContentRescaleCallbacks)
            onContentRescale();
        this.props.parent.props.onContentRescale?.(); // call callback to component's caller
    }
    // callback function from WellLogView
    onContentSelection(): void {
        for (const onContentSelection of this.onContentSelectionCallbacks)
            onContentSelection();
        this.props.parent.props.onContentSelection?.(); // call callback to component's caller
    }
    onTemplateChanged(): void {
        this.props.parent.props.onTemplateChanged?.(); // call callback to component's caller
    }

    createPanel(
        panel?: JSX.Element | ((parent: WellLogViewer) => JSX.Element)
    ): JSX.Element | null {
        if (typeof panel == "function") return panel(this.props.parent);
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
                    <div style={styleHeaderFooter}>{this.state.header}</div>
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
                        <div style={styleLeftRight}>{this.state.left}</div>
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
                            <div style={styleTopBottom}>{this.state.top}</div>
                        )}
                        {this.state.center /* The main view component */}
                        {this.state.bottom && (
                            <div style={styleTopBottom}>
                                {this.state.bottom}
                            </div>
                        )}
                    </div>
                    {this.state.right && (
                        <div style={styleLeftRight}>{this.state.right}</div>
                    )}
                </div>
                {this.state.footer && (
                    <div style={styleHeaderFooter}>{this.state.footer}</div>
                )}
            </div>
        );
    }
}

export default WellLogLayout;
