import React from "react";
import * as d3 from "d3";

import type { ReactNode } from "react";
import type { D3TreeNode, RecursiveTreeNode } from "../types";

import "./group_tree.css";
import {
    type DataAssembler,
    useDataAssemblerTree,
} from "../utils/DataAssembler";
import { computeLinkId, computeNodeId, usePrevious } from "../utils";
import { TransitionGroup } from "react-transition-group";
import { TransitionTreeEdge } from "./TransitionTreeEdge";
import { TransitionTreeNode } from "./TransitionTreeNode";

export type TreePlotRendererProps = {
    dataAssembler: DataAssembler;
    primaryEdgeProperty: string;
    primaryNodeProperty: string;
    height: number;
    width: number;

    initialVisibleDepth?: number;
};

const PLOT_MARGINS = {
    top: 10,
    right: 120,
    bottom: 10,
    left: 70,
};

export default function TreePlotRenderer(
    props: TreePlotRendererProps
): ReactNode {
    const activeTree = useDataAssemblerTree(props.dataAssembler);
    const rootTreeNode = activeTree.tree;

    const [nodeCollapseFlags, setNodeCollapseFlags] = React.useState<
        Record<string, boolean>
    >({});

    const heightPadding = PLOT_MARGINS.top + PLOT_MARGINS.bottom;
    const widthPadding = PLOT_MARGINS.left + PLOT_MARGINS.right;
    const layoutHeight = props.height - heightPadding;
    const layoutWidth = props.width - widthPadding;

    const treeLayout = React.useMemo(
        function computeLayout() {
            // Note that we invert height / width to render the tree sideways
            return d3
                .tree<RecursiveTreeNode>()
                .size([layoutHeight, layoutWidth]);
        },
        [layoutHeight, layoutWidth]
    );

    const nodeTree = React.useMemo(
        function computeTree() {
            const hierarcy = d3
                // .hierarchy(rootTreeNode).
                .hierarchy(rootTreeNode, (datum) => {
                    // Stop traversal at all collapsed nodes
                    if (nodeCollapseFlags[datum.node_label]) return null;
                    else return datum.children;
                })
                .each((node) => {
                    // Secondary collapse-run; collapse nodes based on `props.initialVisibleDepth`. Keep explicitly expanded nodes open
                    const nodeLabel = node.data.node_label;
                    if (props.initialVisibleDepth == null) return;
                    if (nodeCollapseFlags[nodeLabel] === false) return;

                    if (node.depth >= props.initialVisibleDepth) {
                        node.children = undefined;
                    }
                });

            return treeLayout(hierarcy);
        },
        [treeLayout, rootTreeNode, nodeCollapseFlags, props.initialVisibleDepth]
    );

    // Storing the previous value so entering nodes know where to expand from
    const oldNodeTree = usePrevious(nodeTree);

    const toggleNodeCollapse = React.useCallback(
        function toggleNodeCollapse(node: D3TreeNode) {
            const label = node.data.node_label;
            const existingVal = nodeCollapseFlags[label];

            const newVal = Boolean(node.children?.length) && !existingVal;
            const newFlags = { ...nodeCollapseFlags, [label]: newVal };

            // When closing a node, reset any stored flag for all children
            if (newVal) {
                node.descendants()
                    // descendants() includes this node, slice to skip it
                    .slice(1)
                    .forEach(({ data }) => delete newFlags[data.node_label]);
            }

            setNodeCollapseFlags(newFlags);
        },
        [nodeCollapseFlags]
    );

    return (
        <g transform={`translate(${PLOT_MARGINS.left},${PLOT_MARGINS.top})`}>
            <TransitionGroup
                component={null}
                childFactory={(child) =>
                    React.cloneElement(child, { oldNodeTree, nodeTree })
                }
            >
                {nodeTree.links().map((link) => (
                    // @ts-expect-error Missing props are injected by child-factory above
                    <TransitionTreeEdge
                        key={computeLinkId(link)}
                        link={link}
                        dataAssembler={props.dataAssembler}
                        primaryEdgeProperty={props.primaryEdgeProperty}
                    />
                ))}

                {nodeTree.descendants().map((node) => (
                    // @ts-expect-error Missing props are injected by child-factory above
                    <TransitionTreeNode
                        key={computeNodeId(node)}
                        primaryNodeProperty={props.primaryNodeProperty}
                        dataAssembler={props.dataAssembler}
                        node={node}
                        onNodeClick={toggleNodeCollapse}
                    />
                ))}
            </TransitionGroup>
        </g>
    );
}
