import React from "react";
import { motion } from "motion/react";
import type { DataAssembler } from "../../../utils/DataAssembler";
import type { D3TreeNode } from "../../../types";
import { printTreeValue } from "../../../utils/treePlot";
import { useCollapseMotionProps } from "../../../hooks/useCollapseMotionProps";

import { HiddenChildren } from "./HiddenChildren";

export type TransitionTreeNodeProps = {
    primaryNodeProperty: string;
    dataAssembler: DataAssembler;
    node: D3TreeNode;

    oldNodeTree: D3TreeNode;

    onNodeClick?: (
        node: TransitionTreeNodeProps["node"],
        evt: React.MouseEvent<SVGGElement, MouseEvent>
    ) => void;
};

export function TransitionTreeNode(
    props: TransitionTreeNodeProps
): React.ReactNode {
    const recursiveTreeNode = props.node.data;
    const nodeData = recursiveTreeNode.node_data;
    // ! This is whether the node is a leaf *in the actual tree*, not the rendered one
    const isLeaf = !recursiveTreeNode.children?.length;
    const canBeExpanded = !props.node.children?.length && !isLeaf;
    const nodeLabel = recursiveTreeNode.node_label;

    let circleClass = "grouptree__node";
    if (!isLeaf) circleClass += "  grouptree__node--withchildren";

    const [, primaryUnit] = props.dataAssembler.getPropertyInfo(
        props.primaryNodeProperty
    );

    const toolTip = props.dataAssembler.getTooltip(nodeData);
    const primaryNodeValue = props.dataAssembler.getPropertyValue(
        nodeData,
        props.primaryNodeProperty
    );

    const motionProps = useCollapseMotionProps(
        props.node,
        props.oldNodeTree,
        {
            opacity: 1,
            x: props.node.y,
            y: props.node.x,
        },
        (collapseTarget: D3TreeNode) => ({
            opacity: 0,
            x: collapseTarget.y,
            y: collapseTarget.x,
        })
    );

    return (
        <motion.g
            {...motionProps}
            className="node"
            cursor={!isLeaf ? "pointer" : undefined}
            onClick={(evt) => props.onNodeClick?.(props.node, evt)}
        >
            <circle className={circleClass} r={15} />
            <text
                className="grouptree__nodelabel"
                dominantBaseline="middle"
                x={isLeaf ? 21 : -21}
                textAnchor={isLeaf ? "start" : "end"}
            >
                {nodeLabel}
            </text>

            <text
                className="grouptree__pressurelabel"
                textAnchor="middle"
                y="-.05em"
            >
                {printTreeValue(primaryNodeValue)}
            </text>

            <text
                className="grouptree__pressureunit"
                y=".04em"
                dominantBaseline="text-before-edge"
                textAnchor="middle"
            >
                {primaryUnit}
            </text>
            <title>{toolTip}</title>

            {canBeExpanded && (
                <HiddenChildren
                    hiddenChildren={recursiveTreeNode.children ?? []}
                />
            )}
        </motion.g>
    );
}
