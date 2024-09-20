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

        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        this.welllog = this.props.callbackManager.welllog();
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const axes = getAvailableAxes(this.welllog, this.props.axisMnemos);

        this.state = {
            axes: axes,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
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

        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const wellog = this.props.callbackManager?.welllog();
        if (
            this.welllog !== wellog ||
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            prevProps.axisMnemos !== this.props.axisMnemos
        ) {
            this.welllog = wellog;
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
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
                    // TODO: Fix this the next time the file is edited.
                    // eslint-disable-next-line react/prop-types
                    header={this.props.header}
                    axes={this.state.axes}
                    value={this.state.primaryAxis}
                    // TODO: Fix this the next time the file is edited.
                    // eslint-disable-next-line react/prop-types
                    axisTitles={this.props.axisTitles}
                    onChange={(value: string) =>
                        // TODO: Fix this the next time the file is edited.
                        // eslint-disable-next-line react/prop-types
                        this.props.onChangePrimaryAxis(value)
                    }
                    // TODO: Fix this the next time the file is edited.
                    // eslint-disable-next-line react/prop-types
                    autoHide={this.props.autoHide}
                />
            </div>
        );
    }
}

export default WellLogAxesPanel;
