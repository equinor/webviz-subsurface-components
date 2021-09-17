import React from "react";
import colorLegend from "../utils/legend";
import * as d3 from "d3";

// prop coming from map
interface colorLegendProps {
    data: any;
}

const ColorLegend: React.FC<colorLegendProps> = ({  data,
} : colorLegendProps) => {
    React.useEffect(() => {
        legendDemo(); 
    }, [data]);
    const legendDemo = () => {
        /* Discrete Legend */
        const itemName: any = [];
        const itemColor: any = [];
        Object.keys(data).forEach((key) =>
        {
            itemColor.push({ color: RGBAToHexA(data[key][0]) });
            itemName.push(key);
        })
        function RGBAToHexA(rgba: any) {
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
        const sampleCategoricalData = itemName;
        const sampleOrdinal = d3.scaleOrdinal(d3.schemeCategory10).domain(sampleCategoricalData);
        const verticalLegend = colorLegend(itemColor).labelFormat("none").cellPadding(5).orientation("vertical").units("Discrete Legend").cellWidth(25).cellHeight(18).inputScale(sampleOrdinal).cellStepping(10);
        d3.select("svg").append("g").attr("transform", "translate(320,100)").attr("class", "legend").call(verticalLegend);
    }
    return (
        <div style={{}}>
            <div id="vizcontainer">
                <svg style={{
                    width: 452,
                    height: 452,
                    right: 0,
                    top: 0,
                    position: "absolute"
                }}></svg>
            </div>
        </div>
    );
}

export default ColorLegend;