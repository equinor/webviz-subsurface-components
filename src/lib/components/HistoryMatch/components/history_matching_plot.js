/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

/* eslint-disable no-magic-numbers,react/require-render-return */
import * as d3 from "d3";
import Component from "../../../shared/component";
import Legend from "../utils/legend";

export default class HistoryMatchingPlot extends Component {
    constructor(config = {}) {
        super();
        this.validate(config);

        this.parentElement = config.parentElement;
        this.width = config.width ? config.width : 100;
        this.height = config.height ? config.height : 100;
        this.position = config.position ? config.position : { x: 0, y: 0 };
        this.maxHorizontalValue = 10;

        this.notePosition = this.height + 40;

        this.data = {
            name: "",
            positive: [],
            negative: [],
            labels: [],
        };

        this.SIGMA_LETTER = "\u03C3";
        this.NEGATIVE_BARS_COLOR = "#34A037";
        this.NEGATIVE_BARS_OPACITY = 0.7;
        this.NEGATIVE_BARS_STROKE = "#050";

        this.POSITIVE_BARS_COLOR = "#40537D";
        this.POSITIVE_BARS_OPACITY = 0.7;
        this.POSITIVE_BARS_STROKE = "#050";

        this.PLOT_MARGIN = 50;
        this.LABEL_MARGIN = -10;
        this.LABEL_FONT_SIZE = 15;

        this.confidenceIntervalUnsorted = config.confidenceIntervalUnsorted
            ? config.confidenceIntervalUnsorted
            : { low: 0, high: 2 };
        this.confidenceIntervalSorted = config.confidenceIntervalSorted;
    }

    validate(config) {
        if (!config.parentElement) {
            throw new Error("Parent element not provided");
        }
    }

    setData(data) {
        this.data = data;

        if (this.container) {
            this.renderUpdate();
        }
    }

    render() {
        this.renderContainer();
        this.renderTitle();
        this.renderPlot();
        this.renderHorizontalScale();
        this.renderLegend();
    }

    renderUpdate() {
        this.renderTitle();
        this.renderNegativeBars();
        this.renderPositiveBars();
        this.renderParameterLabels();
    }

    renderContainer() {
        this.container = this.parentElement
            .append("g")
            .attr("id", "g_history_matching_plot")
            .attr(
                "transform",
                `translate(${this.position.x},${this.position.y})`
            );
    }

    renderTitle() {
        this.container
            .selectAll("text#title")
            .data([this.data.name])
            .enter()
            .append("text")
            .attr("id", "title")
            .attr("x", this.width / 2)
            .attr("font-size", 30)
            .attr("text-anchor", "middle")
            .merge(this.container.selectAll("text#title"))
            .text((d) => `Misfit overview for ${d}`);
    }

    renderPlot() {
        this.renderPlotContainer();
        this.renderConfidenceIntervals();
        this.renderHorizontalScale();
        this.renderNegativeBars();
        this.renderPositiveBars();
        this.renderParameterLabels();
        this.renderTooltip();
    }

    renderPlotContainer() {
        this.plotContainer = this.container
            .append("g")
            .attr("transform", `translate(0,${this.PLOT_MARGIN})`);

        this.xScale = d3
            .scaleLinear()
            .domain([0, this.maxHorizontalValue])
            .range([0, this.width]);

        this.yScale = d3
            .scaleBand()
            .domain(d3.range(0, this.data.positive.length + 1))
            .range([10, this.height]);
    }

    renderHorizontalScale() {
        const xAxis = d3
            .axisTop()
            .scale(this.xScale)
            .tickFormat((d) => {
                if (d === 0) {
                    return "0";
                }
                if (d === 1) {
                    return `${this.SIGMA_LETTER}²`;
                }
                return `${d + this.SIGMA_LETTER}²`;
            });

        this.plotContainer
            .append("g")
            .attr("id", "g_history_matching_plot_xaxis")
            .attr("class", "axis")
            .attr("transform", "translate(0, 0)")
            .call(xAxis);

        this.plotContainer
            .selectAll("#g_history_matching_plot_xaxis text")
            .style("font-size", "15px");
    }

    renderLegend() {
        this.legend = new Legend({
            parentElement: this.plotContainer,
            width: 0.43 * this.width,
            height: 0.11 * this.width,
            position: {
                x: 0.5 * this.width,
                y: 0.14 * this.height,
            },
        });

        this.legend.loadData([
            {
                label: "Simulated values too high",
                box: {
                    colour: this.POSITIVE_BARS_COLOR,
                    stroke: this.POSITIVE_BARS_STROKE,
                    fillOpacity: this.POSITIVE_BARS_OPACITY,
                },
            },
            {
                label: "Simulated values too low",
                box: {
                    colour: this.NEGATIVE_BARS_COLOR,
                    stroke: this.NEGATIVE_BARS_STROKE,
                    fillOpacity: this.NEGATIVE_BARS_OPACITY,
                },
            },
            {
                label: "P90-P10 confidence interval (unsorted)*",
                box: {
                    colour: "#FF26A4",
                    stroke: "#FF26A4",
                    fillOpacity: 0.3,
                },
            },
            {
                label: "P90-P10 confidence interval (sorted)*",
                box: {
                    colour: "#FF7900",
                    stroke: "#FF7900",
                    fillOpacity: 0.3,
                },
            },
        ]);

        this.legend.render();
    }

    renderParameterLabels() {
        const labelSelection = this.plotContainer
            .selectAll("text.ylabel")
            .data(this.data.labels, (d, i) => i);

        labelSelection.exit().remove();

        labelSelection
            .enter()
            .append("text")
            .attr("class", "ylabel")
            .attr(
                "transform",
                (d, i) =>
                    `translate(${[
                        this.LABEL_MARGIN,
                        this.yScale(i) + this.LABEL_FONT_SIZE,
                    ]})`
            )
            .attr("text-anchor", "end")
            .attr("font-size", this.LABEL_FONT_SIZE)
            .merge(labelSelection)
            .text((d) => d);

        labelSelection.transition().duration(400).attr("fill-opacity", 0.0);

        labelSelection
            .transition()
            .delay(400)
            .duration(1)
            .text((d) => d);

        labelSelection
            .transition()
            .delay(400)
            .duration(400)
            .attr("fill-opacity", 1.0);
    }

    renderNegativeBars() {
        const negativeBarsSelection = this.plotContainer
            .selectAll("rect.bar_neg")
            .data(this.data.negative, (d, i) => i);

        negativeBarsSelection.exit().remove();

        negativeBarsSelection
            .enter()
            .append("rect")
            .attr("transform", (d, i) => `translate(0,${this.yScale(i)})`)
            .attr("class", "bar_neg")
            .attr("fill", this.NEGATIVE_BARS_COLOR)
            .attr("stroke", this.NEGATIVE_BARS_STROKE)
            .attr("fill-opacity", this.NEGATIVE_BARS_OPACITY)
            .attr("height", this.yScale.bandwidth())
            .on("mouseover", (d, i, nodes) => this.showTooltip(i, nodes[i]))
            .on("mouseout", (d, i, nodes) => this.hideTooltip(nodes[i]))
            // Initial setup, when entering
            .attr(
                "width",
                (d, i) => `${this.xScale(this.data.negative[i] + 0.01)}px`
            )
            .attr("transform", (d, i) => `translate(0,${this.yScale(i)})`);

        negativeBarsSelection
            .transition()
            .attr(
                "width",
                (d, i) => `${this.xScale(this.data.negative[i] + 0.01)}px`
            )
            .attr("transform", (d, i) => `translate(0,${this.yScale(i)})`);
    }

    renderPositiveBars() {
        const positiveBarsSelection = this.plotContainer
            .selectAll("rect.bar_pos")
            .data(this.data.positive, (d, i) => i);

        positiveBarsSelection.exit().remove();

        positiveBarsSelection
            .enter()
            .append("rect")
            .attr("class", "bar_pos")
            .attr("fill", this.POSITIVE_BARS_COLOR)
            .attr("stroke", this.POSITIVE_BARS_STROKE)
            .attr("fill-opacity", this.POSITIVE_BARS_OPACITY)
            .attr("height", this.yScale.bandwidth())
            .on("mouseover", (d, i, nodes) => this.showTooltip(i, nodes[i]))
            .on("mouseout", (d, i, nodes) => this.hideTooltip(nodes[i]))
            // initial setup when entering
            .attr("width", (d, i) => `${this.xScale(this.data.positive[i])}px`)
            .attr(
                "transform",
                (d, i) =>
                    `translate(${[
                        this.xScale(this.data.negative[i]),
                        this.yScale(i),
                    ]})`
            );

        positiveBarsSelection
            .transition()
            .attr("width", (d, i) => `${this.xScale(this.data.positive[i])}px`)
            .attr(
                "transform",
                (d, i) =>
                    `translate(${[
                        this.xScale(this.data.negative[i]),
                        this.yScale(i),
                    ]})`
            );
    }

    showTooltip(index, node) {
        this.tooltip
            .select("text.positive")
            .text(this.data.positive[index].toFixed(2));

        this.tooltip
            .select("text.negative")
            .text(this.data.negative[index].toFixed(2));

        const [x, y] = d3.mouse(this.parentElement.node());

        this.tooltip.attr("transform", `translate(${x + 20}, ${y - 30})`);

        this.tooltip.style("display", "block");

        d3.select(node).transition().attr("stroke-width", 5);
    }

    hideTooltip(node) {
        d3.select(node).transition().attr("stroke-width", 1);

        this.tooltip.style("display", "none");
    }

    renderConfidenceIntervals() {
        this._renderUnsorted();
        this._renderSorted();
    }

    _renderUnsorted() {
        this.plotContainer
            .append("path")
            .attr("fill", "#FF26A4")
            .attr("fill-opacity", "0.3")
            .attr(
                "d",
                `M${this.xScale(
                    this.confidenceIntervalUnsorted.low
                )} ${this.yScale(this.data.negative.length)} L${this.xScale(
                    this.confidenceIntervalUnsorted.low
                )} 10 L${this.xScale(
                    this.confidenceIntervalUnsorted.high
                )} 10 L${this.xScale(
                    this.confidenceIntervalUnsorted.high
                )} ${this.yScale(this.data.negative.length)} Z`
            );

        this.plotContainer
            .append("text")
            .attr("transform", `translate(0, ${this.notePosition})`)
            .attr("font-size", 20)
            .text(
                "*Visualized confidence intervals use the (conservative) assumption of correlated error within each observation group."
            );
    }

    _renderSorted() {
        this.lineContainer = this.plotContainer
            .append("g")
            .attr("transform", "translate(0,0)");

        const numberOfParameters = this.data.negative.length;

        const transformedData = this.confidenceIntervalSorted.high
            .map((val, i) => ({ xVal: this.xScale(val), yVal: this.yScale(i) }))
            .concat(
                this.confidenceIntervalSorted.low
                    .slice(0)
                    .reverse()
                    .map((val, i) => ({
                        xVal: this.xScale(val),
                        yVal: this.yScale(numberOfParameters - 1 - i),
                    }))
            );

        let line = "M";

        transformedData.forEach((d, i) => {
            const y0 = d.yVal;

            const x0 = d.xVal;
            if (i === 0) {
                line += `${x0},${y0}`;
            } else {
                line += `H${x0}`;
            }

            if (i < numberOfParameters) {
                if (i < numberOfParameters - 1) {
                    line += `V${transformedData[i + 1].yVal}`;
                } else {
                    line += `V${
                        transformedData[i].yVal + this.yScale.bandwidth()
                    }`;
                }
            } else {
                line += `V${transformedData[i].yVal}`;
            }
        });

        this.lineContainer
            .append("path")
            .datum(transformedData)
            .attr("d", line)
            .attr("stroke", "#FF7900")
            .attr("fill", "#FF7900")
            .attr("fill-opacity", "0.3");
    }

    renderTooltip() {
        this.tooltip = this.parentElement
            .append("g")
            .attr("id", "g_tooltip")
            .style("display", "none");

        this.tooltip.transition().duration(1000);

        this.tooltip
            .append("rect")
            .attr("width", 200)
            .attr("height", 50)
            .attr("fill", "white")
            .attr("fill-opacity", 0.9)
            .attr("stroke", "black");

        this.tooltip
            .append("text")
            .attr("x", 16)
            .attr("y", 22)
            .attr("font-size", 20)
            .text("Positive");

        this.tooltip
            .append("text")
            .attr("x", 16)
            .attr("y", 42)
            .attr("font-size", 20)
            .text("Negative");

        this.tooltip
            .append("text")
            .attr("class", "positive")
            .attr("x", 150)
            .attr("y", 22)
            .attr("font-size", 20)
            .text("150");

        this.tooltip
            .append("text")
            .attr("class", "negative")
            .attr("x", 150)
            .attr("y", 42)
            .attr("font-size", 20)
            .text("159");
    }
}
