/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

/* eslint-disable no-magic-numbers */
export default class DistanceScale {
    constructor(config = {}) {
        this.validate(config);
    }

    validate(config) {
        if (!config.parentElement) {
            throw new Error("Parent element not provided");
        }

        if (typeof config.initialK === "undefined") {
            throw new Error("Initial K value not provided");
        }

        if (config.initialK <= 0) {
            throw new Error("Initial K cannot be 0 or undefined");
        }

        if (typeof config.origMeter2Px === "undefined") {
            throw new Error("origMeter2Px not provided");
        }

        this.parentElement = config.parentElement;

        if (config.initialPosition) {
            this.position = {
                x: config.initialPosition.x,
                y: config.initialPosition.y,
            };
        } else {
            this.position = {
                x: 0,
                y: 0,
            };
        }

        this.k = config.initialK;
        this.origMeter2Px = config.origMeter2Px;
    }

    render() {
        this.renderContainer();
        this.renderScale();
    }

    setK(k) {
        this.k = k;

        this.renderScale();
    }

    renderContainer() {
        this.element = this.parentElement
            .append("g")
            .attr("id", "g_scale")
            .attr(
                "transform",
                `translate(${this.position.x},${this.position.y})`
            );
    }

    // This functions plot the metric scale shown. It tries
    // to automatically decide on the optimal number of subscales (and length of them)
    // such that each subscale corresponds to an integer number of km.
    renderScale() {
        // px = meter * meter2px;
        const meter2px = this.k * this.origMeter2Px;

        const gScaleMaxWidth = 400;

        let numberScales = 0;
        let distScale = null;
        let unit = null;
        let remainder = 1.0;
        let distPerScale = 1;

        if (1000 * meter2px < gScaleMaxWidth) {
            distScale = 1000;
            unit = ["", " km"];
        } else if (100 * meter2px < gScaleMaxWidth) {
            distScale = 100;
            unit = ["00", " m"];
        } else {
            distScale = 1;
            unit = ["", " m"];
        }
        for (let i = 5; i > 0; i -= 1) {
            const temp = gScaleMaxWidth / meter2px / i / distScale;
            if (temp % 1 < remainder && Math.floor(temp) > 0) {
                distPerScale = Math.floor(temp);
                remainder = temp % 1;
                numberScales = i;
            }
        }

        const width = distPerScale * distScale * meter2px;

        const positions = [];
        const colors = [];
        for (let i = 0; i < numberScales; i += 1) {
            positions.push(i * width);
            if (i % 2 === 0) {
                colors.push("black");
            } else {
                colors.push("white");
            }
        }

        this.element.selectAll("rect").remove();
        this.element
            .selectAll("rect")
            .data(positions)
            .enter()
            .append("rect")
            .attr("y", "0px")
            .attr("height", "10px")
            .attr("stroke", "#bbbbbb")
            .attr("fill", (d, i) => colors[i])
            .attr("fill-opacity", "0.6")
            .attr("x", (d) => `${d}px`)
            .attr("width", `${width}px`);

        this.element.selectAll("text").remove();
        this.element
            .append("text")
            .attr("x", 0)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .text(`0${unit[1]}`);
        this.element
            .append("text")
            .attr("x", width * numberScales)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .text(distPerScale * numberScales + unit[0] + unit[1]);
    }
}
