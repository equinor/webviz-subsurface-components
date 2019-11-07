import React, { Component } from "react";
import PropTypes from "prop-types";
import render_completion from "../private_components/completion_overview/render_completion";

class CompletionOverview extends Component {
    constructor(props) {
        super(props);
        this.props.height = 300;
        this.props.id = "some-id";
    }

    componentDidMount() {
        render_completion(
            this.props.id,
            this.props.layers,
            this.props.data,
            this.props.height
        );
    }

    render() {
        return <div id={this.props.id} width="100%"></div>;
    }
}

export default CompletionOverview;
