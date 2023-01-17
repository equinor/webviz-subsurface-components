import React, { Component } from "react";

import { LogViewer } from "@equinor/videx-wellog";

import WellLogViewer from "../WellLogViewer";

import InfoPanel from "./InfoPanel";
import { Info } from "./InfoTypes";

import { fillInfos } from "../utils/fill-info";

interface Props {
    parent: WellLogViewer;
    header?: string;
}

interface State {
    infos: Info[];
}

export class WellLogInfoPanel extends Component<Props, State> {
    collapsedTrackIds: (string | number)[];
    constructor(props: Props) {
        super(props);
        this.collapsedTrackIds = [];
        this.state = {
            infos: [],
        };

        this.onInfoGroupClick = this.onInfoGroupClick.bind(this);
        this.onInfo = this.onInfo.bind(this);
        this.props.parent.registerCallback("onInfo", this.onInfo);
    }
    componentWillUnmount(): void {
        this.props.parent.registerCallback("onInfo", this.onInfo);
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
                this.collapsedTrackIds,
                this.props.parent.props.readoutOptions
            ),
        });
    }

    onInfoGroupClick(trackId: string | number): void {
        const i = this.collapsedTrackIds.indexOf(trackId);
        if (i < 0) this.collapsedTrackIds.push(trackId);
        else delete this.collapsedTrackIds[i];

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
