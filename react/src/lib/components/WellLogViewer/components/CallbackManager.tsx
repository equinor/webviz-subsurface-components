//import React from "react";
import { LogViewer } from "@equinor/videx-wellog";

import { WellLogController } from "./WellLogView";
import { WellLog } from "./WellLogTypes";

export class CallbackManager<Parent> {
    parent: Parent;
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

    constructor(parent: Parent, welllog: () => WellLog | undefined) {
        this.parent = parent;
        this.welllog = welllog;
        this.controller = null;

        this.onInfoCallbacks = [];
        this.onContentRescaleCallbacks = [];
        this.onContentSelectionCallbacks = [];
        this.onChangePrimaryAxisCallbacks = [];
    }

    unregisterAll(): void {
        // clear all callback lists
        this.onInfoCallbacks.length = 0;
        this.onContentRescaleCallbacks.length = 0;
        this.onContentSelectionCallbacks.length = 0;
        this.onChangePrimaryAxisCallbacks.length = 0;
    }
}

export default CallbackManager;
