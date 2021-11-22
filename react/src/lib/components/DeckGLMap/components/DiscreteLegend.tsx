import React from "react";
import legendUtil from "../utils/discreteLegend";
import { scaleOrdinal, select } from "d3";

interface ItemColor {
    color: string;
}

interface colorLegendProps {
    discreteData: { objects: Record<string, [number[], number]> };
    dataObjectName: string;
    name: string;
    position: number[];
    template: colorTemplateArray;
    colorTables: colorTablesArray;
}

interface colorTablesObj {
    name: string;
    description: string;
    colors: [number, number, number, number][];
}

type colorTablesArray = Array<colorTablesObj>;

interface colorTemplate {
    name: string;
    properties: Array<colorTemplatePropertiesObj>;
}

type colorTemplateArray = Array<colorTemplate>;

interface colorTemplatePropertiesObj {
    objectName: string;
    colorTable: string;
    context: string;
    colorInterpolation: string;
}

const DiscreteColorLegend: React.FC<colorLegendProps> = ({
    discreteData,
    name,
    dataObjectName,
    position,
    template,
    colorTables,
}: colorLegendProps) => {
    React.useEffect(() => {
        discreteLegend("#legend");
    }, [discreteData]);
    function discreteLegend(legend: string) {
        const itemName: string[] = [];
        const itemColor: ItemColor[] = [];
        const colorsArrayData: [number, number, number, number][] =
            colorTableData(name, template, colorTables);
        Object.keys(discreteData).forEach((key) => {
            // eslint-disable-next-line
            let code = (discreteData as { [key: string]: any })[key][1]
            const colorArrays = colorsArrayData.find((value: number[]) => {
                return value[0] == code;
            });
            const splicedData = colorArrays;
            if (splicedData)
                itemColor.push({
                    color: RGBToHex(splicedData),
                });
            itemName.push(key);
        });

        function RGBToHex(rgb: number[]) {
            let r = rgb[1].toString(16),
                g = rgb[2].toString(16),
                b = rgb[3].toString(16);
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
                .attr("width", 230 + "px")
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

// Based on name return the colors array from color.tables.json file
export function colorTableData(
    name: string,
    template: colorTemplateArray,
    colorTables: colorTablesArray
): [number, number, number, number][] {
    const properties = template[0]["properties"];
    const propertiesData = properties.filter(
        (value: colorTemplatePropertiesObj) => value.objectName == name
    );
    const colorTableData = colorTables.filter(
        (value: colorTablesObj) =>
            value.name.toLowerCase() ==
            propertiesData[0].colorTable.toLowerCase()
    );
    return colorTableData[0].colors;
}

DiscreteColorLegend.defaultProps = {
    position: [16, 10],
};

export default DiscreteColorLegend;
