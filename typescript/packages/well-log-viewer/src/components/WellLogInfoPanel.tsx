import React, { Component } from "react";

import type { LogViewer } from "@equinor/videx-wellog";

import type { CallbackManager } from "./CallbackManager";
import InfoPanel from "./InfoPanel";
import type { Info, InfoOptions } from "./InfoTypes";

import { fillInfos } from "../utils/fill-info";
import "./SidePanel.scss";

interface Props {
    callbackManager: CallbackManager;

    header?: string | JSX.Element;
    readoutOptions?: InfoOptions; // options for readout
}
interface State {
    infos: Info[];
}

function toggleId(
    trackIds: (string | number)[],
    trackId: string | number
): void {
    const i = trackIds.indexOf(trackId);
    if (i < 0) trackIds.push(trackId);
    else trackIds.splice(i, 1);
}

export class WellLogInfoPanel extends Component<Props, State> {
    onGroupClick: (info: Info) => void;
    collapsedTrackIds: (string | number)[];

    constructor(props: Props) {
        super(props);
        this.state = {
            infos: [],
        };
        this.collapsedTrackIds = [];

        this.onInfo = this.onInfo.bind(this);
        this.onInfoGroupClick = this.onInfoGroupClick.bind(this);

        const callbackManager = this.props.callbackManager;
        this.onGroupClick = callbackManager.callCallbacks.bind(
            callbackManager,
            "onInfoGroupClick"
        );
    }

    componentDidMount(): void {
        const callbackManager = this.props.callbackManager;
        callbackManager.registerCallback("onInfo", this.onInfo);
        callbackManager.registerCallback(
            "onInfoGroupClick",
            this.onInfoGroupClick,
            true
        );

        callbackManager.updateInfo(); // force onInfo callback to be called
    }

    componentWillUnmount(): void {
        const callbackManager = this.props.callbackManager;
        callbackManager.unregisterCallback("onInfo", this.onInfo);
        callbackManager.unregisterCallback(
            "onInfoGroupClick",
            this.onInfoGroupClick
        );
    }

    componentDidUpdate(prevProps: Props /*, prevState: State*/): void {
        if (
            this.props.readoutOptions &&
            (!prevProps.readoutOptions ||
                this.props.readoutOptions.allTracks !==
                    prevProps.readoutOptions.allTracks ||
                this.props.readoutOptions.grouping !==
                    prevProps.readoutOptions.grouping)
        ) {
            this.props.callbackManager.updateInfo(); // force onInfo callback to be called
        }
    }

    // callback function from WellLogView
    onInfo(
        x: number,
        logController: LogViewer,
        iFrom: number,
        iTo: number
    ): void {
        const infos = fillInfos(
            x,
            logController,
            iFrom,
            iTo,
            this.collapsedTrackIds,
            this.props.readoutOptions
        );
        this.setState({ infos: infos });
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
        this.props.callbackManager.updateInfo(); // force to get onInfo call from WellLogView
    }

    render(): JSX.Element {
        return (
            <InfoPanel
                header={this.props.header}
                infos={this.state.infos}
                onGroupClick={this.onGroupClick}
            />
        );
    }
}

export default WellLogInfoPanel;
