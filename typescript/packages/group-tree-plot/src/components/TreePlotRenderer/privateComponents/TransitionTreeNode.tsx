import React from "react";
import { Transition, type TransitionStatus } from "react-transition-group";
import type { DataAssembler } from "../../../utils/dataAssembler";
import type { D3TreeNode } from "../../../types";
import { findClosestVisibleInNewTree } from "../../../utils/treePlot";
import { printTreeValue } from "../../../utils/treePlot";
import { TREE_TRANSITION_DURATION } from "../../../GroupTreePlot";

import * as d3 from "d3";
import { HiddenChildren } from "./HiddenChildren";

export type TransitionTreeNodeProps = {
    primaryNodeProperty: string;
    dataAssembler: DataAssembler;
    node: D3TreeNode;

    nodeTree: D3TreeNode;
    oldNodeTree: D3TreeNode | null;

    in: boolean;

    onNodeClick?: (
        node: TransitionTreeNodeProps["node"],
        evt: React.MouseEvent<SVGGElement, MouseEvent>
    ) => void;
};

export function TransitionTreeNode(
    props: TransitionTreeNodeProps
): React.ReactNode {
    const rootRef = React.useRef<SVGGElement | null>(null);
    const [transitionState, setTransitionState] =
        React.useState<TransitionStatus>("exited");

    const recursiveTreeNode = props.node.data;
    const nodeData = recursiveTreeNode.node_data;
    // ! This is whether the node is a leaf *in the actual tree*, not the rendered one
    const isLeaf = !recursiveTreeNode.children?.length;
    const canBeExpanded = !props.node.children?.length && !isLeaf;
    const nodeLabel = recursiveTreeNode.node_label;

    let circleClass = "grouptree__node";
    if (!isLeaf) circleClass += "  grouptree__node--withchildren";

    const targetTransform = `translate(${props.node.y},${props.node.x})`;

    const [, primaryUnit] = props.dataAssembler.getPropertyInfo(
        props.primaryNodeProperty
    );

    const toolTip = props.dataAssembler.getTooltip(nodeData);
    const primaryNodeValue = props.dataAssembler.getPropertyValue(
        nodeData,
        props.primaryNodeProperty
    );

    const onTransitionEnter = React.useCallback(
        function onTransitionEnter() {
            const isAppearing = transitionState === "exited";
            const alreadyExiting = transitionState === "exiting";

            setTransitionState("entering");

            const node = d3.select(rootRef.current);

            if (alreadyExiting) {
                node.interrupt();
            }

            if (isAppearing) {
                const closestVisibleParent = findClosestVisibleInNewTree(
                    props.node,
                    props.oldNodeTree
                );

                const expandFrom = closestVisibleParent ?? props.nodeTree;
                const initTransform = `translate(${expandFrom.y},${expandFrom.x})`;

                node.attr("transform", initTransform).attr("opacity", 0);
            }

            node.transition()
                .duration(TREE_TRANSITION_DURATION)
                .ease(d3.easeCubicInOut)
                .attr("transform", targetTransform)
                .attr("opacity", 1)
                .on("end", () => {
                    setTransitionState("entered");
                });
        },
        [
            props.oldNodeTree,
            props.node,
            props.nodeTree,
            transitionState,
            targetTransform,
        ]
    );

    const onTransitionExit = React.useCallback(
        function onTransitionExit() {
            setTransitionState("exiting");

            const node = d3.select(rootRef.current);

            const closestVisibleParent = findClosestVisibleInNewTree(
                props.node,
                props.nodeTree
            );

            const retractTo = closestVisibleParent ?? props.node;
            const targetTransform = `translate(${retractTo.y},${retractTo.x})`;

            node.transition()
                .duration(TREE_TRANSITION_DURATION)
                .ease(d3.easeCubicInOut)
                .attr("transform", targetTransform)
                .attr("opacity", 0)
                .on("end", () => {
                    setTransitionState("exited");
                });
        },
        [props.node, props.nodeTree]
    );

    // Animate other changes
    // TODO: Gets desynced with exiting animation if you spam new dates
    const isEntered = transitionState === "entered";
    if (isEntered) {
        const node = d3.select(rootRef.current);

        node.transition()
            .duration(TREE_TRANSITION_DURATION)
            .ease(d3.easeCubicInOut)
            .attr("transform", targetTransform);
    }

    return (
        <Transition
            in={props.in}
            // @ts-expect-error Wrongly raises for SVGElement type
            nodeRef={rootRef}
            timeout={TREE_TRANSITION_DURATION}
            onEnter={onTransitionEnter}
            onExit={onTransitionExit}
            appear
            unmountOnExit={true}
            mountOnEnter={true}
        >
            <g
                ref={rootRef}
                className="node"
                // ! Defaulting to opacity=0 to avoid flickering. D3 will override this in the transition hooks
                opacity={0}
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
            </g>
        </Transition>
    );
}
