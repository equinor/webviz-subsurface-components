import React, { Component } from "react";

import { LogViewer } from "@equinor/videx-wellog";

import WellLogViewer from "../WellLogViewer";
import SyncLogViewer from "../SyncLogViewer";
import { CallbackManager } from "./CallbackManager";

import InfoPanel from "./InfoPanel";
import { Info, InfoOptions } from "./InfoTypes";

import { fillInfos } from "../utils/fill-info";

interface Props {
    parent: SyncLogViewer | WellLogViewer;
    header?: string;

    callbacksManager: CallbackManager<SyncLogViewer | WellLogViewer>;
    readoutOptions?: InfoOptions; // options for readout
}

interface State {
    infos: Info[];
}

export class WellLogInfoPanel extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            infos: [],
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
            this.props.parent.updateReadoutPanel(); // force onInfo callback to be called
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
                this.props.parent.collapsedTrackIds,
                this.props.readoutOptions
            ),
        });
    }

    onInfoGroupClick(trackId: string | number): void {
        const i = this.props.parent.collapsedTrackIds.indexOf(trackId);
        if (i < 0) this.props.parent.collapsedTrackIds.push(trackId);
        else delete this.props.parent.collapsedTrackIds[i];

        this.props.parent.updateReadoutPanel(); // force to get onInfo call from WellLogView
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
