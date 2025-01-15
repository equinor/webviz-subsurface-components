import _ from "lodash";
import type { DataAssembler } from "./utils/DataAssembler";
import type { D3TreeEdge, D3TreeNode } from "./types";
import React from "react";

export const TREE_TRANSITION_DURATION = 200;

export function computeNodeId(node: D3TreeNode) {
    if (!node.parent) {
        return node.data.node_label;
    } else {
        return `${node.parent.data.node_label}_${node.data.node_label}`;
    }
}

export function computeLinkId(link: D3TreeEdge) {
    return `path ${computeNodeId(link.target)}`;
}

export function printTreeValue(value: number | null): string {
    if (value === null) return "N/A";
    else return value.toFixed(0);
}

export function findClosestVisibleInNewTree(
    targetNode: D3TreeNode,
    newTreeRoot: D3TreeNode | null
): D3TreeNode | null {
    if (!newTreeRoot) return null;

    // Get a path of d3 nodes from the root to the treeNode
    let pathToNode = [targetNode];
    let traversingNode = targetNode;
    while (traversingNode.parent) {
        traversingNode = traversingNode.parent;
        pathToNode = [traversingNode, ...pathToNode];
    }

    let visibleParent = null;
    let childrenInTree = [newTreeRoot];

    // Compare the node's expected path the currently active assembler tree
    for (let i = 0; i < pathToNode.length; i++) {
        const pathNode = pathToNode[i];

        const label = pathNode.data.node_label;

        const foundChild = _.find(childrenInTree, ["data.node_label", label]);

        // Previous node was the last visible parent for the node
        if (!foundChild) {
            return visibleParent;
        } else {
            visibleParent = foundChild;
            childrenInTree = foundChild.children ?? [];
        }
    }

    return visibleParent;
}

export function findClosestVisibleParent(
    assembler: DataAssembler,
    treeNode: D3TreeNode
): D3TreeNode | null {
    const activeTreeRoot = assembler.getActiveTree()?.tree;
    if (!activeTreeRoot) return null;

    // Get a path of d3 nodes from the root to the treeNode
    let pathToNode = [treeNode];
    let traversingNode = treeNode;
    while (traversingNode.parent) {
        traversingNode = traversingNode.parent;
        pathToNode = [traversingNode, ...pathToNode];
    }

    let visibleParent = null;
    let childrenInTree = [activeTreeRoot];

    // Compare the node's expected path the currently active assembler tree
    for (let i = 0; i < pathToNode.length; i++) {
        const pathNode = pathToNode[i];

        const label = pathNode.data.node_label;

        const foundChild = _.find(childrenInTree, ["node_label", label]);

        // Previous node was the last visible parent for the node
        if (!foundChild) {
            return visibleParent;
        } else {
            visibleParent = pathToNode[i];
            childrenInTree = foundChild.children ?? [];
        }
    }

    // ? I think this might be unreachable?
    return visibleParent;
}

export function diagonalPath(link: D3TreeEdge): string {
    const { source, target } = link;

    const avgY = (target.y + source.y) / 2;
    // Svg path drawing commands. Note that x and y is swapped to show the tree sideways
    return `
        M ${source.y} ${source.x} \
        C \
            ${avgY} ${source.x}, \
            ${avgY} ${target.x}, \
            ${target.y} ${target.x}
        `;
}

export function usePrevious<T>(value: T): T | null {
    const oldValRef = React.useRef<T | null>(null);
    React.useEffect(() => {
        oldValRef.current = value;
    }, [value]);

    return oldValRef.current;
}
