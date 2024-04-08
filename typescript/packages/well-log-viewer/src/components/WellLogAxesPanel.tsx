import React, { Component } from "react";

import AxisSelector from "./AxisSelector";

import { getAvailableAxes } from "../utils/tracks";

import type { WellLog } from "./WellLogTypes";
import type { CallbackManager } from "./CallbackManager";

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
    axes: string[]; // axes available in welllog
    primaryAxis: string;
}

export class WellLogAxesPanel extends Component<Props, State> {
    welllog: WellLog | undefined;

    constructor(props: Props) {
        super(props);

        this.welllog = this.props.callbackManager.welllog();
        const axes = getAvailableAxes(this.welllog, this.props.axisMnemos);

        this.state = {
            axes: axes,
            primaryAxis: this.props.primaryAxis,
        };

        this.onChangePrimaryAxis = this.onChangePrimaryAxis.bind(this);

        this.props.callbackManager.registerCallback(
            "onChangePrimaryAxis",
            this.onChangePrimaryAxis
        );
    }

    componentWillUnmount(): void {
        this.props.callbackManager.unregisterCallback(
            "onChangePrimaryAxis",
            this.onChangePrimaryAxis
        );
    }

    componentDidUpdate(prevProps: Props): void {
        const wellog = this.props.callbackManager?.welllog();
        if (
            this.welllog !== wellog ||
            prevProps.axisMnemos !== this.props.axisMnemos
        ) {
            this.welllog = wellog;
            const axes = getAvailableAxes(this.welllog, this.props.axisMnemos);
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
