import {
    drawRawImage,
    drawWithColormap,
    drawWithHillShading,
    drawWithAdvancedHillShading,
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

    if (loadedColorMap) {
        switch (shader.type) {
            // Old hillshader
            case "soft-hillshading": {
                drawWithHillShading(gl, canvas, loadedImage, loadedColorMap, {
                    ...colorScale,
                    ...shader,
                });
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
};

/**
 * Calculates cutOffPoints based on given a min/max values and min/max-cutoff-points between 0 and 255.
 * @example
 * calcCutOffPoints(0, 1000, 500, 1000) // { 127, 255 }
 */
const calcCutOffPoints = (min, max, cutMin, cutMax) => {
    // If min and max is not provided, there will be no cutOff
    if (!min || !max) {
        return {
            cutPointMin: 0,
            cutPointMax: 256,
        };
    }

    if (cutMax > max) {
        cutMax = max;
    }
    if (cutMin < min) {
        cutMin = min;
    }

    const maxColorValue = Math.round(
        255 - (Math.abs(cutMax - max) / (max - min)) * 255
    );
    const minColorValue = Math.round(((cutMin - min) / (max - min)) * 255);

    return {
        cutPointMin: minColorValue,
        cutPointMax: maxColorValue,
    };
};
