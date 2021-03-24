import React, { Component } from "react";
import VectorSelector from "../lib/components/VectorSelector";

const data = require("./example-data/vector-data.json");

class WellCompletionsDemo extends Component {
    constructor(props) {
        super(props);

        this.setProps = this.setProps.bind(this);
    }

    setProps(newProps) {
        this.setState(newProps);
    }

    render() {
        return (
            <VectorSelector
                id="vector_selector"
                delimiter=":"
                label="Select a vector"
                data={data}
                setProps={this.setProps}
            />
        );
    }
}

export default WellCompletionsDemo;
