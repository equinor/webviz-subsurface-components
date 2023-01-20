import React, { Component } from "react";

import WellLogViewer from "../WellLogViewer";
import SyncLogViewer from "../SyncLogViewer";

import AxisSelector from "./AxisSelector";

import { getAvailableAxes } from "../utils/tracks";

import { WellLog } from "./WellLogTypes";
import { CallbackManager } from "./CallbackManager";

interface Props {
    parent: SyncLogViewer | WellLogViewer;
    header?: string;

    callbacksManager: CallbackManager<SyncLogViewer | WellLogViewer>;
}

interface State {
    axes: string[]; // axes available in welllog
    primaryAxis: string;
}

export class WellLogAxesPanel extends Component<Props, State> {
    welllog: WellLog | undefined;
    axisMnemos: Record<string, string[]>;

    constructor(props: Props) {
        super(props);

        this.welllog = this.props.callbacksManager.welllog();
        this.axisMnemos = this.props.parent.props.axisMnemos;
        const axes = getAvailableAxes(this.welllog, this.axisMnemos);

        this.state = {
            axes: axes, //["md", "tvd"]
            primaryAxis: this.props.parent.state.primaryAxis, //??
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

    componentDidUpdate(/*prevProps: Props*/): void {
        const wellog = this.props.callbacksManager.welllog();
        if (
            this.welllog !== wellog ||
            this.axisMnemos !== this.props.parent.props.axisMnemos
        ) {
            this.welllog = wellog;
            this.axisMnemos = this.props.parent.props.axisMnemos;
            const axes = getAvailableAxes(this.welllog, this.axisMnemos);
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
                    axisLabels={this.props.parent.props.axisTitles}
                    onChange={(value: string) =>
                        this.props.parent.setPrimaryAxis(value)
                    }
                />
            </div>
        );
    }
}

export default WellLogAxesPanel;
