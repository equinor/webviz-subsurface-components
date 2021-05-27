/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

/* eslint-disable no-magic-numbers */
import * as d3 from "d3";
import Map2D from "./map2d";
import FlowAnimation from "./flow_animation";
import { Cell } from "./cell";
import Grid from "./grid";
import Field from "./field";
import ParticleGenerator from "./particle_generator";

export default class FlowMap extends Map2D {
    constructor({ canvasSelector, layers, ...rest }) {
        super(Object.assign(rest, { layers }));
        if (typeof canvasSelector === "string") {
            this._canvas = d3
                .select(canvasSelector)
                .attr("width", this.width)
                .attr("height", this.height);

            this._canvasNode = this._canvas.node();
        }

        this._setNormalizedFlux();

        this._setLayer(0);
        this._flowAnimation = new FlowAnimation(
            this._canvasNode,
            0,
            1,
            this._particleGenerator,
            1500,
            this.kInit
        );
    }

    _setNormalizedFlux() {
        const self = this;
        const maxNormalSpeedPerLayer = [];
        this.layers.forEach((_, i) => {
            const cells = self._createCells(i);
            const maxNormalSpeeds = [];
            cells.forEach((cell) => {
                maxNormalSpeeds.push(cell.maxNormalSpeed);
            });
            maxNormalSpeedPerLayer.push(Math.max(...maxNormalSpeeds));
        });

        const scale = 1.0 / Math.max(...maxNormalSpeedPerLayer);
        this.layers.forEach((layer_cells) => {
            layer_cells.forEach((cell) => {
                cell["NORMFLOWI-"] = scale * cell["FLOWI-"];
                cell["NORMFLOWJ-"] = scale * cell["FLOWJ-"];
                cell["NORMFLOWI+"] = scale * cell["FLOWI+"];
                cell["NORMFLOWJ+"] = scale * cell["FLOWJ+"];
            });
        });
    }

    _createCells(i) {
        const cells = [];
        const self = this;
        this.layers[i].forEach((cell) => {
            cells.push(
                new Cell(
                    cell.points.map(([x, y]) => [x - self.xMin, self.yMax - y]),
                    cell.i,
                    cell.j,
                    cell["NORMFLOWI-"] || cell["FLOWI-"],
                    cell["NORMFLOWJ-"] || cell["FLOWJ-"],
                    cell["NORMFLOWI+"] || cell["FLOWI+"],
                    cell["NORMFLOWJ+"] || cell["FLOWJ+"]
                )
            );
        });

        return cells;
    }

    _setLayer(i) {
        const grid = new Grid(this._createCells(i));
        const field = new Field(grid);
        this._particleGenerator = new ParticleGenerator(field);
    }

    init() {
        super.init();

        const self = this;
        this.on("zoom", (t) => {
            self._flowAnimation.clear();
            self._flowAnimation.setTransform(
                t.x,
                t.y,
                t.k,
                this.kInit,
                t.angle,
                [(t.k * this.map.mapWidth) / 2, (t.k * this.map.mapHeight) / 2]
            );
        });
        this.on("rotate", (t) => {
            self._flowAnimation.clear();
            self._flowAnimation.setTransform(
                t.x,
                t.y,
                t.k,
                this.kInit,
                t.angle,
                [(t.k * this.map.mapWidth) / 2, (t.k * this.map.mapHeight) / 2]
            );
        });
        if (this.layerSlider) {
            this.layerSlider.on("change", (value) => {
                self._setLayer(value);
                self._flowAnimation.clear();
                self._flowAnimation.particleGenerator = self._particleGenerator;
            });
        }
        this._flowAnimation.setTransform(
            0,
            0,
            this.kInit,
            this.kInit,
            0,
            [0, 0]
        );
        this._flowAnimation.start();
    }

    initResize() {
        super.initResize();

        const resizeCanvas = () => {
            this._canvas.attr("width", this.width);
            this._flowAnimation.clear();

            const t = this.map.mapTransform;
            this._flowAnimation.setTransform(
                t.x,
                t.y,
                t.k,
                this.kInit,
                t.angle,
                [(t.k * this.map.mapWidth) / 2, (t.k * this.map.mapHeight) / 2]
            );
        };

        window.addEventListener("resize", resizeCanvas);
    }
}
