interface ItemColor {
    color: string;
}

// eslint-disable-next-line
export default function legendUtil(itemColor: ItemColor[]): any {
    let legendValues: ItemColor[] = [];
    const cellWidth = 22;
    const cellHeight = 22;
    const cellPadding = 4;

    // eslint-disable-next-line
    function legend(g: any) {
        function drawLegend() {
            itemColor.forEach((item, index) => {
                legendValues[index].color = item.color;
            });
            // Code to fill the color
            g.selectAll("g.legendCells")
                .append("rect")
                .attr("height", cellHeight)
                .attr("width", cellWidth)
                .style("stroke", "black")
                .style("stroke-width", "1px")
                .style("fill", function (d: Record<string, unknown>) {
                    return d["color"];
                });
            // Display the label
            g.selectAll("g.legendCells")
                .append("text")
                .attr("class", "breakLabels")
                .style("fill", "#6F6F6F")
                .attr("x", cellWidth + cellPadding)
                .attr("y", 5 + cellHeight / 2)
                .text(function (d: Record<string, unknown>) {
                    return d["label"];
                });
            // Alighment of cell in straight line
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
            .attr("class", "legendCells");
        drawLegend();
    }
    // eslint-disable-next-line
    legend.inputScale = function (newScale: any) {
        // eslint-disable-next-line
        let scale: any = {};
        scale = newScale;
        legendValues = [];
        scale.domain().forEach(function (el: string) {
            const cellObject = { color: scale(el), label: el };
            legendValues.push(cellObject);
        });
        return this;
    };
    return legend;
}
