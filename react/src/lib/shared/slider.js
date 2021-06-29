/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

/* eslint-disable no-invalid-this,react/require-render-return */
import * as d3 from "d3";
import Component from "./component";
import "./slider.css";

const ORIENTATION = {
    HORIZONTAL: "HORIZONTAL",
    VERTICAL: "VERTICAL",
};

const TICKPOSITION = {
    TOP: "TOP",
    BOTTOM: "BOTTOM",
    LEFT: "LEFT",
    RIGHT: "RIGHT",
};

const DIMENSION = {
    HORIZONTAL: "width",
    VERTICAL: "height",
};

const AXIS = {
    HORIZONTAL: "x",
    VERTICAL: "y",
};

const TICKOFFSET = 4;
const SNAP_DURATION = 500;
const HANDLE_RADIUS = 10;

/**
 * Generic D3 based slider. Fixed to a discrete number of steps.
 * Emits an event every at the end of every slide event, with the selected step index.
 * The slider control will snap to the nearest valid step.
 */
export default class Slider extends Component {
    constructor(config) {
        super();
        this.parentElement = config.parentElement;
        this.data = config.data || [];
        this.numberOfVisibleTicks = config.numberOfVisibleTicks;

        this.length = config.length || 0;
        this.width = config.width || 0;
        this.position = config.position || { x: 0, y: 0 };

        this.orientation = config.orientation || ORIENTATION.HORIZONTAL;
        this.dimension = DIMENSION[this.orientation];
        this.axis = AXIS[this.orientation];
        this.selectedIndex = config.selectedIndex || 0;
        this.hideCurrentTick = config.hideCurrentTick || false;

        if (this.orientation === ORIENTATION.HORIZONTAL) {
            this.currentValuePosition =
                config.currentValuePosition || TICKPOSITION.TOP;
            this.ticksPosition = config.ticksPosition || TICKPOSITION.BOTTOM;
        } else {
            this.currentValuePosition =
                config.currentValuePosition || TICKPOSITION.LEFT;
            this.ticksPosition = config.ticksPosition || TICKPOSITION.RIGHT;
        }
    }

    render() {
        this.init();

        this.renderContainer();
        this.renderLine();
        this.renderTicks();

        if (!this.hideCurrentTick) {
            this.renderCurrentTick();
        }
        this.renderHandle();
    }

    init() {
        this.scale = d3
            .scaleLinear()
            .domain([0, this.data.length - 1])
            .range([0, this.length])
            .clamp(true);
    }

    renderContainer() {
        this.container = this.parentElement
            .append("g")
            .attr("class", "slider")
            .attr(
                "transform",
                `translate(${this.position.x}, ${this.position.y})`
            );
    }

    renderLine() {
        this.container
            .append("line")
            .attr("class", "slider")
            .attr(`${this.axis}1`, this.scale.range()[0])
            .attr(`${this.axis}2`, this.scale.range()[1])
            .select(function () {
                return this.parentNode.appendChild(this.cloneNode(true));
            })
            .attr("class", "slider-inset")
            .select(function () {
                return this.parentNode.appendChild(this.cloneNode(true));
            })
            .attr("class", "slider-overlay")
            .call(
                d3
                    .drag()
                    .on("start.interrupt", () => this.container.interrupt())
                    .on("start drag", () => this.slideMove(d3.event[this.axis]))
                    .on("end", () => this.slideEnd(d3.event[this.axis]))
            );
    }

    slideMove(pos) {
        // Use d3's clamp to avoid going outside range
        const clamp_pos = this.scale(this.scale.invert(pos));
        this.bar.attr(`c${this.axis}`, clamp_pos);

        const index = Math.round(this.scale.invert(pos));
        if (index !== this.selectedIndex) {
            this.selectedIndex = index;
            this.emit("change", this.selectedIndex);
        }

        this.container
            .select(".currentTick")
            .text(this.data[this.selectedIndex])
            .attr(this.axis, clamp_pos);
    }

    slideEnd(pos) {
        // Use d3's clamp to avoid going outside range
        const clamp_pos = this.scale(this.scale.invert(pos));
        const finalPosition = this.scale(
            Math.round(this.scale.invert(clamp_pos))
        );

        this.bar
            .transition()
            .duration(SNAP_DURATION)
            .attr(`c${this.axis}`, finalPosition);

        this.container
            .select(".currentTick")
            .transition()
            .duration(SNAP_DURATION)
            .attr(this.axis, finalPosition);

        this.emit("end", this.selectedIndex);
    }

    renderTicks() {
        const tickProp = this._calculateTickProperties(this.ticksPosition);
        this.container
            .append("g")
            .classed("ticks", true)
            .attr("transform", tickProp.transform)
            .selectAll("text")
            .data(this.scale.ticks(this.numberOfVisibleTicks))
            .enter()
            .append("text")
            .attr(this.axis, (d) => this.scale(d))
            .attr("text-anchor", tickProp["text-anchor"])
            .attr("dominant-baseline", tickProp["dominant-baseline"])
            .text((d) => this.data[d]);
    }

    renderCurrentTick() {
        const tickProp = this._calculateTickProperties(
            this.currentValuePosition
        );
        this.container
            .append("g")
            .append("text")
            .classed("ticks", true)
            .classed("currentTick", true)
            .attr("transform", tickProp.transform)
            .attr("text-anchor", tickProp["text-anchor"])
            .attr("dominant-baseline", tickProp["dominant-baseline"])
            .text(this.data[this.selectedIndex])
            .attr(this.axis, this.scale(this.selectedIndex));
    }

    _calculateTickProperties(position) {
        if (
            this.orientation === ORIENTATION.HORIZONTAL &&
            position === TICKPOSITION.TOP
        ) {
            return {
                transform: `translate(0,-${HANDLE_RADIUS / 2 + TICKOFFSET})`,
                "text-anchor": "middle",
                "dominant-baseline": "text-after-edge",
            };
        }
        if (
            this.orientation === ORIENTATION.HORIZONTAL &&
            position === TICKPOSITION.BOTTOM
        ) {
            return {
                transform: `translate(0,${HANDLE_RADIUS / 2 + TICKOFFSET})`,
                "text-anchor": "middle",
                "dominant-baseline": "text-before-edge",
            };
        }
        if (
            this.orientation === ORIENTATION.VERTICAL &&
            position === TICKPOSITION.LEFT
        ) {
            return {
                transform: `translate(-${HANDLE_RADIUS / 2 + TICKOFFSET}, 0)`,
                "text-anchor": "end",
                "dominant-baseline": "central",
            };
        }
        if (
            this.orientation === ORIENTATION.VERTICAL &&
            position === TICKPOSITION.RIGHT
        ) {
            return {
                transform: `translate(${HANDLE_RADIUS / 2 + TICKOFFSET}, 0)`,
                "text-anchor": "start",
                "dominant-baseline": "central",
            };
        }

        throw new Error(
            `Not implemented pair of orientation (${this.orientation}) and tick position (${position})`
        );
    }

    renderHandle() {
        this.bar = this.container
            .insert("circle", ".slider-overlay")
            .attr("class", "handle")
            .attr("r", HANDLE_RADIUS)
            .attr(`c${this.axis}`, this.scale(this.selectedIndex));
    }

    setData(data) {
        this.data = data;
        this.update();
    }

    update() {
        this.scale = d3
            .scaleLinear()
            .domain([0, this.data.length - 1])
            .range([0, this.length])
            .clamp(true);

        this.container.selectAll(".ticks").remove();

        this.renderTicks();
        if (!this.hideCurrentTick) {
            this.renderCurrentTick();
        }

        this.slideEnd(this.selectedIndex);
    }
}
