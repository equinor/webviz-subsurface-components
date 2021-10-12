import React from "react";
import legendUtil from "../utils/legend";
import { scaleOrdinal, select } from "d3";

interface ItemColor {
    color: string;
}

interface colorLegendProps {
    discreteData: { objects: Record<string, [number[], number]> };
}

const DiscreteColorLegend: React.FC<colorLegendProps> = ({
    discreteData,
}: colorLegendProps) => {
    React.useEffect(() => {
        discreteLegend("#legend");
    }, [discreteData]);
    function discreteLegend(legend: string) {
        const itemName: string[] = [];
        const itemColor: ItemColor[] = [];

        Object.keys(discreteData).forEach((key) => {
            itemColor.push({
                color: RGBAToHexA(
                    // eslint-disable-next-line
                    (discreteData as { [key: string]: any })[key][0]
                ),
            });
            itemName.push(key);
        });
        function RGBAToHexA(rgba: number[]) {
            let r = rgba[0].toString(16),
                g = rgba[1].toString(16),
                b = rgba[2].toString(16);
            if (r.length == 1) r = "0" + r;
            if (g.length == 1) g = "0" + g;
            if (b.length == 1) b = "0" + b;
            return "#" + r + g + b;
        }
        const ordinalValues = scaleOrdinal().domain(itemName);
        const colorLegend = legendUtil(itemColor).inputScale(ordinalValues);
        select(legend)
            .append("svg")
            .attr("height", 600 + "px")
            .attr("width", 150 + "px")
            .style("position", "absolute")
            .style("right", "40px")
            .style("top", "0px")
            .attr("transform", "translate(0,30)")
            .call(colorLegend);
    }

    return <div id="legend"></div>;
};

export default DiscreteColorLegend;
