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
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const callbackManager = this.props.callbackManager;
        this.registerCallBacks(callbackManager);

        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        callbackManager.updateInfo(); // force onInfo callback to be called
    }

    componentWillUnmount(): void {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const callbackManager = this.props.callbackManager;
        this.unregisterCallBacks(callbackManager);
    }

    componentDidUpdate(prevProps: Props /*, prevState: State*/): void {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        if (prevProps.callbackManager !== this.props.callbackManager) {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.unregisterCallBacks(prevProps.callbackManager);
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.registerCallBacks(this.props.callbackManager);
        }
        if (
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.props.readoutOptions && // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            (!prevProps.readoutOptions ||
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line react/prop-types
                this.props.readoutOptions.allTracks !== // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line react/prop-types
                prevProps.readoutOptions.allTracks || // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.props.readoutOptions.grouping !== // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            prevProps.readoutOptions.grouping)
        ) {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
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
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line react/prop-types
                header={this.props.header}
                infos={this.state.infos}
                onGroupClick={this.onGroupClick}
            />
        );
    }
}

export default WellLogInfoPanel;
