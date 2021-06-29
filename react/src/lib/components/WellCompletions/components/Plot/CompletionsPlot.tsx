import React, { useCallback, useContext, useMemo } from "react";
import { CompletionPlotData, PlotData } from "../../utils/dataUtil";
import { useTooltip } from "../Common/TooltipProvider";
import { DataContext } from "../DataLoader";
import { Padding, PlotLayout } from "./plotUtil";

interface Props {
    plotData: PlotData;
    layout: PlotLayout;
    padding: Padding;
}

/* eslint-disable react/prop-types */
const CompletionsPlot: React.FC<Props> = React.memo(
    ({ plotData, layout, padding }) => {
        const data = useContext(DataContext);
        const { setContent } = useTooltip();
        const decimalPlaces = useMemo(
            () => data.units.kh.decimalPlaces,
            [data]
        );
        const khUnit = useMemo(
            () =>
                data.units.kh.unit.length > 0 ? ` ${data.units.kh.unit}` : "",
            [data]
        );
        const wellWidth = useMemo(
            () => layout.xExtent / Math.max(plotData.wells.length, 1),
            [layout.xExtent, plotData.wells.length]
        );
        const barHeight = useMemo(
            () => layout.yExtent / Math.max(plotData.stratigraphy.length, 1),
            [layout.yExtent, plotData.stratigraphy.length]
        );

        const onMouseMove = useCallback(
            (e, well, completion: CompletionPlotData) => {
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

        const onMouseOut = useCallback(
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
                                    <g
                                        key={`well-${well.name}-completions-${j}`}
                                    >
                                        <rect
                                            key={`well-${well.name}-completions-${j}-shut-left`}
                                            transform={`translate(${
                                                -totalWidth * wellWidth * 0.25
                                            }, ${
                                                start * barHeight + padding.top
                                            })`}
                                            width={
                                                (completion.shut * wellWidth) /
                                                4
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
                                                -completion.open *
                                                wellWidth *
                                                0.25
                                            }, ${
                                                start * barHeight + padding.top
                                            })`}
                                            width={
                                                (completion.open * wellWidth) /
                                                2
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
                                            }, ${
                                                start * barHeight + padding.top
                                            })`}
                                            width={
                                                (completion.shut * wellWidth) /
                                                4
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
    }
);

CompletionsPlot.displayName = "CompletionsPlot";
export default CompletionsPlot;
