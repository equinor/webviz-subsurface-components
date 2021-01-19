/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import React, { Component } from "react";
import PropTypes from "prop-types";
import "./prior_posterior_distribution.css";
import D3PriorPosterior from "./utils/prior_posterior_distribution";

class PriorPosteriorDistribution extends Component {
    componentDidMount() {
        this.d3priorposterior = new D3PriorPosterior(
            this.props.height,
            this.props.id,
            this.props.data
        );

        this.d3priorposterior.renderPlot();

        window.addEventListener("resize", () =>
            this.d3priorposterior.renderPlot()
        );
    }

    componentDidUpdate(prevProps) {
        if (this.props.data !== prevProps.data) {
            this.d3priorposterior.updateData(this.props.data);
            this.d3priorposterior.renderPlot();
        }

        if (this.props.height !== prevProps.height) {
            this.d3priorposterior.renderPlot();
        }
    }

    render() {
        return <div id={this.props.id}></div>;
    }
}

PriorPosteriorDistribution.defaultProps = {
    height: 700,
    data: { iterations: [], labels: [], values: [] },
};

PriorPosteriorDistribution.propTypes = {
    id: PropTypes.string.isRequired,
    height: PropTypes.number,
    data: PropTypes.object,
};

export default PriorPosteriorDistribution;
