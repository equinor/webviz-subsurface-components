import type { ReactNode } from "react";
import React, { Component } from "react";

import PropTypes from "prop-types";

import WellLogSpacer from "./components/WellLogSpacer";
import WellLogViewWithScroller from "./components/WellLogViewWithScroller";

import { CallbackManager } from "./components/CallbackManager";

import type { ViewerLayout } from "./components/WellLogLayout";
import WellLogLayout from "./components/WellLogLayout";
import defaultLayout from "./components/DefaultSyncLogViewerLayout";

import type { WellLogCollection, WellLogSet } from "./components/WellLogTypes";
import type { Template } from "./components/WellLogTemplateTypes";
import type { ColorTable } from "./components/ColorTableTypes";
import type { PatternsTable } from "./utils/pattern";

import type {
    WellLogController,
    WellPickProps,
} from "./components/WellLogView";

import type WellLogView from "./components/WellLogView";
import type {
    WellLogViewOptions,
    TrackMouseEvent,
} from "./components/WellLogView";
import type { WellLogSpacerOptions } from "./components/WellLogSpacer";
import { getWellPicks } from "./components/WellLogView";

import { getAvailableAxes, toggleId } from "./utils/tracks";

import { checkMinMax } from "./utils/minmax";

import { onTrackMouseEventDefault } from "./utils/edit-track";

import type { Info, InfoOptions } from "./components/InfoTypes";

import { isEqualRanges, isEqDomains } from "./utils/log-viewer";
import type { LogViewer } from "@equinor/videx-wellog";
import { fillInfos } from "./utils/fill-info";

export function isEqualArrays(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    d1: undefined | any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    d2: undefined | any[]
): boolean {
    if (!d1) return !d2;
    if (!d2) return !d1;

    const n = d1.length;
    if (n !== d2.length) return false;

    for (let i = 0; i < n; i++) {
        if (d1[i] !== d2[i]) return false;
    }
    return true;
}

export interface SyncLogViewerProps {
    /**
     * Object from JSON file describing single well log data.
     */
    welllogs: (WellLogSet | WellLogCollection)[];

    /**
     * Prop containing track templates data.
     */
    templates: Template[];
    /**
     * Prop containing color table data.
     */
    colorTables: ColorTable[];
    /**
     * Set to true for default titles or to array of individial well log titles
     */
    viewTitles?: boolean | (boolean | string | JSX.Element)[];

    /**
     * Well Picks data array
     */
    wellpicks?: WellPickProps[];

    /**
     * Patterns table
     */
    patternsTable?: PatternsTable;
    /**
     * Horizon to pattern index map
     */
    patterns?: [string, number][];

    /**
     * Horizon names for wellpick flatting (pan and zoom)
     */
    wellpickFlatting?: string[]; // For example ["Hor_5", "Hor_3"];

    /**
     * Set to true or to spacer width or to array of widths if WellLogSpacers should be used
     */
    spacers?: boolean | number | number[];
    /**
     * Distanses between wells to show on the spacers
     */
    wellDistances?: {
        units: string;
        distances: (number | undefined)[];
    };

    /**
     * Orientation of the track plots on the screen.
     */
    horizontal?: boolean;
    syncTrackPos?: boolean;
    syncContentDomain?: boolean;
    syncContentSelection?: boolean;
    syncTemplate?: boolean;

    /**
     * Primary axis id: "md", "tvd", "time"... Default is the first available from axisMnemos
     */
    primaryAxis?: string;

    /**
     * Log mnemonics for axes
     */
    axisTitles: Record<string, string>;

    /**
     * Names for axes
     */
    axisMnemos: Record<string, string[]>;

    /**
     * Initial visible range
     */
    domain?: [number, number];

    /**
     * Initial selected range
     */
    selection?: [number | undefined, number | undefined];

    /**
     * Options for well log views
     */
    welllogOptions?: WellLogViewOptions;
    /**
     * Options for well log spacers
     */
    spacerOptions?: WellLogSpacerOptions;
    /**
     * Options for readout
     */
    readoutOptions?: InfoOptions; // options for readout

    /**
     * Side panels layout (default is layout with default right panel)
     */
    layout?: ViewerLayout<SyncLogViewer>;

    // callbacks
    onInfo?: (
        iWellLog: number,
        x: number,
        logController: LogViewer,
        iFrom: number,
        iTo: number
    ) => void;
    onInfoFilled?: (iWellLog: number, infos: Info[]) => void;
    onContentRescale?: (iWellLog: number) => void;
    onContentSelection?: (iWellLog: number) => void;
    onTemplateChanged?: (iWellLog: number) => void;

    onTrackMouseEvent?: (wellLogView: WellLogView, ev: TrackMouseEvent) => void;

    onCreateController?: (
        iWellLog: number,
        controller: WellLogController
    ) => void;
    onDeleteController?: (
        iWellLog: number,
        controller: WellLogController
    ) => void;
}

export const argTypesSyncLogViewerProp = {
    id: {
        description:
            "The ID of this component, used to identify dash components in callbacks. The ID needs to be unique across all of the components in an app.",
    },
    welllogs: {
        description: "Array of JSON objects describing well log data.",
    },
    templates: {
        description: "Array of track template data.",
    },
    colorTables: {
        description: "Prop containing color table data.",
    },
    wellpicks: {
        description: "Well Picks data array",
    },
    patternsTable: {
        description: "Patterns table",
    },
    patterns: {
        description: "Horizon to pattern index map",
    },

    spacers: {
        description:
            "Set to true or to spacers width or to array of spacer widths if WellLogSpacers should be used",
    },
    wellDistances: {
        description: "Distanses between wells to show on the spacers",
    },

    horizontal: {
        description: "Orientation of the track plots on the screen.",
    },
    syncTrackPos: {
        description: "Synchronize first visible track", // defaultValue: false
    },
    syncContentDomain: {
        description: "Synchronize visible content domain (pan and zoom)", // defaultValue: false
    },
    syncContentSelection: {
        description: "Synchronize content selection", // defaultValue: false
    },
    syncTemplate: {
        description: "Synchronize templates in the views", // defaultValue: false
    },
    welllogOptions: {
        description:
            "Options for well log views:<br/>" +
            "maxContentZoom: The maximum zoom value (default 256)<br/>" +
            "maxVisibleTrackNum: The maximum number of visible tracks<br/>" +
            "checkDatafileSchema: Validate JSON datafile against schema<br/>" +
            "hideTrackTitle: Hide titles on the tracks<br/>" +
            "hideLegend: Hide legends on the tracks.",
    },
    readoutOptions: {
        description:
            "Options for readout panel.<br/>" +
            "allTracks: boolean — Show not only visible tracks,<br/>" +
            "grouping: string — How group values.",
        //defaultValue: {
        //    allTracks: false,
        //    grouping: "by_track",
        //},
    },
    domain: {
        description: "Initial visible interval of the log data.",
    },
    selection: {
        description: "Initial selected interval of the log data.",
    },
    viewTitles: {
        description:
            "Set to true for default titles or to array of individial well log titles",
    },
    layout: {
        description:
            "Side panels layout (default is layout with default right panel",
    },
    // callbacks...
};

interface State {
    primaryAxis: string;
}

class SyncLogViewer extends Component<SyncLogViewerProps, State> {
    public static propTypes: Record<string, unknown>;

    spacers: (WellLogSpacer | null)[];

    wellLogCollections: WellLogCollection[];

    callbackManagers: CallbackManager[];

    callbacks: {
        onCreateControllerBind: (controller: WellLogController) => void;
        onTrackScrollBind: () => void;
        onTrackSelectionBind: () => void;
        onContentRescaleBind: () => void;
        onContentSelectionBind: () => void;
        onTemplateChangedBind: () => void;
        onInfoBind: (
            x: number,
            logController: LogViewer,
            iFrom: number,
            iTo: number
        ) => void;
    }[];

    collapsedTrackIds: (string | number)[][];
    controllers: WellLogController[]; // for onDeletecontroller implementation

    _isMounted: boolean;
    _inInfoGroupClick: number;

    constructor(props: SyncLogViewerProps) {
        super(props);

        this.wellLogCollections = getWellLogCollectionsFromProps(props);

        this.spacers = [];

        this.callbacks = [];
        this.callbackManagers = [];
        this.collapsedTrackIds = [];

        this.controllers = [];

        this._isMounted = false;
        this._inInfoGroupClick = 0;

        this.state = {
            primaryAxis: this.getDefaultPrimaryAxis(), //"md"
        };

        this.onChangePrimaryAxis = this.onChangePrimaryAxis.bind(this);

        this.beforeRender(this.props);
    }
    componentDidMount(): void {
        this._isMounted = true;

        if (this.wellLogCollections.length) {
            this.syncTrackScrollPos(0);
            this.syncContentScrollPos(0);
        }
        {
            // fix after setting the commonBaseDomain
            this.setControllersZoom();
        }
        if (this.wellLogCollections.length) this.syncContentSelection(0);
    }

    componentWillUnmount(): void {
        for (const callbackManager of this.callbackManagers) {
            callbackManager.unregisterAll();
        }
        this._isMounted = false;
    }
    shouldComponentUpdate(
        nextProps: SyncLogViewerProps,
        nextState: State
    ): boolean {
        //?!
        const ret =
            !Object.is(this.props, nextProps) ||
            !Object.is(this.state, nextState);

        if (ret) this.beforeRender(nextProps);
        return ret;
    }

    beforeRender(nextProps: SyncLogViewerProps): void {
        // called before render() but not inside it to avoid onDeleteController notifications
        this.wellLogCollections = getWellLogCollectionsFromProps(nextProps);

        if (this.callbackManagers.length === this.wellLogCollections.length)
            return;
        this.spacers.length = this.wellLogCollections.length;

        this.fillViewsCallbacks(this.wellLogCollections.length); // update this.callbackManagers and this.callbacks[] before render()
    }

    componentDidUpdate(
        prevProps: SyncLogViewerProps /*, prevState: State, snapshot*/
    ): void {
        if (
            this.props.welllogs !== prevProps.welllogs ||
            this.props.templates !== prevProps.templates ||
            this.props.axisMnemos !== prevProps.axisMnemos ||
            this.props.primaryAxis !== prevProps.primaryAxis
        ) {
            const value = this.getDefaultPrimaryAxis();
            this.onChangePrimaryAxis(value);
        }

        if (
            this.props.syncContentDomain !== prevProps.syncContentDomain ||
            !isEqualRanges(this.props.domain, prevProps.domain)
        ) {
            this.setControllersZoom();
        }
        if (
            this.props.syncContentDomain !== prevProps.syncContentDomain ||
            this.props.wellpicks !== prevProps.wellpicks ||
            !isEqualArrays(
                this.props.wellpickFlatting,
                prevProps.wellpickFlatting
            ) ||
            this.props.welllogs.length !== prevProps.welllogs.length
        ) {
            if (this.props.welllogs.length) this.syncContentScrollPos(0); // force to redraw visible domain
        }

        if (!isEqualRanges(this.props.selection, prevProps.selection)) {
            this.setControllersSelection();
        }

        if (
            this.props.syncContentSelection !==
                prevProps.syncContentSelection ||
            this.props.welllogs.length !== prevProps.welllogs.length
        ) {
            if (this.props.welllogs.length) this.syncContentSelection(0); // force to redraw selection
        }
    }

    fillViewCallbacks(iView: number): void {
        const collapsedTrackIds: (string | number)[] = [];
        this.collapsedTrackIds.push(collapsedTrackIds);

        const callbackManager = new CallbackManager(
            () => this.wellLogCollections[iView]
        );
        this.callbackManagers.push(callbackManager);

        const onInfoGroupClickBind = this.onInfoGroupClick.bind(this, iView);
        callbackManager.registerCallback(
            "onInfoGroupClick",
            onInfoGroupClickBind,
            true
        );

        // const onInfoFilled = this.onInfoFilled.bind(this, iView);
        const onInfoFilled = (infos: Info[]) => {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.props.onInfoFilled?.(iView, infos);
        };

        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        if (this.props.onInfoFilled) {
            callbackManager.registerCallback("onInfoFilled", onInfoFilled);
        }

        this.callbacks.push({
            onInfoBind: this.onInfo.bind(this, iView),
            onCreateControllerBind: this.onCreateController.bind(this, iView),
            onTrackScrollBind: this.onTrackScroll.bind(this, iView),
            onTrackSelectionBind: this.onTrackSelection.bind(this, iView),
            onContentRescaleBind: this.onContentRescale.bind(this, iView),
            onContentSelectionBind: this.onContentSelection.bind(this, iView),
            onTemplateChangedBind: this.onTemplateChanged.bind(this, iView),
        });
    }
    fillViewsCallbacks(nViews: number): void {
        for (let iView = this.callbacks.length; iView < nViews; iView++)
            this.fillViewCallbacks(iView);
        this.callbacks.length = nViews;
        this.callbackManagers.length = nViews;

        for (let iView = nViews; iView < this.controllers.length; iView++) {
            console.assert(this.controllers[iView]);
            this.onDeleteController(iView, this.controllers[iView]);
        }
        this.controllers.length = nViews;
    }

    getPrimaryAxis(): string {
        return this.state.primaryAxis;
    }

    getDefaultPrimaryAxis(): string {
        if (this.props.primaryAxis) return this.props.primaryAxis;

        const _axes = this.wellLogCollections?.map((collection) =>
            getAvailableAxes(collection, this.props.axisMnemos)
        );
        const axes = _axes?.[0];
        let primaryAxis = axes?.[0];
        const template = this.props.templates?.[0];
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

    onInfoGroupClick(iWellLog: number, info: Info): void {
        if (this._inInfoGroupClick) return;
        this._inInfoGroupClick++;
        let i = 0;
        for (const callbackManager of this.callbackManagers) {
            if (i != iWellLog)
                callbackManager.callCallbacks("onInfoGroupClick", info);
            i++;
        }

        // Collapse this views info group
        const collapsedTrackIds = this.collapsedTrackIds[iWellLog];
        toggleId(collapsedTrackIds, info.trackId);
        this.callbackManagers[iWellLog].updateInfo();

        this._inInfoGroupClick--;
    }

    onInfo(
        iWellLog: number,
        x: number,
        logController: LogViewer,
        iFrom: number,
        iTo: number
    ) {
        this.callbackManagers[iWellLog].onInfo(x, logController, iFrom, iTo);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        this.props.onInfo?.(iWellLog, x, logController, iFrom, iTo);

        this.fillInfo(iWellLog, x, logController, iFrom, iTo);
    }

    fillInfo(
        iWellLog: number,
        x: number,
        logController: LogViewer,
        iFrom: number,
        iTo: number
    ) {
        // Skip computations if no-one is listening to the result
        if (this.callbackManagers[iWellLog].onInfoFilledCallbacks.length < 1)
            return;

        const interpolatedData = fillInfos(
            x,
            logController,
            iFrom,
            iTo,
            this.collapsedTrackIds[iWellLog],
            this.props.readoutOptions
        );

        this.callbackManagers[iWellLog].onInfoFilled(interpolatedData);
    }

    // callback function from WellLogView
    onCreateController(iWellLog: number, controller: WellLogController): void {
        this.callbackManagers[iWellLog]?.onCreateController(controller);
        // set callback to component's caller
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        this.props.onCreateController?.(iWellLog, controller);

        this.setControllersZoom();
        this.syncTrackScrollPos(iWellLog);
        this.syncContentScrollPos(iWellLog);
        this.syncContentSelection(iWellLog);

        this.controllers[iWellLog] = controller;
    }
    onDeleteController(iWellLog: number, controller: WellLogController): void {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        this.props.onDeleteController?.(iWellLog, controller);
    }
    // callback function from WellLogView
    onTrackScroll(iWellLog: number): void {
        this.syncTrackScrollPos(iWellLog);
    }
    // callback function from WellLogView
    onTrackSelection(iWellLog: number): void {
        this.syncTrackSelection(iWellLog);
    }
    // callback function from WellLogView
    onContentRescale(iWellLog: number): void {
        this.callbackManagers[iWellLog]?.onContentRescale();

        this.syncTrackScrollPos(iWellLog);
        this.syncContentScrollPos(iWellLog);
        this.syncContentSelection(iWellLog);

        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        this.props.onContentRescale?.(iWellLog);
    }
    // callback function from WellLogView
    onContentSelection(iWellLog: number): void {
        this.callbackManagers[iWellLog]?.onContentSelection();

        this.syncContentSelection(iWellLog);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        this.props.onContentSelection?.(iWellLog);
    }
    // callback function from WellLogView
    onTemplateChanged(iWellLog: number): void {
        this.callbackManagers[iWellLog]?.onTemplateChanged();

        this.syncTemplate(iWellLog);

        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        this.props.onTemplateChanged?.(iWellLog);
    }
    // callback function from Axis selector
    onChangePrimaryAxis(value: string): void {
        for (const callbackManager of this.callbackManagers)
            callbackManager.onChangePrimaryAxis(value);

        if (this._isMounted) this.setState({ primaryAxis: value });
    }

    syncTrackScrollPos(iWellLog: number): void {
        const controller = this.callbackManagers[iWellLog]?.controller;
        if (!controller) return;
        const trackPos = controller.getTrackScrollPos();
        for (const callbackManager of this.callbackManagers) {
            const _controller = callbackManager?.controller;
            if (!_controller || _controller === controller) continue;
            if (this.props.syncTrackPos) _controller.scrollTrackTo(trackPos);
        }
    }
    syncTrackSelection(iWellLog: number): void {
        const controller = this.callbackManagers[iWellLog]?.controller;
        if (!controller) return;
        const trackSelection = controller.getSelectedTrackIndices();
        for (const callbackManager of this.callbackManagers) {
            const _controller = callbackManager?.controller;
            if (!_controller || _controller === controller) continue;
            if (this.props.syncTemplate)
                _controller.setSelectedTrackIndices(trackSelection);
        }
    }

    getCommonContentBaseDomain(): [number, number] {
        const commonBaseDomain: [number, number] = [
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
        ];
        for (const callbackManager of this.callbackManagers) {
            const controller = callbackManager?.controller;
            if (!controller) continue;
            checkMinMax(commonBaseDomain, controller.getContentBaseDomain());
        }
        return commonBaseDomain;
    }

    syncContentBaseDomain(): boolean {
        let updated = false;
        if (
            !(this.props.wellpickFlatting && this.props.wellpicks) &&
            this.props.syncContentDomain
        ) {
            const commonBaseDomain: [number, number] =
                this.getCommonContentBaseDomain();
            for (const callbackManager of this.callbackManagers) {
                const controller = callbackManager?.controller;
                if (!controller) continue;
                const baseDomain = controller.getContentBaseDomain();
                if (!isEqDomains(baseDomain, commonBaseDomain)) {
                    if (controller.setContentBaseDomain(commonBaseDomain))
                        updated = true;
                }
            }
        }
        return updated;
    }

    makeFlattingCoeffs(): {
        A: number[][];
        B: number[][];
        newBaseDomain: [number, number][]; // not used
    } {
        const wellpickFlatting = this.props.wellpickFlatting;
        if (!wellpickFlatting) return { A: [], B: [], newBaseDomain: [] };

        const flattingA: number[][] = [];
        const flattingB: number[][] = [];

        const nView = this.callbackManagers.length;
        const newBaseDomain: [number, number][] = [];
        for (let i = 0; i < nView; i++) {
            newBaseDomain.push([
                Number.POSITIVE_INFINITY,
                Number.NEGATIVE_INFINITY,
            ]);
        }
        for (const callbackManager of this.callbackManagers) {
            const controller = callbackManager.controller;
            const wellLogView = controller as WellLogView;
            const wps = wellLogView ? getWellPicks(wellLogView) : [];
            let wp1: number | undefined = undefined;
            let wp2: number | undefined = undefined;
            for (const wp of wps) {
                if (wellpickFlatting[0] === wp.horizon) wp1 = wp.vPrimary;
                if (wellpickFlatting[1] === wp.horizon) wp2 = wp.vPrimary;
            }

            const _flattingA: number[] = [];
            const _flattingB: number[] = [];
            let j = -1;
            for (const callbackManager of this.callbackManagers) {
                const _controller = callbackManager.controller;
                j++;
                if (!_controller || !controller) {
                    _flattingA.push(0.0);
                    _flattingB.push(0.0);
                    continue;
                }
                const _wellLogView = _controller as WellLogView;
                const _wps = getWellPicks(_wellLogView);
                let _wp1: number | undefined = undefined;
                let _wp2: number | undefined = undefined;
                for (const _wp of _wps) {
                    if (wellpickFlatting[0] === _wp.horizon)
                        _wp1 = _wp.vPrimary;
                    if (wellpickFlatting[1] === _wp.horizon)
                        _wp2 = _wp.vPrimary;
                }

                if (
                    Number.isFinite(wp1) &&
                    Number.isFinite(_wp1) &&
                    wp1 !== undefined &&
                    _wp1 !== undefined
                ) {
                    let a: number;
                    if (
                        Number.isFinite(wp2) &&
                        Number.isFinite(_wp2) &&
                        wp2 !== undefined &&
                        _wp2 !== undefined &&
                        wp2 - wp1
                    )
                        a = (_wp2 - _wp1) / (wp2 - wp1);
                    else {
                        if (this.props.syncContentDomain) {
                            a = 1;
                        } else {
                            const domain = controller.getContentDomain();
                            const _domain = _controller.getContentDomain();
                            if (
                                _domain[1] - _domain[0] &&
                                domain[1] - domain[0]
                            )
                                a =
                                    (_domain[1] - _domain[0]) /
                                    (domain[1] - domain[0]);
                            else a = 1;
                        }
                    }
                    const b = _wp1 - a * wp1;
                    _flattingA.push(a);
                    _flattingB.push(b);

                    const baseDomain = controller.getContentBaseDomain();
                    const baseDomainNew: [number, number] = [
                        a * baseDomain[0] + b,
                        a * baseDomain[1] + b,
                    ];

                    checkMinMax(newBaseDomain[j], baseDomainNew);
                } else {
                    // The first well pick undefined
                    _flattingA.push(controller === _controller ? 1.0 : 0.0);
                    _flattingB.push(0.0);
                }
            }
            flattingA.push(_flattingA);
            flattingB.push(_flattingB);
        }

        return { A: flattingA, B: flattingB, newBaseDomain: newBaseDomain };
    }

    skipSiblings: number[] = [];
    syncContentScrollPos(iWellLog: number): void {
        const controller = this.callbackManagers[iWellLog]?.controller;
        if (!controller) return;

        const domain = controller.getContentDomain();
        if (domain[0] === 0 && domain[1] === 0)
            // controller.logController not created yet
            return;

        let updated = false;
        const wellpickFlatting = this.props.wellpickFlatting;
        const syncContentDomain = this.props.syncContentDomain;
        let coeff: {
            A: number[][];
            B: number[][];
            newBaseDomain: [number, number][];
        } | null = null;
        if (this.props.wellpicks && wellpickFlatting)
            coeff = this.makeFlattingCoeffs();

        // synchronize base domains
        updated = this.syncContentBaseDomain();

        let j = -1;

        const index = this.skipSiblings.findIndex(
            (val: number) => val === iWellLog
        );
        if (index >= 0) {
            this.skipSiblings.splice(index, 1);
        } else
            for (const callbackManager of this.callbackManagers) {
                const _controller = callbackManager?.controller;
                j++;
                if (!_controller || _controller === controller) continue;
                if (coeff) {
                    // wellpick flatting
                    const a = coeff.A[iWellLog][j];
                    const b = coeff.B[iWellLog][j];

                    const domainNew: [number, number] = [
                        a * domain[0] + b,
                        a * domain[1] + b,
                    ];
                    const _domain = _controller.getContentDomain();
                    if (
                        Number.isFinite(domainNew[0]) &&
                        Number.isFinite(domainNew[1])
                    ) {
                        if (!isEqDomains(_domain, domainNew)) {
                            if (_controller.zoomContentTo(domainNew)) {
                                this.skipSiblings.push(j);
                                updated = true;
                            }
                        }

                        // sync scroll bar: not work yet
                        const baseDomain = _controller.getContentBaseDomain();
                        //const newBaseDomain = coeff.newBaseDomain[j];
                        const newBaseDomain: [number, number] = [
                            domainNew[0],
                            domainNew[1],
                        ];
                        if (baseDomain[0] < newBaseDomain[0])
                            newBaseDomain[0] = baseDomain[0];
                        if (baseDomain[1] > newBaseDomain[1])
                            newBaseDomain[1] = baseDomain[1];
                        if (
                            Number.isFinite(newBaseDomain[0]) &&
                            Number.isFinite(newBaseDomain[1])
                        )
                            if (!isEqDomains(baseDomain, newBaseDomain)) {
                                //if(_controller.setContentBaseDomain(newBaseDomain))
                                //    updated = true;
                            }
                    }
                } else if (syncContentDomain) {
                    const _domain = _controller.getContentDomain();
                    if (!isEqDomains(_domain, domain)) {
                        if (_controller.zoomContentTo(domain)) {
                            this.skipSiblings.push(j);
                            updated = true;
                        }
                    }
                }
            }

        if (updated) {
            for (let i = iWellLog - 1; i <= iWellLog; i++) {
                {
                    // restore
                    const _domain = controller.getContentDomain();
                    if (!isEqDomains(_domain, domain))
                        controller.zoomContentTo(domain);
                }

                const spacer = this.spacers[i];
                if (!spacer) continue;
                spacer.update();
            }
        }
    }

    syncContentSelection(iWellLog: number): void {
        const controller = this.callbackManagers[iWellLog]?.controller;
        if (!controller) return;
        const selection = controller.getContentSelection();
        for (const callbackManager of this.callbackManagers) {
            const _controller = callbackManager?.controller;
            if (!_controller || _controller === controller) continue;
            if (this.props.syncContentSelection) {
                const _selection = _controller.getContentSelection();
                if (!isEqualRanges(_selection, selection))
                    _controller.selectContent(selection);
            }
        }

        for (const spacer of this.spacers) {
            if (!spacer) continue;
            spacer.update();
        }
    }

    syncTemplate(iWellLog: number): void {
        const controller = this.callbackManagers[iWellLog]?.controller;
        if (!controller) return;
        const template = controller.getTemplate();
        for (const callbackManager of this.callbackManagers) {
            const _controller = callbackManager?.controller;
            if (!_controller || _controller === controller) continue;
            if (this.props.syncTemplate) _controller.setTemplate(template);
        }
    }

    setControllersZoom(): void {
        for (const callbackManager of this.callbackManagers) {
            const controller = callbackManager?.controller;
            if (!controller) continue;
            if (this.props.domain) {
                controller.zoomContentTo(this.props.domain);
                //this.forceUpdate();
                if (this.props.syncContentDomain) break; // Set the domain only to the first controllers. Another controllers should be set by syncContentDomain or wellpickFlatting options
            }
        }
    }
    setControllersSelection(): void {
        if (!this.props.selection) return;
        for (const callbackManager of this.callbackManagers) {
            const controller = callbackManager?.controller;
            if (!controller) continue;
            controller.selectContent(this.props.selection);
        }
        for (const spacer of this.spacers) {
            if (!spacer) continue;
            spacer.update();
        }
    }

    createView(index: number): ReactNode {
        const callbacks = this.callbacks[index];
        const wellLog = this.wellLogCollections[index];
        const templates = this.props.templates;
        const template = templates[index] ? templates[index] : templates[0];
        const viewTitles = this.props.viewTitles;
        const viewTitle =
            viewTitles && (viewTitles === true ? true : viewTitles[index]);
        const options = {
            ...this.props.welllogOptions,
            maxVisibleTrackNum:
                this.props.welllogOptions?.maxVisibleTrackNum ||
                (this.props.horizontal ? 2 : 3),
        };
        return (
            <WellLogViewWithScroller
                iWellLogView={index}
                key={index}
                welllog={wellLog}
                viewTitle={viewTitle}
                template={template}
                colorTables={this.props.colorTables}
                wellpick={this.props.wellpicks?.[index]}
                patternsTable={this.props.patternsTable}
                patterns={this.props.patterns}
                horizontal={this.props.horizontal}
                axisTitles={this.props.axisTitles}
                axisMnemos={this.props.axisMnemos}
                domain={this.props.domain}
                selection={this.props.selection}
                primaryAxis={this.state.primaryAxis}
                options={options}
                // callbacks
                onInfo={callbacks.onInfoBind}
                onCreateController={callbacks.onCreateControllerBind}
                onTrackMouseEvent={
                    // TODO: Fix this the next time the file is edited.
                    // eslint-disable-next-line react/prop-types
                    this.props.onTrackMouseEvent || onTrackMouseEventDefault
                }
                onTrackScroll={callbacks.onTrackScrollBind}
                onTrackSelection={callbacks.onTrackSelectionBind}
                onContentRescale={callbacks.onContentRescaleBind}
                onContentSelection={callbacks.onContentSelectionBind}
                onTemplateChanged={callbacks.onTemplateChangedBind}
            />
        );
    }

    createSpacer(index: number): ReactNode {
        if (!this.props.spacers) return null;
        const prev = index - 1;

        let width = 75;
        if (typeof this.props.spacers !== "boolean") {
            width =
                typeof this.props.spacers === "number"
                    ? this.props.spacers // all widths are equal
                    : this.props.spacers[prev]; // individual width
        }

        if (width === undefined) width = 75; // set some default value
        if (!width) return null;

        return (
            <div
                style={
                    this.props.horizontal
                        ? { height: width + "px" }
                        : { width: width + "px" }
                }
                key={"s" + index}
            >
                <WellLogSpacer
                    controllers={[
                        this.callbackManagers[prev].controller,
                        this.callbackManagers[index].controller,
                    ]}
                    distance={{
                        units: this.props.wellDistances
                            ? this.props.wellDistances.units
                            : "",
                        value: this.props.wellDistances?.distances[prev],
                    }}
                    colorTables={this.props.colorTables}
                    wellpicks={
                        this.props.wellpicks
                            ? [
                                  this.props.wellpicks[prev],
                                  this.props.wellpicks[index],
                              ]
                            : []
                    }
                    width={width}
                    patternsTable={this.props.patternsTable}
                    patterns={this.props.patterns}
                    // TODO: Fix this the next time the file is edited.
                    // eslint-disable-next-line react/prop-types
                    options={this.props.spacerOptions}
                    horizontal={this.props.horizontal}
                    onCreateSpacer={(spacer: WellLogSpacer): void => {
                        this.spacers[index] = spacer;
                    }}
                ></WellLogSpacer>
            </div>
        );
    }

    render(): JSX.Element {
        return (
            <WellLogLayout
                parent={this}
                center={
                    <div
                        style={{
                            height: "0%",
                            //width: "255px" /*some small value to be grown by flex*/,
                            flex: "1",
                            display: "flex",
                            flexDirection: this.props.horizontal
                                ? "column"
                                : "row",
                        }}
                    >
                        {this.wellLogCollections.map(
                            (_collection, index: number) => [
                                index ? this.createSpacer(index) : null,
                                this.createView(index),
                            ]
                        )}
                    </div>
                }
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line react/prop-types
                layout={this.props.layout || defaultLayout}
            />
        );
    }
}

function getWellLogCollectionsFromProps(props: SyncLogViewerProps) {
    return props.welllogs.map((setOrCollection) => {
        if (Array.isArray(setOrCollection)) return setOrCollection;
        else return [setOrCollection];
    });
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
    /**
     * Hide current position. Default is false
     */
    hideCurrentPosition: PropTypes.bool,
    /**
     * Hide selection interval. Default is false
     */
    hideSelectionInterval: PropTypes.bool,
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
     * Well Picks data array
     */
    wellpicks: PropTypes.array,

    /**
     * Patterns table
     */
    patternsTable: PropTypes.object,
    /**
     * Horizon to pattern index map
     */
    patterns: PropTypes.array, // [string, number][];

    /**
     * Horizon names for wellpick flatting (pan and zoom)
     */
    wellpickFlatting: PropTypes.arrayOf(PropTypes.string),

    /**
     * Set to true or to array of spaser widths if WellLogSpacers should be used
     */
    spacers: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.number,
        PropTypes.arrayOf(PropTypes.number),
    ]),

    /**
     * Distanses between wells to show on the spacers
     */
    wellDistances: PropTypes.object,

    /**
     * Orientation of the track plots on the screen. Default is false
     */
    horizontal: PropTypes.bool,

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
     * The maximum zoom value
     */
    maxContentZoom: PropTypes.number,

    /**
     * Initial visible interval of the log data
     */
    domain: PropTypes.arrayOf(PropTypes.number),

    /**
     * Initial selected interval of the log data
     */
    selection: PropTypes.arrayOf(PropTypes.number),

    /**
     * Set to true for default titles or to array of individial well log titles
     */
    viewTitles: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.arrayOf(
            PropTypes.oneOfType([
                PropTypes.bool,
                PropTypes.string,
                PropTypes.object,
            ])
        ) /* bool, string or react element */,
    ]),

    /**
     * WellLogView additional options
     */
    welllogOptions: WellLogViewOptions_propTypes /*PropTypes.object,*/,

    /**
     * Options for readout panel
     */
    readoutOptions: InfoOptions_propTypes /*PropTypes.object,*/,

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
};

export default SyncLogViewer;
