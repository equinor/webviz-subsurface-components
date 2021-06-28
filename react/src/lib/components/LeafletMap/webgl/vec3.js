/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

/**
 * !NB - This file implements only the necessary functions of gl-matrix's Vec3
 * instead of installing the entire dependency. If the demand of gl-matrix functionality
 * increases, one might transition over to the gl-matrix package instead.
 */

/**
 * @typedef {Array<Number>} Vec3
 */

/**
 * @returns {Vec3}
 */
export const create = (x = 0, y = 0, z = 0) => {
    return [x, y, z];
};

/**
 * @param {Vec} out
 * @param {Vec} vec
 * @param {Vec} vec2
 * @returns {Vec}
 */
export const add = (out, vec, vec2) => {
    out[0] = vec[0] + vec2[0];
    out[1] = vec[1] + vec2[1];
    out[2] = vec[2] + vec2[2];
    return out;
};

/**
 * @param {Vec3} out
 * @param {Vec3} vec
 * @param {Number} scale
 * @returns {Vec3}
 */
export const scale = (out, vec, scale) => {
    out[0] = vec[0] * scale;
    out[1] = vec[1] * scale;
    out[2] = vec[2] * scale;
    return out;
};

/**
 *
 * @param {Vec} out
 * @param {Vec} vec
 * @returns {Vec}
 */
export const normalize = (out, vec) => {
    let x = vec[0];
    let y = vec[1];
    let z = vec[2];

    let length = x * x + y * y + z * z;
    if (length > 0) {
        length = 1 / Math.sqrt(length);
    }

    out[0] = vec[0] * length;
    out[1] = vec[1] * length;
    out[2] = vec[2] * length;
    return out;
};

/**
 *
 * @param {Vec} out
 * @param {Number} scale
 * @returns {Vec}
 */
export const random = (out, scale) => {
    scale = scale || 1.0;

    let r = Math.random() * 2.0 * Math.PI;
    let z = Math.random() * 2.0 - 1.0;
    let zScale = Math.sqrt(1.0 - z * z) * scale;

    out[0] = Math.cos(r) * zScale;
    out[1] = Math.sin(r) * zScale;
    out[2] = z * scale;
    return out;
};

export default {
    create,
    add,
    scale,
    normalize,
    random,
};
