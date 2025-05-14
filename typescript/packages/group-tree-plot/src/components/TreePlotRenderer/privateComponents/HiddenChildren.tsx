import React from "react";
import type { RecursiveTreeNode } from "../../../types";

export type HiddenChildrenProps = {
    hiddenChildren: RecursiveTreeNode[];
};

export function HiddenChildren(props: HiddenChildrenProps): React.ReactNode {
    let msg = "+ " + props.hiddenChildren.length;
    if (props.hiddenChildren.length > 1) {
        msg += " children";
    } else {
        msg += " child";
    }

    return (
        <g>
            <text
                x={21}
                textAnchor="start"
                dominantBaseline="middle"
                fontSize={10}
                fontFamily="sans-serif"
            >
                {msg}
            </text>
        </g>
    );
}
