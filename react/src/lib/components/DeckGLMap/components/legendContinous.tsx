import * as React from "react";
import { useRef } from "react";
import { RGBToHex } from "../utils/continousLegend";
//import {colorScalesCont} from "@emerson-eps/color-tables/src/component/Utils/d3ColorScale"
import * as d3 from "d3";

interface legendProps {
    position?: number[] | null;
    colorArray?: any;
    legendColor?: any;
    legendColorName: string;
    useContColorTable?: boolean;
    valueIndex?: any;
    parentFunc: any;
}

interface ItemColor {
    color: string;
    offset: number;
}

export const LegendContinous: React.FC<legendProps> = ({
    position,
    colorArray,
    legendColor,
    legendColorName,
    useContColorTable,
    valueIndex,
    parentFunc
}: legendProps) => {

    const handleChange = React.useCallback(() => {
        //console.log('colorArray--in', colorArray)
        parentFunc(colorArray);
        //setIsParent(childData);
    }, []);

    const divRef = useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        // colortable colors
        if (useContColorTable == true && divRef.current) {
            colortableLegend()
        } 
        // d3 colors
        // else if (useContColorTable == false && divRef.current) {
        //     d3colorLegend(colorScalesCont)
        // }
        return function cleanup() {
            d3.select(divRef.current).select("svg").remove();
        };
    }, [useContColorTable]); 

    function colortableLegend() {
        const itemColor: ItemColor[] = [];
        colorArray.color.forEach((value: [number, number, number, number]) => {
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
            .text(colorArray.name);

        // draw the rectangle and fill with gradient
        svgLegend
            .append("rect")
            .attr("x", 180)
            .attr("y", 30)
            .attr("width", 150)
            .attr("height", 25)
            .style("fill", "url(#"+currentIndex+")");
    }

    // continuous legend using d3 color scale (linear gradiend code)
    // function d3colorLegend(colorscale: any) {

    //     const itemColor: any = [];

    //     colorscale.forEach((value: any) => {
    //         // return the color and offset needed to draw the legend
    //         itemColor.push(value.colors);
    //     });

    //     // create an array of steps based on the color scale
    //     // returns an array of evenly-spaced numbers. Returns the integers from zero to the specified end minus one.
    //     // d3.range(start, stop, step)
    //     var data = d3.range(10).map(d=> ({color:legendColor(d/10), value:d}))
    //     // get the array's min and max value
    //     var extent: any = d3.extent(data, d => d.value); 

    //     // append a defs (for definition) element to your SVG
    //     const svgLegend = d3.select(divRef.current)
    //         .append("svg")
    //         .style("height", "50px")
    //         .style("display", "flex")

    //     const defs = svgLegend.append("defs");
    //     let currentIndex = "linear-gradient-" + valueIndex;
    //     // append a linearGradient element to the defs and give it a unique id
    //     const linearGradient = defs
    //         .append("linearGradient")
    //         .attr("id", currentIndex)
    //         .attr("x1", "0%")
    //         .attr("x2", "100%") //since it's a horizontal linear gradient
    //         .attr("y1", "0%")
    //         .attr("y2", "0%");

    //     // append multiple color stops by using D3's data/enter step
    //     linearGradient.selectAll("stop")
    //         .data(data)
    //         .enter().append("stop")
    //         .attr("offset", d => ((d.value - extent[0]) / (extent[1] - extent[0]) * 100) + "%")
    //         .attr("stop-color", d => d.color);

    //     // append title
    //     svgLegend
    //         .append("text")
    //         .attr("class", "legendTitle")
    //         .attr("x", 0)
    //         .attr("y", 43)
    //         .style("text-anchor", "left")
    //         .text(legendColorName);

    //     // draw the rectangle and fill with gradient
    //     svgLegend
    //         .append("rect")
    //         .attr("x", 180)
    //         .attr("y", 30)
    //         .attr("width", 150)
    //         .attr("height", 25)
    //         .style("fill", "url(#"+currentIndex+")");
    // }

    return (
        <div
            style={{
                right: position ? position[0] : ' ',
                top: position ? position[1] : ' ',
            }}
        >
            {useContColorTable ?
            <div className="colortableLegend" ref={divRef} onClick={handleChange}></div> 
            :
            <div className="d3colorLegend" ref={divRef} onClick={handleChange} ></div>
            }
        </div>
    );
};