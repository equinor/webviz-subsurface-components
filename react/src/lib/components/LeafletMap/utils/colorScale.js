/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

/**
 * @typedef {Array<Number>} Color - [r, g, b, a]
 */

/**
 * @typedef {Object} ColorScaleConfig
 * @property {Boolean|undefined} prefixZeroAlpha - Decides if the first color should have an alpha equals to 0.
 * @property {Boolean|undefined} suffixZeroAlpha - Decides if the last color should have an alpha equals to 0.
 * @property {String} scaleType
 * @property {Number} cutPointMin
 * @property {Number} cutPointMax
 * @description A set of default configuration values for building colormaps.
 */
export const DEFAULT_COLORSCALE_CONFIG = {
    prefixZeroAlpha: false,
    suffixZeroAlpha: false,
    scaleType: "linear",
};

/**
 * interpolateByFactor interpolates a color towards another color by a given factor.
 * @param {Color} color1 Array of RGB values
 * @param {Color} color2 Array of RGB values
 * @param {Number} factor - Between 0 and 1
 * @returns {Color}
 */
export const interpolateByFactor = (color1, color2, factor) => {
    const result = color1.slice();
    for (let i = 0; i < result.length; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
};

/**
 * interpolateColors linearly interpolates a list of colors with given amount of steps.
 * @param {Array<Color>} colors - The colors that should be interpolated
 * @param {Number} steps - An unsigned integer. Default is 256.
 * @param {ColorScaleConfig} config
 * @returns {Array<Color>} The result of the interpolated colors in the form of an array of colors.
 */
export const interpolateColors = (colors, steps = 256) => {
    const stepsBetweenColor = Math.floor(steps / (colors.length - 1));
    // const stepFactor = 1 / (stepsBetweenColor - 1);

    // Make sure we get an exact length equal to "steps". If we have less steps, add
    // more steps by expanding from the center.
    const stepsBetweenColors = new Array(colors.length - 1).fill(
        stepsBetweenColor
    );
    let sum = stepsBetweenColors.reduce((acc, val) => acc + val, 0);
    let curIndex = Math.floor(stepsBetweenColors.length / 2);
    let dir = -1;
    let jumpSize = 1;
    while (sum < steps) {
        stepsBetweenColors[curIndex]++;
        sum++;
        curIndex += dir * jumpSize;
        dir *= -1;
        jumpSize++;
        if (curIndex < 0 || curIndex >= stepsBetweenColors.length) {
            curIndex = Math.floor(stepsBetweenColors.length / 2);
        }
    }

    // Interpolate between all the colors
    const interpolatedColors = [];
    for (let col = 0; col < colors.length - 1; col++) {
        const stepFactor = 1 / (stepsBetweenColors[col] - 1);
        for (let i = 0; i < stepsBetweenColors[col]; i++) {
            interpolatedColors.push(
                interpolateByFactor(
                    colors[col],
                    colors[col + 1],
                    stepFactor * i
                )
            );
        }
    }

    return interpolatedColors;
};

/**
 * buildColormap takes a set of colors and creates a N x 1 image with those colors.
 * @param {Array<Color>} colors - The colors to base the image on.
 * @param {ColorScaleConfig} config
 * @returns {String} A dataURL-string.
 */
export const buildColormapWithCfg = (colors, config = {}) => {
    if (config.prefixZeroAlpha && colors.length > 0) {
        colors[0][3] = 0;
    }
    if (config.suffixZeroAlpha && colors.length > 0) {
        colors[colors.length - 1][3] = 0;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set pixel by pixel with fillStyle and fillRect. An alternative is to use ImageData, but according to
    // this post - fillRect was more performant:
    // https://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas
    /*     for(let i = 0; i < size; i++) {
        ctx.fillStyle = `rgba(${colors[i][0]}, ${colors[i][1]}, ${colors[i][2]}, ${1})`
        ctx.fillRect(i, 0, 1, 1);
    } */

    const width = config.width || 256;
    const imageData = ctx.createImageData(width, 1);
    canvas.width = width;
    canvas.height = 1;
    for (let i = 0; i < colors.length; i++) {
        imageData.data[i * 4 + 0] = colors[i][0];
        imageData.data[i * 4 + 1] = colors[i][1];
        imageData.data[i * 4 + 2] = colors[i][2];
        imageData.data[i * 4 + 3] = colors[i].length === 4 ? colors[i][3] : 255;
    }
    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL("image/png");
};

/**
 *
 * @param {String|Object|Array<String>} colorScale
 */
export const buildColormap = (colorScale) => {
    if (typeof colorScale === "string") {
        // The given colorScale is already a base64 image
        return colorScale;
    } else if (Array.isArray(colorScale)) {
        // The given colorScale is an array of hexColors
        return colorScale.length > 0
            ? buildColormapFromHexColors(colorScale, DEFAULT_COLORSCALE_CONFIG)
            : null;
    } else if (typeof colorScale === "object") {
        // The given colorScale is an object
        /**
         * @type {ColorScaleConfig}
         */
        const colorScaleCfg = Object.assign(
            {},
            DEFAULT_COLORSCALE_CONFIG,
            colorScale || {}
        );
        const colors = colorScaleCfg.colors;
        return colors && colors.length > 0
            ? buildColormapFromHexColors(colors, colorScaleCfg)
            : null;
    } else {
        return null;
    }
};

/**
 * buildColormapFromHexColors builds a N x 1 colormap image based on an array of colors in hex-format.
 * @param {Array<String>} hexColors
 * @returns {String} A dataURL-string.
 */
export const buildColormapFromHexColors = (hexColors, config = {}) => {
    const width = config.width || 256;
    const colors = hexColors.map(hexToRGB);
    const interpolated = interpolateColors(colors, width, config);
    return buildColormapWithCfg(interpolated, config);
};

/**
 * hexToRGB converts a color from hex format to rgb-format.
 * @param {String} hex - A color in hex format
 *
 * @example
 * const [r, g, b, a] = hexToRGB("#ffeeaaff")
 */
export const hexToRGB = (hex) => {
    const hasAlpha = hex.length === 9;
    const start = hasAlpha ? 24 : 16;
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> start) & 255;
    const g = (bigint >> (start - 8)) & 255;
    const b = (bigint >> (start - 16)) & 255;
    const a = hasAlpha ? (bigint >> (start - 24)) & 255 : 255;
    return [r, g, b, a];
};
