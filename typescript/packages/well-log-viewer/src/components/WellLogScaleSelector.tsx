import React, { Component } from "react";

import ScaleSelector from "./ScaleSelector";

import type { CallbackManager } from "./CallbackManager";

interface Props {
    callbackManager: CallbackManager | undefined;

    label?: string | JSX.Element;
    values?: number[]; // Available scale values array
    round?: boolean | number; // round the value to a "good" number
}
interface State {
    value: number; // value for scale combo
}

export class WellLogScaleSelector extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            value: 1.0,
        };

        this.onChange = this.onChange.bind(this);
        this.onContentRescale = this.onContentRescale.bind(this);
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
        this.registerCallbacks(this.props.callbackManager);
    }

    componentWillUnmount(): void {
        this.unregisterCallbacks(this.props.callbackManager);
    }

    componentDidUpdate(prevProps: Props): void {
        if (prevProps.callbackManager !== this.props.callbackManager) {
            this.unregisterCallbacks(prevProps.callbackManager);
            this.registerCallbacks(this.props.callbackManager);
        }
    }

    // callback function from Vertical Scale combobox
    onChange(value: number): void {
        const controller = this.props.callbackManager?.controller;
        if (!controller) return;
        controller.setContentScale(value);
    }

    onContentRescale(): void {
        this.setState((state: Readonly<State>) => {
            const controller = this.props.callbackManager?.controller;
            if (!controller) return null;
            const value = controller.getContentScale();
            if (Math.abs(state.value - value) < 1) return null;
            return {
                value: value,
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
                        onChange={this.onChange}
                        values={this.props.values}
                        value={this.state.value}
                        round={this.props.round}
                    />
                </span>
            </div>
        );
    }
}

export default WellLogScaleSelector;
