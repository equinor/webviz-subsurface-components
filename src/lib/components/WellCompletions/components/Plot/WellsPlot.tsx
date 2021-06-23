import React, { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { WellCompletionsState } from "../../redux/store";
import { PlotData } from "../../utils/dataUtil";
import { SORT_BY_COMPLETION_DATE } from "../../utils/sort";
import { capitalizeFirstLetter } from "../../utils/stringUtil";
import { useTooltip } from "../Common/TooltipProvider";
import { Padding, PlotLayout } from "./plotUtil";

interface Props {
    timeSteps: string[];
    plotData: PlotData;
    layout: PlotLayout;
    padding: Padding;
}
/* eslint-disable react/prop-types */
const WellsPlot: React.FC<Props> = React.memo(
    ({ timeSteps, plotData, layout, padding }) => {
        const { setContent } = useTooltip();
        const attributeKeys = useSelector(
            (st: WellCompletionsState) => st.attributes.attributeKeys
        );
        const wellWidth = useMemo(
            () => layout.xExtent / Math.max(plotData.wells.length, 1),
            [layout.xExtent, plotData.wells.length]
        );
        const barHeight = useMemo(
            () => layout.yExtent / Math.max(plotData.stratigraphy.length, 1),
            [layout.yExtent, plotData.stratigraphy.length]
        );
        const onMouseOver = useCallback(
            (well) => {
                setContent(() => (
                    <table style={{ color: "#fff" }}>
                        <tbody>
                            {/* earliest completion date */}
                            <tr key={`well-tooltip-${well.name}-earliest-comp`}>
                                <td>
                                    <b>
                                        {capitalizeFirstLetter(
                                            SORT_BY_COMPLETION_DATE
                                        )}
                                    </b>
                                </td>
                                <td>{timeSteps[well.earliestCompDateIndex]}</td>
                            </tr>
                            {attributeKeys.map((attribute) => (
                                <tr
                                    key={`well-tooltip-${well.name}-${attribute}`}
                                >
                                    <td>
                                        <b>
                                            {capitalizeFirstLetter(attribute)}
                                        </b>
                                    </td>
                                    <td>
                                        {well.attributes[attribute] ||
                                            "Undefined"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ));
            },
            [setContent]
        );

        const onMouseOut = useCallback(
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
    }
);

WellsPlot.displayName = "WellsPlot";
export default WellsPlot;
