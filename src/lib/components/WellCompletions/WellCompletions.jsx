import React, { Component } from "react";
import D3WellCompletions from "./utils/well_completions";

class WellCompletions extends Component {
    componentDidMount() {
        this.d3wellcompletions = new D3WellCompletions(
            this.props.id,
            this.props.data
        );
        this.d3wellcompletions.renderPlot();

        window.addEventListener("resize", () =>
            this.d3wellcompletions.renderPlot()
        );
    }

    render() {
        return <div id={this.props.id}></div>
    }
}

export default WellCompletions;
