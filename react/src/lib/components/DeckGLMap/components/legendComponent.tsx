import * as React from "react";
import { useRef } from "react";
import { RGBToHex } from "../utils/continousLegend";
import {d3ColorScales} from "./d3ColorScale"
import * as d3 from "d3";
import { scaleOrdinal, select } from "d3";
import { colorTablesArray, colorTablesObj } from "../ColorTableTypes";
import discreteLegendUtil from "../utils/discreteLegend";

interface legendProps {
    position: number[];
    colorsObject?: any;
    legendColor?: any;
    legendColorName: string;
    useContColorTable?: boolean;
    useDiscColorTable?: boolean;
    valueIndex?: any;
    parentFunc: any;
}

interface ItemColor {
    color: string;
    offset?: number;
}

export const LegendComponent: React.FC<legendProps> = ({
    position,
    colorsObject,
    legendColor,
    legendColorName,
    useContColorTable,
    useDiscColorTable,
    valueIndex,
    parentFunc,
}: legendProps) => {

    const divRef = useRef<HTMLDivElement>(null);

    // create an array of steps based on the color scale
    // returns an array of evenly-spaced numbers. Returns the integers from zero to the specified end minus one.
    // d3.range(start, stop, step)
    if (legendColor)
    var data = d3.range(10).map(d=> ({color:legendColor(d/10), value:d}))

    const handleChange = React.useCallback((data) => {
        if (Object.keys(colorsObject).length > 0) {
            parentFunc(colorsObject);
        } else {
            parentFunc(data);
        }
    }, []);

    React.useEffect(() => {
        // continuous legend using color table colors
        if (useContColorTable == true && divRef.current) {
            contColortableLegend();
            return function cleanup() {
                d3.select(divRef.current).select("svg").remove();
            };
        }
        // discrete legend using color table colors
        if (useDiscColorTable == true && divRef.current) {
            discColorTableLegend();
            return function cleanup() {
                select(divRef.current).select("div").remove();
                select(divRef.current).select("svg").remove();
            };
        }
        // discrete legend using d3 colors
        if (useDiscColorTable == false && divRef.current) {
            discD3legend();
            return function cleanup() {
                select(divRef.current).select("div").remove();
                select(divRef.current).select("svg").remove();
            }
        } 
        // continuous legend using d3 colors
        else if (useContColorTable == false && divRef.current) {
            contD3Legend();
            return function cleanup() {
                d3.select(divRef.current).select("svg").remove();
            };
        }
    }, [useContColorTable]); 

    // continuous legend using color table colors (linear gradiend code)
    function contColortableLegend() {
        const itemColor: ItemColor[] = [];

        colorsObject.color.forEach((value: [number, number, number, number]) => {
                // return the color and offset needed to draw the legend
                itemColor.push({
                    offset: RGBToHex(value).offset,
                    color: RGBToHex(value).color,
                });
            });

        // append a defs (for definition) element to your SVG
        const svgLegend = d3.select(divRef.current)
            .append("svg")
            .style("height", "50px")
            .style("display", "flex")

        const defs = svgLegend.append("defs");
        let currentIndex = "linear-gradient-" + valueIndex;
        // append a linearGradient element to the defs and give it a unique id
        const linearGradient = defs
            .append("linearGradient")
            .attr("id", currentIndex)
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
            .attr("x", 0)
            .attr("y", 43)
            .style("text-anchor", "left")
            .text(colorsObject.name);

        // draw the rectangle and fill with gradient
        svgLegend
            .append("rect")
            .attr("x", 180)
            .attr("y", 30)
            .attr("width", 150)
            .attr("height", 25)
            .style("fill", "url(#"+currentIndex+")");
    }

    // continuous legend using d3 colors (linear gradiend code)
    function contD3Legend() {
        const itemColor: any = [];

        d3ColorScales.forEach((value: any) => {
            // return the color and offset needed to draw the legend
            itemColor.push(value.colors);
        });

        // get the array's min and max value
        var extent: any = d3.extent(data, d => d.value); 

        // append a defs (for definition) element to your SVG
        const svgLegend = d3.select(divRef.current)
            .append("svg")
            .style("height", "50px")
            .style("display", "flex")

        const defs = svgLegend.append("defs");
        let currentIndex = "linear-gradient-" + valueIndex;
        // append a linearGradient element to the defs and give it a unique id
        const linearGradient = defs
            .append("linearGradient")
            .attr("id", currentIndex)
            .attr("x1", "0%")
            .attr("x2", "100%") //since it's a horizontal linear gradient
            .attr("y1", "0%")
            .attr("y2", "0%");

        // append multiple color stops by using D3's data/enter step
        linearGradient.selectAll("stop")
            .data(data)
            .enter().append("stop")
            .attr("offset", d => ((d.value - extent[0]) / (extent[1] - extent[0]) * 100) + "%")
            .attr("stop-color", d => d.color);

        // append title
        svgLegend
            .append("text")
            .attr("class", "legendTitle")
            .attr("x", 0)
            .attr("y", 43)
            .style("text-anchor", "left")
            .text(legendColorName);


        // draw the rectangle and fill with gradient
        svgLegend
            .append("rect")
            .attr("x", 180)
            .attr("y", 30)
            .attr("width", 150)
            .attr("height", 25)
            .style("fill", "url(#"+currentIndex+")");
    }

    // discrete legend using color table colors
    function discColorTableLegend() {
        const itemColor: ItemColor[] = [];
        const itemName: any = [];

        colorsObject.color.forEach((element: any, key: any) => {
                itemColor.push({color: RGBToHex(element)});
                itemName.push(key);
            })

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
        const colorLegend = discreteLegendUtil(itemColor, "ColorSelector").inputScale(ordinalValues);
        select("svg").append("g").attr("transform", "translate(50,70)").attr("class", "legend").call(colorLegend);
        //const calcLegendHeight = 22 * itemColor.length + 4 * itemColor.length;
        const selectedLegend = select(divRef.current);
        selectedLegend
            .append("text")
            .text(legendColorName)
            .attr("y", 7)
            .style("float", "left")
            .style("width", "30%")
            .style("margin", "10px 0px");
        selectedLegend
            .append("svg")
            .style("margin-top", "13px")
            .style("margin-right", "103px")
            .style("float", "right")
            // .style("width", "60%")
            .style("height", "25px")
            .call(colorLegend);
    }

    // discrete legend using d3 colors
    function discD3legend() {
        const itemName: any = [];
        const itemColor: any = [];

        colorsObject.forEach((element: any, key: any) => {
            itemColor.push({color: element});
            itemName.push(key);
        });

        const ordinalValues = scaleOrdinal(colorsObject).domain(itemName);
        const discreteLegend = discreteLegendUtil(itemColor, "ColorSelector").inputScale(ordinalValues);
        select("svg").append("g").attr("transform", "translate(50,70)").attr("class", "legend").call(discreteLegend);
        const selectedLegend = select(divRef.current);
        selectedLegend
            .append("text")
            .text(legendColorName)
            .attr("y", 7)
            .style("float", "left")
            .style("width", "30%")
            .style("margin", "10px 0px");
        selectedLegend
            .append("svg")
            .style("margin-top", "13px")
            .style("margin-right", "103px")
            .style("float", "right")
            // .style("width", "60%")
            .style("height", "25px")
            .call(discreteLegend);
    }

    return (
        <div
            style={{
                right: position[0],
                top: position[1],
                borderRadius: "5px",
                height: "35px",
                marginTop: "15px"
            }}
        >
            <div id="legend" ref={divRef} onClick={handleChange}></div>
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