/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import React from "react";
import type { AttributeType, PlotData, WellPlotData } from "../types/dataTypes";
import {
    SortWellsBy,
    SortWellsByEnumToStringMapping,
} from "../types/dataTypes";
import { capitalizeFirstLetter } from "../private-utils/stringUtils";
import { useTooltip } from "./TooltipProvider";
import type { Padding, PlotLayout } from "../types/layoutTypes";

interface WellTooltipContentProps {
    name: string;
    earliestCompDate: string;
    attributes: Record<string, AttributeType>;
}

const WellTooltipContent: React.FC<WellTooltipContentProps> = (
    props: WellTooltipContentProps
) => {
    return (
        <table style={{ color: "#fff" }}>
            <tbody>
                <tr key={`well-tooltip-${props.name}-earliest-comp`}>
                    <td>
                        <b>
                            {
                                SortWellsByEnumToStringMapping[
                                    SortWellsBy.EARLIEST_COMPLETION_DATE
                                ]
                            }
                        </b>
                    </td>
                    <td>{props.earliestCompDate}</td>
                </tr>
                {Object.entries(props.attributes).map(([key, value]) => (
                    <tr key={`well-tooltip-${name}-${key}`}>
                        <td>
                            <b>{capitalizeFirstLetter(key)}</b>
                        </td>
                        <td>{value || "Undefined"}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
WellTooltipContent.displayName = "WellTooltipContent";

interface WellsPlotProps {
    sortedCompletionDates: string[]; // Array of string dates/time steps in increasing order;
    plotData: PlotData;
    layout: PlotLayout;
    padding: Padding;
}

/* eslint-disable react/prop-types */
export const WellsPlot: React.FC<WellsPlotProps> = (props: WellsPlotProps) => {
    const { setContent } = useTooltip();

    const wellWidth =
        props.layout.xExtent / Math.max(props.plotData.wells.length, 1);
    const barHeight =
        props.layout.yExtent / Math.max(props.plotData.stratigraphy.length, 1);

    const onMouseOver = React.useCallback(
        function onMouseOver(well: WellPlotData): void {
            setContent(() => (
                <WellTooltipContent
                    name={well.name}
                    earliestCompDate={
                        props.sortedCompletionDates[well.earliestCompDateIndex]
                    }
                    attributes={well.attributes}
                />
            ));
        },
        [setContent, props.sortedCompletionDates]
    );

    const onMouseOut = React.useCallback(
        function onMouseOut(): void {
            setContent(() => null);
        },
        [setContent]
    );
    return (
        <g>
            {props.plotData.wells.map((well, i) => {
                const lastCompletion = Array.from(well.completions)
                    .reverse()
                    .find((comp) => comp.open + comp.shut > 0);
                const height = lastCompletion
                    ? (lastCompletion.zoneIndex + 1) * barHeight
                    : 0;
                return (
                    <g
                        transform={`translate(${
                            props.padding.left + (i + 0.5) * wellWidth
                        },0)`}
                        key={`well-${well.name}`}
                    >
                        <text
                            style={{ fontSize: "9px" }}
                            textAnchor="start"
                            transform={`translate(0,${
                                props.padding.top - 10
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
                            transform={`translate(0,${props.padding.top - 4})`}
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
