import React from "react";
import legendUtil from "../utils/legend";
import * as d3 from "d3";

interface colorLegendProps {
    data: any;
}

const ColorLegend: React.FC<colorLegendProps> = ({
    data,
}: colorLegendProps) => {
    React.useEffect(() => {
        if (data) {
            legendDemo("#legend");
        }
    }, [data]);

    //console.log('data', data)

    function legendDemo(legend: string) {
        const itemName: string[] = [];
        const itemColor: Record<string, unknown>[] = [];

        Object.keys(data).forEach((key) => {
            itemColor.push({ color: RGBAToHexA(data[key][0]) });
            itemName.push(key);
        });
        function RGBAToHexA(rgba: number[]) {
            let r = rgba[0].toString(16),
                g = rgba[1].toString(16),
                b = rgba[2].toString(16),
                a = Math.round(rgba[3] * 255).toString(16);
            if (r.length == 1) r = "0" + r;
            if (g.length == 1) g = "0" + g;
            if (b.length == 1) b = "0" + b;
            if (a.length == 1) a = "0" + a;
            return "#" + r + g + b;
        }
        const ordinalValues = d3
            .scaleOrdinal(d3.schemeCategory10)
            .domain(itemName);
        const discreteLegend = legendUtil(itemColor)
            .labelFormat("none")
            .inputScale(ordinalValues);
        d3.select(legend)
            .append("svg")
            .attr("height", 600 + "px")
            .attr("width", 150 + "px")
            .style("position", "absolute")
            .style("right", "0px")
            .style("top", "0px")
            .attr("transform", "translate(0,30)")
            .call(discreteLegend);
    }

    return <div id="legend"></div>;
};

export default ColorLegend;
