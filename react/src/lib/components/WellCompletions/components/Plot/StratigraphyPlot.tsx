import React, { useMemo } from "react";
import { Zone } from "../../redux/types";
import { Padding, PlotLayout } from "./plotUtil";

interface Props {
    data: Zone[];
    layout: PlotLayout;
    padding: Padding;
}

const shortenName = (str: string) =>
    str.length >= 13 ? "..." + str.substring(str.length - 10, str.length) : str;
/* eslint-disable react/prop-types */
const StratigraphyPlot: React.FC<Props> = React.memo(
    ({ data, layout, padding }) => {
        const barHeight = useMemo(
            () => layout.yExtent / Math.max(data.length, 1),
            [layout.yExtent, data.length]
        );
        return (
            <g>
                {data.map((zone, i) => {
                    return (
                        <g
                            transform={`translate(0,${
                                padding.top + i * barHeight
                            })`}
                            key={`zone-${zone.name}`}
                        >
                            <rect
                                transform={`translate(${padding.left}, 0)`}
                                width={layout.xExtent}
                                height={barHeight}
                                fill={zone.color}
                            />
                            <title>{zone.name}</title>
                            <text
                                style={{ fontSize: "11px" }}
                                textAnchor="end"
                                x={padding.left - 4}
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
export default StratigraphyPlot;
