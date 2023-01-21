import React, { Component } from "react";

import { LogViewer } from "@equinor/videx-wellog";

import { CallbackManager } from "./CallbackManager";

import InfoPanel from "./InfoPanel";
import { Info, InfoOptions } from "./InfoTypes";

import { fillInfos } from "../utils/fill-info";

interface Props {
    callbacksManager: CallbackManager;

    header?: string;
    readoutOptions?: InfoOptions; // options for readout
}
interface State {
    infos: Info[];

    collapsedTrackIds: (string | number)[];
}

export class WellLogInfoPanel extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            infos: [],
            collapsedTrackIds: [],
        };

        this.onInfoGroupClick = this.onInfoGroupClick.bind(this);
        this.onInfo = this.onInfo.bind(this);
        this.props.callbacksManager.registerCallback("onInfo", this.onInfo);
    }
    componentWillUnmount(): void {
        this.props.callbacksManager.unregisterCallback("onInfo", this.onInfo);
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
            this.props.callbacksManager.updateInfo(); // force onInfo callback to be called
        }
    }

    // callback function from WellLogView
    onInfo(
        x: number,
        logController: LogViewer,
        iFrom: number,
        iTo: number
    ): void {
        this.setState({
            infos: fillInfos(
                x,
                logController,
                iFrom,
                iTo,
                this.state.collapsedTrackIds,
                this.props.readoutOptions
            ),
        });
    }

    onInfoGroupClick(trackId: string | number): void {
        const collapsedTrackIds = this.state.collapsedTrackIds;
        const i = collapsedTrackIds.indexOf(trackId);
        if (i < 0) collapsedTrackIds.push(trackId);
        else delete collapsedTrackIds[i];

        this.props.callbacksManager.updateInfo(); // force to get onInfo call from WellLogView
    }

    render(): JSX.Element {
        return (
            <InfoPanel
                header={this.props.header}
                infos={this.state.infos}
                onGroupClick={this.onInfoGroupClick}
            />
        );
    }
}

export default WellLogInfoPanel;
