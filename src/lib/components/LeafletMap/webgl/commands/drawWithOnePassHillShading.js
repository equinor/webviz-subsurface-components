import EQGL from "../eqGL";
import vec3 from "../vec3";

// Shaders
import positionVShader from "../../shaders/position.vs.glsl";
import onepassFSShader from "../../shaders/onepass.fs.glsl";

// CONSTANTS
const DEFAULT_PIXEL_SCALE = 1;
const DEFAULT_ELEVATION_SCALE = 1.0;
const DEFAULT_SUN_DIRECTION = vec3.normalize([], [1, 1, 1]);
const DEFAULT_AMBIENT_LIGHT_INTENSITY = 0.4;
const DEFAULT_DIFFUSE_LIGHT_INTENSITY = 1.0;

/**
 * @typedef {Object} Options
 * @property {Boolean} setBlackToAlpha - Set alpha = 0 for all black values in the input data.
 * @property {Boolean} applyColorScale - Colorscale the data.
 * @property {String} scaleType - "linear"/"log", apply the colorscale linearly or logarithmically.
 * @property {Number} remapPointMin - [0,1], remap the minimum data point to a different point on the colorscale.
 * @property {Number} remapPointMax - [0,1], remap the maximum data point to a different point on the colorscale.
 * @property {Number} cutPointMin - [0,1], don't display points lower than this threshold.
 * @property {Number} cutPointMax - [0,1], don't display points higher than this threshold.
 * @property {Boolean} applyHillshading - Apply hillshading.
 * @property {Number} pixelScale
 * @property {Number} elevationScale
 * @property {vec3} sunDirection - Direction the light is coming from.
 * @property {Number} ambientLightIntesity - Brightness added to all pixels.
 * @property {Number} diffuseLightIntesity - Brightness of surfaces hit by light.
 */

/**
 * @description - This shader combines the hillshading in the previous implementation (drawWithAdvancedHillShading)
 * into only one pass, avoiding processing the framebuffer multiple times. The softshadow feature wasn't ported over
 * since it seems to be very computational intensive while the visualization benefit is questionable.
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
        setBlackToAlpha = true,

        // ColorScale type
        applyColorScale = true,
        scaleType = "linear",
        remapPointMin = 0.0,
        remapPointMax = 1.0,
        cutPointMin = 0.0,
        cutPointMax = 1.0,

        // Hillshading options
        applyHillshading = true,
        pixelScale = DEFAULT_PIXEL_SCALE,
        elevationScale = DEFAULT_ELEVATION_SCALE,
        sunDirection = DEFAULT_SUN_DIRECTION,
        ambientLightIntesity = DEFAULT_AMBIENT_LIGHT_INTENSITY,
        diffuseLightIntesity = DEFAULT_DIFFUSE_LIGHT_INTENSITY,
    } = options;

    const interpolationTypes = {
        "linear": 0,
        "log": 1
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
    const quad = [
        -1, -1, //Bottom-Left
        1, -1, // Bottom-Right
        1, 1, // Top-Right

        -1, -1, // Bottom-Left
        1, 1, // Top-Right
        -1, 1, // Top-Left
    ];
    const onepassCmd = eqGL
        .new()
        .vert(positionVShader)
        .frag(onepassFSShader)
        .attribute("position", quad)
        .vertexCount(6)

        .texture("u_data_texture", dataTexture)
        .uniformf("u_resolution", loadedImage.width, loadedImage.height)

        .uniformi("u_black_to_alpha", Boolean(setBlackToAlpha))
        .uniformi("u_apply_color_scale", Boolean(applyColorScale))
        .uniformi("u_apply_hillshading", Boolean(applyHillshading))

        .texture("u_colormap", eqGL.texture({ image: loadedColorMap }))
        .uniformi("u_interpolation_type", interpolationTypes[scaleType])
        .uniformf("u_remap_colormap", remapPointMin, remapPointMax)
        .uniformf("u_clamp_colormap", cutPointMin, cutPointMax)


        .uniformf("u_elevation_scale", elevationScale)
        .uniformf("u_pixel_scale", pixelScale)
        .uniformf("u_sun_direction", sunDirection)
        .uniformf("u_ambient_light_intensity", ambientLightIntesity)
        .uniformf("u_diffuse_light_intensity", diffuseLightIntesity)

        .viewport(0, 0, loadedImage.width, loadedImage.height)
        .build();

    onepassCmd();

    eqGL.clean();
};