import React, { Component } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";


class CompletionOverview extends Component {

    constructor(props) {
        super(props);
        this.props.width = "100%";
        this.props.height = "400px";
    }

    componentDidMount(){
        const number_layers = 20;
        const color_range = d3.scaleOrdinal().domain(d3.range(number_layers)).range(d3.schemeSet3);

        const layer2pixels = d3.scaleLinear()
          .domain([0, number_layers]) // unit: km
          .range([0, this.props.height]) // unit: pixels

        d3.select("#some-id").append("rect")
                             .attr("width", 200)
                             .attr("height", 200);

        d3.select("#some-id")
          .selectAll("rect.bar_neg")
          .data(d3.range(number_layers))
            .enter()
            .append("rect")
            .attr("x", (d) => 100)
            .attr("y", (d) => layer2pixels(d))
            .attr("width", 100)
            .attr("height", 100)
            .attr("fill", (d) => myColor(d))
    }

    render() {
        return (
            <div>
                <svg id="some-id" width={this.props.width} height={this.props.height}></svg>
            </div>
        );
    }
}


export default CompletionOverview;
