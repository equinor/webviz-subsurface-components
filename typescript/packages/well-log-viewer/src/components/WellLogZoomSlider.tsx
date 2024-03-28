import React, { Component } from "react";

import { CallbackManager } from "./CallbackManager";

import ZoomSlider from "./ZoomSlider";

interface Props {
    callbacksManager: CallbackManager;

    label?: string;
    max?: number;
}
interface State {
    zoomValue: number; // value for zoom slider
}

export default class WellLogZoomSlider extends Component<Props, State> {
    constructor(props: Props, state: State) {
        super(props, state);
        this.state = {
            zoomValue: 4.0,
        };

        this.onContentRescale = this.onContentRescale.bind(this);
        this.onZoomSliderChange = this.onZoomSliderChange.bind(this);

        this.props.callbacksManager.registerCallback(
            "onContentRescale",
            this.onContentRescale
        );
    }
    componentWillUnmount(): void {
        this.props.callbacksManager.unregisterCallback(
            "onContentRescale",
            this.onContentRescale
        );
    }

    onContentRescale(): void {
        this.setState((state: Readonly<State>) => {
            const controller = this.props.callbacksManager.controller;
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
        this.props.callbacksManager.controller?.zoomContent(zoom);
    }

    render(): JSX.Element {
        return (
            <div
                style={{
                    paddingLeft: "10px",
                    paddingTop: "5px",
                    display: "flex",
                }}
            >
                {this.props.label && <span>{this.props.label}</span>}
                <span
                    style={{
                        flex: "1",
                        padding: "0 20px 0 10px",
                    }}
                >
                    <ZoomSlider
                        value={this.state.zoomValue}
                        max={this.props.max}
                        onChange={this.onZoomSliderChange}
                    />
                </span>
            </div>
        );
    }
}

