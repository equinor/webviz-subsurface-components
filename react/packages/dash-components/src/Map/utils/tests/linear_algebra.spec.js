/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import jsc from "jsverify";
import equal from "deep-equal";
import { Vector, Matrix } from "../linear_algebra";
import {
    arbitraryVector,
    arbitraryMatrix,
    arbitrarySquareMatrix,
} from "./arbitraries";

describe("Vector", () => {
    jsc.property(
        "construction is inverse with Array.from",
        jsc.array(jsc.number),
        (list) => equal(Array.from(new Vector(list)), list)
    );

    jsc.property(
        "value is consistent with input",
        jsc.array(jsc.nat),
        (arr) => {
            const vector = new Vector(arr);
            return arr.every((e, i) => vector.value(i) === e);
        }
    );

    jsc.property(
        "magnitude is calculated correctly",
        jsc.number,
        jsc.number,
        (_x, _y) => {
            const vector = new Vector(_x, _y);
            return Math.sqrt(_x * _x + _y * _y) === vector.magnitude;
        }
    );

    jsc.property(
        "multiply is mapping multiplication on values",
        jsc.array(jsc.nat),
        jsc.array(jsc.nat),
        (_arr1, _arr2) => {
            const arr1 = _arr1.slice(0, _arr2.length);
            const arr2 = _arr2.slice(0, _arr1.length);

            const vector1 = new Vector(arr1);
            const vector2 = new Vector(arr2);

            const multiplied = vector1.multiply(vector2);

            return arr1.every((e, i) => e * arr2[i] === multiplied.value(i));
        }
    );

    jsc.property(
        "scalar multiply is mapping multiplication on values",
        arbitraryVector,
        jsc.number,
        (vector, n) =>
            equal(
                Array.from(vector.scalarMultiply(n)),
                Array.from(vector).map((e) => e * n)
            )
    );

    jsc.property(
        "sum is mapping sum on values",
        jsc.array(jsc.nat),
        jsc.array(jsc.nat),
        (_arr1, _arr2) => {
            const arr1 = _arr1.slice(0, _arr2.length);
            const arr2 = _arr2.slice(0, _arr1.length);

            const vector1 = new Vector(arr1);
            const vector2 = new Vector(arr2);

            const summed = vector1.sum(vector2);

            return arr1.every((e, i) => e + arr2[i] === summed.value(i));
        }
    );

    jsc.property(
        "minus is mapping subtraction on values",
        jsc.array(jsc.nat),
        jsc.array(jsc.nat),
        (_arr1, _arr2) => {
            const arr1 = _arr1.slice(0, _arr2.length);
            const arr2 = _arr2.slice(0, _arr1.length);

            const vector1 = new Vector(arr1);
            const vector2 = new Vector(arr2);

            const summed = vector1.minus(vector2);

            return arr1.every((e, i) => e - arr2[i] === summed.value(i));
        }
    );
});

function matrixToArray(matrix) {
    return Array.from(matrix).map((d) => Array.from(d));
}

describe("Matrix", () => {
    jsc.property(
        "construction is inverse with mapping Array.from",
        arbitraryMatrix(),
        (mat) => {
            const list = matrixToArray(mat);
            return equal(matrixToArray(new Matrix(list)), list);
        }
    );

    jsc.property("Matrix gets size from input", arbitraryMatrix(), (mat) => {
        const list = matrixToArray(mat);
        const matrix = new Matrix(list);
        if (list.length > 0) {
            return (
                matrix.length === list.length &&
                matrix.rowLength === list[0].length
            );
        }
        return matrix.length === 0;
    });

    jsc.property(
        "Transpose has row and column size inverted",
        arbitraryMatrix(),
        (matrix) => {
            const trans = matrix.transpose();

            if (matrix.length > 0 && matrix.rowLength > 0) {
                return (
                    trans.length === matrix.rowLength &&
                    trans.rowLength === matrix.length
                );
            }
            return trans.length === 0;
        }
    );

    jsc.property(
        "Transpose inverts row and column",
        arbitraryMatrix(),
        (matrix) => {
            const trans = matrix.transpose();

            let ok = true;
            for (let i = 0; i < matrix.length; i += 1) {
                ok =
                    ok &&
                    equal(
                        Array.from(matrix.row(i)),
                        Array.from(trans.column(i))
                    );
            }
            return ok;
        }
    );

    jsc.property(
        "Determinant is invariant over transpose",
        arbitrarySquareMatrix(2, 2),
        (matrix) => matrix.determinant() === matrix.transpose().determinant()
    );
    jsc.property(
        "Multiplying with identity matrix is identity",
        arbitrarySquareMatrix(),
        (matrix) => {
            const identity = Matrix.identity(matrix.length);
            return equal(matrix.multiply(identity), matrix);
        }
    );

    jsc.property(
        "Determinant is a multiplicative map",
        arbitrarySquareMatrix(2, 2),
        arbitrarySquareMatrix(2, 2),
        (m1, m2) => {
            if (m1.length !== m2.length) {
                return true;
            }

            return (
                m1.multiply(m2).determinant() ===
                m1.determinant() * m2.determinant()
            );
        }
    );
});
