/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.
import React from "react";
import { SortBy, SortByEnumToStringMapping } from "../types/dataTypes";
import { capitalizeFirstLetter } from "../utils/stringUtil";
import { useTooltip } from "./TooltipProvider";
const WellTooltipContent = (props) => {
    return (React.createElement("table", { style: { color: "#fff" } },
        React.createElement("tbody", null,
            React.createElement("tr", { key: `well-tooltip-${props.name}-earliest-comp` },
                React.createElement("td", null,
                    React.createElement("b", null, SortByEnumToStringMapping[SortBy.CompletionDate])),
                React.createElement("td", null, props.earliestCompDate)),
            Object.entries(props.attributes).map(([key, value]) => (React.createElement("tr", { key: `well-tooltip-${name}-${key}` },
                React.createElement("td", null,
                    React.createElement("b", null, capitalizeFirstLetter(key))),
                React.createElement("td", null, value || "Undefined")))))));
};
WellTooltipContent.displayName = "WellTooltipContent";
/* eslint-disable react/prop-types */
export const WellsPlot = (props) => {
    const { setContent } = useTooltip();
    const wellWidth = props.layout.xExtent / Math.max(props.plotData.wells.length, 1);
    const barHeight = props.layout.yExtent / Math.max(props.plotData.stratigraphy.length, 1);
    const onMouseOver = React.useCallback(function onMouseOver(well) {
        setContent(() => (React.createElement(WellTooltipContent, { name: well.name, earliestCompDate: props.timeSteps[well.earliestCompDateIndex], attributes: well.attributes })));
    }, [setContent, props.timeSteps]);
    const onMouseOut = React.useCallback(function onMouseOut() {
        setContent(() => null);
    }, [setContent]);
    return (React.createElement("g", null, props.plotData.wells.map((well, i) => {
        const lastCompletion = Array.from(well.completions)
            .reverse()
            .find((comp) => comp.open + comp.shut > 0);
        const height = lastCompletion
            ? (lastCompletion.zoneIndex + 1) * barHeight
            : 0;
        return (React.createElement("g", { transform: `translate(${props.padding.left + (i + 0.5) * wellWidth},0)`, key: `well-${well.name}` },
            React.createElement("text", { style: { fontSize: "9px" }, textAnchor: "start", transform: `translate(0,${props.padding.top - 10}) rotate(-60)`, x: 0, y: 0, dy: ".35em", fontFamily: "sans-serif", onMouseOver: () => onMouseOver(well), onMouseOut: onMouseOut }, well.name),
            React.createElement("rect", { transform: `translate(0,${props.padding.top - 4})`, width: 0.5, height: height + 4, fill: "#111" })));
    })));
};
WellsPlot.displayName = "WellsPlot";
//# sourceMappingURL=WellsPlot.js.map