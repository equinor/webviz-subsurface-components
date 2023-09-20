/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.
import React from "react";
import { useTooltip } from "./TooltipProvider";
const CompletionTooltipContent = (props) => {
    return (React.createElement("table", { style: { color: "#fff" } },
        React.createElement("tbody", null, [
            ["Well name", props.wellName],
            ["Stratigraphy", props.zoneName],
            ["Open", props.completionData.open],
            ["Shut", props.completionData.shut],
            [
                "Kh Mean",
                `${props.completionData.khMean.toFixed(props.decimalPlaces)}${props.khUnit}`,
            ],
            [
                "Kh Min",
                `${props.completionData.khMin.toFixed(props.decimalPlaces)}${props.khUnit}`,
            ],
            [
                "Kh Max",
                `${props.completionData.khMax.toFixed(props.decimalPlaces)}${props.khUnit}`,
            ],
        ].map(([key, value]) => (React.createElement("tr", { key: `tooltip-${key}-${value}` },
            React.createElement("td", null,
                React.createElement("b", null, key)),
            React.createElement("td", null, value)))))));
};
CompletionTooltipContent.displayName = "CompletionTooltipContent";
/* eslint-disable react/prop-types */
export const CompletionsPlot = (props) => {
    const { setContent } = useTooltip();
    const decimalPlaces = props.plotData.units.kh.decimalPlaces;
    const khUnit = props.plotData.units.kh.unit.length > 0
        ? ` ${props.plotData.units.kh.unit}`
        : "";
    const wellWidth = props.layout.xExtent / Math.max(props.plotData.wells.length, 1);
    const barHeight = props.layout.yExtent / Math.max(props.plotData.stratigraphy.length, 1);
    const onMouseMove = React.useCallback(function onMouseOver(e, well, completion) {
        const zoneName = props.plotData.stratigraphy[Math.floor((e.nativeEvent.offsetY - props.padding.top) / barHeight)].name;
        setContent(() => (React.createElement(CompletionTooltipContent, { zoneName: zoneName, wellName: well.name, completionData: completion, khUnit: khUnit, decimalPlaces: decimalPlaces })));
    }, [setContent, props.plotData.stratigraphy, barHeight]);
    const onMouseOut = React.useCallback(function onMouseOut() {
        setContent(() => null);
    }, [setContent]);
    return (React.createElement("g", null, props.plotData.wells.map((well, i) => {
        return (React.createElement("g", { transform: `translate(${props.padding.left + (i + 0.5) * wellWidth}, ${0})`, key: `well-${well.name}-completions` }, well.completions.map((completion, j) => {
            const start = completion.zoneIndex;
            const end = j === well.completions.length - 1
                ? props.plotData.stratigraphy.length
                : well.completions[j + 1].zoneIndex;
            const totalWidth = completion.open + completion.shut;
            return (React.createElement("g", { key: `well-${well.name}-completions-${j}` },
                React.createElement("rect", { key: `well-${well.name}-completions-${j}-shut-left`, transform: `translate(${-totalWidth * wellWidth * 0.25}, ${start * barHeight +
                        props.padding.top})`, width: (completion.shut * wellWidth) / 4, height: barHeight * (end - start), fill: "#f00", onMouseMove: (e) => onMouseMove(e, well, completion), onMouseOut: onMouseOut }),
                React.createElement("rect", { key: `well-${well.name}-completions-${j}-open`, transform: `translate(${-completion.open * wellWidth * 0.25}, ${start * barHeight +
                        props.padding.top})`, width: (completion.open * wellWidth) / 2, height: barHeight * (end - start), fill: "#111", onMouseMove: (e) => onMouseMove(e, well, completion), onMouseOut: onMouseOut }),
                React.createElement("rect", { key: `well-${well.name}-completions-${j}-shut-right`, transform: `translate(${(totalWidth - completion.shut) *
                        wellWidth *
                        0.25}, ${start * barHeight +
                        props.padding.top})`, width: (completion.shut * wellWidth) / 4, height: barHeight * (end - start), fill: "#f00", onMouseMove: (e) => onMouseMove(e, well, completion), onMouseOut: onMouseOut })));
        })));
    })));
};
CompletionsPlot.displayName = "CompletionsPlot";
//# sourceMappingURL=CompletionsPlot.js.map