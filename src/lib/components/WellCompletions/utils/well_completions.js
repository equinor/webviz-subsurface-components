import * as d3 from "d3";
import Slider from "../../../shared/slider";

export default class D3WellCompletions {
    constructor(container_id, data) {
        this.container_id = container_id
        this.data = data
    }

    renderPlot() {

        /// this.data.wells.forEach(function (well) { console.log(well.name) })
        //        console.log(this.data)

        // TODO: look at size/resize behaviour
        this.width = 900;
        this.height = 400;
        this.leftHeader = 100;
        this.topHeader = 130;

        this.container = d3.select("#" + this.container_id);
        this.container.select("svg").remove();

        this.svg = d3
            .select("#" + this.container_id)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .style("overflow", "visible");

        this.control_g = this.svg
            .append("g");
        this.stratigraphy = this.svg
            .append("g");
        this.wells = this.svg
            .append("g");
        this.completions = this.svg
            .append("g");

        this.renderStratigraphy();
        this.renderWells();
        this.renderCompletions();

        this.initTimeSlider();
    }

    initTimeSlider() {
        this.time_step_index = 0

        this.time_slider = new Slider({
            parentElement: this.control_g,
            data: this.data.time_steps,
            length: this.width - 120,
            width: 60,
            position: {
                x: 100,
                y: 40,
            },
            selectedIndex: this.time_step_index,
            numberOfVisibleTicks: 0,
        });

        this.time_slider.on("change", index => {
            this._setTimeStep(index);
        });

        this.time_slider.render();
    }

    _setTimeStep(index) {
        this.time_step_index = index

        //        console.log(index)
    }


    renderWells() {

        const w = this.width - this.leftHeader;
        const wellWidth = w / Math.max(this.data.wells.length, 1);
        const wellHeight = this.height - this.topHeader;

        var left = this.leftHeader;
        var top = this.topHeader;

        var well = this.wells
            .selectAll("g")
            .data(this.data.wells)
            .enter()
            .append("g")
            .attr("transform", function (d, i) {
                return "translate(" + (left + (i + 0.5) * wellWidth) + ",0)";
            });

        well.append("text")
            .style("font-size", "9px")
            .attr("text-anchor", "start")
            .attr("transform", "translate(0," + (top - 10) + ") rotate(-60)")
            .attr("x", 0)
            .attr("y", 0)
            .attr("dy", ".35em")
            .attr("font-family", "sans-serif")
            .text(function (d) { return d.name; });
        var traj = well
            .append("g")
            .attr("transform", "translate(0," + (top - 4) + ")");
        traj.append("rect")
            .attr("width", 0.5)
            .attr("height", wellHeight + 4)
            .attr("fill", "#111");
    }

    renderStratigraphy() {

        const w = this.width - this.leftHeader;
        const h = this.height - this.topHeader;
        const barHeight = h / Math.max(this.data.stratigraphy.length, 1);
        const leftHeader = this.leftHeader;
        const topHeader = this.topHeader;

        var bar = this.stratigraphy
            .selectAll("g")
            .data(this.data.stratigraphy)
            .enter()
            .append("g")
            .attr("transform", function (d, i) {
                return "translate(0," + (topHeader + i * barHeight) + ")";
            });

        var b = bar.append("g")
            .attr("transform", function (d, i) {
                return "translate(" + leftHeader + ", 0)";
            })
        b.append("rect")
            .attr("width", w)
            .attr("height", barHeight + 1)
            .attr("fill", function (d) { return d.color; })

        bar.append("text")
            .style("font-size", "11px")
            .attr("text-anchor", "end")
            .attr("x", function (d) { return leftHeader - 4; })
            .attr("y", barHeight / 2)
            .attr("dy", ".35em")
            .attr("font-family", "sans-serif")
            .text(function (d) { return d.name; });
    }

    renderCompletions() {
        const w = this.width - this.leftHeader;
        const h = this.height - this.topHeader;
        const topHeader = this.topHeader;
        const wellWidth = w / Math.max(this.data.wells.length, 1);
        const leftHeader = this.leftHeader;
        const barHeight = h / Math.max(this.data.stratigraphy.length, 1);
        const barWidth = 20;

        this.completions
            .selectAll("g")
            .data(this.data.wells)
            .enter()
            .append("g")
            .attr("transform", function (d, i) {
                return `translate(${leftHeader + (i + 0.5) * wellWidth}, ${0})`
            })
            .selectAll("g")
            .data(function (d) { return d.completions; })
            .enter()
            .append("g")
            .attr("transform", function (d, i) {
                return `translate(${-d * barWidth * 0.5}, ${i * barHeight + topHeader})`
            })
            .append("rect")
            .attr("width", function (d) { return d * barWidth; })
            .attr("height", barHeight)
            .attr("fill", "#111");
    }
}
