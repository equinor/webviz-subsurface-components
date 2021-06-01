/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

/* eslint-disable no-magic-numbers,no-global-assign,no-native-reassign,no-unused-vars,no-invalid-this */
/* Fix lint when/if rewriting the whole file */

import * as d3 from "d3";

export default function sensitivitySliderPlot(
    target,
    output,
    parameters,
    parameterName
) {
    const MAIN = "main";
    const INTERACTION = "interaction";

    const GRAPH_FOCUS_X = 9;
    const INVERTED_GRAPH_FOCUS_X = -80;
    const MINIMUM_LABEL_X = 50;

    function capFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const proto = {
        init() {
            return this.initContainers()
                .initMeta()
                .initData()
                .initGraphDimensions()
                .initGraphScales()
                .initGraphAxes()
                .initGraphGenerators()
                .initParameterDomains()
                .initSliderDimensions()
                .initSliderPositions()
                .initSliderCellWidths()
                .initSliderWidths()
                .initSliderRanges()
                .initSliderScale()
                .initScaleSelection(INTERACTION)
                .initScaleSelection(MAIN);
        },

        initContainers() {
            d3.select("#sensitivity-slider-plot__graph-container").remove();
            d3.select("#sensitivity-slider-plot__slider-container").remove();
            this._graphContainer = d3
                .select(this._target)
                .append("div")
                .attr("id", "sensitivity-slider-plot__graph-container")
                .classed(
                    "sensitivity-slider-plot__graph-container Pos(st) T(0) Ovx(h)",
                    true
                );

            this._sliderContainer = d3
                .select(this._target)
                .append("div")
                .attr("id", "sensitivity-slider-plot__slider-container")
                .classed("sensitivity-slider-plot__slider-container", true);

            return this;
        },

        initMeta() {
            this._sliderColumns = ["label", "main", "interaction"];
            this._sliderCellRelativeWidths = [2 / 14, 6 / 14, 6 / 14];
            this._sliderCellRelativeXPos = [0, 2 / 14, 8 / 14];
            return this;
        },

        initGraphDimensions() {
            this._graphHeight =
                this._graphContainerHeight -
                this._graphContainerMargin.top -
                this._graphContainerMargin.bottom;
            return this.updateGraphWidth();
        },

        updateGraphWidth() {
            this._graphWidth =
                this._graphContainer.node().getBoundingClientRect().width -
                this._graphContainerMargin.left -
                this._graphContainerMargin.right;
            return this;
        },

        initData() {
            this._bisectDate = d3.bisector((d) => d.time).left;

            return this.initGraphData().initSliderData();
        },

        initGraphData() {
            this._currentGraphDatumIndex = 0;
            return this;
        },

        initSliderData() {
            this._sliderData = this._sliderColumns.map((d, j) => ({
                i: 0,
                j,
                key: j > 0 ? `${capFirst(d)} effect` : null,
                clazz: `sensitivity-slider-plot__slider-col-header sensitivity-slider-plot__slider-col-header-${d}`,
            }));

            this._nParameters = this._parameters.length;

            for (let i = 0; i < this._nParameters; i++) {
                for (let j = 0; j < 3; j++) {
                    const d = {
                        i: i + 1,
                        j,
                        key: this._parameters[i].name,
                        type: this._sliderColumns[j],
                    };
                    // console.log(this._parameters[i].main)
                    switch (j) {
                        case 0:
                            d.clazz =
                                "sensitivity-slider-plot__slider-row-header";
                            break;
                        case 1:
                            d.values = {
                                linear: this._parameters[i].main,
                                log: this._parameters[i].main.map((value) =>
                                    Math.log(value)
                                ),
                            };
                            d.clazz =
                                "sensitivity-slider-plot__slider-bar-container " +
                                "sensitivity-slider-plot__slider-bar-container-main";
                            break;
                        case 2:
                            d.values = {
                                linear: this._parameters[i].interactions,
                                log: this._parameters[i].interactions.map(
                                    (value) => Math.log(value)
                                ),
                            };
                            d.clazz =
                                "sensitivity-slider-plot__slider-bar-container " +
                                "sensitivity-slider-plot__slider-bar-container-interaction";
                            break;
                        default:
                            throw new Error("Unknown case");
                    }
                    this._sliderData.push(d);
                }
            }

            return this;
        },

        initGraphScales() {
            this._graphX = d3.scaleTime();
            this._graphY = d3.scaleLinear();
            return this.updateGraphScales();
        },

        updateGraphScales() {
            this._graphX
                .domain(d3.extent(this._output, (d) => d.time))
                .range([0, this._graphWidth]);
            this._graphY
                .domain([
                    d3.min(this._output, (d) => d.min),
                    d3.max(this._output, (d) => d.max),
                ])
                .range([this._graphHeight, 0]);
            return this;
        },

        initGraphAxes() {
            this._graphXAxis = d3
                .axisBottom()
                .tickFormat(d3.timeFormat("%d.%m.%Y"));
            this._graphYAxis = d3.axisLeft();
            return this.updateGraphAxes();
        },

        initGraphLabel() {
            this._graphG
                .append("text")
                .attr(
                    "transform",
                    `translate(-70, ${this._graphHeight / 2}) rotate(-90)`
                )
                .text(parameterName);
            return this;
        },

        updateGraphAxes() {
            this._graphXAxis.scale(this._graphX);
            this._graphYAxis.scale(this._graphY);
            return this;
        },

        initGraphGenerators() {
            this._area = d3
                .area()
                .x((d) => this._graphX(d.time))
                .y0((d) => this._graphY(d.min))
                .y1((d) => this._graphY(d.max))
                .curve(d3.curveLinear);

            this._line = d3
                .line()
                .x((d) => this._graphX(d.time))
                .y((d) => this._graphY(d.mean))
                .curve(d3.curveLinear);

            return this;
        },

        initGraphSVG() {
            this._graphSVG = this._graphContainer
                .append("svg")
                .classed("sensitivity-slider-plot__graph-svg", true)
                .attr(
                    "height",
                    this._graphHeight +
                        this._graphContainerMargin.top +
                        this._graphContainerMargin.bottom
                );
            this.updateGraphSVG();

            this._graphG = this._graphSVG
                .append("g")
                .attr(
                    "transform",
                    `translate(${this._graphContainerMargin.left}, ${this._graphContainerMargin.top})`
                );

            return this;
        },

        updateGraphSVG() {
            this._graphSVG.attr(
                "width",
                this._graphWidth +
                    this._graphContainerMargin.left +
                    this._graphContainerMargin.right
            );
            return this;
        },

        initParameterDomains() {
            const allMainValues = this._parameters.reduce(
                (sum, param) => sum.concat(param.main),
                []
            );
            const allInteractionValues = this._parameters.reduce(
                (sum, param) => sum.concat(param.interactions),
                []
            );

            this._parameterDomains = {
                main: {
                    linear: d3.extent(allMainValues),
                    log: d3.extent(
                        allMainValues
                            .filter((value) => value !== 0)
                            .map(Math.log)
                    ),
                },
                interaction: {
                    linear: d3.extent(allInteractionValues),
                    log: d3.extent(
                        allInteractionValues
                            .filter((value) => value !== 0)
                            .map(Math.log)
                    ),
                },
            };

            return this;
        },

        initSliderDimensions() {
            this._sliderHeight =
                this._sliderCellHeight -
                this._sliderCellPadding.top -
                this._sliderCellPadding.bottom;
            return this.updateSliderRowWidth();
        },

        updateSliderRowWidth() {
            this._sliderRowWidth = this._sliderContainer
                .node()
                .getBoundingClientRect().width;
            return this;
        },

        initSliderPositions() {
            return this.updateSliderPositions();
        },

        updateSliderPositions() {
            this._sliderCellXPos = this._sliderColumns.map(
                (d, j) =>
                    this._sliderCellRelativeXPos[j] * this._sliderRowWidth,
                this
            );
            this._sliderCellYPos = ["header"]
                .concat(this._parameters.map((param) => param.name))
                .map((d, i) => i * this._sliderCellHeight);
            return this;
        },

        initSliderCellWidths() {
            return this.updateSliderCellWidths();
        },

        updateSliderCellWidths() {
            this._sliderCellWidths = this._sliderColumns.map(
                (d, j) =>
                    this._sliderCellRelativeWidths[j] * this._sliderRowWidth,
                this
            );
            return this;
        },

        initSliderWidths() {
            return this.updateSliderWidths();
        },

        updateSliderWidths() {
            this._sliderWidths = this._sliderColumns.map(
                (d, j) =>
                    this._sliderCellRelativeWidths[j] * this._sliderRowWidth -
                    this._sliderCellPadding.left -
                    this._sliderCellPadding.right,
                this
            );
            return this;
        },

        initSliderRanges() {
            return this.updateSliderRanges();
        },

        updateSliderRanges() {
            this._sliderXRanges = this._sliderColumns.map(
                (d, j) => [0, this._sliderWidths[j]],
                this
            );
            return this;
        },

        initSliderScale() {
            this._mainX = "linear";
            this._interactionX = "linear";

            return this;
        },

        updateSliderScale(typeOfSlider, typeOfScale) {
            if (typeOfSlider === MAIN) {
                this._mainX = typeOfScale;
            } else {
                this._interactionX = typeOfScale;
            }
        },

        initScaleSelection(type) {
            self = this;
            const container = d3.select(
                ".sensitivity-slider-plot__slider-container"
            );
            const formContainer = container.insert("div", ":first-child");

            const label = formContainer
                .append("label")
                .style("font-size", "2rem")
                .style("min-width", "150px")
                .html(`${capFirst(type)} scale`);

            const select = formContainer
                .append("select")
                .on("change", function () {
                    self.updateSliderScale(type, this.value);
                    self.updateSliderBars();
                });
            select
                .append("option")
                .attr("value", "linear")
                .attr("selected", "selected")
                .html("Linear");

            select.append("option").attr("value", "log").html("Log");

            return this;
        },

        initSliderSVG() {
            const self = this;

            this._sliderSVG = this._sliderContainer
                .append("svg")
                .classed("sensitivity-slider-plot__slider-svg", true)
                .attr(
                    "height",
                    (1 + this._nParameters) * this._sliderCellHeight
                )
                .attr("width", this._sliderRowWidth);

            const g = this._sliderSVG.selectAll("g").data(this._sliderData);
            g.enter()
                .append("g")
                .attr(
                    "class",
                    (d) =>
                        `sensitivity-slider-plot__slider-cell${
                            d.clazz ? ` ${d.clazz}` : ""
                        }`
                )
                .attr("height", self._sliderCellHeight)
                .merge(g)
                .attr(
                    "transform",
                    (d) =>
                        `translate(${self._sliderCellXPos[d.j]}, ${
                            self._sliderCellYPos[d.i]
                        })`
                )
                .attr("width", (d) => self._sliderCellWidths[d.j]);

            const colHeaderLabel = this._sliderSVG
                .selectAll(".sensitivity-slider-plot__slider-col-header")
                .selectAll("text")
                .data((d) => [d]);
            colHeaderLabel
                .enter()
                .append("text")
                .classed(
                    "sensitivity-slider-plot__slider-col-header-label",
                    true
                )
                .attr("y", self._sliderCellHeight / 2)
                .text((d) => d.key)
                .merge(colHeaderLabel)
                .attr("x", (d) => self._sliderCellWidths[d.j] / 2);

            const rowHeaderLabel = this._sliderSVG
                .selectAll(".sensitivity-slider-plot__slider-row-header")
                .selectAll("text")
                .data((d) => [d]);
            rowHeaderLabel
                .enter()
                .append("text")
                .classed(
                    "sensitivity-slider-plot__slider-row-header-label",
                    true
                )
                .attr("y", self._sliderCellHeight / 2)
                .text((d) => d.key)
                .merge(rowHeaderLabel)
                .attr("x", (d) => self._sliderCellWidths[d.j]);

            return this;
        },

        updateSliderSVG() {
            const self = this;

            this._sliderSVG.attr("width", this._sliderRowWidth);

            this._sliderSVG
                .selectAll("g")
                .attr(
                    "transform",
                    (d) =>
                        `translate(${self._sliderCellXPos[d.j]}, ${
                            self._sliderCellYPos[d.i]
                        })`
                )
                .attr("width", (d) => self._sliderCellWidths[d.j]);

            this._sliderSVG
                .selectAll(".sensitivity-slider-plot__slider-col-header")
                .selectAll("text")
                .attr("x", (d) => self._sliderCellWidths[d.j] / 2);

            this._sliderSVG
                .selectAll(".sensitivity-slider-plot__slider-row-header")
                .selectAll("text")
                .attr("x", (d) => self._sliderCellWidths[d.j]);

            return this;
        },

        initSliderBars() {
            return this.updateSliderBars();
        },

        updateSliderBars() {
            const self = this;

            const updateSliderBars = (selector, type, scaleType) => {
                function getScale(domain, range, type) {
                    const scale = d3.scaleLinear();
                    return scale.domain(domain).range(range);
                }

                function drawBackgroundBar() {
                    const cell = d3.select(this);

                    const rect = cell
                        .selectAll(
                            ".sensitivity-slider-plot__slider-bar-background"
                        )
                        .data((d) => [d]);
                    rect.enter()
                        .append("rect")
                        .classed(
                            "sensitivity-slider-plot__slider-bar-background",
                            true
                        )
                        .attr("height", self._sliderHeight)
                        .attr("y", self._sliderCellPadding.top)
                        .attr("x", self._sliderCellPadding.left)
                        .merge(rect)
                        .attr("width", (d) => self._sliderWidths[d.j]);
                }

                function drawMainBar(d) {
                    const cell = d3.select(this);

                    const x = getScale(
                        self._parameterDomains[d.type][scaleType],
                        self._sliderXRanges[d.j],
                        scaleType
                    );

                    const rect = cell
                        .selectAll(".sensitivity-slider-plot__slider-bar-main")
                        .data((d) => [d]);
                    rect.enter()
                        .append("rect")
                        .classed(
                            "sensitivity-slider-plot__slider-bar-main",
                            true
                        )
                        .attr("height", self._sliderHeight)
                        .attr("x", self._sliderCellPadding.left)
                        .attr("y", self._sliderCellPadding.top)
                        .merge(rect)
                        .transition()
                        .duration(self._transitionDuration)
                        .attr("width", (d) => {
                            const val =
                                d.values[scaleType][
                                    self._currentGraphDatumIndex
                                ];

                            if (Number.isFinite(val)) {
                                return x(val);
                            }

                            return 0;
                        });
                }

                function drawInteractionBar(d) {
                    const cell = d3.select(this);

                    const x = getScale(
                        self._parameterDomains[d.type][scaleType],
                        self._sliderXRanges[d.j],
                        scaleType
                    );

                    const rect = cell
                        .selectAll(
                            ".sensitivity-slider-plot__slider-bar-interaction"
                        )
                        .data((d) => [d]);
                    rect.enter()
                        .append("rect")
                        .classed(
                            "sensitivity-slider-plot__slider-bar-interaction",
                            true
                        )
                        .attr("height", self._sliderHeight)
                        .attr("x", self._sliderCellPadding.left)
                        .attr("y", self._sliderCellPadding.top)
                        .merge(rect)
                        .transition()
                        .duration(self._transitionDuration)
                        .attr("width", (d) => {
                            const val =
                                d.values[scaleType][
                                    self._currentGraphDatumIndex
                                ];

                            if (Number.isFinite(val)) {
                                return x(val);
                            }

                            return 0;
                        });
                }

                function drawValueLabel(d) {
                    const cell = d3.select(this);

                    const x = getScale(
                        self._parameterDomains[d.type][scaleType],
                        self._sliderXRanges[d.j],
                        scaleType
                    );

                    const text = cell
                        .selectAll(".sensitivity-slider-plot__slide-bar-label")
                        .data((d) => [d]);
                    text.enter()
                        .append("text")
                        .classed(
                            "sensitivity-slider-plot__slide-bar-label",
                            true
                        )
                        .attr("y", self._sliderCellHeight / 2)
                        .merge(text)
                        .transition()
                        .duration(self._transitionDuration)
                        .text((d) => {
                            const val =
                                d.values[scaleType][
                                    self._currentGraphDatumIndex
                                ];

                            if (Number.isFinite(val)) {
                                return val.toPrecision(
                                    self._labelNumericPrecision
                                );
                            }
                            return "";
                        })
                        .attr("x", (d, i, nodes) => {
                            const val =
                                d.values[scaleType][
                                    self._currentGraphDatumIndex
                                ];
                            const minimumPosition =
                                self._sliderCellPadding.left + MINIMUM_LABEL_X;

                            if (Number.isFinite(val)) {
                                const pos = x(val);

                                return pos > minimumPosition
                                    ? pos
                                    : minimumPosition;
                            }

                            return minimumPosition;
                        });
                }

                this._sliderSVG
                    .selectAll(selector)
                    .each(drawBackgroundBar)
                    .each(type === MAIN ? drawMainBar : drawInteractionBar)
                    .each(drawValueLabel);
            };

            updateSliderBars(
                ".sensitivity-slider-plot__slider-bar-container-main",
                "main",
                this._mainX
            );
            updateSliderBars(
                ".sensitivity-slider-plot__slider-bar-container-interaction",
                "interaction",
                this._interactionX
            );

            return this;
        },

        initGraph() {
            this._graphArea = this._graphG
                .append("path")
                .datum(this._output)
                .classed("sensitivity-slider-plot__graph-area", true);

            this._graphLine = this._graphG
                .append("path")
                .datum(this._output)
                .classed("sensitivity-slider-plot__graph-line", true);

            return this.updateGraph();
        },

        updateGraph() {
            this._graphArea.attr("d", this._area);

            this._graphLine.attr("d", this._line);

            return this;
        },

        initGraphAxesG() {
            this._graphG
                .append("g")
                .classed("x axis", true)
                .attr("transform", `translate(0, ${this._graphHeight})`);

            this._graphG.append("g").classed("y axis", true);

            return this.updateGraphAxesG();
        },

        updateGraphAxesG() {
            this._graphG.select("g.x.axis").call(this._graphXAxis);
            this._graphG.select("g.y.axis").call(this._graphYAxis);

            return this;
        },

        initGraphFocus() {
            this._graphFocus = this._graphG
                .append("g")
                .classed("sensitivity-slider-plot__graph-focus", true)
                .style("display", "none");

            this._graphFocus
                .append("circle")
                .classed(
                    "max sensitivity-slider-plot__graph-focus-circle",
                    true
                );

            this._graphFocus
                .append("circle")
                .classed(
                    "mean sensitivity-slider-plot__graph-focus-circle",
                    true
                );

            this._graphFocus
                .append("circle")
                .classed(
                    "min sensitivity-slider-plot__graph-focus-circle",
                    true
                );

            this._graphFocus
                .append("text")
                .classed("max sensitivity-slider-plot__graph-focus-text", true)
                .attr("x", GRAPH_FOCUS_X)
                .attr("dy", "-.35em");

            this._graphFocus
                .append("text")
                .classed("mean sensitivity-slider-plot__graph-focus-text", true)
                .attr("x", GRAPH_FOCUS_X)
                .attr("dy", "-.35em");

            this._graphFocus
                .append("text")
                .classed("min sensitivity-slider-plot__graph-focus-text", true)
                .attr("x", GRAPH_FOCUS_X)
                .attr("dy", "-.35em");

            this._graphFocus
                .append("line")
                .classed("sensitivity-slider-plot__graph-focus-line", true);

            return this.updateGraphFocus();
        },

        updateGraphFocus() {
            this._graphFocus
                .select("line")
                .attr("y1", this._graphY(this._graphY.domain()[0]))
                .attr("y2", this._graphY(this._graphY.domain()[1]));
            return this;
        },

        initGraphOverlay() {
            this._graphG
                .append("rect")
                .classed("sensitivity-slider-plot__graph-overlay", true)
                .on("mouseover", () => this._graphFocus.style("display", null))
                .on("mouseout", () => this._graphFocus.style("display", "none"))
                .on("mousemove", this.createOnMouseMove());
            return this.updateGraphOverlay();
        },

        updateGraphOverlay() {
            this._graphG
                .select("rect.sensitivity-slider-plot__graph-overlay")
                .attr("width", this._graphWidth)
                .attr("height", this._graphHeight);
            return this;
        },

        draw() {
            return this.initGraphSVG()
                .initGraphAxesG()
                .initGraph()
                .initGraphFocus()
                .initGraphLabel()
                .initGraphOverlay()
                .initSliderSVG()
                .initSliderBars();
        },

        onResize() {
            return this.updateGraphWidth()
                .updateGraphScales()
                .updateGraphSVG()
                .updateGraphAxesG()
                .updateGraph()
                .updateGraphOverlay()
                .updateSliderRowWidth()
                .updateSliderPositions()
                .updateSliderCellWidths()
                .updateSliderWidths()
                .updateSliderRanges()
                .updateSliderSVG()
                .updateSliderBars();
        },

        onGraphDatumSelect(d) {
            const i = this._output.indexOf(d);
            if (i !== this._currentGraphDatumIndex) {
                this._currentGraphDatumIndex = i;
                this.updateSliderBars();
            }
            return this;
        },

        createOnMouseMove() {
            const self = this;

            function onMouseMove() {
                // https://bl.ocks.org/mbostock/3902569
                // https://bl.ocks.org/micahstubbs/e4f5c830c264d26621b80b754219ae1b
                const x0 = self._graphX.invert(d3.mouse(this)[0]);
                const i = self._bisectDate(self._output, x0, 1);
                const d0 = self._output[i - 1];
                const d1 = self._output[i];
                const d = x0 - d0.time > d1.time - x0 ? d1 : d0;

                const invertLabelPosition =
                    self._output.indexOf(d) === self._output.length - 1;
                const labelX = invertLabelPosition
                    ? INVERTED_GRAPH_FOCUS_X
                    : GRAPH_FOCUS_X;

                const maxPosition =
                    self._graphY(d.min) - self._graphY(d.max) < 30
                        ? self._graphY(d.max) - 30
                        : self._graphY(d.max);
                const meanPosition =
                    self._graphY(d.min) - self._graphY(d.max) < 30
                        ? self._graphY(d.mean) - 15
                        : self._graphY(d.mean);

                self._graphFocus.attr(
                    "transform",
                    `translate(${self._graphX(d.time)}, 0)`
                );

                self._graphFocus
                    .select("circle.max")
                    .attr("cy", self._graphY(d.max));
                self._graphFocus
                    .select("text.max")
                    .attr("y", maxPosition)
                    .attr("x", labelX)
                    .text(
                        `max: ${d.max.toPrecision(self._labelNumericPrecision)}`
                    );

                self._graphFocus
                    .select("circle.mean")
                    .attr("cy", self._graphY(d.mean));
                self._graphFocus
                    .select("text.mean")
                    .attr("y", meanPosition)
                    .attr("x", labelX)
                    .text(
                        `mean: ${d.mean.toPrecision(
                            self._labelNumericPrecision
                        )}`
                    );

                self._graphFocus
                    .select("circle.min")
                    .attr("cy", self._graphY(d.min));
                self._graphFocus
                    .select("text.min")
                    .attr("y", self._graphY(d.min))
                    .attr("x", labelX)
                    .text(
                        `min: ${d.min.toPrecision(self._labelNumericPrecision)}`
                    );
                self.onGraphDatumSelect(d);
            }

            return onMouseMove;
        },
    };

    return Object.assign(Object.create(proto), {
        _target: target,
        _parameters: parameters,
        _output: output,
        _graphContainerHeight: 300,
        _graphContainerMargin: {
            top: 20,
            right: 30,
            bottom: 50,
            left: 80,
        },
        _sliderCellHeight: 40,
        _sliderCellPadding: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 20,
        },
        _parameterDomainPadding: { top: 0.1, bottom: 0.4 },
        _labelNumericPrecision: 4,
        _transitionDuration: 200,
    }).init();
}
