import React from "react";
import { useResizeDetector } from "react-resize-detector";
import { TooltipProvider } from "./components/TooltipProvider";
import { CompletionsPlot } from "./components/CompletionsPlot";
import { createLayout } from "./utils/layoutUtils";
import { StratigraphyPlot } from "./components/StratigraphyPlot";
import { WellsPlot } from "./components/WellsPlot";
import "./WellCompletionsPlot.css";
const padding = { left: 80, right: 50, top: 70, bottom: 50 };
/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
export const WellCompletionsPlot = React.memo((props) => {
    const { width, height, ref } = useResizeDetector({
        refreshMode: "debounce",
        refreshRate: 50,
        refreshOptions: { trailing: true },
    });
    const layout = width !== undefined && height !== undefined
        ? createLayout(width, height, padding)
        : undefined;
    return (React.createElement(TooltipProvider, null,
        React.createElement("div", { ref: ref, id: props.id, className: "WellCompletionsPlot", "data-tip": true, "data-for": "plot-tooltip" }, layout && props.plotData && (React.createElement("svg", { id: `${props.id}-svg-context`, width: width, height: height, style: { position: "relative" } },
            React.createElement(StratigraphyPlot, { data: props.plotData.stratigraphy, layout: layout, padding: padding }),
            React.createElement(WellsPlot, { timeSteps: props.timeSteps, plotData: props.plotData, layout: layout, padding: padding }),
            props.plotData && (React.createElement(CompletionsPlot, { plotData: props.plotData, layout: layout, padding: padding })))))));
});
WellCompletionsPlot.displayName = "WellCompletionsPlot";
//# sourceMappingURL=WellCompletionsPlot.js.map