import * as d3 from "d3";
import { Zone } from "../../redux/types";
import { PlotData, WellPlotData } from "./dataUtil";
import { getLayout, getSvg, Padding, PlotLayout } from "./plotUtil";

export class D3WellCompletions {
    // layout
    private padding: Padding = { left: 50, right: 50, top: 50, bottom: 50 };
    private layout: PlotLayout;
    // svg
    private svg: d3.Selection<d3.BaseType, any, any, any>;
    private stratigraphyG: d3.Selection<SVGGElement, any, any, any>;
    private wellsG: d3.Selection<SVGGElement, any, any, any>;
    private completionsG: d3.Selection<SVGGElement, any, any, any>;

    //data
    private stratigraphy: Zone[] = [];
    private wells: WellPlotData[] = [];

    constructor(div: HTMLDivElement) {
        // layout
        this.layout = getLayout(
            div.getBoundingClientRect().width,
            div.getBoundingClientRect().height,
            this.padding
        );

        // svg
        this.svg = getSvg(div);

        this.stratigraphyG = this.svg.append("g");
        this.wellsG = this.svg.append("g");
        this.completionsG = this.svg.append("g");
    }

    setPlotData = (plotData: PlotData): void => {
        this.stratigraphy = plotData.stratigraphy;
        this.wells = plotData.wells;
        this.renderStratigraphy();
        this.renderWells();
        this.renderCompletions();
    };

    resize = (width, height): void => {
        // update layout
        this.layout = getLayout(width, height, this.padding);

        // update svg attributes
        this.svg
            .attr("width", this.layout.width)
            .attr("height", this.layout.height);
        this.renderStratigraphy();
        this.renderWells();
        this.renderCompletions();
    };

    clear = () => {
        //Do nothing
    };

    private renderStratigraphy(): void {
        //Clear existing
        this.stratigraphyG.selectAll("*").remove();

        const w = this.layout.xExtent;
        const h = this.layout.yExtent;
        const barHeight = h / Math.max(this.stratigraphy.length, 1);

        const bar = this.stratigraphyG
            .selectAll("g")
            .data(this.stratigraphy)
            .enter()
            .append("g")
            .attr(
                "transform",
                (_, i) =>
                    "translate(0," + (this.padding.top + i * barHeight) + ")"
            );

        const b = bar
            .append("g")
            .attr("transform", "translate(" + this.padding.left + ", 0)");
        b.append("rect")
            .attr("width", w)
            .attr("height", barHeight + 1)
            .attr("fill", function(d) {
                return d.color;
            });

        bar.append("text")
            .style("font-size", "11px")
            .attr("text-anchor", "end")
            .attr("x", this.padding.left - 4)
            .attr("y", barHeight / 2)
            .attr("dy", ".35em")
            .attr("font-family", "sans-serif")
            .text(function(d) {
                return d.name;
            });
    }

    private renderWells(): void {
        //Clear existing
        this.wellsG.selectAll("*").remove();

        const wellWidth = this.layout.xExtent / Math.max(this.wells.length, 1);
        const wellHeight = this.layout.yExtent;
        const well = this.wellsG
            .selectAll("g")
            .data(this.wells)
            .enter()
            .append("g")
            .attr(
                "transform",
                (_, i) =>
                    "translate(" +
                    (this.padding.left + (i + 0.5) * wellWidth) +
                    ",0)"
            );

        well.append("text")
            .style("font-size", "9px")
            .attr("text-anchor", "start")
            .attr(
                "transform",
                "translate(0," + (this.padding.top - 10) + ") rotate(-60)"
            )
            .attr("x", 0)
            .attr("y", 0)
            .attr("dy", ".35em")
            .attr("font-family", "sans-serif")
            .text(d => d.name);
        const traj = well
            .append("g")
            .attr("transform", "translate(0," + (this.padding.top - 4) + ")");
        traj.append("rect")
            .attr("width", 0.5)
            .attr("height", wellHeight + 4)
            .attr("fill", "#111");
    }

    private renderCompletions(): void {
        //Clear existing
        this.completionsG.selectAll("*").remove();

        const w = this.layout.xExtent;
        const h = this.layout.yExtent;
        const wellWidth = w / Math.max(this.wells.length, 1);
        const barHeight = h / Math.max(this.stratigraphy.length, 1);
        const barWidth = w / 50;
        this.completionsG
            .selectAll("g")
            .data(this.wells)
            .enter()
            .append("g")
            .attr(
                "transform",
                (_, i) =>
                    `translate(${this.padding.left +
                        (i + 0.5) * wellWidth}, ${0})`
            )
            .selectAll("g")
            .data(d => d.completions)
            .enter()
            .append("g")
            .attr(
                "transform",
                (d, i) =>
                    `translate(${-d * barWidth * 0.5}, ${i * barHeight +
                        this.padding.top})`
            )
            .append("rect")
            .attr("width", d => d * barWidth)
            .attr("height", barHeight)
            .attr("fill", "#111");
    }
}
