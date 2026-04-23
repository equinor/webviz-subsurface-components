import type { ReactNode } from "react";
import React, { Component } from "react";

import PropTypes from "prop-types";

import type { LogViewer } from "@equinor/videx-wellog";

import WellLogSpacer from "./components/WellLogSpacer";
import type { WellLogSpacerOptions } from "./components/WellLogSpacer";
import WellLogViewWithScroller from "./components/WellLogViewWithScroller";

import { CallbackManager } from "./components/CallbackManager";

import type { ViewerLayout } from "./components/WellLogLayout";
import WellLogLayout from "./components/WellLogLayout";
import defaultLayout from "./components/DefaultSyncLogViewerLayout";

import type { WellLogSet } from "./components/WellLogTypes";
import type { Template } from "./components/WellLogTemplateTypes";
import {
    ColorFunctionType,
    PatternsTableType,
    PatternsType,
} from "./components/CommonPropTypes";

import type WellLogView from "./components/WellLogView";
import type {
    WellLogController,
    WellPickProps,
    WellLogViewOptions,
    TrackMouseEvent,
} from "./components/WellLogView";
import { WellPickPropsType, getWellPicks } from "./components/WellLogView";

import type { ColormapFunction } from "./utils/color-function";
import type { PatternsTable, Pattern } from "./utils/pattern";
import { getAvailableAxes } from "./utils/well-log";

import { checkMinMax } from "./utils/minmax";

import { onTrackMouseEventDefault } from "./utils/edit-track";

import { fillInfos } from "./utils/fill-info";
import type { Info, InfoOptions } from "./components/InfoTypes";

import type { OpenRange, Range } from "./utils/arrayTypes";
import {
    isEqDomains,
    isEqualArrays,
    isEqualRanges,
    toggleId,
} from "./utils/arrays";

export type WellDistances = {
    units: string;
    distances: (number | undefined)[];
};
export const WellDistancesType = PropTypes.shape({
    units: PropTypes.string.isRequired,
    distances:
        PropTypes
            .array /*Of(PropTypes.oneOfType([PropTypes.number, PropTypes.undefined])*/
            .isRequired,
});

export interface SyncLogViewerProps {
    /**
     * An array of JSON well log objects. A synced well log is created per entry.
     * @deprecated use wellLogCollections instead
     */
    welllogs?: (WellLogSet | WellLogSet[])[];

    /**
     * An array of collections of well log sets. A synced well log is created per entry
     */
    wellLogCollections?: WellLogSet[][];

    /**
     * Prop containing track templates data.
     */
    templates: Template[];

    /**
     * Prop containing color function/table array.
     */
    colorMapFunctions: ColormapFunction[];

    /**
     * Set to true for default titles or to array of individual well log titles
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
    patterns?: Pattern[];

    /**
     * Horizon names for wellpick flatting (pan and zoom)
     */
    wellpickFlatting?: string[]; // For example ["Hor_5", "Hor_3"];

    /**
     * Set to true or to spacer width or to array of widths if WellLogSpacers should be used
     */
    spacers?: boolean | number | number[];
    /**
     * Distances between wells to show on the spacers
     */
    wellDistances?: WellDistances;

    /**
     * Orientation of the track plots on the screen.
     */
    horizontal?: boolean;
    syncTrackPos?: boolean;
    /**
     * Synchronize visible content domain (pan and zoom) across all the tracks in the views.
     */
    syncContentDomain?: boolean;
    /**
     * Synchronize selected content across all the tracks in the views.
     */
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
     * Initial visible range. A single domain applies to all the tracks,
     * an array of domains applies to the tracks in corresponding views.
     */
    domain?: Range | Range[];

    /**
     * Initial selected range. A single selection applies to all the tracks,
     * an array of selections applies to the tracks in corresponding views.
     */
    selection?: OpenRange | OpenRange[];

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
    onTrackMouseLeaveEvent?: () => void;

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
    welllogs: {
        description:
            "Array of JSON objects describing well log data.\n<i>Deprecated — Use <b>wellLogCollections</b> instead.</i>",
    },
    wellLogCollections: {
        description:
            "An array of collections of well log sets. A synced well log is created per entry",
    },
    templates: {
        description: "Array of track template data.",
    },
    colorMapFunctions: {
        description: "Prop containing color function/table data.",
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
        description: "Distances between wells to show on the spacers",
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
    spacerOptions: {
        description: "Options for well log spacer",
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
            "Set to true for default titles or to array of individual well log titles",
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static propTypes: Record<string, any>;

    spacers: (WellLogSpacer | null)[];

    wellLogCollections: WellLogSet[][];

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
    controllers: WellLogController[]; // for onDeleteController implementation

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
        // Always prioritize wellLogCollections if it's set
        const logCollectionKey = this.props.wellLogCollections
            ? "wellLogCollections"
            : "welllogs";

        if (
            this.props[logCollectionKey] !== prevProps[logCollectionKey] ||
            this.props.templates !== prevProps.templates ||
            this.props.axisMnemos !== prevProps.axisMnemos ||
            this.props.primaryAxis !== prevProps.primaryAxis
        ) {
            const value = this.getDefaultPrimaryAxis();
            this.onChangePrimaryAxis(value);
        }

        if (
            this.props.syncContentDomain !== prevProps.syncContentDomain ||
            !isEqualDomains(this.props.domain, prevProps.domain)
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
            this.props[logCollectionKey]?.length !==
                prevProps[logCollectionKey]?.length
        ) {
            if (this.props[logCollectionKey]?.length)
                this.syncContentScrollPos(0); // force to redraw visible domain
        }

        if (!isEqualSelections(this.props.selection, prevProps.selection)) {
            this.setControllersSelection();
        }

        if (
            this.props.syncContentSelection !==
                prevProps.syncContentSelection ||
            this.props[logCollectionKey]?.length !==
                prevProps[logCollectionKey]?.length
        ) {
            if (this.props[logCollectionKey]?.length)
                this.syncContentSelection(0); // force to redraw selection
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
            this.props.onInfoFilled?.(iView, infos);
        };

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
            console.assert(!!this.controllers[iView]);
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
    ): void {
        this.callbackManagers[iWellLog].onInfo(x, logController, iFrom, iTo);
        this.props.onInfo?.(iWellLog, x, logController, iFrom, iTo);

        this.fillInfo(iWellLog, x, logController, iFrom, iTo);
    }

    fillInfo(
        iWellLog: number,
        x: number,
        logController: LogViewer,
        iFrom: number,
        iTo: number
    ): void {
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
        this.props.onCreateController?.(iWellLog, controller);

        this.setControllersZoom();
        this.syncTrackScrollPos(iWellLog);
        this.syncContentScrollPos(iWellLog);
        this.syncContentSelection(iWellLog);

        this.controllers[iWellLog] = controller;
    }
    onDeleteController(iWellLog: number, controller: WellLogController): void {
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

        this.props.onContentRescale?.(iWellLog);
    }
    // callback function from WellLogView
    onContentSelection(iWellLog: number): void {
        this.callbackManagers[iWellLog]?.onContentSelection();

        this.syncContentSelection(iWellLog);
        this.props.onContentSelection?.(iWellLog);
    }
    // callback function from WellLogView
    onTemplateChanged(iWellLog: number): void {
        this.callbackManagers[iWellLog]?.onTemplateChanged();

        this.syncTemplate(iWellLog);

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

    getCommonContentBaseDomain(): Range {
        const commonBaseDomain: Range = [
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
            const commonBaseDomain: Range = this.getCommonContentBaseDomain();
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
        newBaseDomain: Range[]; // not used
    } {
        const wellpickFlatting = this.props.wellpickFlatting;
        if (!wellpickFlatting) return { A: [], B: [], newBaseDomain: [] };

        const flattingA: number[][] = [];
        const flattingB: number[][] = [];

        const nView = this.callbackManagers.length;
        const newBaseDomain: Range[] = [];
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
                    const baseDomainNew: Range = [
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
            newBaseDomain: Range[];
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

                    const domainNew: Range = [
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
                        const newBaseDomain: Range = [
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
        if (!this.props.syncTemplate) return;

        const template = controller.getTemplate();
        for (const callbackManager of this.callbackManagers) {
            const _controller = callbackManager?.controller;
            if (!_controller || _controller === controller) continue;

            _controller.setTemplate(template, true);
        }
    }

    setControllersZoom(): void {
        for (const [
            index,
            callbackManager,
        ] of this.callbackManagers.entries()) {
            const controller = callbackManager?.controller;
            if (!controller) continue;
            const domain = getDomain(this.props.domain, index);
            if (domain) {
                controller.zoomContentTo(domain);
                //this.forceUpdate();
                if (this.props.syncContentDomain) break; // Set the domain only to the first controllers. Other controllers should be set by syncContentDomain or wellpickFlatting options
            }
        }
    }
    setControllersSelection(): void {
        if (!this.props.selection) return;
        for (const [
            index,
            callbackManager,
        ] of this.callbackManagers.entries()) {
            const controller = callbackManager?.controller;
            if (!controller) continue;
            const selection = getSelection(this.props.selection, index);
            if (selection) {
                controller.selectContent(selection);
            }
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
                key={index}
                welllog={wellLog}
                viewTitle={viewTitle}
                template={template}
                colorMapFunctions={this.props.colorMapFunctions}
                wellpick={this.props.wellpicks?.[index]}
                patternsTable={this.props.patternsTable}
                patterns={this.props.patterns}
                horizontal={this.props.horizontal}
                axisTitles={this.props.axisTitles}
                axisMnemos={this.props.axisMnemos}
                domain={getDomain(this.props.domain, index)}
                selection={getSelection(this.props.selection, index)}
                primaryAxis={this.state.primaryAxis}
                options={options}
                // callbacks
                onInfo={callbacks.onInfoBind}
                onCreateController={callbacks.onCreateControllerBind}
                onTrackMouseEvent={
                    this.props.onTrackMouseEvent || onTrackMouseEventDefault
                }
                onTrackMouseLeaveEvent={this.props.onTrackMouseLeaveEvent}
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
                    colorMapFunctions={this.props.colorMapFunctions}
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
                layout={this.props.layout || defaultLayout}
            />
        );
    }
}

function getWellLogCollectionsFromProps(props: SyncLogViewerProps) {
    const collectionProp = props.wellLogCollections ?? props.welllogs ?? [];

    return collectionProp.map((setOrCollection) => {
        if (Array.isArray(setOrCollection)) return setOrCollection;
        else return [setOrCollection];
    });
}

/**
 * Retrieves the domain range for a specific index from the provided domain configuration.
 *
 * @param domain - The domain configuration, which can be either a single [min, max] tuple
 *                 applicable to all indices, or an array of [min, max] tuples, one for each index.
 * @param index - The index to retrieve the domain for. Only used if domain is an array of tuples.
 * @returns A [min, max] tuple representing the domain range, or undefined if the domain
 *          configuration is invalid or the index is out of bounds.
 */
function getDomain(
    domain: SyncLogViewerProps["domain"],
    index: number
): Range | undefined {
    if (Array.isArray(domain)) {
        if (Array.isArray(domain[0])) {
            return domain[index] as Range | undefined;
        } else {
            return domain as Range;
        }
    }
    return undefined;
}

/**
 * Compares two domain props for structural and value equality.
 *
 * Supports both accepted domain shapes:
 * - A single [min, max] tuple used by all views.
 * - An array of [min, max] tuples used per view.
 *
 * @param domain1 - First domain value to compare.
 * @param domain2 - Second domain value to compare.
 * @returns True when both domains represent the same ranges, otherwise false.
 */
function isEqualDomains(
    domain1: SyncLogViewerProps["domain"],
    domain2: SyncLogViewerProps["domain"]
): boolean {
    if (domain1 === domain2) return true;
    if (!domain1 || !domain2) return false;
    if (typeof domain1 !== typeof domain2) return false;
    if (typeof domain1[0] === "number") {
        return isEqualRanges(domain1 as Range, domain2 as Range);
    }
    return domain1.every((range, index) =>
        isEqualRanges(range as Range, domain2[index] as Range)
    );
}

/**
 * Retrieves the selection range for a specific index from the provided selection configuration.
 *
 * @param selection - The selection configuration, either a single [from, to] tuple
 *                    for all indices or an array of [from, to] tuples per index.
 * @param index - The index to retrieve the selection for when selection is per-index.
 * @returns A [from, to] tuple for the requested index, or undefined when unavailable.
 */
function getSelection(
    selection: SyncLogViewerProps["selection"],
    index: number
): OpenRange | undefined {
    if (Array.isArray(selection)) {
        if (Array.isArray(selection[0])) {
            return selection[index] as OpenRange | undefined;
        } else {
            return selection as OpenRange;
        }
    }
    return undefined;
}

/**
 * Compares two selection props for structural and value equality.
 *
 * Supports both accepted selection shapes:
 * - A single [from, to] tuple used by all indices.
 * - An array of [from, to] tuples used per index.
 *
 * @param selection1 - First selection value to compare.
 * @param selection2 - Second selection value to compare.
 * @returns True when both selections represent the same ranges, otherwise false.
 */
function isEqualSelections(
    selection1: SyncLogViewerProps["selection"],
    selection2: SyncLogViewerProps["selection"]
): boolean {
    if (selection1 === selection2) return true;
    if (!selection1 || !selection2) return false;
    if (typeof selection1 !== typeof selection2) return false;
    if (typeof selection1[0] === "number" || selection1[0] === undefined) {
        return isEqualRanges(selection1 as OpenRange, selection2 as OpenRange);
    }
    return selection1.every((range, index) =>
        isEqualRanges(range as OpenRange, selection2[index] as OpenRange)
    );
}

///
export const WellLogViewOptionsTypes = PropTypes.shape({
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

export const InfoOptionsTypes = PropTypes.shape({
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
     * An array of JSON well log objects. A synced well log is created per entry.
     * @deprecated use wellLogCollections instead
     */
    welllogs: PropTypes.array,

    /**
     * An array of collections of well log sets. A synced well log is created per entry
     */
    wellLogCollections: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)),

    /**
     * Prop containing track template data
     */
    templates: PropTypes.array.isRequired,

    /**
     * Prop containing color function/table data
     */
    colorMapFunctions: PropTypes.arrayOf(ColorFunctionType).isRequired,

    /**
     * Well Picks data array
     */
    wellpicks: PropTypes.arrayOf(WellPickPropsType),

    /**
     * Patterns table
     */
    patternsTable: PatternsTableType,
    /**
     * Horizon to pattern index map
     */
    patterns: PropTypes.arrayOf(PatternsType),

    /**
     * Horizon names for wellpick flatting (pan and zoom)
     */
    wellpickFlatting: PropTypes.arrayOf(PropTypes.string),

    /**
     * Set to true or to array of spacer widths if WellLogSpacers should be used
     */
    spacers: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.number,
        PropTypes.arrayOf(PropTypes.number),
    ]),

    /**
     * Distances between wells to show on the spacers
     */
    wellDistances: WellDistancesType,

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
    axisTitles: PropTypes.object /*Of<Record<string, string>>*/,

    /**
     * Names for axes
     */
    axisMnemos: PropTypes.object /*Of<Record<string, string[]>>*/,

    /**
     * The maximum zoom value
     */
    maxContentZoom: PropTypes.number,

    /**
     * Initial visible interval of the log data
     */
    domain: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.number),
        PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    ]),

    /**
     * Initial selected interval of the log data
     */
    selection: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.number),
        PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    ]),

    /**
     * Set to true for default titles or to array of individual well log titles
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
    welllogOptions: WellLogViewOptionsTypes,

    /**
     * Options for readout panel
     */
    readoutOptions: InfoOptionsTypes,

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
