import React, { useCallback, useMemo } from "react";
import { WellPlotData } from "../../hooks/dataUtil";
import { useTooltip } from "../Utils/TooltipProvider";
import { Padding, PlotLayout } from "./plotUtil";

interface Props {
    data: WellPlotData[];
    layout: PlotLayout;
    padding: Padding;
}
/* eslint-disable react/prop-types */
const WellsPlot: React.FC<Props> = React.memo(({ data, layout, padding }) => {
    const { setContent } = useTooltip();
    const wellWidth = useMemo(() => layout.xExtent / Math.max(data.length, 1), [
        layout.xExtent,
        data.length,
    ]);
    const onMouseOver = useCallback(
        well => {
            setContent(() => (
                <table>
                    <tbody>
                        {Object.keys(well.attributes).map(attribute => (
                            <tr key={`well-tooltip-${well.name}-${attribute}`}>
                                <td>
                                    <b>{attribute}</b>
                                </td>
                                <td>{well.attributes[attribute]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ));
        },
        [setContent]
    );

    const onMouseOut = useCallback(() => setContent(() => null), [setContent]);
    return (
        <g>
            {data.map((well, i) => {
                return (
                    <g
                        transform={`translate(${padding.left +
                            (i + 0.5) * wellWidth},0)`}
                        key={`well-${well.name}`}
                    >
                        <text
                            style={{ fontSize: "9px" }}
                            textAnchor="start"
                            transform={`translate(0,${padding.top -
                                10}) rotate(-60)`}
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
                            height={layout.yExtent + 4}
                            fill={"#111"}
                        />
                    </g>
                );
            })}
        </g>
    );
});

WellsPlot.displayName = "WellsPlot";
export default WellsPlot;
