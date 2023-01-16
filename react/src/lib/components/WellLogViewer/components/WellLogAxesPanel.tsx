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
        };
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
                // will be changed by callback! infos: [],
            });
        }
    }

    render(): JSX.Element {
        return (
            <AxisSelector
                header={this.props.header}
                axes={this.state.axes}
                axisLabels={this.props.parent.props.axisTitles}
                value={this.props.parent.state.primaryAxis}
                onChange={this.props.parent.onChangePrimaryAxis}
            />
        );
    }
}

export default WellLogAxesPanel;
