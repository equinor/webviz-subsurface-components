import type { Meta, StoryObj } from "@storybook/react";
import _ from "lodash";
import React from "react";

import { GroupTreePlot, type GroupTreePlotProps } from "../GroupTreePlot";

import type { EdgeMetadata, NodeMetadata } from "../types";

import {
    exampleDatedTrees,
    exampleDates,
} from "../../example-data/dated-trees";

const stories: Meta<GroupTreePlotProps> = {
    component: GroupTreePlot,
    title: "GroupTreePlot/Demo",
    argTypes: {
        selectedDateTime: {
            description:
                "The selected `string` must be a date time present in one of the `dates` arrays in an element of the`datedTrees`-prop.\n\n",
            options: exampleDates,
            control: { type: "select" },
        },
        selectedEdgeKey: {
            description:
                "The selection `string` must be an edge key present in one of the `edge_data` objects in the `tree`-prop of an element in `datedTrees`-prop.\n\n",
        },
        selectedNodeKey: {
            description:
                "The selected `string` must be a node key present in one of the `node_data` objects in the `tree`-prop of an element in `datedTrees`-prop.\n\n",
        },
        initialVisibleDepth: {
            description:
                "When initially rendering the tree, automatically collapse all nodes at or below this depth",
        },
    },
    tags: ["no-dom-test"],
};
export default stories;

/**
 * Storybook test for the group tree plot component
 */

const Template = (args: GroupTreePlotProps) => {
    return (
        <GroupTreePlot
            id={args.id}
            datedTrees={args.datedTrees}
            edgeMetadataList={args.edgeMetadataList}
            nodeMetadataList={args.nodeMetadataList}
            selectedDateTime={args.selectedDateTime}
            selectedEdgeKey={args.selectedEdgeKey}
            selectedNodeKey={args.selectedNodeKey}
            initialVisibleDepth={args.initialVisibleDepth}
        />
    );
};

const edgeMetadataList: EdgeMetadata[] = [
    { key: "waterrate", label: "Water Rate", unit: "m3/s" },
    { key: "oilrate", label: "Oil Rate", unit: "m3/s" },
    { key: "gasrate", label: "Gas Rate", unit: "m3/s" },
    { key: "waterinjrate", label: "Water Injection Rate", unit: "m3/s" },
    { key: "gasinjrate", label: "Gas Injection Rate", unit: "m3/s" },
];

const nodeMetadataList: NodeMetadata[] = [
    { key: "pressure", label: "Pressure", unit: "Bar" },
    { key: "bhp", label: "Bottom Hole Pressure", unit: "N/m2" },
    { key: "wmctl", label: "" },
];

export const Default: StoryObj<typeof Template> = {
    args: {
        id: "grouptreeplot",
        datedTrees: exampleDatedTrees,
        edgeMetadataList: edgeMetadataList,
        nodeMetadataList: nodeMetadataList,
        selectedDateTime: exampleDates[0],
        selectedEdgeKey: edgeMetadataList[0].key,
        selectedNodeKey: nodeMetadataList[0].key,
    },
    render: (args) => {
        const CONTAINER_HEIGHT = 700;
        const CONTAINER_WIDTH = 938;

        return (
            <div
                style={{
                    width: CONTAINER_WIDTH,
                    height: CONTAINER_HEIGHT,
                }}
            >
                <Template {...args} />
            </div>
        );
    },
};

export const Resizable: StoryObj<typeof Template> = {
    parameters: {
        docs: {
            description: {
                story: "The component dynamically resizes itself to fit it's parent container",
            },
        },
    },
    args: {
        id: "grouptreeplot",
        datedTrees: exampleDatedTrees,
        edgeMetadataList: edgeMetadataList,
        nodeMetadataList: nodeMetadataList,
        selectedDateTime: exampleDates[0],
        selectedEdgeKey: edgeMetadataList[0].key,
        selectedNodeKey: nodeMetadataList[0].key,
    },
    render: (args) => {
        // Wrapping comp to showcase resizing
        function RandomSizeDiv(props: {
            children: React.ReactNode;
        }): React.ReactNode {
            const [targetHeight, setTargetHeight] = React.useState(400);
            const [targetWidth, setTargetWidth] = React.useState(400);

            const rerollSize = React.useCallback(() => {
                setTargetHeight(_.random(400, 700));
                setTargetWidth(_.random(400, 700));
            }, []);

            return (
                <div style={{ height: 700, width: 700 }}>
                    <button onClick={rerollSize}>Randomize size</button>
                    <div
                        style={{
                            marginTop: "0.25rem",
                            background: "rgb(0,0,255,0.2)",
                            height: targetHeight,
                            width: targetWidth,
                            transition: "height, width",
                            transitionDuration: "200ms",
                        }}
                    >
                        {props.children}
                    </div>
                </div>
            );
        }

        return (
            <RandomSizeDiv>
                <Template {...args} />
            </RandomSizeDiv>
        );
    },
};
