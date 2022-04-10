import * as React from "react";
import { useRef } from "react";
import discreteLegendUtil from "./discreteeLegend";
import { select, scaleOrdinal } from "d3";
import { colorTablesArray, colorTablesObj } from "@emerson-eps/color-tables/";
import * as d3 from "d3";

declare type ItemColor = {
    color: string;
};

declare type colorLegendProps = {
    discreteData: { objects: Record<string, [number[], number]> };
    dataObjectName: string;
    position?: number[] | null;
    colorName: string;
    colorTables: colorTablesArray | string;
    horizontal?: boolean | null;
    updateLegend?: any;
};

export const DiscreteColorLegend: React.FC<colorLegendProps> = ({
    discreteData,
    dataObjectName,
    position,
    colorName,
    colorTables,
    horizontal,
    updateLegend,
}: colorLegendProps) => {
    const divRef = useRef<HTMLDivElement>(null);
    let itemName: string[] = [];
    let itemColor: ItemColor[] = [];
    const testColor: ItemColor[] = [];
    const testName: string[] = [];

    React.useEffect(() => {
        if (divRef.current) {
            select(divRef.current).select("div").remove();
            select(divRef.current).select("svg").remove();
            discreteLegend();
        }
        return function cleanup() {
            select(divRef.current).select("div").remove();
            select(divRef.current).select("svg").remove();
        };
    }, [discreteData, colorName, colorTables, horizontal, updateLegend]);

    //console.log('colorTables', colorTables)

    async function discreteLegend() {
        let dataSet;
        let useSelectorLegend = false;

        try {
            // fix for dash wrapper
            if (typeof colorTables === "string") {
                const res = await fetch(colorTables);
                dataSet = await res.json();
            }

            const colorsArray =
                typeof colorTables === "string"
                    ? colorTableData(colorName, dataSet)
                    : colorTableData(colorName, colorTables);

            //console.log('updateLegend', updateLegend)
            // Main discrete legend
            if (!updateLegend || updateLegend.length == 0) {
                Object.keys(discreteData).forEach((key) => {
                    //eslint-disable-next-line
                    let code = (discreteData as { [key: string]: any })[key][1]
                    //compare the first value in colorarray(colortable) and code from discreteData
                    const matchedColorsArrays = colorsArray.find(
                        (value: number[]) => {
                            return value[0] == code;
                        }
                    );
                    if (matchedColorsArrays)
                        itemColor.push({
                            color: RGBToHex(matchedColorsArrays),
                        });
                    itemName.push(key);
                });
                useSelectorLegend = false;
            }
            // Discrete legend using Colortable colors
            else if (updateLegend?.color) {
                updateLegend.color.forEach((key: any) => {
                    testColor.push({ color: RGBToHex(key) });
                });

                itemColor = testColor;
                itemName = testName;
                useSelectorLegend = true;
            }
            // Discrete legend using d3 colors
            else if (updateLegend?.colorsObject) {
                updateLegend.colorsObject.forEach((key: any) => {
                    itemColor.push({ color: key });
                });

                //itemColor = itemColor;
                itemName = updateLegend.legendColorName;
                useSelectorLegend = true;
            }

            // const toolTipName = itemName.map((word, idx) => {
            //     return <li key={idx}>{word}</li>;
            // });

            // let nameTool;

            // toolTipName.forEach((data) => {
            //     //nameTool.push(data.props.children)
            //     nameTool = data.props.children;
            // });

            // // create a tooltip
            // const tooltip = select(divRef.current)
            //     .append("div")
            //     .style("position", "absolute")
            //     .style("visibility", "hidden")
            //     .style("background-color", "black")
            //     .style("border", "solid")
            //     .style("border-width", "1px")
            //     .style("border-radius", "5px")
            //     .style("padding", "10px")
            //     .text(nameTool)
            //     .style("color", "grey");

            const ordinalValues = scaleOrdinal().domain(itemName);
            const colorLegend = discreteLegendUtil(
                itemColor,
                useSelectorLegend,
                horizontal
            ).inputScale(ordinalValues);
            const currentDiv = select(divRef.current);
            let totalRect;

            // append the title
            currentDiv
                .append("div")
                .text(dataObjectName)
                .style("color", "grey")
                .attr("y", 10)
                .style("margin-bottom", "5px");

            // Append svg to the div
            const svgLegend = currentDiv
                .style("margin", "5px")
                .append("svg")
                // .on("mouseover", function () {
                //     return tooltip.style("visibility", "visible");
                // })
                // .on("mouseout", function () {
                //     return tooltip.style("visibility", "hidden");
                // })
                .call(colorLegend);

            // Style for main horizontal legend
            if (!useSelectorLegend) {
                totalRect = itemColor.length;
            }
            // Style for color selector legend
            else {
                // calculate width for legend using colortable colors
                if (updateLegend?.color) {
                    totalRect = updateLegend.color.length;
                }
                // calculate width for legend using d3 colors
                else {
                    totalRect = updateLegend.colorsObject.length;
                }
            }

            if (horizontal) {
                svgLegend
                    .attr("viewBox", `0 0 ${totalRect} 2`)
                    .attr("preserveAspectRatio", "none")
                    .style("font-size", ".4")
                    .attr("height", "50px")
                    .attr("width", "150px");
            }
            // vertical legend
            else if (!horizontal) {
                svgLegend
                    .attr("viewBox", `0 0 4 ${totalRect}`)
                    .attr("preserveAspectRatio", "none")
                    .style("font-size", ".4")
                    .attr("height", "150px")
                    .attr("width", "100px");
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div
            style={{
                position: "absolute",
                right: position ? position[0] : " ",
                top: position ? position[1] : " ",
                backgroundColor: "#ffffffcc",
                borderRadius: "5px",
                zIndex: "999 !important",
            }}
        >
            <div id="legend" ref={divRef}></div>
        </div>
    );
};

// Based on name return the colors array from color.tables.json file
export function colorTableData(
    colorName: string,
    colorTables: colorTablesArray
): [number, number, number, number][] {
    const colorTableData = colorTables.filter(
        (value: colorTablesObj) =>
            value.name.toLowerCase() == colorName.toLowerCase()
    );
    return colorTableData.length > 0 ? colorTableData[0].colors : [];
}

export function RGBToHex(rgb: number[]) {
    let r = rgb[1].toString(16),
        g = rgb[2].toString(16),
        b = rgb[3].toString(16);
    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;
    return "#" + r + g + b;
}

DiscreteColorLegend.defaultProps = {
    position: [5, 10],
};
