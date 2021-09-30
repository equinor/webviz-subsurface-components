import * as d3 from "d3";

export default function legendUtil(itemColor?: any) {
    let legendValues = [{ color: "black" }];
    const cellWidth = 30;
    const cellHeight = 25;
    let labelFormat: any = d3.format(".01f");
    //let labelFormat: (n: number | { valueOf(): number; }) => string  = d3.format(".01f");
    const cellPadding = 4;

    function legend(g: any) {
        function redraw() {
            itemColor.forEach((item: any, index: number) => {
                legendValues[index].color = item.color;
            });
            g.selectAll("g.legendCells")
                .select("rect")
                .style("fill", function (d: Record<string, unknown>) {
                    return d["color"];
                });
            g.selectAll("g.legendCells")
                .select("text.breakLabels")
                .style("display", "block")
                .attr("x", cellWidth + cellPadding)
                .attr("y", 5 + cellHeight / 2)
                .text(function (d: Record<string, unknown>) {
                    return labelFormat(d["label"]);
                });
            // alighment of cell in straight line
            g.selectAll("g.legendCells").attr(
                "transform",
                function (_d: Record<string, unknown>, i: number) {
                    return (
                        "translate(0," + i * (cellHeight + cellPadding) + ")"
                    );
                }
            );
        }
        // display the discrete legend
        g.selectAll("g.legendCells")
            .data(legendValues)
            .enter()
            .append("g")
            .attr("class", "legendCells")
            .attr(
                "transform",
                function (_d: Record<string, unknown>, i: number) {
                    return "translate(" + i * (cellWidth + cellPadding) + ",0)";
                }
            );
        // fill the color
        g.selectAll("g.legendCells")
            .append("rect")
            .attr("height", cellHeight)
            .attr("width", cellWidth)
            .style("fill", function (d: Record<string, unknown>) {
                return d["color"];
            });
        // shows the label
        g.selectAll("g.legendCells")
            .append("text")
            .attr("class", "breakLabels");
        redraw();
    }
    legend.inputScale = function (newScale: string[]) {
        let scale: any = {};
        if (!arguments.length) return scale;
        scale = newScale;
        legendValues = [];
        scale.domain().forEach(function (el: string) {
            const cellObject = { color: scale(el), label: el };
            legendValues.push(cellObject);
        });
        return this;
    };
    legend.labelFormat = function (incFormat: string) {
        if (!arguments.length) return labelFormat;
        labelFormat = incFormat;
        if (incFormat == "none") {
            labelFormat = function (inc: string) {
                return inc;
            };
        }
        return this;
    };
    return legend;
}
