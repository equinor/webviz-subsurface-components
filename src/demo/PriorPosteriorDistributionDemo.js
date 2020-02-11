import React, { Component } from "react";
import PriorPosteriorDistribution from "../lib/components/PriorPosteriorDistribution";

const data = require("./example-data/prior-posterior.json");

class PriorPosteriorDistributionDemo extends Component {
    render() {
        return <PriorPosteriorDistribution id="someid" data={data} />;
    }
}

export default PriorPosteriorDistributionDemo;
