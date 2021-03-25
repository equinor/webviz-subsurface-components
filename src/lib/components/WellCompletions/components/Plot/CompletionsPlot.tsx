import React, { useCallback, useMemo } from "react";
import { PlotData } from "../../utils/dataUtil";
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
            (e, well, completion) => {
                const zoneName =
                    data.stratigraphy[
                        Math.floor(
                            (e.nativeEvent.offsetY - padding.top) / barHeight
                        )
                    ].name;
                setContent(() => (
                    <table style={{ color: "#fff" }}>
                        <tbody>
                            <tr>
                                <td>
                                    <b>Well name</b>
                                </td>
                                <td>{well.name}</td>
                            </tr>
                            <tr>
                                <td>
                                    <b>Stratigraphy</b>
                                </td>
                                <td>{zoneName}</td>
                            </tr>
                            <tr>
                                <td>
                                    <b>Completion</b>
                                </td>
                                <td>{completion}</td>
                            </tr>
                        </tbody>
                    </table>
                ));
            },
            [setContent, data.stratigraphy]
        );

        const onMouseOut = useCallback(() => setContent(() => null), [
            setContent,
        ]);
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
                                        onMouseMove={e =>
                                            onMouseMove(e, well, completion)
                                        }
                                        onMouseOut={onMouseOut}
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
