import * as React from "react";
import { useRef } from "react";
import { RGBToHex } from "@emerson-eps/color-tables/";
import { d3ColorScales } from "@emerson-eps/color-tables/src/component/Utils/d3ColorScale";
import { select, range } from "d3";
import * as d3 from "d3";
import { colorTablesArray, colorTablesObj } from "@emerson-eps/color-tables/";
import discreteLegendUtil from "./discreteeLegend";
import { color } from "d3-color";

interface legendProps {
    position: number[];
    colorsObject?: any;
    legendColor?: any;
    legendColorName?: string | undefined;
    useContColorTable?: boolean;
    useDiscColorTable?: boolean;
    valueIndex?: any;
    colorScaleData: any;
    getColorMapname?: any | null;
}

interface ItemColor {
    color: string;
    offset?: number;
}

export const ColorSelectorComponent: React.FC<legendProps> = ({
    // position,
    colorsObject,
    legendColor,
    legendColorName,
    useContColorTable,
    useDiscColorTable,
    valueIndex,
    colorScaleData,
}: // getColorMapname,
legendProps) => {
    const divRef = useRef<HTMLDivElement>(null);

    // create an array of steps based on the color scale
    // returns an array of evenly-spaced numbers. Returns the integers from zero to the specified end minus one.
    // d3.range(start, stop, step)
    let rangeData: any;
    var extent: any
    if (legendColor) {
        rangeData = range(10).map((d) => ({
            color: legendColor(d / 10),
            value: d,
        }));
        // get the array's min and max value
        extent = d3.extent(rangeData, (d: any) => d?.value);
    }


    const handleChange = React.useCallback(() => {
        // const colorMapping = function colorMapping(t:number) {
        //     return d3.interpolateSpectral(t)
        // }

        

       // console.log('colorMapping', colorMapping)


        // continous legend with colortable colors
        if (
            colorsObject &&
            Object.keys(colorsObject).length > 0 &&
            useContColorTable
        ) {
            //console.log('colorsObject', colorsObject)
            colorScaleData(colorsObject, true);
        }
        // continous legend with d3 colors
        else if (rangeData && !useContColorTable) {
            const arrayData: any = [];
            rangeData.forEach((colorsObject: any) => {
                arrayData.push([
                    0 + "." + colorsObject.value,
                    color(colorsObject.color)?.rgb().r,
                    color(colorsObject.color)?.rgb().g,
                    color(colorsObject.color)?.rgb().b,
                ]);
            });
            colorScaleData({ arrayData, legendColorName }, true);
        }
        // discrete legend with colortable colors
        else if (
            colorsObject &&
            Object.keys(colorsObject).length > 0 &&
            useDiscColorTable
        ) {
            colorScaleData(colorsObject, false);
        }
        // discrete legend with d3 colors
        else {
            colorScaleData({ colorsObject, legendColorName }, false);
        }
    }, []);

    React.useEffect(() => {
        // continuous legend using color table colors
        if (useContColorTable == true && divRef.current) {
            contColortableLegend();
            return function cleanup() {
                select(divRef.current).select("svg").remove();
                select(divRef.current).select("div").remove();
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
            };
        }
        // continuous legend using d3 colors
        else if (useContColorTable == false && divRef.current) {
            contD3Legend();
            return function cleanup() {
                select(divRef.current).select("svg").remove();
                select(divRef.current).select("div").remove();
            };
        }
    }, [useContColorTable]);

    // continuous legend using color table colors (using linear gradiend)
    function contColortableLegend() {
        const itemColor: ItemColor[] = [];

        colorsObject.color.forEach(
            (value: [number, number, number, number]) => {
                // return the color and offset needed to draw the legend
                itemColor.push({
                    offset: RGBToHex(value).offset,
                    color: RGBToHex(value).color,
                });
            }
        );

        // append a defs (for definition) element to your SVG
        const svgLegend = select(divRef.current)
            .append("svg")
            .style("height", "30px");

        const defs = svgLegend.append("defs");
        const currentIndex = "linear-gradient-" + valueIndex;
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
            .attr("id", "legendTitle")
            .attr("x", 0)
            .attr("y", 15)
            .style("font-size", "smaller")
            .style("font-weight", "900")
            // .attr("textLength","5em")
            .text(colorsObject.name);

        // draw the rectangle and fill with gradient
        svgLegend
            .append("rect")
            .attr("x", 85)
            .attr("y", 5)
            .attr("width", "110")
            .attr("height", 20)
            .style("fill", "url(#" + currentIndex + ")");
    }

    // continuous legend using d3 colors (using linear gradiend)
    function contD3Legend() {
        const itemColor: any = [];

        d3ColorScales.forEach((value: any) => {
            // return the color and offset needed to draw the legend
            itemColor.push(value.colors);
        });

        // append a defs (for definition) element to your SVG
        const svgLegend = select(divRef.current)
            .append("svg")
            .style("height", "50px");

        const defs = svgLegend.append("defs");
        const currentIndex = "linear-gradient-" + valueIndex;
        // append a linearGradient element to the defs and give it a unique id
        const linearGradient = defs
            .append("linearGradient")
            .attr("id", currentIndex)
            .attr("x1", "0%")
            .attr("x2", "100%") //since it's a horizontal linear gradient
            .attr("y1", "0%")
            .attr("y2", "0%");

        // console.log('rangeData', rangeData)
        // console.log('extent', extent)

        // append multiple color stops by using D3's data/enter step
        linearGradient
            .selectAll("stop")
            .data(rangeData)
            .enter()
            .append("stop")
            .attr(
                "offset",
                (d: any) =>
                    ((d.value - extent[0]) / (extent[1] - extent[0])) * 100 +
                    "%"
            )
            .attr("stop-color", (d: any) => d.color);

        // append title
        svgLegend
            .append("text")
            .attr("id", "legendTitle")
            .attr("x", 0)
            .attr("y", 15)
            .style("font-size", "smaller")
            .style("font-weight", "900")
            .text(legendColorName ? legendColorName : "");

        // draw the rectangle and fill with gradient
        svgLegend
            .append("rect")
            .attr("x", 85)
            .attr("y", 5)
            .attr("width", "110")
            .attr("height", 20)
            .style("fill", "url(#" + currentIndex + ")");
    }

    // discrete legend using color table colors
    function discColorTableLegend() {
        const itemColor: ItemColor[] = [];
        const itemName: any = [];

        colorsObject.color.forEach((element: any, key: any) => {
            itemColor.push({ color: RGBToHex(element) });
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

        //const ordinalValues = scaleOrdinal().domain(itemName);
        const count = itemName.length;
        const colorLegend = discreteLegendUtil(itemColor, true);
        //const calcLegendHeight = 22 * itemColor.length + 4 * itemColor.length;
        const selectedLegend = select(divRef.current);
        // colorname as label for the legend (ex: facies)
        selectedLegend
            .append("label")
            .text(legendColorName ? legendColorName : "")
            .attr("y", 7)
            .style("float", "left")
            .style("width", "15px")
            .style("margin", "10px 0px")
            .style("white-space", "nowrap")
            .style("font-size", "smaller")
            .style("font-weight", "900");

        selectedLegend
            .append("svg")
            .style("margin-top", "13px")
            .style("margin-left", "70px")
            .attr("viewBox", `0 0 ${count} 1`)
            .attr("preserveAspectRatio", "none")

            .style("width", "109px")
            .style("height", "20px")
            .call(colorLegend);
    }

    // discrete legend using d3 colors
    function discD3legend() {
        const itemName: any = [];
        const itemColor: any = [];
        colorsObject.forEach((element: any, key: any) => {
            itemColor.push({ color: element });
            itemName.push(key);
        });
        //const ordinalValues = scaleOrdinal(colorsObject).domain(itemName);
        const count = itemName.length;
        const discreteLegend = discreteLegendUtil(itemColor, true);
        select("svg")
            .append("g")
            .attr("transform", "translate(50,70)")
            .attr("class", "legend")
            .call(discreteLegend);
        const selectedLegend = select(divRef.current);
        selectedLegend
            .append("text")
            .text(legendColorName ? legendColorName : "")
            .attr("y", 7)
            .style("float", "left")
            .style("width", "15px")
            .style("margin", "10px 0px")
            .style("font-size", "smaller")
            .style("font-weight", "900");
        selectedLegend
            .append("svg")
            .style("margin-top", "13px")
            .style("margin-left", "70px")
            .style("background", "grey")
            .attr("viewBox", `0 0 ${count} 1`)
            .attr("preserveAspectRatio", "none")

            .style("width", "109px")
            .style("height", "20px")
            .call(discreteLegend);
    }

    return (
        <div>
            <div
                id="legend"
                style={{ height: 30 }}
                ref={divRef}
                onClick={handleChange}
            ></div>
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
