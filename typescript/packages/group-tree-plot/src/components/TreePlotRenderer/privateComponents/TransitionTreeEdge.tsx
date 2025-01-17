import React from "react";

import { motion } from "motion/react";

import { diagonalPath } from "../../../utils/treePlot";
import type { DataAssembler } from "../../../utils/dataAssembler";
import type { D3TreeEdge, D3TreeNode } from "../../../types";
import { useCollapseMotionProps } from "../../../utils/useCollapseMotionProps";

export type TreeEdgeProps = {
    link: D3TreeEdge;
    dataAssembler: DataAssembler;
    primaryEdgeProperty: string;

    // Kinda messy solution for this, might warrant a change in the future
    oldNodeTree: D3TreeNode;
};

export function TransitionTreeEdge(props: TreeEdgeProps): React.ReactNode {
    const linkPath = diagonalPath(props.link);

    const mainTreeNode = props.link.target.data;
    const edgeData = mainTreeNode.edge_data;

    const linkId = React.useId();

    const groupPropertyStrokeClass = `grouptree_link__${props.primaryEdgeProperty}`;

    const edgeTooltip = props.dataAssembler.getTooltip(edgeData);
    const normalizedValue = props.dataAssembler.normalizeValue(
        edgeData,
        props.primaryEdgeProperty
    );

    // Keep minimum width at 2 so line doesnt dissapear
    const strokeWidth = Math.max(normalizedValue, 2);

    const motionProps = useCollapseMotionProps(
        props.link.target,
        props.oldNodeTree,
        {
            strokeOpacity: 1,
            strokeWidth: strokeWidth,
            d: linkPath,
        },
        (collapseTarget: D3TreeNode) => ({
            strokeOpacity: 0,
            strokeWidth: strokeWidth / 4,
            d: diagonalPath({ source: collapseTarget, target: collapseTarget }),
        })
    );

    return (
        <motion.g>
            <motion.path
                {...motionProps}
                id={linkId}
                className={`link grouptree_link ${groupPropertyStrokeClass}`}
                strokeDasharray={normalizedValue > 0 ? "none" : "5,5"}
            >
                <title>{edgeTooltip}</title>
            </motion.path>

            <motion.text
                transition={motionProps.transition}
                initial={{ fillOpacity: 0 }}
                animate={{ fillOpacity: 1 }}
                exit={{ fillOpacity: 0 }}
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
            </motion.text>
        </motion.g>
    );
}
