//import React from "react";
import type { LogViewer } from "@equinor/videx-wellog";

import type { WellLogController } from "./WellLogView";
import type WellLogView from "./WellLogView";
import type { Info } from "../components/InfoTypes";
import type { WellLogSet } from "./WellLogTypes";

export class CallbackManager {
    controller: WellLogController | null;

    /**
     * @deprecated use getWellLogSets instead
     */
    welllog: () => WellLogSet | undefined;
    getWellLogSets: () => WellLogSet[] | undefined;

    onCreateControllerCallbacks: ((controller: WellLogController) => void)[];
    onInfoCallbacks: ((
        x: number,
        logController: LogViewer,
        iFrom: number,
        iTo: number
    ) => void)[];
    onContentRescaleCallbacks: (() => void)[];
    onContentSelectionCallbacks: (() => void)[];
    onTemplateChangedCallbacks: (() => void)[];
    onChangePrimaryAxisCallbacks: ((primaryAxis: string) => void)[];
    onInfoFilledCallbacks: ((computedInfo: Info[]) => void)[];

    constructor(wellLogSetsGetter: () => WellLogSet[] | undefined) {
        this.getWellLogSets = wellLogSetsGetter;
        this.welllog = () => this.getWellLogSets()?.[0];

        this.controller = null;

        this.onCreateControllerCallbacks = [];
        this.onInfoCallbacks = [];
        this.onContentRescaleCallbacks = [];
        this.onContentSelectionCallbacks = [];
        this.onTemplateChangedCallbacks = [];
        this.onChangePrimaryAxisCallbacks = [];

        this.onInfoFilledCallbacks = [];

        this.onCreateController = this.onCreateController.bind(this);
        this.onInfo = this.onInfo.bind(this);
        this.onInfoFilled = this.onInfoFilled.bind(this);
        this.onContentRescale = this.onContentRescale.bind(this);
        this.onContentSelection = this.onContentSelection.bind(this);
        this.onTemplateChanged = this.onTemplateChanged.bind(this);
        this.onChangePrimaryAxis = this.onChangePrimaryAxis.bind(this);
    }

    unregisterAll(): void {
        // clear all callback lists
        /* predefined
        this.onCreateControllerCallbacks = 0;
        this.onInfoCallbacks.length = 0;
        this.onContentRescaleCallbacks.length = 0;
        this.onContentSelectionCallbacks.length = 0;
        this.onTemplateChangedCallbacks.length = 0;
        this.onChangePrimaryAxisCallbacks.length = 0;
        */
        for (const key in this) {
            if (key.indexOf("Callbacks") >= 0) {
                // predefined and user callback tables
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                this[key].length = 0;
            }
        }
    }

    registerCallback<CallbackFunction>(
        name: string,
        callback: CallbackFunction,
        userDefined?: boolean
    ): void {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        let table = this[name + "Callbacks"];
        if (!table) {
            if (!userDefined) {
                console.log(
                    "CallbackManager.registerCallback: " +
                        name +
                        "s" +
                        " not found"
                );
                return;
            }
            // create new callback table
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            table = this[name + "Callbacks"] = [];
        }
        table.push(callback);
    }
    unregisterCallback<CallbackFunction>(
        name: string,
        callback: CallbackFunction
    ): void {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const table = this[name + "Callbacks"];
        if (!table) {
            console.log(
                "CallbackManager.unregisterCallback: " +
                    name +
                    "Callbacks" +
                    " not found"
            );
            return;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this[name + "Callbacks"] = table.filter(
            (p: CallbackFunction) => p !== callback
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    callCallbacks(name: string, ...args: any): void {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const table = this[name + "Callbacks"];
        if (!table) return;
        for (const callback of table) callback(...args);
    }

    // callback function from WellLogView
    onCreateController(controller: WellLogController): void {
        this.controller = controller;
        for (const onCreateController of this.onCreateControllerCallbacks)
            onCreateController(controller);
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

    onInfoFilled(infos: Info[]): void {
        for (const onInfoFilled of this.onInfoFilledCallbacks)
            onInfoFilled(infos);
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
    // callback function from WellLogView
    onTemplateChanged(): void {
        for (const onTemplateChanged of this.onTemplateChangedCallbacks)
            onTemplateChanged();
    }
    // callback function from Axis selector
    onChangePrimaryAxis(value: string): void {
        for (const onChangePrimaryAxis of this.onChangePrimaryAxisCallbacks)
            onChangePrimaryAxis(value);
    }

    updateInfo(): void {
        const wellLogView = this.controller as unknown as WellLogView;
        wellLogView?.setInfo(); // reflect new values
    }
}

export default CallbackManager;
