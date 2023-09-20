import React from "react";
const shortenName = (str) => str.length >= 13 ? "..." + str.substring(str.length - 10, str.length) : str;
/* eslint-disable react/prop-types */
export const StratigraphyPlot = React.memo((props) => {
    const barHeight = props.layout.yExtent / Math.max(props.data.length, 1);
    return (React.createElement("g", null, props.data.map((zone, i) => {
        return (React.createElement("g", { transform: `translate(0,${props.padding.top + i * barHeight})`, key: `zone-${zone.name}` },
            React.createElement("rect", { transform: `translate(${props.padding.left}, 0)`, width: props.layout.xExtent, height: barHeight, fill: zone.color }),
            React.createElement("title", null, zone.name),
            React.createElement("text", { style: { fontSize: "11px" }, textAnchor: "end", x: props.padding.left - 4, y: barHeight / 2, dy: ".35em", fontFamily: "sans-serif" }, shortenName(zone.name))));
    })));
});
StratigraphyPlot.displayName = "StratigraphyPlot";
//# sourceMappingURL=StratigraphyPlot.js.map