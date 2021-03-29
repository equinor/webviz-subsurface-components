/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

/* eslint-disable no-magic-numbers */
import { Vector, Matrix } from "./linear_algebra";

const oneVector = new Vector(1, 1);

export function outsideUnitSquare(x, y) {
    return x < 0 || x > 1 || y < 0 || y > 1;
}

/**
 * Represents one Cell in a grid with flux of fluid/gas
 * going in/out of it. Internally the cell uses normalized
 * quadrilateral coordinates, which it can be convert to
 * non-normalized coordinates, but *not* vice-versa.
 * @param {[[number]]} corners - List of x/y coordinates for
 *      the corners of the cell.
 * @param {number} i - horizontal index of the cell in the grid.
 * @param {number} j - vertical index of the cell in the grid.
 * @param {number} fluxX0 - Flux going into the cell from the left.
 * @param {number} fluxY0 - Flux going into the cell from the bottom.
 * @param {number} fluxX1 - Flux going out of the cell from the right.
 * @param {number} fluxY1 - Flux going out of the cell from the top.
 */
export class Cell {
    constructor(corners, i, j, fluxX0, fluxY0, fluxX1, fluxY1) {
        this._corners = new Matrix(corners);
        this._i = i;
        this._j = j;
        this._flux = new Matrix([
            [fluxX0, fluxY0],
            [fluxX1, fluxY1],
        ]);
        this._leftFlux = this._flux.row(0);
        this._rightFlux = this._flux.row(1);
    }

    get corners() {
        return this._corners;
    }

    get i() {
        return this._i;
    }

    set i(val) {
        this._i = val;
    }

    get j() {
        return this._j;
    }

    set j(val) {
        this._j = val;
    }

    get flux() {
        return this._flux;
    }

    /**
     * @returns {float} - maximum speed (in normal coordinates) within the cell
     */
    get maxNormalSpeed() {
        const normalCornerSpeeds = [];
        const corners = [
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 1],
        ];
        corners.forEach((corner) => {
            const position = new Vector(corner[0], corner[1]);
            const speed = this.normalVelocity(position).magnitude;
            normalCornerSpeeds.push(speed);
        });
        return Math.max(...normalCornerSpeeds.map((x) => x || 0));
    }

    /**
     * @returns - the jacobian of the transformation to normalized coordinates at
     *  the given coordinate.
     * @param x - normalized (quadrilateral) x-coordinate.
     * @param y - normalized (quadrilateral) y-coordinate.
     */
    /* eslint-disable space-unary-ops */
    /* eslint-disable no-multi-spaces */
    jacobian([x, y]) {
        if (x > 1 || x < 0 || y > 1 || y < 0) {
            throw Error(
                `asked for jacobian of values outside unit square: ${x}, ${y}`
            );
        }
        const shapeDerivates = new Matrix(
            [
                [y - 1, 1 - y, y, -y],
                [x - 1, -x, x, 1 - x],
            ],
            true,
            2,
            4
        );
        return shapeDerivates.multiply(this._corners);
    }
    /* eslint-enable space-unary-ops */
    /* eslint-enable no-multi-spaces */

    /**
     * Transforms normal coordinates to non-normalized coordinates.
     * @param {number} x - normal (quadrilateral) x-coordinate.
     * @param {number} y - normal (quadrilateral) y-coordinate.
     * @returns {Vector} - non-normalized coordinates
     */
    denormalize([x, y]) {
        if (x > 1 || x < 0 || y > 1 || y < 0) {
            throw Error("asked to normalize values outside unit square");
        }
        const shapeValues = new Vector(
            (1 - x) * (1 - y),
            x * (1 - y),
            x * y,
            (1 - x) * y
        );
        return this._corners.vectorMultiply(shapeValues);
    }

    /**
     * @param {Vector} position - Normal position.
     * @returns {Vector} - velocity of flux, in normal coordinates.
     */
    normalVelocity(position) {
        const leftWeight = oneVector.minus(position);
        const rightWeight = position;

        const leftVelocity = this._leftFlux.multiply(leftWeight);
        const rightVelocity = this._rightFlux.multiply(rightWeight);

        const determinant = this.jacobian(position).determinant();

        return leftVelocity.sum(rightVelocity).scalarMultiply(1 / determinant);
    }
}
