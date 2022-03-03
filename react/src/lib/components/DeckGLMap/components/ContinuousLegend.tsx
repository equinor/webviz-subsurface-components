import * as React from "react";
import { useCallback } from "react";
import { useRef } from "react";
import { RGBToHex, colorsArray } from "../utils/continousLegend";
import { select, scaleLinear, scaleSequential, axisBottom } from "d3";
import { colorTablesArray } from "../ColorTableTypes";
//import {ColorSelectorWrapper} from "@emerson-eps/color-tables/src/component/ColorSelector/ColorTableSelectorWrapper"
import {ColorSelectorWrapper} from "./ColorTableSelectorWrapper"

declare type legendProps = {
    min: number;
    max: number;
    dataObjectName: string;
    position?: number[] | null;
    colorName: string;
    colorTables: colorTablesArray;
    horizontal?: boolean | null;
    //parentdata: any
}

declare type ItemColor = {
    color: string;
    offset: number;
}

export const ContinuousLegend: React.FC<legendProps> = ({
    min,
    max,
    dataObjectName,
    position,
    colorName,
    colorTables,
    horizontal,
    //parentdata
}: legendProps) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [parent, setIsParent] = React.useState([] as any);

    const parent_data = React.useCallback((parent_data: any) => {
        console.log('parent_data', parent_data)
        setIsParent(parent_data);
    }, []);

    React.useEffect(() => {
        if (divRef.current) {
            continuousLegend();
        };
        return function cleanup() {
            select(divRef.current).select("svg").remove();
        };
    }, [min, max, colorName, colorTables, horizontal, parent]);

    const [isToggled, setIsToggled] = React.useState(false);

    const handleClick = useCallback(() => {
        setIsToggled(true);
    }, []);


    function continuousLegend() {
        const itemColor: ItemColor[] = [];
        // Return the matched colors array from color.tables.json file
        let colorTableColors = colorsArray(colorName, colorTables);
        //let colorTableColors; 

        // if (colorTables[0].name) {
        //     colorTableColors = colorsArray(colorName, colorTables);
        // } else {
        //     colorTableColors = colorTables;
        // } 

        console.log('parent', parent)
        
        if (parent.color) {
            colorTableColors = parent.color;
        } else {
            colorTableColors;
        }

        colorTableColors.forEach((value: [number, number, number, number]) => {
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
            .style("background-color", "none")
            .style("border-radius", "5px");
        if (!horizontal) {
            svgLegend
                .style("transform", "rotate(270deg)")
                .style("margin-top", "80px");
        }
        const defs = svgLegend.append("defs");
        // append a linearGradient element to the defs and give it a unique id
        const linearGradient = defs
            .append("linearGradient")
            .attr("id", "linear-gradient")
            .attr("x1", "0%")
            .attr("x2", "100%") //since it's a horizontal linear gradient
            .attr("y1", "0%")
            .attr("y2", "0%");
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

        // draw the rectangle and fill with gradient
        svgLegend
            .append("rect")
            .attr("x", 25)
            .attr("y", 30)
            .attr("width", 250)
            .attr("height", 25)
            .style("fill", "url(#linear-gradient)");

        //create tick marks
        const xLeg = scaleLinear().domain([min, max]).range([10, 258]);

        const axisLeg = axisBottom(xLeg).tickValues(colorScale.domain());

        svgLegend
            .attr("class", "axis")
            .append("g")
            .attr("transform", "translate(15, 55)")
            .style("font-size", "10px")
            .style("font-weight", "700")
            .call(axisLeg);
    }

    return (
        <div
            style={{
                position: "absolute",
                right: position ? position[0] : ' ',
                top: position ? position[1] : ' ',
            }}
        >
            <div id="legend" ref={divRef} onClick={handleClick}></div>
            {isToggled && (
                <ColorSelectorWrapper parentdata={parent_data} />
            )}
        </div>
    );
};

ContinuousLegend.defaultProps = {
    position: [5, 10],
};