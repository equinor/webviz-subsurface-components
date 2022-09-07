import React from "react";

import { Meta, Story } from "@storybook/react";

import VectorSelector from "./VectorSelector";

import { VectorSelectorPropsType } from "../VectorSelector/components/VectorSelectorComponent";

export default {
    title: "VectorSelector/VectorSelector",
    component: VectorSelector,
} as Meta;

type ParentProps = {
    selectedTags: string[];
    selectedNodes: string[];
    selectedIds: string[];
};

const Template: Story<VectorSelectorPropsType> = (args) => {
    const { setProps, ...others } = args;
    const [state, setState] = React.useState<ParentProps>({
        selectedTags: [],
        selectedNodes: [],
        selectedIds: [],
    });

    return (
        <>
            <VectorSelector setProps={setState} {...others} />
            Selected vectors:
            <br />
            {state.selectedNodes.length > 0 &&
                state.selectedNodes.map((node, index) => (
                    <div key={`node-${index}`}>{node}</div>
                ))}
            {state.selectedNodes.length == 0 && <i>None</i>}
        </>
    );
};

export const Demo = Template.bind({});
Demo.args = {
    id: "VectorSelector",
    delimiter: ":",
    caseInsensitiveMatching: true,
    useBetaFeatures: true,
    selectedTags: ["iter-0:WGOR:OP_1"],
    numMetaNodes: 1,
    label: "Select a vector",
    placeholder: "Add new vector...",
    customVectorDefinitions: {
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
            description: "Oil Production Rate Custom description",
        },
    },
    data: [
        {
            id: "0",
            name: "iter-0",
            color: "#0095FF",
            description: "Iteration 0",
            children: [
                {
                    id: "0-0",
                    name: "WGOR",
                    description: "Gas-Oil Ratio Tree data description",
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
                    description: "First Test Tree data description",
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
    ],
};
