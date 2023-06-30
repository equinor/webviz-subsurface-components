/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import React from "react";
import { PlotData, SortBy, WellPlotData } from "../types/dataTypes";
import { capitalizeFirstLetter } from "../utils/stringUtil";
import { useTooltip } from "./TooltipProvider";
import { Padding, PlotLayout } from "../types/layoutTypes";

interface WellsPlotProps {
    timeSteps: string[];
    plotData: PlotData;
    layout: PlotLayout;
    padding: Padding;
}
/* eslint-disable react/prop-types */
const WellsPlot: React.FC<WellsPlotProps> = ({
    timeSteps,
    plotData,
    layout,
    padding,
}) => {
    const { setContent } = useTooltip();

    const wellWidth = layout.xExtent / Math.max(plotData.wells.length, 1);
    const barHeight =
        layout.yExtent / Math.max(plotData.stratigraphy.length, 1);

    // TODO: Add on pointer down for touch devices
    const onMouseOver = React.useCallback(
        (well: WellPlotData) => {
            setContent(() => (
                <table style={{ color: "#fff" }}>
                    <tbody>
                        {/* earliest completion date */}
                        <tr key={`well-tooltip-${well.name}-earliest-comp`}>
                            <td>
                                <b>
                                    {capitalizeFirstLetter(
                                        SortBy.CompletionDate
                                    )}
                                </b>
                            </td>
                            <td>{timeSteps[well.earliestCompDateIndex]}</td>
                        </tr>
                        {Object.entries(well.attributes).map(([key, value]) => (
                            <tr key={`well-tooltip-${well.name}-${key}`}>
                                <td>
                                    <b>{capitalizeFirstLetter(key)}</b>
                                </td>
                                <td>{value || "Undefined"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ));
        },
        [setContent]
    );

    // TODO: Add on pointer up for touch devices
    const onMouseOut = React.useCallback(
        () => setContent(() => null),
        [setContent]
    );
    return (
        <g>
            {plotData.wells.map((well, i) => {
                const lastCompletion = Array.from(well.completions)
                    .reverse()
                    .find((comp) => comp.open + comp.shut > 0);
                const height = lastCompletion
                    ? (lastCompletion.zoneIndex + 1) * barHeight
                    : 0;
                return (
                    <g
                        transform={`translate(${
                            padding.left + (i + 0.5) * wellWidth
                        },0)`}
                        key={`well-${well.name}`}
                    >
                        <text
                            style={{ fontSize: "9px" }}
                            textAnchor="start"
                            transform={`translate(0,${
                                padding.top - 10
                            }) rotate(-60)`}
                            x={0}
                            y={0}
                            dy={".35em"}
                            fontFamily={"sans-serif"}
                            onMouseOver={() => onMouseOver(well)}
                            onMouseOut={onMouseOut}
                        >
                            {well.name}
                        </text>
                        <rect
                            transform={`translate(0,${padding.top - 4})`}
                            width={0.5}
                            height={height + 4}
                            fill={"#111"}
                        />
                    </g>
                );
            })}
        </g>
    );
};

WellsPlot.displayName = "WellsPlot";
export default WellsPlot;
