import type {
    SVGMotionProps,
    TargetAndTransition,
    Variants,
    Transition,
} from "motion/dist/react";
import type { D3TreeNode } from "../types";
import { findClosestVisibleInNewTree } from "../utils/treePlot";

/**
 * Settings for the tree's animation timing
 */
export const TREE_MOTION_TRANSITION: Transition = {
    // Other settings that might be nice
    // type: "tween",
    // ease: "anticipate",
    // ease: (@motion).cubicBezier(0.77, 0.12, 0.54, 0.91),

    type: "spring",
    bounce: 0,
    duration: 0.5,
};

/**
 * Generates component properties for a tree element that animates to collapse/expand into other nodes in tree
 * @param node The main node that should be animated (for edges, the target node)
 * @param oldTreeRoot A reference to the old tree
 * @param animationTarget The normal animation target for the node
 * @param buildCollapseTargets A generator method to build an animation target for the node fully collapsed
 * @returns A properties object for the node's animation
 */
export function useCollapseMotionProps(
    node: D3TreeNode,
    oldTreeRoot: D3TreeNode,
    animationTarget: TargetAndTransition,
    buildCollapseTargets: (targetNode: D3TreeNode) => TargetAndTransition
): SVGMotionProps<SVGPathElement> {
    const variants: Variants = {
        expand() {
            const collapseInto = findClosestVisibleInNewTree(node, oldTreeRoot);
            return buildCollapseTargets(collapseInto);
        },
        expanded() {
            return animationTarget;
        },
        collapse(futureTree?: D3TreeNode) {
            if (!futureTree) return {};

            const collapseInto = findClosestVisibleInNewTree(node, futureTree);
            return buildCollapseTargets(collapseInto);
        },
    };

    return {
        initial: "expand",
        animate: "expanded",
        exit: "collapse",
        transition: TREE_MOTION_TRANSITION,
        variants,
    };
}
