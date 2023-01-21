import React, { Component } from "react";

import AxisSelector from "./AxisSelector";

import { getAvailableAxes } from "../utils/tracks";

import { WellLog } from "./WellLogTypes";
import { CallbackManager } from "./CallbackManager";

interface Props {
    callbacksManager: CallbackManager;

    header?: string;

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
}
interface State {
    axes: string[]; // axes available in welllog
    primaryAxis: string;
}

export class WellLogAxesPanel extends Component<Props, State> {
    welllog: WellLog | undefined;

    constructor(props: Props) {
        super(props);

        this.welllog = this.props.callbacksManager.welllog();
        const axes = getAvailableAxes(this.welllog, this.props.axisMnemos);

        this.state = {
            axes: axes,
            primaryAxis: this.props.primaryAxis,
        };

        this.onChangePrimaryAxis = this.onChangePrimaryAxis.bind(this);

        this.props.callbacksManager.registerCallback(
            "onChangePrimaryAxis",
            this.onChangePrimaryAxis
        );
    }

    componentWillUnmount(): void {
        this.props.callbacksManager.unregisterCallback(
            "onChangePrimaryAxis",
            this.onChangePrimaryAxis
        );
    }

    componentDidUpdate(prevProps: Props): void {
        const wellog = this.props.callbacksManager.welllog();
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
            <div>
                <AxisSelector
                    header={this.props.header}
                    axes={this.state.axes}
                    axis={this.state.primaryAxis}
                    axisTitles={this.props.axisTitles}
                    onChange={(value: string) =>
                        this.props.onChangePrimaryAxis(value)
                    }
                />
            </div>
        );
    }
}

export default WellLogAxesPanel;
