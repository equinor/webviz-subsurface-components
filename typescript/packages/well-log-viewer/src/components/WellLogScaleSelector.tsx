import React, { Component } from "react";

import ScaleSelector from "./ScaleSelector";

import type { CallbackManager } from "./CallbackManager";

interface Props {
    callbackManager: CallbackManager | undefined;

    label?: string | JSX.Element;
    values?: number[];
}
interface State {
    scale: number; // value for scale combo
}

export class WellLogScaleSelector extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            scale: 1.0,
        };

        this.onScaleChange = this.onScaleChange.bind(this);
        this.onContentRescale = this.onContentRescale.bind(this);
        this.props.callbackManager?.registerCallback(
            "onContentRescale",
            this.onContentRescale
        );
    }
    componentWillUnmount(): void {
        this.props.callbackManager?.unregisterCallback(
            "onContentRescale",
            this.onContentRescale
        );
    }

    // callback function from Vertical Scale combobox
    onScaleChange(value: number): void {
        const controller = this.props.callbackManager?.controller;
        if (!controller) return;
        controller.setContentScale(value);
    }

    onContentRescale(): void {
        this.setState((state: Readonly<State>) => {
            const controller = this.props.callbackManager?.controller;
            if (!controller) return null;
            const scale = controller.getContentScale();
            if (Math.abs(state.scale - scale) < 1) return null;
            return {
                scale: scale,
            };
        });
    }

    render(): JSX.Element {
        return (
            <div className="scale">
                {this.props.label && (
                    <span className="scale-label">{this.props.label}</span>
                )}
                <span className="scale-value">
                    <ScaleSelector
                        onScaleChange={this.onScaleChange}
                        values={this.props.values}
                        scale={this.state.scale}
                    />
                </span>
            </div>
        );
    }
}

export default WellLogScaleSelector;
