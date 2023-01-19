import React, { Component } from "react";

import WellLogViewer from "../WellLogViewer";

import AxisSelector from "./AxisSelector";

import { getAvailableAxes } from "../utils/tracks";

import { WellLog } from "./WellLogTypes";

interface Props {
    parent: WellLogViewer;
    header?: string;
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

        this.welllog = this.props.parent.props.welllog;
        this.axisMnemos = this.props.parent.props.axisMnemos;
        const axes = getAvailableAxes(this.welllog, this.axisMnemos);

        this.state = {
            axes: axes, //["md", "tvd"]
            primaryAxis: this.props.parent.state.primaryAxis, //??
        };

        this.onChangePrimaryAxis = this.onChangePrimaryAxis.bind(this);

        this.props.parent.registerCallback(
            "onChangePrimaryAxis",
            this.onChangePrimaryAxis
        );
    }

    componentWillUnmount(): void {
        this.props.parent.unregisterCallback(
            "onChangePrimaryAxis",
            this.onChangePrimaryAxis
        );
    }

    componentDidUpdate(/*prevProps: Props*/): void {
        if (
            this.welllog !== this.props.parent.props.welllog ||
            this.axisMnemos !== this.props.parent.props.axisMnemos
        ) {
            this.welllog = this.props.parent.props.welllog;
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
            <AxisSelector
                header={this.props.header}
                axes={this.state.axes}
                axis={this.state.primaryAxis}
                axisLabels={this.props.parent.props.axisTitles}
                onChange={(value: string) =>
                    this.props.parent.setPrimaryAxis(value)
                }
            />
        );
    }
}

export default WellLogAxesPanel;
