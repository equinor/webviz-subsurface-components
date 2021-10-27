import React from "react";
import legendUtil from "../utils/legend";
import { scaleOrdinal, select } from "d3";

interface ItemColor {
    color: string;
}

interface colorLegendProps {
    discreteData: { objects: Record<string, [number[], number]> };
    dataObjectName: string;
    position: number[];
}

const DiscreteColorLegend: React.FC<colorLegendProps> = ({
    discreteData,
    dataObjectName,
    position,
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

        if (colorLegend) {
            select(legend).select("svg").remove();
            select(legend)
                .append("svg")
                .attr("height", 410 + "px")
                .attr("width", 130 + "px")
                .attr("transform", "translate(0,10)")
                .call(colorLegend);
        }
    }

    return (
        <div
            style={{
                position: "absolute",
                right: position[0],
                top: position[1],
            }}
        >
            <label style={{ color: "#6F6F6F" }}>{dataObjectName}</label>
            <div id="legend"></div>
        </div>
    );
};

DiscreteColorLegend.defaultProps = {
    position: [16, 10],
};

export default DiscreteColorLegend;
