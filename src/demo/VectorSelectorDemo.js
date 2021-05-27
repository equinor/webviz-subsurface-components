import React, { Component } from "react";
import VectorSelector from "../lib/components/VectorSelector";

class WellCompletionsDemo extends Component {
    constructor(props) {
        super(props);

        this.setProps = this.setProps.bind(this);
        this.state = {
            selectedNodes: [],
            selectedIds: [],
            selectedTags: [],
        };
    }

    setProps(newProps) {
        this.setState(newProps);
    }

    render() {
        return (
            <>
                <VectorSelector
                    id="vector_selector"
                    delimiter=":"
                    selectedTags={["iter-0:WGOR:OP_1"]}
                    numMetaNodes={1}
                    label="Select a vector"
                    data={[
                        {
                            id: "0",
                            name: "iter-0",
                            color: "#0095FF",
                            description: "Iteration 0",
                            children: [
                                {
                                    id: "0-0",
                                    name: "WGOR",
                                    description: "Gas-Oil Ratio",
                                    children: [
                                        {
                                            id: "0-0-0",
                                            name: "OP_1",
                                        },
                                    ],
                                },
                            ],
                        },
                    ]}
                    setProps={this.setProps}
                />
                Selected vectors:
                <br />
                {this.state.selectedNodes.length > 0 &&
                    this.state.selectedNodes.map((node, index) => (
                        <div key={`node-${index}`}>{node}</div>
                    ))}
                {this.state.selectedNodes.length == 0 && <i>None</i>}
            </>
        );
    }
}

export default WellCompletionsDemo;
