import React, { Component } from "react";

import type { CallbackManager } from "./CallbackManager";

import ZoomSlider from "./ZoomSlider";

interface Props {
    callbackManager: CallbackManager | undefined;

    label?: string | JSX.Element;
    max?: number;
}
interface State {
    zoomValue: number; // value for zoom slider
}

export class WellLogZoomSlider extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            zoomValue: 1.0,
        };

        this.onContentRescale = this.onContentRescale.bind(this);
        this.onZoomSliderChange = this.onZoomSliderChange.bind(this);
    }

    registerCallbacks(callbackManager: CallbackManager | undefined): void {
        callbackManager?.registerCallback(
            "onContentRescale",
            this.onContentRescale
        );
    }

    unregisterCallbacks(callbackManager: CallbackManager | undefined): void {
        callbackManager?.unregisterCallback(
            "onContentRescale",
            this.onContentRescale
        );
    }

    componentDidMount(): void {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        this.registerCallbacks(this.props.callbackManager);
    }

    componentWillUnmount(): void {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        this.unregisterCallbacks(this.props.callbackManager);
    }

    componentDidUpdate(prevProps: Props): void {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        if (prevProps.callbackManager !== this.props.callbackManager) {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.unregisterCallbacks(prevProps.callbackManager);
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.registerCallbacks(this.props.callbackManager);
        }
    }

    onContentRescale(): void {
        this.setState((state: Readonly<State>) => {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            const controller = this.props.callbackManager?.controller;
            if (!controller) return null;
            const zoom = controller.getContentZoom();
            if (Math.abs(Math.log(state.zoomValue / zoom)) < 0.01) return null;
            return {
                zoomValue: zoom,
            };
        });
    }

    // callback function from zoom slider
    onZoomSliderChange(zoom: number): void {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        this.props.callbackManager?.controller?.zoomContent(zoom);
    }

    render(): JSX.Element {
        return (
            <div className="zoom">
                {/* TODO: Fix this the next time the file is edited. */}
                {/* eslint-disable-next-line react/prop-types */}
                {this.props.label && (
                    // TODO: Fix this the next time the file is edited.
                    // eslint-disable-next-line react/prop-types
                    <span className="zoom-label">{this.props.label}</span>
                )}
                <span className="zoom-value">
                    <ZoomSlider
                        value={this.state.zoomValue}
                        // TODO: Fix this the next time the file is edited.
                        // eslint-disable-next-line react/prop-types
                        max={this.props.max}
                        onChange={this.onZoomSliderChange}
                    />
                </span>
            </div>
        );
    }
}

export default WellLogZoomSlider;
