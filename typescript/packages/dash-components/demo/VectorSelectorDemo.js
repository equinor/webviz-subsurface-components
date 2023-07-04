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
                    caseInsensitiveMatching={true}
                    useBetaFeatures={true}
                    selectedTags={["iter-0:WGOR:OP_1"]}
                    numMetaNodes={1}
                    customVectorDefinitions={{
                        Test: {
                            type: "calculated",
                            description: "Test Custom description",
                        },
                        WGOR: {
                            type: "field",
                            description: "Gas-Oil Ratio Custom description",
                        },
                        WOPR: {
                            type: "well",
                            description:
                                "Oil Production Rate Custom description",
                        },
                    }}
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
                                    description:
                                        "Gas-Oil Ratio Tree data description",
                                    children: [
                                        {
                                            id: "0-0-0",
                                            name: "OP_1",
                                        },
                                    ],
                                },
                                {
                                    id: "0-1",
                                    name: "WOPT",
                                    children: [
                                        {
                                            id: "0-1-0",
                                            name: "OP_1",
                                        },
                                    ],
                                },
                                {
                                    id: "0-2",
                                    name: "WOPR",
                                    children: [
                                        {
                                            id: "0-2-0",
                                            name: "OP_1",
                                        },
                                    ],
                                },
                                {
                                    id: "0-3",
                                    name: "Test",
                                    description:
                                        "First Test Tree data description",
                                    children: [
                                        {
                                            id: "0-3-0",
                                            name: "OP_1",
                                        },
                                    ],
                                },
                                {
                                    id: "0-4",
                                    name: "Test2",
                                    description: "Test2 Tree data description",
                                    children: [
                                        {
                                            id: "0-4-0",
                                            name: "OP_1",
                                        },
                                    ],
                                },
                                {
                                    id: "0-5",
                                    name: "Test3",
                                    description: "Test3 Tree data description",
                                    children: [
                                        {
                                            id: "0-5-0",
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
