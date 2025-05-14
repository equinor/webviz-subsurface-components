import React from "react";

export type PlotErrorOverlayProps = {
    message: string;
};

export function PlotErrorOverlay(
    props: PlotErrorOverlayProps
): React.ReactNode {
    return (
        <>
            <rect
                className="error-overlay-background"
                width="100%"
                height="100%"
                fill="rgba(255, 255, 255, 0.8)"
            />
            <text
                x="50%"
                y="50%"
                fill="red"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={16}
            >
                {props.message}
            </text>
        </>
    );
}
