import React from "react";
import * as d3 from "d3";

import type { ReactNode } from "react";
import type { RecursiveTreeNode } from "../types";
import type DataAssembler from "../DataAssembler/DataAssembler";

import "./group_tree.css";
import { useDataAssemblerTree } from "../DataAssembler/DataAssemblerHooks";
import { computeLinkId, computeNodeId } from "../utils";
import { TransitionGroup } from "react-transition-group";
import { TransitionTreeEdge } from "./TransitionTreeEdge";
import { TransitionTreeNode } from "./TransitionTreeNode";

export type TreePlotRendererProps = {
    dataAssembler: DataAssembler;
    primaryEdgeProperty: string;
    primaryNodeProperty: string;
    // TODO: Make dynamic
    height: number;
    width: number;
};

const PLOT_MARGINS = {
    top: 10,
    right: 120,
    bottom: 30,
    left: 70,
};

export default function TreePlotRenderer(
    props: TreePlotRendererProps
): ReactNode {
    const activeTree = useDataAssemblerTree(props.dataAssembler);
    const rootTreeNode = activeTree.tree;

    const treeLayout = React.useMemo(() => {
        // TODO: Remove constant number
        const treeHeight =
            props.height - PLOT_MARGINS.top - PLOT_MARGINS.bottom;
        const treeWidth = props.width - PLOT_MARGINS.left - PLOT_MARGINS.right;

        return d3.tree<RecursiveTreeNode>().size([treeHeight, treeWidth]);
    }, [props.height, props.width]);

    const lastComputedTreeRef =
        React.useRef<d3.HierarchyPointNode<RecursiveTreeNode> | null>(null);

    const [nodeTree, oldNodeTree] = React.useMemo(() => {
        const previousTree = lastComputedTreeRef.current;
        const hierarcy = d3.hierarchy(rootTreeNode);
        const tree = treeLayout(hierarcy);

        lastComputedTreeRef.current = tree;

        return [tree, previousTree];
    }, [treeLayout, rootTreeNode]);

    return (
        <svg height={props.height} width={props.width}>
            <g
                transform={`translate(${PLOT_MARGINS.left},${PLOT_MARGINS.top})`}
            >
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
                        />
                    ))}
                </TransitionGroup>
            </g>
        </svg>
    );
}
