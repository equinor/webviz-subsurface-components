/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import {
    drawRawImage,
    drawWithColormap,
    drawWithHillShading,
    drawWithAdvancedHillShading,
    drawWithOnePassHillShading,
} from "./commands";

// Utils
import Utils from "../utils";

export default async (gl, canvas, image, colormap = null, config = {}) => {
    gl.getExtension("OES_texture_float");

    const imagesToLoad = [Utils.loadImage(image, config)];
    if (colormap) {
        imagesToLoad.push(Utils.loadImage(colormap, config));
    }

    let [loadedImage, loadedColorMap = null] = await Promise.all(
        imagesToLoad
    ).catch(console.error);

    // Select which draw command to draw
    const shader = config.shader || {};
    const colorScale = config.colorScale || {};

    const cutOffPoints = calcCutOffPoints(
        config.minvalue,
        config.maxvalue,
        (config.colorScale || {}).cutPointMin,
        (config.colorScale || {}).cutPointMax
    );

    if (shader.type == "onepass") {
        // The "onepass" shader doesn't need a colormap, it can also display the input image,
        // based on the shader's parameters.

        const minmaxValues = {
            minValue: config.minvalue,
            maxValue: config.maxvalue,
        };

        drawWithOnePassHillShading(gl, canvas, loadedImage, loadedColorMap, {
            ...minmaxValues,
            ...colorScale,
            ...shader,
            ...cutOffPoints,
        });
    } else {
        // [0,1] -> [0, 255]
        cutOffPoints.cutPointMin = Math.round(cutOffPoints.cutPointMin * 255);
        cutOffPoints.cutPointMax = Math.round(cutOffPoints.cutPointMax * 255);

        if (loadedColorMap) {
            switch (shader.type) {
                // Old hillshader
                case "soft-hillshading": {
                    drawWithHillShading(
                        gl,
                        canvas,
                        loadedImage,
                        loadedColorMap,
                        {
                            ...colorScale,
                            ...shader,
                        }
                    );
                    break;
                }

                case "hillshading": {
                    drawWithAdvancedHillShading(
                        gl,
                        canvas,
                        loadedImage,
                        loadedColorMap,
                        {
                            ...colorScale,
                            ...shader,
                            ...cutOffPoints,
                        }
                    );
                    break;
                }

                default: {
                    // Draw the image with colormap
                    drawWithColormap(gl, canvas, loadedImage, loadedColorMap, {
                        ...colorScale,
                        ...shader,
                        ...cutOffPoints,
                    });
                }
            }
        } else {
            // Draw the image raw - without colormap
            drawRawImage(gl, canvas, loadedImage, {
                ...colorScale,
                ...shader,
                ...cutOffPoints,
            });
        }
    }
};

/**
 * Calculates cutOffPoints based on given a min/max values and min/max-cutoff-points between 0 and 1.
 * @example
 * calcCutOffPoints(0, 1000, 500, 1000) // { 0.5, 1.0 }
 */
const calcCutOffPoints = (min, max, cutMin, cutMax) => {
    // If min and max is not provided, there will be no cutOff
    if (!min || !max) {
        return {
            cutPointMin: 0.0,
            cutPointMax: 1.0,
        };
    }

    if (cutMax > max) {
        cutMax = max;
    }
    if (cutMin < min) {
        cutMin = min;
    }

    const minColorValue = (cutMin - min) / (max - min);
    const maxColorValue = (cutMax - min) / (max - min);

    return {
        cutPointMin: minColorValue,
        cutPointMax: maxColorValue,
    };
};
