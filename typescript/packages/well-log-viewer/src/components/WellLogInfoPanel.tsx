import React, { Component } from "react";

import type { CallbackManager } from "./CallbackManager";
import InfoPanel from "./InfoPanel";
import type { Info, InfoOptions } from "./InfoTypes";

import "./SidePanel.scss";

interface Props {
    callbackManager: CallbackManager;

    header?: string | JSX.Element;
    readoutOptions?: InfoOptions; // options for readout
}
interface State {
    infos: Info[];
}

export class WellLogInfoPanel extends Component<Props, State> {
    onGroupClick?: (info: Info) => void;
    collapsedTrackIds: (string | number)[];

    constructor(props: Props) {
        super(props);
        this.state = {
            infos: [],
        };
        this.collapsedTrackIds = [];

        this.onInfoFilled = this.onInfoFilled.bind(this);
        this.onGroupClick = undefined;
    }

    registerCallBacks(callbackManager: CallbackManager | undefined): void {
        if (!callbackManager) return;

        callbackManager.registerCallback("onInfoFilled", this.onInfoFilled);

        this.onGroupClick = callbackManager.callCallbacks.bind(
            callbackManager,
            "onInfoGroupClick"
        );
    }
    unregisterCallBacks(callbackManager: CallbackManager | undefined): void {
        if (!callbackManager) return;
        this.onGroupClick = undefined;
        callbackManager.unregisterCallback("onInfoFilled", this.onInfoFilled);
    }

    componentDidMount(): void {
        const callbackManager = this.props.callbackManager;
        this.registerCallBacks(callbackManager);

        callbackManager.updateInfo(); // force onInfo callback to be called
    }

    componentWillUnmount(): void {
        const callbackManager = this.props.callbackManager;
        this.unregisterCallBacks(callbackManager);
    }

    componentDidUpdate(prevProps: Props /*, prevState: State*/): void {
        if (prevProps.callbackManager !== this.props.callbackManager) {
            this.unregisterCallBacks(prevProps.callbackManager);
            this.registerCallBacks(this.props.callbackManager);
        }
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
    onInfoFilled(infos: Info[]): void {
        this.setState({ infos: infos });
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
