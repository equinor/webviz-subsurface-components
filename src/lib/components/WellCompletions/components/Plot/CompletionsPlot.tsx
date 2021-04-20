import React, { useCallback, useMemo } from "react";
import { CompletionPlotData, PlotData } from "../../utils/dataUtil";
import { useTooltip } from "../Common/TooltipProvider";
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

        const onMouseMove = useCallback(
            (e, well, completion: CompletionPlotData) => {
                const zoneName =
                    data.stratigraphy[
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
                                ["Kh Mean", completion.khMean.toFixed(2)],
                                ["Kh Min", completion.khMin.toFixed(2)],
                                ["Kh Max", completion.khMax.toFixed(2)],
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
            [setContent, data.stratigraphy, barHeight]
        );

        const onMouseOut = useCallback(() => setContent(() => null), [
            setContent,
        ]);
        return (
            <g>
                {data.wells.map((well, i) => {
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
                                        ? data.stratigraphy.length
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
