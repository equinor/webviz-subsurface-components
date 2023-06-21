/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

/* eslint-disable no-undefined */
import { Vector } from "./linear_algebra";
import { outsideUnitSquare } from "./cell";

/**
 * A velocity Field over a given Grid.
 *
 * @param
 */
export default class Field {
    /**
     * Constructor
     * @param {Grid} grid - The grid of cells
     */
    constructor(grid) {
        this._grid = grid;
    }

    get grid() {
        return this._grid;
    }

    /**
     * Given normalized coordinates. If the coordinates
     * are outside the unit square, returns the new cell the coordinates
     * belong to.
     * @param {number} x - The normalized x-coordinate.
     * @param {number} y - The normalized y-coordinate.
     * @returns {[Cell, Vector]} - The new cell of the position, along
     *      with normalized position with overflow subtracted. The position is
     *      *not* the correct normal coordinates in the new cell as the
     *      quadrilateral transformation is not linear.
     */
    calculateNewCell(position, cell) {
        let [x, y] = position;
        let { i, j } = cell;
        while (outsideUnitSquare(x, y)) {
            if (x <= 0) {
                i -= 1;
                x += 1;
            } else if (x >= 1) {
                i += 1;
                x -= 1;
            }

            if (y <= 0) {
                j -= 1;
                y += 1;
            } else if (y >= 1) {
                j += 1;
                y -= 1;
            }
        }
        return [this._grid.getCell(i, j), new Vector(x, y)];
    }

    /**
     * Simulates the movement of a massless particle
     * at given normalized position, in a cell for given
     * time. Returns a new normalized position and cell.
     * @param {Cell} cell - The cell to simulate a particle in.
     * @param {Vector} normalPosition - The position of the particle
     * @param {[Cell, Vector]} - The new cell and position of the
     *      particle.
     */
    simulate(cell, normalPosition) {
        const normalVelocity = cell.normalVelocity(normalPosition);

        const newNormalPosition = normalPosition.sum(normalVelocity);

        const [newCell, newCellPosition] = this.calculateNewCell(
            newNormalPosition,
            cell
        );
        if (!newCell) {
            return [undefined, undefined];
        }
        return [newCell, newCellPosition];
    }
}
