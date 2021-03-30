/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

/* eslint-disable react/require-render-return */
import * as d3 from "d3";
import Component from "./component";

export default class Map extends Component {
    static validate(config) {
        if (!config.parentElement) {
            throw new Error("Parent element not provided");
        }

        if (!config.coords) {
            throw new Error("Coords not provided");
        }

        if (!config.values) {
            throw new Error("Values not provided");
        }

        if (!config.colorScale) {
            throw new Error("Color scale not provided");
        }
    }

    constructor(config = {}) {
        super();

        this.constructor.validate(config);

        this.layer = 0;
        this.parentElement = config.parentElement;
        this.coords = config.coords;
        this.values = config.values;
        this.valMin = config.valMin;
        this.valMax = config.valMax;
        this.xMin = config.xMin;
        this.yMax = config.yMax;
        this.colorScale = config.colorScale;
        this.mapTransform = {
            x: 0,
            y: 0,
            k: 0,
            angle: 0,
        };
    }

    setTransform(transform) {
        this.mapTransform = transform;

        if (this.element) {
            this.element.attr("transform", this.getMapTransform());
        }
    }

    getMapTransform() {
        return (
            `translate(${this.mapTransform.x},${this.mapTransform.y})` +
            ` scale(${this.mapTransform.k})` +
            ` rotate(${this.mapTransform.angle}, ${this.mapWidth / 2},${
                this.mapHeight / 2
            })`
        );
    }

    setLayer(layer) {
        this.layer = layer;
        this.renderCells();
    }

    color(i) {
        return this.colorScale(
            (this.values[this.layer][i] - this.valMin) /
                (this.valMax - this.valMin)
        );
    }

    renderCells() {
        const self = this;

        this.map = this.element
            .selectAll("polygon")
            .data(this.coords[this.layer]);

        this.map
            .enter()
            .append("polygon")
            .merge(this.map)
            .attr("points", (d) =>
                d
                    .map(([x, y]) => [x - self.xMin, self.yMax - y].join(","))
                    .join(" ")
            )
            .attr("fill", (d, i) => self.color(i))
            .on("mousemove", function (d, i) {
                self.emit("mousemove", {
                    x: d3.mouse(this)[0],
                    y: d3.mouse(this)[1],
                    value: self.values[self.layer][i],
                });
            })
            .on("mouseleave", () => self.emit("mouseleave"));

        this.map.exit().remove();

        const node = this.element.node();

        if (typeof this.mapWidth === "undefined" && node) {
            this.mapWidth = node.getBoundingClientRect().width;
        }

        if (typeof this.mapHeight === "undefined" && node) {
            this.mapHeight = node.getBoundingClientRect().height;
        }

        this.element.attr("transform", this.getMapTransform());
    }

    renderContainer() {
        this.element = this.parentElement.append("g").attr("id", "g_map_cells");
    }

    render() {
        this.renderContainer();
        this.renderCells();
    }
}
