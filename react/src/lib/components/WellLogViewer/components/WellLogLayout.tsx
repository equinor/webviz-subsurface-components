import React, { Component } from "react";

import { WellLogController } from "./WellLogView";
import WellLogView from "./WellLogView";
import WellLogViewer from "../WellLogViewer";

import { LogViewer } from "@equinor/videx-wellog";

export interface ViewerLayout {
    header?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    left?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    right?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    top?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    bottom?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
    footer?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);
}

export interface Props {
    parent: WellLogViewer;

    center?: JSX.Element | ((parent: WellLogViewer) => JSX.Element);

    layout?: ViewerLayout;
}

import { defaultRightPanel } from "./DefaultRightPanel";

const styleHeaderFooter = { flex: "0", width: "100%" };
const styleTopBottom = { flex: "0" };
const styleLeftRight = { flex: "0", height: "100%" };

export class WellLogLayout extends Component<Props> {
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
        const center = this.createPanel(this.props.center);

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
                {header && <div style={styleHeaderFooter}>{header}</div>}
                <div
                    style={{
                        flex: "1",
                        height: "0%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                    }}
                >
                    {left && <div style={styleLeftRight}>{left}</div>}
                    <div
                        style={{
                            flex: "1",
                            height: "100%",
                            width: "0%",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {top && <div style={styleTopBottom}>{top}</div>}
                        {center /* The main view component */}
                        {bottom && <div style={styleTopBottom}>{bottom}</div>}
                    </div>
                    {right && <div style={styleLeftRight}>{right}</div>}
                </div>
                {footer && <div style={styleHeaderFooter}>{footer}</div>}
            </div>
        );
    }
}

export default WellLogLayout;
