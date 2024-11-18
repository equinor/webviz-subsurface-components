import React from "react";
import { Transition, type TransitionStatus } from "react-transition-group";

import * as d3 from "d3";
import {
    diagonalPath,
    findClosestVisibleInNewTree,
    TREE_TRANSITION_DURATION,
} from "../utils";
import {
    useDataAssemblerPropertyValue,
    useDataAssemblerTooltip,
} from "../DataAssembler/DataAssemblerHooks";
import type { D3TreeEdge, D3TreeNode } from "../types";
import type DataAssembler from "../DataAssembler/DataAssembler";

export type TreeEdgeProps = {
    link: D3TreeEdge;
    dataAssembler: DataAssembler;
    primaryEdgeProperty: string;
    transitionState?: TransitionStatus;

    // Kinda messy solution for this, might warrant a change in the future
    nodeTree: D3TreeNode;
    oldNodeTree: D3TreeNode | null;

    in?: boolean;
};

export function TransitionTreeEdge(props: TreeEdgeProps): React.ReactNode {
    const rootRef = React.useRef<SVGGElement | null>(null);
    const pathRef = React.useRef<SVGPathElement | null>(null);
    const labelRef = React.useRef<SVGTextElement | null>(null);

    const [transitionState, setTransitionState] =
        React.useState<TransitionStatus | null>("exited");

    const linkPath = diagonalPath(props.link);

    const mainTreeNode = props.link.target.data;
    const linkId = React.useId();

    const groupPropertyStrokeClass = `grouptree_link__${props.primaryEdgeProperty}`;

    const edgeValue =
        useDataAssemblerPropertyValue(
            props.dataAssembler,
            mainTreeNode.edge_data,
            props.primaryEdgeProperty
        ) ?? 0;

    const strokeWidth = props.dataAssembler.normalizeValue(
        props.primaryEdgeProperty,
        edgeValue
    );

    const edgeTooltip = useDataAssemblerTooltip(
        props.dataAssembler,
        mainTreeNode.edge_data
    );

    const onTransitionEnter = React.useCallback(
        function onTransitionEnter() {
            const isAppearing = transitionState === "exited";
            const alreadyExiting = transitionState === "exiting";

            const node = d3.select(pathRef.current);
            const labelNode = d3.select(labelRef.current);
            const targetPath = diagonalPath(props.link);

            setTransitionState("entering");

            if (alreadyExiting) {
                node.interrupt();
            }

            if (isAppearing) {
                const closestVisibleParent = findClosestVisibleInNewTree(
                    props.link.target,
                    props.oldNodeTree
                );

                const expandFrom = closestVisibleParent ?? props.nodeTree;
                const initPath = diagonalPath({
                    source: expandFrom,
                    target: expandFrom,
                });

                node.attr("d", initPath).attr("stroke-width", strokeWidth / 4);

                labelNode.style("fill-opacity", 0);
            }

            node.transition()
                .duration(TREE_TRANSITION_DURATION)
                .ease(d3.easeCubicInOut)
                .attr("d", targetPath)
                .attr("stroke-width", strokeWidth)
                .on("end", () => {
                    setTransitionState("entered");
                });

            labelNode
                .transition()
                .duration(TREE_TRANSITION_DURATION)
                .style("fill-opacity", 1);
        },
        [
            props.link,
            props.oldNodeTree,
            strokeWidth,
            transitionState,
            props.nodeTree,
        ]
    );

    const onTransitionExit = React.useCallback(() => {
        setTransitionState("exiting");

        const closestVisibleParent = findClosestVisibleInNewTree(
            props.link.target,
            props.nodeTree
        );

        const retractTo = closestVisibleParent ?? props.link.source;

        const finalPath = diagonalPath({
            source: retractTo,
            target: retractTo,
        });

        const node = d3.select(pathRef.current);
        const labelNode = d3.select(labelRef.current);

        node.transition()
            .duration(TREE_TRANSITION_DURATION)
            .ease(d3.easeCubicInOut)
            .attr("d", finalPath)
            .attr("stroke-width", strokeWidth / 4)
            .on("end", () => {
                setTransitionState("exited");
            });

        labelNode
            .transition()
            .duration(TREE_TRANSITION_DURATION)
            .style("fill-opacity", 0);
    }, [props.link, props.nodeTree, strokeWidth]);

    // Animate other changes
    // TODO: Gets desynced with exiting animation if you spam new dates
    const isEntered = transitionState === "entered";
    if (isEntered) {
        d3.select(pathRef.current)
            .interrupt()
            .transition()
            .duration(TREE_TRANSITION_DURATION)
            .ease(d3.easeCubicInOut)
            .attr("d", linkPath)
            .attr("stroke-width", strokeWidth);
    }

    return (
        <Transition
            in={props.in}
            // @ts-expect-error Wrongly raises for SVGElement typing
            nodeRef={rootRef}
            timeout={TREE_TRANSITION_DURATION}
            appear
            onEnter={onTransitionEnter}
            onExit={onTransitionExit}
            unmountOnExit={true}
        >
            <g ref={rootRef}>
                <path
                    ref={pathRef}
                    id={linkId}
                    className={`link grouptree_link ${groupPropertyStrokeClass}`}
                    strokeDasharray={edgeValue > 0 ? "none" : "5,5"}
                >
                    <title>{edgeTooltip}</title>
                </path>

                <text
                    ref={labelRef}
                    dominantBaseline="central"
                    textAnchor="middle"
                >
                    <textPath
                        className="edge_info_text"
                        startOffset="50%"
                        href={"#" + linkId}
                    >
                        {mainTreeNode.edge_label}
                    </textPath>
                </text>
            </g>
        </Transition>
    );
}
