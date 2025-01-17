import type {
    SVGMotionProps,
    TargetAndTransition,
    Variants,
    Transition,
} from "motion/dist/react";
import type { D3TreeNode } from "../types";
import { findClosestVisibleInNewTree } from "./treePlot";

export const TREE_MOTION_TRANSITION: Transition = {
    // Other settings that might be nice
    // type: "tween",
    // ease: "anticipate",
    // ease: (@motion).cubicBezier(0.77, 0.12, 0.54, 0.91),

    type: "spring",
    bounce: 0,
    duration: 0.5,
};

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
