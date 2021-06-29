/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

/* eslint-disable no-magic-numbers */
import * as d3 from "d3";
import HistoryMatchingPlot from "../components/history_matching_plot";
import Slider from "../../../shared/slider";

export default class HistoryMatching {
    init(container, data) {
        this.container = container;
        this.data = data;

        this.initVisualisation();
        this.initIterationPicker();
        this.initPlot();
        this._reorderTooltipLegendElements();
        this.initResize();
    }

    initVisualisation() {
        this.margin = {
            left: 200,
            right: 200,
            bottom: 100,
            top: 100,
        };

        // width of plot area
        this.plotWidth =
            d3.select(this.container).node().offsetWidth -
            this.margin.left -
            this.margin.right;

        // height of plot area
        this.plotHeight = 20 * (this.data.iterations[0].labels.length + 1);

        d3.select(this.container).selectAll("*").remove();

        this.svg = d3
            .select(this.container)
            .append("svg")
            .attr(
                "width",
                this.plotWidth + this.margin.left + this.margin.right
            )
            .attr(
                "height",
                this.plotHeight + this.margin.top + this.margin.bottom
            );
    }

    initPlot() {
        this.plot = new HistoryMatchingPlot({
            parentElement: this.svg,
            width: this.plotWidth,
            height: this.plotHeight,
            position: {
                x: this.margin.left,
                y: this.margin.top,
            },
            confidenceIntervalUnsorted: this.data.confidence_interval_unsorted,
            confidenceIntervalSorted: this.data.confidence_interval_sorted,
        });

        this.plot.setData(this.data.iterations[0]);

        this.plot.render();
    }

    initIterationPicker() {
        this.sliderContainer = this.svg.append("g");

        this.sliderContainer.attr("width", this.plotWidth).attr("height", 80);

        this.iterationPicker = new Slider({
            parentElement: this.sliderContainer,
            data: this.data.iterations.map((iteration) => iteration.name),
            length: this.plotWidth,
            width: 80,
            position: {
                x: 200,
                y: 40,
            },
            numberOfVisibleTicks: this.data.iterations.length,
        });

        this.iterationPicker.on("change", (index) => {
            this._setIteration(index);
        });

        this.iterationPicker.render();
    }

    initResize() {
        const resize = () => {
            // width of plot area
            this.plotWidth =
                d3.select(this.container).node().offsetWidth -
                this.margin.left -
                this.margin.right;
            this.initVisualisation();
            this.initIterationPicker();
            this.initPlot();
            this._reorderTooltipLegendElements();
        };

        window.addEventListener("resize", resize);
    }

    _setIteration(index) {
        this.plot.setData(this.data.iterations[index]);
    }

    _reorderTooltipLegendElements() {
        this.svg.node().appendChild(this.svg.select("#g_tooltip").node());
    }
}
