import * as React from "react";
import { useRef } from "react";
import { RGBToHex, colorsArray } from "@emerson-eps/color-tables/";
import {
    select,
    scaleLinear,
    scaleSequential,
    axisBottom,
    axisRight,
} from "d3";
import { colorTablesArray } from "@emerson-eps/color-tables/";

declare type legendProps = {
    min: number;
    max: number;
    dataObjectName: string;
    position?: number[] | null;
    colorName: string;
    colorTables: colorTablesArray | string;
    horizontal?: boolean | null;
    updateLegend?: any;
};

declare type ItemColor = {
    color: string;
    offset: number;
};

export const ContinuousLegend: React.FC<legendProps> = ({
    min,
    max,
    dataObjectName,
    position,
    colorName,
    colorTables,
    horizontal,
    updateLegend,
}: legendProps) => {
    const divRef = useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (divRef.current) {
            continuousLegend();
        }
        return function cleanup() {
            select(divRef.current).select("div").remove();
            select(divRef.current).select("svg").remove();
        };
    }, [min, max, colorName, colorTables, horizontal, updateLegend]);

    //console.log('colorTables', colorTables)

    async function continuousLegend() {
        const itemColor: ItemColor[] = [];
        let dataSet;

        try {
            // fix for dash wrapper
            if (typeof colorTables === "string") {
                const res = await fetch(colorTables);
                dataSet = await res.json();
            }
            //Return the matched colors array from color.tables.json file
            let legendColors =
                typeof colorTables === "string"
                    ? colorsArray(colorName, dataSet)
                    : colorsArray(colorName, colorTables);

            // Update color of legend based on color selector scales
            // data is passed on click upon color scales
            if (updateLegend) {
                // legend using color table data
                if (updateLegend.color) {
                    legendColors = updateLegend.color;
                }
                // legend using d3 data
                else if (updateLegend.arrayData) {
                    legendColors = updateLegend.arrayData;
                }
            }
            // main continuous legend
            else {
                legendColors;
            }

            legendColors.forEach((value: [number, number, number, number]) => {
                // return the color and offset needed to draw the legend
                itemColor.push({
                    offset: RGBToHex(value).offset,
                    color: RGBToHex(value).color,
                });
            });

            const colorScale = scaleSequential().domain([min, max]);
            // append a defs (for definition) element to your SVG
            const svgLegend = select(divRef.current)
                .append("svg")
                .style("background-color", "#ffffffcc")
                .style("border-radius", "5px");

            const defs = svgLegend.append("defs");
            let linearGradient;
            // vertical legend
            if (!horizontal) {
                svgLegend
                    // .style("transform", "rotate(270deg)")
                    // .style("margin-top", "80px");
                    .attr("width", "100")
                    .attr("height", "190");
                linearGradient = defs
                    .append("linearGradient")
                    .attr("id", "linear-gradient")
                    .attr("x1", "0%")
                    .attr("x2", "0%")
                    .attr("y1", "0%")
                    .attr("y2", "100%"); //since it's a vertical linear gradient
            }
            // horizontal legend
            else {
                svgLegend.attr("width", "200").attr("height", "90");

                // append a linearGradient element to the defs and give it a unique id
                linearGradient = defs
                    .append("linearGradient")
                    .attr("id", "linear-gradient")
                    .attr("x1", "0%")
                    .attr("x2", "100%") //since it's a horizontal linear gradient
                    .attr("y1", "0%")
                    .attr("y2", "0%");
            }

            // append multiple color stops by using D3's data/enter step
            linearGradient
                .selectAll("stop")
                .data(itemColor)
                .enter()
                .append("stop")
                .attr("offset", function (data) {
                    return data.offset + "%";
                })
                .attr("stop-color", function (data) {
                    return data.color;
                });

            // append title
            svgLegend
                .append("text")
                .attr("class", "legendTitle")
                .attr("x", 25)
                .attr("y", 20)
                .style("text-anchor", "left")
                .text(dataObjectName);

            // vertical legend
            if (!horizontal) {
                // draw the rectangle and fill with gradient
                svgLegend
                    .append("rect")
                    .attr("x", 25)
                    .attr("y", 30)
                    .attr("width", 25)
                    .attr("height", "150")
                    .style("fill", "url(#linear-gradient)");
            }
            // horizontal legend
            else {
                // draw the rectangle and fill with gradient
                svgLegend
                    .append("rect")
                    .attr("x", 25)
                    .attr("y", 30)
                    .attr("width", "150")
                    .attr("height", 25)
                    .style("fill", "url(#linear-gradient)");
            }

            // create tick marks
            // range varies the size of the axis
            const xLeg = scaleLinear().domain([min, max]).range([10, 158]);
            const yLeg = scaleLinear().domain([min, max]).range([10, 158]);

            const horizontalAxisLeg = axisBottom(xLeg).tickValues(
                colorScale.domain()
            );
            const VerticalAxisLeg = axisRight(yLeg)
                .tickSize(24)
                .tickValues(colorScale.domain());

            if (horizontal) {
                svgLegend
                    .attr("class", "axis")
                    .append("g")
                    .attr("transform", "translate(15, 55)")
                    .style("font-size", "10px")
                    .style("font-weight", "700")
                    .call(horizontalAxisLeg)
                    .style("height", 25);
            } else {
                svgLegend
                    .attr("class", "axis")
                    .append("g")
                    .attr("transform", "translate(25, 20)")
                    .style("font-size", "10px")
                    .style("font-weight", "700")
                    .call(VerticalAxisLeg);
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
                zIndex: 999,
            }}
        >
            <div id="legend" ref={divRef}></div>
        </div>
    );
};

ContinuousLegend.defaultProps = {
    position: [5, 10],
};
