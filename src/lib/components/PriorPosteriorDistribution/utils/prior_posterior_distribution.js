/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

/* eslint-disable no-magic-numbers */

import * as d3 from "d3";
import Slider from "../../../shared/slider";

class D3PriorPosterior {
    constructor(height, container_id, data) {
        this.height = height;
        this.container_id = container_id;
        this.data = data;

        this.iteration_index = 0;

        this.number_bins = 20;

        // Radius of realization circles in pixels
        this.radius_circles = 3;

        this.margin = {
            top: 10,
            bottom: 40,
            right: 30,
            left: 30,
        };

        // Height of iteration slider in pixels
        this.height_slider = 100;

        // Fraction of total height used for histogram - range [0, 1]
        this.height_fraction_histogram = 0.6;
    }

    updateData(data) {
        this.data = data;
        if (this.iteration_index >= this.data.iterations.length) {
            // New data contains fewer iterations, change user selected iteration number
            this.iteration_index = this.data.iterations.length - 1;
        }
    }

    createXAndColorScale() {
        /* Create the x-axis scale, and color scale, used when plotting the data.
         */

        this.global_min = Math.min(
            ...this.data.values.map((values) => Math.min(...values))
        );

        this.global_max = Math.max(
            ...this.data.values.map((values) => Math.max(...values))
        );

        this.x_scale = d3
            .scaleLinear()
            .domain([this.global_min, this.global_max])
            .range([0, this.width_plot]);

        this.color_scale = d3
            .scaleLinear()
            .domain([this.global_min, this.global_max])
            .range(["blue", "red"]);
    }

    updateTooltipLocation(x_value) {
        const normalized_x =
            (x_value - this.global_min) / (this.global_max - this.global_min);
        const tooltip_width = this.tooltip.node().getBoundingClientRect().width;

        const mouse_position = d3.mouse(this.svg.node());
        this.tooltip
            .style(
                "left",
                mouse_position[0] - tooltip_width * normalized_x + "px"
            )
            .style("top", mouse_position[1] - 20 + "px")
            .style("opacity", 1.0);
    }

    calculateBins() {
        /* Calculate bin sizes, and corresponding percents. Also finds max percent
        globally (across both iterations and bins) such that an appropriate y-scale
        can be made.
        */

        const histogram = d3
            .histogram()
            .domain(this.x_scale.domain())
            .thresholds(
                d3.range(
                    this.global_min,
                    this.global_max,
                    (this.global_max - this.global_min) / this.number_bins
                )
            );

        this.bins = this.data.values.map((values) => histogram(values));

        const number_data_points = this.data.values.map(
            (values) => values.length
        );
        this.bins.map((bins, iteration_index) =>
            bins.map(
                (bin) =>
                    (bin.percent =
                        (bin.length * 100) /
                        number_data_points[iteration_index])
            )
        );

        const max_percent = Math.max(
            ...this.bins.map((bins) =>
                Math.max(...bins.map((bin) => bin.percent))
            )
        );

        this.y_scale = d3
            .scaleLinear()
            .range([this.height_histogram, 0])
            .domain([0, max_percent]);
    }

    renderPlot() {
        this.container = d3.select("#" + this.container_id);
        this.container.select("svg").remove();

        this.width = this.container.node().offsetWidth;

        this.tooltip = this.container
            .append("div")
            .classed("prior_posterior_tooltip", true)
            .style("opacity", 0);

        this.svg = d3
            .select("#" + this.container_id)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .style("overflow", "visible");

        if (this.data.labels.length > 0) {
            this.createMainGroup();
            this.createXAndColorScale();

            this.renderPileChart();
            this.renderHistogram();
            this.initNumberBinsPicker();
            this.initIterationPicker();
        }
    }

    createMainGroup() {
        // Creates the main SVG group taking care of margins, and also calculating
        // remaining width and height available for the slider, histogram and pile chart.

        this.main_g = this.svg
            .append("g")
            .attr(
                "transform",
                "translate(" + this.margin.left + "," + this.margin.top + ")"
            );

        this.width_plot = this.width - this.margin.left - this.margin.right;
        this.height_plot = this.height - this.margin.top - this.margin.bottom;

        this.height_histogram =
            (this.height_plot - this.height_slider) *
            this.height_fraction_histogram;
        this.height_pile_chart =
            (this.height_plot - this.height_slider) *
            (1 - this.height_fraction_histogram);

        this.y_offset_histogram = 2 * this.height_slider;
        this.y_offset_pile_chart =
            this.y_offset_histogram + this.height_histogram;
    }

    renderHistogram() {
        // Render histogram of the data inbetween slider and pile chart

        this.calculateBins();

        if (typeof this.histogram_g !== "undefined") {
            this.histogram_g.remove();
        }

        this.histogram_g = this.main_g
            .append("g")
            .attr("transform", "translate(0," + this.y_offset_histogram + ")");

        this.histogram_g
            .append("g")
            .attr("transform", "translate(0," + this.height_histogram + ")")
            .call(d3.axisBottom(this.x_scale));

        this.histogram_g
            .selectAll("rect")
            .data(this.bins[this.iteration_index])
            .enter()
            .append("rect")
            .classed("prior_posterior_rect", true)
            .attr("x", (d) => this.x_scale(d.x0))
            .attr("y", (d) => this.y_scale(d.percent))
            .attr("width", (d) => this.x_scale(d.x1) - this.x_scale(d.x0))
            .attr(
                "height",
                (d) => this.height_histogram - this.y_scale(d.percent)
            )
            .style("fill", (d) => this.color_scale(0.5 * (d.x1 + d.x0)))
            .on("mouseover", (_, i) => {
                this.tooltip
                    .style("opacity", 1)
                    .text(
                        this.bins[this.iteration_index][i].percent.toPrecision(
                            3
                        ) + " %"
                    );
            })
            .on("mousemove", (d) => {
                this.updateTooltipLocation(d.x1);
            })
            .on("mouseout", () => this.tooltip.style("opacity", 0));
    }

    updateHistogram() {
        this.histogram_g
            .selectAll("rect")
            .transition()
            .duration(250)
            .attr("y", (_, i) =>
                this.y_scale(this.bins[this.iteration_index][i].percent)
            )
            .attr(
                "height",
                (_, i) =>
                    this.height_histogram -
                    this.y_scale(this.bins[this.iteration_index][i].percent)
            );
    }

    renderPileChart() {
        const temp_nodes = {};

        this.data.values.forEach((values, iter_index) =>
            values.forEach((value, sample_index) => {
                const real_label = this.data.labels[iter_index][sample_index];
                if (typeof temp_nodes[real_label] === "undefined") {
                    temp_nodes[real_label] = {};
                }
                temp_nodes[real_label][iter_index] = value;
            })
        );

        const data = Object.entries(temp_nodes).map((entry) => {
            return {
                id: entry[0],
                values: entry[1],
                x: this.x_scale(entry[1][0]),
                y: this.height_pile_chart / 2,
            };
        });

        const tick = () => {
            d3.selectAll(".prior_posterior_circle")
                .attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y)
                .attr("fill", (d) =>
                    this.color_scale(d.values[this.iteration_index])
                );
        };

        this.pile_chart_g = this.main_g
            .append("g")
            .attr("transform", "translate(0," + this.y_offset_pile_chart + ")");

        this.pile_chart_circles = this.pile_chart_g
            .selectAll(".prior_posterior_circle")
            .data(data)
            .enter()
            .append("circle")
            .classed("prior_posterior_circle", true)
            .on("mouseover", (d) => {
                this.tooltip
                    .style("opacity", 1)
                    .html(
                        d.id +
                            "<br>Value: " +
                            d.values[this.iteration_index].toPrecision(5)
                    );
            })
            .on("mousemove", (d) =>
                this.updateTooltipLocation(d.values[this.iteration_index])
            )
            .on("mouseout", () => this.tooltip.style("opacity", 0));

        this.pile_chart_circles
            .attr("r", (d) =>
                this.iteration_index in d.values ? this.radius_circles : 0
            )
            .attr("visibility", (d) =>
                this.iteration_index in d.values ? "visible" : "hidden"
            );

        this.simulation = d3
            .forceSimulation(data)
            .force(
                "x",
                d3.forceX((d) =>
                    this.iteration_index in d.values
                        ? this.x_scale(d.values[this.iteration_index])
                        : 0
                )
            )
            .force("y", d3.forceY(this.height_pile_chart / 2).strength(0.01))
            .force("collide", d3.forceCollide(this.radius_circles))
            .alphaDecay(0.005)
            .alpha(0.9)
            .on("tick", tick);
    }

    initNumberBinsPicker() {
        const bins = [10, 20, 30, 40, 50, 60, 70, 80];
        const labels = ["fewer bins ←", "", "", "", "", "", "", "→ more bins"];

        this.numberBinsPicker = new Slider({
            parentElement: this.main_g,
            data: labels,
            length: this.width_plot - 200,
            width: 80,
            position: {
                x: this.height_slider,
                y: 120,
            },
            hideCurrentTick: true,
            selectedIndex: bins.findIndex((x) => x === this.number_bins),
            numberOfVisibleTicks: bins.length,
        });

        this.numberBinsPicker.on("change", (index) => {
            this._setNumberBins(bins[index]);
        });

        this.numberBinsPicker.render();
    }

    _setNumberBins(index) {
        this.number_bins = index;
        this.renderHistogram();
    }

    initIterationPicker() {
        this.iterationPicker = new Slider({
            parentElement: this.main_g,
            data: this.data.iterations,
            length: this.width_plot - 200,
            width: 80,
            position: {
                x: 100,
                y: 40,
            },
            selectedIndex: this.iteration_index,
            numberOfVisibleTicks: this.data.iterations.length,
        });

        this.iterationPicker.on("change", (index) => {
            this._setIteration(index);
        });

        this.iterationPicker.render();
    }

    _setIteration(index) {
        this.iteration_index = index;

        this.updateHistogram();

        this.pile_chart_circles
            .attr("r", (d) =>
                this.iteration_index in d.values ? this.radius_circles : 0
            )
            .attr("visibility", (d) =>
                this.iteration_index in d.values ? "visible" : "hidden"
            );

        this.simulation
            .force(
                "x",
                d3.forceX((d) =>
                    this.iteration_index in d.values
                        ? this.x_scale(d.values[this.iteration_index])
                        : 0
                )
            )
            .alphaDecay(0.005)
            .alpha(0.7)
            .restart();
    }
}

export default D3PriorPosterior;
