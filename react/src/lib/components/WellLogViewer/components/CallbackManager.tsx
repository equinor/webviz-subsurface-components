//import React from "react";
import { LogViewer } from "@equinor/videx-wellog";

import WellLogView, { WellLogController } from "./WellLogView";
import { WellLog } from "./WellLogTypes";

export class CallbackManager {
    controller: WellLogController | null;
    welllog: () => WellLog | undefined;

    onInfoCallbacks: ((
        x: number,
        logController: LogViewer,
        iFrom: number,
        iTo: number
    ) => void)[];
    onContentRescaleCallbacks: (() => void)[];
    onContentSelectionCallbacks: (() => void)[];
    onChangePrimaryAxisCallbacks: ((primaryAxis: string) => void)[];

    constructor(welllog: () => WellLog | undefined) {
        this.welllog = welllog;
        this.controller = null;

        this.onInfoCallbacks = [];
        this.onContentRescaleCallbacks = [];
        this.onContentSelectionCallbacks = [];
        this.onChangePrimaryAxisCallbacks = [];

        this.onCreateController = this.onCreateController.bind(this);
        this.onInfo = this.onInfo.bind(this);
        this.onContentRescale = this.onContentRescale.bind(this);
        this.onContentSelection = this.onContentSelection.bind(this);
    }

    unregisterAll(): void {
        // clear all callback lists
        this.onInfoCallbacks.length = 0;
        this.onContentRescaleCallbacks.length = 0;
        this.onContentSelectionCallbacks.length = 0;
        this.onChangePrimaryAxisCallbacks.length = 0;
    }

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
                "CallbackManager.registerCallback: " + name + "s" + " not found"
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
                "CallbackManager.unregisterCallback: " +
                    name +
                    "Callbacks" +
                    " not found"
            );
    }

    // callback function from WellLogView
    onCreateController(controller: WellLogController): void {
        this.controller = controller;
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
    onContentRescale(): void {
        for (const onContentRescale of this.onContentRescaleCallbacks)
            onContentRescale();
    }
    // callback function from WellLogView
    onContentSelection(): void {
        for (const onContentSelection of this.onContentSelectionCallbacks)
            onContentSelection();
    }

    // callback function from Axis selector
    onChangePrimaryAxis(value: string): void {
        for (const onChangePrimaryAxis of this.onChangePrimaryAxisCallbacks)
            onChangePrimaryAxis(value);
    }

    updateInfo(): void {
        const wellLogView = this.controller as WellLogView;
        if (wellLogView) wellLogView.setInfo(); // reflect new values
    }
}

export default CallbackManager;
