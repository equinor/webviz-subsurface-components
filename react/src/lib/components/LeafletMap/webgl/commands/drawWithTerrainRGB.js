// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// Copyright (C) 2020 - Equinor ASA.

import EQGL from "../eqGL";
import vec3 from "../vec3";

// Shaders
import positionVShader from "../../shaders/position.vs.glsl";
import terrainRGBFSShader from "../../shaders/terrainRGB.fs.glsl";

// CONSTANTS
const DEFAULT_ELEVATION_SCALE = -1.0;
const DEFAULT_SUN_DIRECTION = vec3.normalize([], [1, 1, 1]);
const DEFAULT_AMBIENT_LIGHT_INTENSITY = 0.5;
const DEFAULT_DIFFUSE_LIGHT_INTENSITY = 0.5;

/**
 * @typedef {Object} Options
 * @property {Number} minValue - Minimum elevation value.
 * @property {Number} maxValue - Maximum elevation value.
 * @property {Boolean} applyColorScale - Colorscale the data.
 * @property {String} scaleType - "linear"/"log", apply the colorscale linearly or logarithmically.
 * @property {Number} remapPointMin - [0,1], remap the minimum data point to a different point on the colorscale.
 * @property {Number} remapPointMax - [0,1], remap the maximum data point to a different point on the colorscale.
 * @property {Number} cutPointMin - [0,1], don't display points lower than this threshold.
 * @property {Number} cutPointMax - [0,1], don't display points higher than this threshold.
 * @property {Boolean} applyHillshading - Apply hillshading.
 * @property {Number} elevationScale - Multiplier applied to the elevation value when computing the hillshading.
 * @property {vec3} sunDirection - Direction the light is coming from.
 * @property {Number} ambientLightIntensity - Brightness added to all pixels.
 * @property {Number} diffuseLightIntensity - Brightness of surfaces hit by light.
 */

/**
 * @description - This draws MapBox Terrain RGB data with a colorscale applied.
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLImageElement} loadedImage
 * @param {HTMLImageElement} loadedColorMap
 * @param {Options} options
 */
export default async (
    gl,
    canvas,
    loadedImage,
    loadedColorMap,
    options = {}
) => {
    const {
        minValue = 0.0,
        maxValue = 0.0,

        // ColorScale type
        applyColorScale = true,
        scaleType = "linear",
        remapPointMin = 0.0,
        remapPointMax = 1.0,
        cutPointMin = 0.0,
        cutPointMax = 1.0,

        // Hillshading options
        applyHillshading = true,
        elevationScale = DEFAULT_ELEVATION_SCALE,
        sunDirection = DEFAULT_SUN_DIRECTION,
        ambientLightIntensity = DEFAULT_AMBIENT_LIGHT_INTENSITY,
        diffuseLightIntensity = DEFAULT_DIFFUSE_LIGHT_INTENSITY,
    } = options;

    const interpolationTypes = {
        linear: 0,
        log: 1,
    };

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    /**
     * @type {EQGLContext}
     */
    const eqGL = EQGL(gl, canvas);

    const width = loadedImage.width;
    const height = loadedImage.height;

    canvas.width = width;
    canvas.height = height;

    const dataTexture = eqGL.texture({ image: loadedImage });
    const colormapTexture = loadedColorMap
        ? eqGL.texture({ image: loadedColorMap })
        : null;

    // prettier-ignore
    const quad = [
        -1, -1, //Bottom-Left
        1, -1, // Bottom-Right
        1, 1, // Top-Right

        -1, -1, // Bottom-Left
        1, 1, // Top-Right
        -1, 1, // Top-Left
    ];

    const terrainRGBCmd = eqGL
        .new()
        .vert(positionVShader)
        .frag(terrainRGBFSShader)
        .attribute("position", quad)
        .vertexCount(6)

        .texture("u_data_texture", dataTexture)
        .uniformf("u_resolution", loadedImage.width, loadedImage.height)

        .uniformi("u_apply_color_scale", Boolean(applyColorScale))
        .uniformi("u_apply_hillshading", Boolean(applyHillshading))

        .texture("u_colormap", colormapTexture)
        .uniformi("u_interpolation_type", interpolationTypes[scaleType])
        .uniformf("u_value_range", maxValue - minValue)
        .uniformf("u_remap_colormap", remapPointMin, remapPointMax)
        .uniformf("u_clamp_colormap", cutPointMin, cutPointMax)

        .uniformf("u_elevation_scale", elevationScale)
        .uniformf("u_sun_direction", sunDirection)
        .uniformf("u_ambient_light_intensity", ambientLightIntensity)
        .uniformf("u_diffuse_light_intensity", diffuseLightIntensity)

        .viewport(0, 0, loadedImage.width, loadedImage.height)
        .build();

    terrainRGBCmd();

    eqGL.clean();
};
