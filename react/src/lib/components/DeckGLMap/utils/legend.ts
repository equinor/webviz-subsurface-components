import * as d3 from "d3";
export default function colorLegend(itemColor: any) {
    let legendValues= [{color: "black", stop: [0,1]},{color: "black", stop: [1,2]},
    {color: "black", stop: [2,3]},{color: "black", stop: [3,4]},{color: "black", stop: [4,5]}];
    let cellWidth: number = 30;
    let cellHeight = 20;
    let labelFormat: any = d3.format(".01f");
    let labelUnits = "units";
    let changeValue = 1;
    let orientation = "horizontal";
    let cellPadding: number = 0;

    function legend(g: any) {
        function redraw() {
            if (itemColor) {
                itemColor.forEach((item: any, index: number) => {
                    legendValues[index].color = item.color;
                })
            }
            g.selectAll("g.legendCells").data(legendValues).exit().remove();
            g.selectAll("g.legendCells").select("rect").style("fill", function(d: any) {
                return d.color;
            });
            if (orientation == "vertical") {
                g.selectAll("g.legendCells").select("text.breakLabels").style("display", "block").style("text-anchor", "start").attr("x", cellWidth + cellPadding).attr("y", 5 + (cellHeight / 2)).text(function(d: any) {
                    return labelFormat(d.stop[0]) + (d.stop[1].length > 0 ? " - " + labelFormat(d.stop[1]) : "");
                })
                g.selectAll("g.legendCells").attr("transform", function(_d: any,i:any) {
                    return "translate(0," + (i * (cellHeight + cellPadding)) + ")" });
                } else {
                g.selectAll("g.legendCells").attr("transform", function(_d: any,i:any) {
                    return "translate(" + (i * cellWidth) + ",0)" });
                g.selectAll("text.breakLabels").style("text-anchor", "middle").attr("x", 0).attr("y", -7).style("display", function(_d: any,i: any) {
                    return i == 0 ? "none" : "block"}).text(function(d: any) {
                        return labelFormat(d.stop[0])
                    });
                }
            }
            g.selectAll("g.legendCells").data(legendValues).enter().append("g").attr("class", "legendCells")
            .attr("transform", function(_d: any,i:any) {return "translate(" + (i * (cellWidth + cellPadding)) + ",0)" })
            g.selectAll("g.legendCells").append("rect").attr("height", cellHeight).attr("width", cellWidth)
            .style("fill", function(d: any) {return d.color}).style("stroke", "black").style("stroke-width", "1px");
            g.selectAll("g.legendCells").append("text").attr("class", "breakLabels").style("pointer-events", "none");
            g.append("text").text(labelUnits).attr("y", -7);
            redraw();
    }
        // code is needed
    legend.inputScale = function(newScale: any) {
        let scale:any = {};
        if (!arguments.length) return scale;
            scale = newScale;
            legendValues = [];
            // continous scale
            if (scale.invertExtent) {
                //Is a quantile scale
                scale.range().forEach(function(el: any) {
                    const cellObject = { color: el, stop: scale.invertExtent(el) }
                    legendValues.push(cellObject);
                })
            }
            // discrete scale
            else {
                scale.domain().forEach(function (el: any) {
                    const cellObject = {color: scale(el), stop: [el,""]};
                    legendValues.push(cellObject);
                })
        }
        return this;
    };
    legend.scale = function(testValue: any) {
        let foundColor = legendValues[legendValues.length - 1].color;
        for (let el in legendValues) {
            if(testValue < legendValues[el].stop[1]) {
                foundColor = legendValues[el].color;
                break;
            }
        }
        return foundColor;
    };
    legend.cellWidth = function(newCellSize: number) {
        if (!arguments.length) return cellWidth;
        cellWidth = newCellSize;
        return this;
    };
    legend.cellHeight = function(newCellSize: number) {
        if (!arguments.length) return cellHeight;
        cellHeight = newCellSize;
        return this;
    };
    legend.cellPadding = function(newCellPadding: number) {
        if (!arguments.length) return cellPadding;
        cellPadding = newCellPadding;
        return this;
    };
    legend.cellExtent = function(incColor: any,newExtent: any) {
        const selectedStop = legendValues.filter(function(el) { return el.color == incColor })[0].stop;
        if (arguments.length == 1) return selectedStop;
        legendValues.filter(function(el) { return el.color == incColor })[0].stop = newExtent;
        return this;
    };
    legend.cellStepping = function(incStep: any) {
        if (!arguments.length) return changeValue;
        changeValue = incStep;
        return this;
    };
    legend.units = function(incUnits: string) {
        if (!arguments.length) return labelUnits;
        labelUnits = incUnits;
        return this;
    };
    legend.orientation = function(incOrient: any) {
        if (!arguments.length) return orientation;
        orientation = incOrient;
        return this;
    };
    legend.labelFormat = function(incFormat: any) {
        if (!arguments.length) return labelFormat;
            labelFormat = incFormat;
        if (incFormat == "none") { labelFormat = function(inc: any) { return inc }; };
        return this;
    };
    return legend;
}