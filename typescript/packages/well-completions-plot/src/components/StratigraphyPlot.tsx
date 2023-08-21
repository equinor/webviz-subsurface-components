import React from "react";
import type { Zone } from "../types/dataTypes";
import type { Padding, PlotLayout } from "../types/layoutTypes";

interface StratigraphyPlotProps {
    data: Zone[];
    layout: PlotLayout;
    padding: Padding;
}

const shortenName = (str: string) =>
    str.length >= 13 ? "..." + str.substring(str.length - 10, str.length) : str;
/* eslint-disable react/prop-types */
export const StratigraphyPlot: React.FC<StratigraphyPlotProps> = React.memo(
    (props: StratigraphyPlotProps) => {
        const barHeight = props.layout.yExtent / Math.max(props.data.length, 1);

        return (
            <g>
                {props.data.map((zone, i) => {
                    return (
                        <g
                            transform={`translate(0,${
                                props.padding.top + i * barHeight
                            })`}
                            key={`zone-${zone.name}`}
                        >
                            <rect
                                transform={`translate(${props.padding.left}, 0)`}
                                width={props.layout.xExtent}
                                height={barHeight}
                                fill={zone.color}
                            />
                            <title>{zone.name}</title>
                            <text
                                style={{ fontSize: "11px" }}
                                textAnchor="end"
                                x={props.padding.left - 4}
                                y={barHeight / 2}
                                dy={".35em"}
                                fontFamily={"sans-serif"}
                            >
                                {shortenName(zone.name)}
                            </text>
                        </g>
                    );
                })}
            </g>
        );
    }
);

StratigraphyPlot.displayName = "StratigraphyPlot";
