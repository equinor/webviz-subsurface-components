declare type ItemColor = {
    color: any;
};

// eslint-disable-next-line
export default function discreteLegendUtil(itemColor: ItemColor[], isSelectorLegend?: boolean, horizontal?: any): any {
    // var cellWidth = 22;
    // var cellHeight = 22;

    // if (isSelectorLegend) {
    //     cellWidth = 25;
    //     cellHeight = 22;
    // }

    const legendValues: ItemColor[] = [];

    // eslint-disable-next-line
    function legend(g: any) { 
        function drawLegend() {
            // Code to fill the color
            // Styling for color selector legend
            //if (isSelectorLegend) {
            g.selectAll("g.legendCells")
                .data(itemColor)
                .enter()
                .append("g")
                .append("rect")
                .attr("class", "rectLabel")
                .style("cursor", "pointer")
                .style("pointer-events", "all");
            g.selectAll("rect")
                .attr("height", 1)
                .attr("width", 1)
                .style("fill", function (d: Record<string, unknown>) {
                    return d["color"];
                });
            if (horizontal && !isSelectorLegend) {
                g.selectAll("rect")
                    .attr("x", function (d: number, i: number) {
                        return i;
                    })
                    .attr("y", 0);
            } else if (!horizontal && !isSelectorLegend) {
                g.selectAll("rect")
                    .attr("y", function (d: number, i: number) {
                        return i;
                    })
                    .attr("x", 0);
            } else if (horizontal == true && isSelectorLegend) {
                g.selectAll("rect")
                    .attr("x", function (d: number, i: number) {
                        return i;
                    })
                    .attr("y", 0);
            } else if (horizontal == false && isSelectorLegend) {
                g.selectAll("rect")
                    .attr("y", function (d: number, i: number) {
                        return i;
                    })
                    .attr("x", 0);
            } else {
                g.selectAll("rect")
                    .attr("x", function (d: number, i: number) {
                        return i;
                    })
                    .attr("y", 0);
            }

            // Display the labels for legend
            // g.selectAll("g")
            //     .style("background", "grey")
            //     .append("text")
            //     .attr("class", "breakLabels")
            //     .style("font-size", "0.4")
            //     //.attr("x", cellWidth + cellPadding)
            //     //.attr("y", 5 + cellHeight / 2)
            //     .attr("x", function (d: any, i: any) {
            //         //console.log(d)
            //         return i + "." + 25
            //     })
            //     .attr("y", 1.5)
            //     .text(function (d: any, i: any) {
            //         //console.log(d)
            //         return i;
            //     })
            //}
            // styling for main legend
            // else {
            //     itemColor.forEach((item, index) => {
            //         legendValues[index].color = item.color;
            //     });
            //     g.selectAll("g.legendCells")
            //         .append("text")
            //         .attr("class", "breakLabels")
            //         .style("fill", "#6F6F6F")
            //         .attr("x", cellWidth + cellPadding)
            //         .attr("y", 5 + cellHeight / 2)
            //         .text(function (d: Record<string, unknown>, i:any) {
            //             return d['label'];
            //         });
            //     g.selectAll("g.legendCells")
            //     .style("cursor", "pointer")
            //         .append("rect")
            //         .attr("height", cellHeight)
            //         .attr("width", cellWidth)
            //         .style("fill", function (d: Record<string, unknown>) {
            //             //console.log('d', d)
            //             return d["color"];
            //         })

            //     // Alighment of cell in straight line
            //     g.selectAll("g.legendCells").attr(
            //         "transform",
            //         function (_d: Record<string, unknown>, i: number) {
            //             return (
            //                "translate(0," + i * (cellHeight + cellPadding) + ")"
            //                //"translate(0," + i + ")"
            //             );
            //         }
            //     );
            // }
        }

        // display the discrete legend
        // if (!isSelectorLegend) {
        //    // console.log('itemcolor', itemColor)
        //     g.selectAll("g.legendCells")
        //     .data(legendValues)
        //     .enter()
        //     .append("g")
        //     .attr("class", "legendCells")
        // }

        drawLegend();
    }
    // eslint-disable-next-line
    legend.inputScale = function (newScale: any) {
        // eslint-disable-next-line
        let scale: any = {};
        scale = newScale;

        scale.domain().forEach(function (el: any) {
            const cellObject = { color: scale(el), label: el };
            legendValues.push(cellObject);
        });
        return this;
    };

    return legend;
}
