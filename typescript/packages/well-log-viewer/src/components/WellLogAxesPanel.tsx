import React, { Component } from "react";

import AxisSelector from "./AxisSelector";

import { getAvailableAxes } from "../utils/tracks";

import type { CallbackManager } from "./CallbackManager";
import type { WellLogCollection } from "./WellLogTypes";

interface Props {
    callbackManager: CallbackManager;

    header?: string | JSX.Element;

    /**
     * Log mnemonics for axes
     */
    axisTitles: Record<string, string>;
    /**
     * Names for axes
     */
    axisMnemos: Record<string, string[]>;

    primaryAxis: string;

    onChangePrimaryAxis: (value: string) => void;

    /**
     * Hide the component when only one axis is available
     */
    autoHide?: boolean;
}
interface State {
    axes: string[]; // axes available in well log
    primaryAxis: string;
}

export class WellLogAxesPanel extends Component<Props, State> {
    wellLog: WellLogCollection | undefined;

    constructor(props: Props) {
        super(props);

        this.wellLog = this.props.callbackManager.wellLog() ?? [];
        const axes = getAvailableAxes(this.wellLog, this.props.axisMnemos);

        this.state = {
            axes: axes,
            primaryAxis: this.props.primaryAxis,
        };

        this.onChangePrimaryAxis = this.onChangePrimaryAxis.bind(this);
    }

    registerCallbacks(callbackManager: CallbackManager): void {
        callbackManager?.registerCallback(
            "onChangePrimaryAxis",
            this.onChangePrimaryAxis
        );
    }
    unregisterCallbacks(callbackManager: CallbackManager): void {
        callbackManager?.unregisterCallback(
            "onChangePrimaryAxis",
            this.onChangePrimaryAxis
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

        const wellog = this.props.callbackManager?.wellLog();
        if (
            this.wellLog !== wellog ||
            prevProps.axisMnemos !== this.props.axisMnemos
        ) {
            this.wellLog = wellog;
            const axes = getAvailableAxes(
                this.wellLog ?? [],
                this.props.axisMnemos
            );
            this.setState({
                axes: axes,
            });
        }
    }

    onChangePrimaryAxis(value: string): void {
        this.setState({ primaryAxis: value });
    }

    render(): JSX.Element {
        return (
            <div className="axes-selector">
                <AxisSelector
                    header={this.props.header}
                    axes={this.state.axes}
                    value={this.state.primaryAxis}
                    axisTitles={this.props.axisTitles}
                    onChange={(value: string) =>
                        this.props.onChangePrimaryAxis(value)
                    }
                    autoHide={this.props.autoHide}
                />
            </div>
        );
    }
}

export default WellLogAxesPanel;
