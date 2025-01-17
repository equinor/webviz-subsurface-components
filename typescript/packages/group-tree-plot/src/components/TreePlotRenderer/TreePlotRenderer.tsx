import React from "react";
import type { ReactNode } from "react";
import _ from "lodash";
import * as d3 from "d3";

import { AnimatePresence } from "motion/react";

import type { D3TreeNode, RecursiveTreeNode } from "../../types";
import type { DataAssembler } from "../../utils/dataAssembler";

import { computeLinkId, computeNodeId } from "../../utils/treePlot";
import { TransitionTreeEdge } from "./privateComponents/TransitionTreeEdge";
import { TransitionTreeNode } from "./privateComponents/TransitionTreeNode";

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

export function TreePlotRenderer(props: TreePlotRendererProps): ReactNode {
    const activeTree = props.dataAssembler.getActiveTree();
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
            const hierarchy = d3.hierarchy(rootTreeNode).each((node) => {
                // Collapse nodes based on collapse flags and minimum depth
                // ! I'd argue that it'd be more correct to collapse nodes using the hierarchy constructor:
                //      d3.hierarchy(rootTreeNode, (datum) => {
                //        if(someCheck) return null
                //        else return datum.children
                //      })
                // However, nodes are being collapsed after-the-fact here, since we need the depth value for implicit collapses, and it's not available in the constructor

                const collapseFlag = nodeCollapseFlags[computeNodeId(node)];
                const visibleDepth =
                    props.initialVisibleDepth ?? Number.MAX_SAFE_INTEGER;

                // Return only if collapse flag is *explicitly* set to false
                if (collapseFlag === false) return;
                if (node.depth >= visibleDepth || collapseFlag === true) {
                    node.children = undefined;
                }
            });

            return treeLayout(hierarchy);
        },
        [treeLayout, rootTreeNode, nodeCollapseFlags, props.initialVisibleDepth]
    );

    // Storing the previous value so entering nodes know where to expand from
    const oldNodeTree = usePreviousTree(nodeTree);

    function toggleNodeCollapse(node: D3TreeNode) {
        const nodeIdent = computeNodeId(node);
        // Might be collapsed implicitly due to visibleDepth prop
        const collapsed = Boolean(node.children?.length);

        setNodeCollapseFlags((prev) => {
            const existingVal = prev[nodeIdent];

            const newVal = collapsed && !existingVal;
            const newFlags = { ...prev, [nodeIdent]: newVal };

            // When closing a node, reset any stored flag for all children
            if (newVal) {
                node.descendants()
                    // descendants() includes this node, slice to skip it
                    .slice(1)
                    .forEach((child) => delete newFlags[computeNodeId(child)]);
            }

            return newFlags;
        });
    }

    return (
        <g transform={`translate(${PLOT_MARGINS.left},${PLOT_MARGINS.top})`}>
            <AnimatePresence custom={nodeTree}>
                {nodeTree.links().map((link) => (
                    <TransitionTreeEdge
                        key={computeLinkId(link)}
                        link={link}
                        dataAssembler={props.dataAssembler}
                        primaryEdgeProperty={props.primaryEdgeProperty}
                        oldNodeTree={oldNodeTree}
                    />
                ))}
                {nodeTree.descendants().map((node) => (
                    <TransitionTreeNode
                        key={computeNodeId(node)}
                        primaryNodeProperty={props.primaryNodeProperty}
                        dataAssembler={props.dataAssembler}
                        node={node}
                        oldNodeTree={oldNodeTree}
                        onNodeClick={toggleNodeCollapse}
                    />
                ))}
            </AnimatePresence>
        </g>
    );
}

function usePreviousTree(treeRootNode: D3TreeNode): D3TreeNode {
    // Make the first "old" tree be just the root, so everything expands from the root
    const initRoot: D3TreeNode = _.clone(treeRootNode);
    initRoot.children = undefined;

    const oldNodeTree = React.useRef<D3TreeNode>(initRoot);
    React.useEffect(() => {
        oldNodeTree.current = treeRootNode;
    }, [treeRootNode]);

    return oldNodeTree.current;
}
