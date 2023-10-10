/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

/* eslint-disable no-undefined */
function isIterable(object) {
    return typeof object[Symbol.iterator] === "function";
}

/**
 * A vector of numerical values.
 * Vectors are iterable and immutable.
 */
export class Vector {
    /**
     * Constructor
     * Can be instantiated either with an array of floats or
     * with the floats given directly as arguments:
     *
     *     new Vector([1.0, 2.0]) === new Vector(1.0, 2.0)
     *
     * @param {[number]} data - An array-like of numerical values.
     */
    constructor(...args) {
        if (args.length === 0) {
            this._initEmpty();
        } else if (args.length === 1 && args[0] instanceof Float64Array) {
            // One argument which is a Float64Array
            this._initArray(args[0], args[0].length);
        } else if (args.length === 1 && isIterable(args[0])) {
            // One argument which is an iterable
            this._initArray(Float64Array.from(args[0]), args[0].length);
        } else {
            // arguments contain floats which are the elements
            // of the vector
            this._initArray(new Float64Array(args), args.length);
        }
    }

    /**
     * Initializes the vector as being empty;
     */
    _initEmpty() {
        this._length = 0;
    }

    /**
     * Initializes the vector with the given
     * array of elements and length.
     */
    _initArray(array, length) {
        this._data = array;
        this._length = length;
    }

    [Symbol.iterator]() {
        let nextIndex = 0;
        const self = this;

        return {
            next() {
                if (nextIndex < self._data.length) {
                    const index = nextIndex;
                    nextIndex += 1;
                    return { value: self._data[index], done: false };
                }
                return { done: true };
            },
        };
    }

    values() {
        return Array.from(this._data);
    }

    /**
     * @type {number}
     * Length of the vector.
     */
    get length() {
        return this._length;
    }

    /**
     * @type {float}
     * Magnitude of the vector (L2 norm)
     */
    get magnitude() {
        return Math.sqrt(this._data.map((x) => x ** 2).reduce((a, b) => a + b));
    }

    /**
     * @param {number} i - Index of value to get.
     * @returns {number} The value at the given index.
     */
    value(i) {
        return this._data[i];
    }

    /**
     * @param {Vector} vector - A vector to multiply with.
     * @returns {Vector} The result of multiplying this with given
     *      vector, element-wise.
     */
    multiply(vector) {
        return this.transform((e, i) => e * vector.value(i));
    }

    /**
     * @param {number} scalar - A scalar to multiply all elements with.
     * @returns {Vector} The result of multiplying all elements in the vector
     *     with the given scalar.
     */
    scalarMultiply(scalar) {
        return this.transform((e) => e * scalar);
    }

    /**
     * @param {Vector} vector - A vector to sum with.
     * @returns {Vector} The result of summing this with given
     *      vector, element-wise.
     */
    sum(vector) {
        return this.transform((e, i) => e + vector.value(i));
    }

    /**
     * @param {Vector} vector - A vector to subtract with.
     * @returns {Vector} The result of subtracting this with given
     *      vector, element-wise.
     */
    minus(vector) {
        return this.transform((e, i) => e - vector.value(i));
    }

    /**
     * @param { function(float64, index) } - function to apply
     *      to every value.
     * @returns {Vector} - Vector which is the result of
     *      applying the given function to each element.
     */
    transform(f) {
        const newData = new Float64Array(this._length);
        for (let i = 0; i < this._length; i += 1) {
            newData[i] = f(this._data[i], i);
        }
        const result = new Vector();
        result._data = newData;
        result._length = this._length;
        return result;
    }
}

/**
 * A matrix of numerical values. Matrix are iterable and immutable.
 * Iterating of the Matrix gives you vectors of rows.
 */
export class Matrix {
    /**
     * Constructor
     * @param {[[number]]} data - An  array-like of rows.
     *      Each row is an array-like of numerical values.
     * @param {boolean} [unsafe=false] -
     *      Perform an unchecked instantiation of the Matrix, the data will not
     *      be copied, possibly breaking immutability and length/rowLength
     *      will be taken *unchecked* as parameters. Only provided for
     *      performance reasons.
     * @param {number} [length=auto] - Length of data, only
     *      used if instantiated unsafe.
     * @param {number} [rowLength=auto] - Length of rows in
     *      data, only used if instantiated unsafe.
     */
    constructor(
        data,
        unsafe = false,
        length = undefined,
        rowLength = undefined
    ) {
        if (unsafe) {
            this._data = data;
            this._length = length;
            this._rowLength = rowLength;
        } else if (data.length > 0) {
            this._data = data.map((d) => Float64Array.from(d));
            this._length = data.length;
            this._rowLength = this._data[0].length;
        } else {
            this._data = [];
            this._rowLength = 0;
            this._length = 0;
        }
    }

    /**
     * @returns The identity matrix of size n.
     */
    static identity(n) {
        const identMat = new Array(n);
        for (let i = 0; i < n; i += 1) {
            identMat[i] = new Float64Array(n);
            identMat[i].fill(0);
            identMat[i][i] = 1;
        }
        return new Matrix(identMat);
    }

    values() {
        return this._data.reduce((a, b) => a.concat(Array.from(b)), []);
    }

    /**
     * @type {number}
     * Number of rows
     */
    get length() {
        return this._length;
    }

    /**
     * @type {number}
     * Length of each row.
     */
    get rowLength() {
        return this._rowLength;
    }

    [Symbol.iterator]() {
        let nextIndex = 0;
        const self = this;

        return {
            next() {
                if (nextIndex < self._data.length) {
                    const index = nextIndex;
                    nextIndex += 1;
                    const result = new Vector();
                    result._data = self._data[index];
                    result._length = self._rowLength;
                    return {
                        value: result,
                        done: false,
                    };
                }
                return { done: true };
            },
        };
    }

    /**
     * @param {number} i - Index of a column. Must
     *     be between 0 and rowLength.
     * @returns {Vector} The ith column.
     */
    column(i) {
        return new Vector(this._data.map((d) => d[i]));
    }

    /**
     * @param {number} i - Index of a row. Must be
     *   between 0 and length.
     * @returns {Vector} The ith row.
     */
    row(i) {
        const result = new Vector();
        result._data = this._data[i];
        result._length = this._rowLength;
        return result;
    }

    /**
     * @param {number} i - Index of a row. Must be
     *   between 0 and length.
     * @param {number} j - Index of a column. Must
     *     be between 0 and rowLength.
     * @returns {number} The value at the given position.
     */
    value(i, j) {
        return this._data[i][j];
    }

    /**
     * @returns {number} The determinant of the matrix.
     */
    determinant() {
        if (this.length === 0) {
            return 1;
        }
        if (this.length === 1) {
            return this.value(0, 0);
        }
        if (this.length === 2) {
            return (
                this.value(0, 0) * this.value(1, 1) -
                this.value(1, 0) * this.value(0, 1)
            );
        }
        throw Error("Unimplemented determinant of higher dimensions");
    }

    /**
     * @return {Matrix} The transpose of the matrix
     */
    transpose() {
        const newdata = Array(this.rowLength);
        for (let i = 0; i < this.length; i += 1) {
            for (let j = 0; j < this.rowLength; j += 1) {
                if (!newdata[j]) {
                    newdata[j] = Array(this.length);
                }
                newdata[j][i] = this._data[i][j];
            }
        }
        return new Matrix(newdata, true, this._rowLength, this.length);
    }

    /**
     * @param {Matrix} matrix2 - A matrix to multiply with
     * @returns {Matrix} The matrix product of this and matrix2.
     */
    multiply(matrix2) {
        if (matrix2.length === 0) {
            return new Matrix([]);
        }
        if (this.length === 0) {
            return new Matrix([]);
        }
        if (this.rowLength !== matrix2.length) {
            const m1 = `${this.length}x${this.rowLength}`;
            const m2 = `${matrix2.length}x${matrix2.rowLength}`;
            throw Error(`Cannot multiply matrices of size ${m1} vs ${m2}`);
        }

        const multmatrix = Array(this.length);

        for (let i = 0; i < this.length; i += 1) {
            multmatrix[i] = new Float64Array(matrix2.rowLength);
            for (let j = 0; j < matrix2.rowLength; j += 1) {
                multmatrix[i][j] = 0;
                for (let k = 0; k < this.rowLength; k += 1) {
                    multmatrix[i][j] += this.value(i, k) * matrix2.value(k, j);
                }
            }
        }

        return new Matrix(multmatrix, true, this.length, this.rowLength);
    }

    /**
     * @param {number} scalar - A scalar to multiply all elements with.
     * @returns {Matrix} The result of multiplying all elements in the matrix
     *     with the given scalar.
     */
    scalarMultiply(scalar) {
        return new Matrix(
            this._data.map((d) => d.map((e) => scalar * e)),
            true,
            this._length,
            this._rowLength
        );
    }

    /**
     * @param {Vector} vector - A vector to multiply with.
     * @returns {Matrix} The result of multiplying the matrix with the vector.
     */
    vectorMultiply(vector) {
        if (this.length === 0) {
            return [];
        }
        if (this.length !== vector.length) {
            const m = `${this.length}x${this.rowLength}`;
            const v = `${vector.length}`;
            throw Error(`Cannot vector multiply matrix of size ${m} vs ${v}`);
        }

        const multvector = new Float64Array(this.rowLength);
        for (let j = 0; j < this.rowLength; j += 1) {
            multvector[j] = 0;
            for (let i = 0; i < vector.length; i += 1) {
                multvector[j] += this.value(i, j) * vector.value(i);
            }
        }
        const result = new Vector();
        result._data = multvector;
        result._length = this.rowLength;
        return result;
    }
}

export function linearIndependent(vectors) {
    if (vectors.length === 0) {
        return true;
    }
    const len = vectors[0].length;
    const copyVectors = Array.from(vectors);
    const zeroArray = new Array(len);
    zeroArray.fill(0);
    while (copyVectors.length < len) {
        copyVectors.push(new Vector(zeroArray));
    }

    const mat = new Matrix(copyVectors);
    return mat.determinant() !== 0;
}

export function affineIndependent([v1, ...rest]) {
    return linearIndependent(rest.filter(Boolean).map((v2) => v2.minus(v1)));
}
