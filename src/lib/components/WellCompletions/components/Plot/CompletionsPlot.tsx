import React, { useMemo } from "react";
import { PlotData } from "../../hooks/dataUtil";
import { useTooltip } from "../Tooltip/TooltipProvider";
import { Padding, PlotLayout } from "./plotUtil";

interface Props {
    data: PlotData;
    layout: PlotLayout;
    padding: Padding;
}

/* eslint-disable react/prop-types */
const CompletionsPlot: React.FC<Props> = React.memo(
    ({ data, layout, padding }) => {
        const { setContent } = useTooltip();
        const wellWidth = useMemo(
            () => layout.xExtent / Math.max(data.wells.length, 1),
            [layout.xExtent, data.wells.length]
        );
        const barHeight = useMemo(
            () => layout.yExtent / Math.max(data.stratigraphy.length, 1),
            [layout.yExtent, data.stratigraphy.length]
        );
        return (
            <g>
                {data.wells.map((well, i) => {
                    return (
                        <g
                            transform={`translate(${padding.left +
                                (i + 0.5) * wellWidth}, ${0})`}
                            key={`well-${well.name}-completions`}
                        >
                            {well.completions.map((completion, j) => {
                                const start = well.zoneIndices[j];
                                const end =
                                    j === well.zoneIndices.length - 1
                                        ? data.stratigraphy.length
                                        : well.zoneIndices[j + 1];
                                const rangeText =
                                    data.stratigraphy[start].name +
                                    (start < end - 1
                                        ? ` - ${
                                              data.stratigraphy[end - 1].name
                                          }`
                                        : "");
                                return (
                                    <rect
                                        key={`well-${well.name}-completions-${start}-${end}`}
                                        transform={`translate(${-completion *
                                            wellWidth *
                                            0.25}, ${start * barHeight +
                                            padding.top})`}
                                        width={(completion * wellWidth) / 2}
                                        height={barHeight * (end - start)}
                                        fill={"#111"}
                                        onMouseOver={() =>
                                            setContent(() => (
                                                <table>
                                                    <tr>
                                                        <td>Well name</td>
                                                        <td>{well.name}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Stratigraphy</td>
                                                        <td>{rangeText}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Completion</td>
                                                        <td>{completion}</td>
                                                    </tr>
                                                </table>
                                            ))
                                        }
                                        onMouseOut={() =>
                                            setContent(() => null)
                                        }
                                    />
                                );
                            })}
                        </g>
                    );
                })}
            </g>
        );
    }
);

CompletionsPlot.displayName = "CompletionsPlot";
export default CompletionsPlot;
