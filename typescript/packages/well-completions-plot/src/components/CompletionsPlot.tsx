/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import React from "react";
import { CompletionPlotData, PlotData, WellPlotData } from "../types/dataTypes";
import { useTooltip } from "./TooltipProvider";
import { Padding, PlotLayout } from "../types/layoutTypes";

interface CompletionsPlotProps {
    plotData: PlotData;
    layout: PlotLayout;
    padding: Padding;
}

/* eslint-disable react/prop-types */
const CompletionsPlot: React.FC<CompletionsPlotProps> = ({
    plotData,
    layout,
    padding,
}) => {
    const { setContent } = useTooltip();
    const decimalPlaces = plotData.units.kh.decimalPlaces;
    const khUnit =
        plotData.units.kh.unit.length > 0 ? ` ${plotData.units.kh.unit}` : "";
    const wellWidth = layout.xExtent / Math.max(plotData.wells.length, 1);
    const barHeight =
        layout.yExtent / Math.max(plotData.stratigraphy.length, 1);

    const onMouseMove = React.useCallback(
        (
            e: React.MouseEvent<SVGRectElement>,
            well: WellPlotData,
            completion: CompletionPlotData
        ) => {
            const zoneName =
                plotData.stratigraphy[
                    Math.floor(
                        (e.nativeEvent.offsetY - padding.top) / barHeight
                    )
                ].name;
            setContent(() => (
                <table style={{ color: "#fff" }}>
                    <tbody>
                        {[
                            ["Well name", well.name],
                            ["Stratigraphy", zoneName],
                            ["Open", completion.open],
                            ["Shut", completion.shut],
                            [
                                "Kh Mean",
                                `${completion.khMean.toFixed(
                                    decimalPlaces
                                )}${khUnit}`,
                            ],
                            [
                                "Kh Min",
                                `${completion.khMin.toFixed(
                                    decimalPlaces
                                )}${khUnit}`,
                            ],
                            [
                                "Kh Max",
                                `${completion.khMax.toFixed(
                                    decimalPlaces
                                )}${khUnit}`,
                            ],
                        ].map(([key, value]) => (
                            <tr key={`tooltip-${key}-${value}`}>
                                <td>
                                    <b>{key}</b>
                                </td>
                                <td>{value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ));
        },
        [setContent, plotData.stratigraphy, barHeight]
    );

    const onMouseOut = React.useCallback(
        () => setContent(() => null),
        [setContent]
    );
    return (
        <g>
            {plotData.wells.map((well, i) => {
                return (
                    <g
                        transform={`translate(${
                            padding.left + (i + 0.5) * wellWidth
                        }, ${0})`}
                        key={`well-${well.name}-completions`}
                    >
                        {well.completions.map((completion, j) => {
                            const start = completion.zoneIndex;
                            const end =
                                j === well.completions.length - 1
                                    ? plotData.stratigraphy.length
                                    : well.completions[j + 1].zoneIndex;
                            const totalWidth =
                                completion.open + completion.shut;
                            return (
                                <g key={`well-${well.name}-completions-${j}`}>
                                    <rect
                                        key={`well-${well.name}-completions-${j}-shut-left`}
                                        transform={`translate(${
                                            -totalWidth * wellWidth * 0.25
                                        }, ${start * barHeight + padding.top})`}
                                        width={
                                            (completion.shut * wellWidth) / 4
                                        }
                                        height={barHeight * (end - start)}
                                        fill={"#f00"}
                                        onMouseMove={(e) =>
                                            onMouseMove(e, well, completion)
                                        }
                                        onMouseOut={onMouseOut}
                                    />
                                    <rect
                                        key={`well-${well.name}-completions-${j}-open`}
                                        transform={`translate(${
                                            -completion.open * wellWidth * 0.25
                                        }, ${start * barHeight + padding.top})`}
                                        width={
                                            (completion.open * wellWidth) / 2
                                        }
                                        height={barHeight * (end - start)}
                                        fill={"#111"}
                                        onMouseMove={(e) =>
                                            onMouseMove(e, well, completion)
                                        }
                                        onMouseOut={onMouseOut}
                                    />
                                    <rect
                                        key={`well-${well.name}-completions-${j}-shut-right`}
                                        transform={`translate(${
                                            (totalWidth - completion.shut) *
                                            wellWidth *
                                            0.25
                                        }, ${start * barHeight + padding.top})`}
                                        width={
                                            (completion.shut * wellWidth) / 4
                                        }
                                        height={barHeight * (end - start)}
                                        fill={"#f00"}
                                        onMouseMove={(e) =>
                                            onMouseMove(e, well, completion)
                                        }
                                        onMouseOut={onMouseOut}
                                    />
                                </g>
                            );
                        })}
                    </g>
                );
            })}
        </g>
    );
};

CompletionsPlot.displayName = "CompletionsPlot";
export default CompletionsPlot;
