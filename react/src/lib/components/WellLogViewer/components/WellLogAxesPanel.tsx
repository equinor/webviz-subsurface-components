import React, { Component } from "react";

import WellLogViewer from "../WellLogViewer";

import AxisSelector from "./AxisSelector";

import { getAvailableAxes } from "../utils/tracks";

interface Props {
    parent: WellLogViewer;
    header?: string;
}

interface State {
    axes: string[]; // axes available in welllog
    primaryAxis: string;
}

export class WellLogAxesPanel extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        const axes = getAvailableAxes(
            this.props.parent.props.welllog,
            this.props.parent.props.axisMnemos
        );

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

    componentDidUpdate(prevProps: Props): void {
        if (
            this.props.parent.props.welllog !==
                prevProps.parent.props.welllog ||
            this.props.parent.props.axisMnemos !==
                prevProps.parent.props.axisMnemos
        ) {
            const axes = getAvailableAxes(
                this.props.parent.props.welllog,
                this.props.parent.props.axisMnemos
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
