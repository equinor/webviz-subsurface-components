import EQGL from "../eqGL";
import vec3 from "../vec3";

// Shaders
import positionVShader from "../../shaders/position.vs.glsl";
import elevationFShader from "../../shaders/hillshading/elevation.fs.glsl";
import normalsFShader from "../../shaders/hillshading/normals.fs.glsl";
import directLightningsFShader from "../../shaders/hillshading/directlightning.fs.glsl";
import softShadowFShader from "../../shaders/hillshading/softshadow.fs.glsl";
import ambientFShader from "../../shaders/hillshading/ambient.fs.glsl";
import combinedFShader from "../../shaders/hillshading/combined.fs.glsl";
import colorFShader from "../../shaders/color.fs.glsl";

// CONSTANTS
const DEFAULT_PIXEL_SCALE = 8000;
const DEFAULT_ELEVATION_SCALE = 1.0;
const DEFAULT_SUN_DIRECTION = vec3.normalize([], [1, 1, 1]);

/**
 * @typedef {Object} HillshadingOptions
 * @property {Number} pixelScale
 * @property {Number} elevationScale
 * @property {Boolean} shadows
 * @property {Number} shadowIterations
 * @property {String} scaleType
 * @property {Number} cutPointMin
 * @property {Number} cutPointMax
 */

/**
 * @description - This hillshader is heavly inspiried by the Rye Terrell's advanced map shading tutorial:
 *                                                  https://wwwtyro.net/2019/03/21/advanced-map-shading.html
 *
 * A known issue is that the soft-shadows are quite GPU-heavy and is quite slow for big images. High number of
 * shadow-iterations might be fatal for the browser on big images.
 *
 * @author Anders Hallem Iversen
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLImageElement} loadedImage
 * @param {HTMLImageElement} loadedColorMap
 * @param {HillshadingOptions} options
 */
export default async (
    gl,
    canvas,
    loadedImage,
    loadedColorMap,
    options = {}
) => {
    const {
        // Hillshading options
        pixelScale = DEFAULT_PIXEL_SCALE,
        elevationScale = DEFAULT_ELEVATION_SCALE,
        shadows = false,
        sunDirection = DEFAULT_SUN_DIRECTION,
        shadowIterations = null,

        // ColorScale type
        scaleType = "linear",
        cutPointMin = 0.0,
        cutPointMax = 256.0,
        noColor = false,

        setBlackToAlpha = false,
    } = options;

    gl.getExtension("OES_texture_float");
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    /**
     * @type {EQGLContext}
     */
    const eqGL = EQGL(gl, canvas);

    const width = loadedImage.width;
    const height = loadedImage.height;

    canvas.width = width;
    canvas.height = height;

    // The number of iterations for soft-shadows and ambient light
    let N = shadowIterations || calcN(width, height);

    const rawTexture = eqGL.texture({ image: loadedImage });
    const fboElevation = eqGL.framebuffer({ width: width, height: height });

    const elevationCmd = eqGL
        .new()
        .vert(positionVShader)
        .frag(elevationFShader)
        .attribute("position", [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
        .texture("tElevation", rawTexture)
        .uniformf("elevationScale", elevationScale)
        .uniformf("resolution", loadedImage.width, loadedImage.height)
        .vertexCount(6)
        .viewport(0, 0, loadedImage.width, loadedImage.height)
        .framebuffer(fboElevation)
        .build();

    elevationCmd();

    const fboNormal = eqGL.framebuffer({ width: width, height: height });

    const normalCmd = eqGL
        .new()
        .vert(positionVShader)
        .frag(normalsFShader)
        .attribute("position", [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
        .texture("tElevation", fboElevation)
        .uniformf("pixelScale", pixelScale)
        .uniformf("resolution", loadedImage.width, loadedImage.height)
        .vertexCount(6)
        .viewport(0, 0, loadedImage.width, loadedImage.height)
        .framebuffer(fboNormal)
        .build();

    normalCmd();

    const fboFinal = eqGL.framebuffer({ width: width, height: height });

    if (!shadows) {
        // Render the image without shadows - just add some direct lights
        const directCmd = eqGL
            .new()
            .vert(positionVShader)
            .frag(directLightningsFShader)
            .attribute("position", [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
            .texture("tNormal", fboNormal)
            .uniformf("sunDirection", sunDirection)
            .uniformf("resolution", loadedImage.width, loadedImage.height)
            .viewport(0, 0, loadedImage.width, loadedImage.height)
            .framebuffer(noColor ? null : fboFinal)
            .vertexCount(6)
            .build();

        directCmd();
    } else {
        // Enable shadows
        const shadowPP = PingPong(eqGL, {
            width: loadedImage.width,
            height: loadedImage.height,
        });

        const softShadowsCmd = eqGL
            .new()
            .vert(positionVShader)
            .frag(softShadowFShader)
            .attribute("position", [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
            .texture("tElevation", fboElevation)
            .texture("tNormal", fboNormal)
            .texture("tSrc", eqGL.variable("src"))
            .uniform("sunDirection", "3f", eqGL.variable("sunDirection"))
            .uniformf("pixelScale", pixelScale)
            .uniformf("resolution", loadedImage.width, loadedImage.height)
            .uniformf("n", N)
            .viewport(0, 0, loadedImage.width, loadedImage.height)
            .framebuffer(eqGL.variable("dest"))
            .vertexCount(6)
            .build();

        for (let i = 0; i < N; i++) {
            const sunDirection = vec3.normalize(
                [],
                vec3.add(
                    [],
                    vec3.scale([], vec3.normalize([], [1, 1, 1]), 149600000000),
                    vec3.random([], 695508000 * 100)
                )
            );

            softShadowsCmd({
                sunDirection: sunDirection,
                src: shadowPP.ping(),
                // dest: i === N - 1 ? undefined : shadowPP.pong()
                dest: shadowPP.pong(),
            });
            shadowPP.swap();
        }

        // Enable ambient lighting
        const ambientPP = PingPong(eqGL, {
            width: loadedImage.width,
            height: loadedImage.height,
        });

        const ambientCmd = eqGL
            .new()
            .vert(positionVShader)
            .frag(ambientFShader)
            .attribute("position", [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
            .texture("tElevation", fboElevation)
            .texture("tNormal", fboNormal)
            .texture("tSrc", eqGL.variable("src"))
            .uniform("direction", "3f", eqGL.variable("direction"))
            .uniformf("pixelScale", 152.70299374405343)
            .uniformf("resolution", loadedImage.width, loadedImage.height)
            .uniformf("n", N)
            .framebuffer(eqGL.variable("dest"))
            .viewport(0, 0, loadedImage.width, loadedImage.height)
            .vertexCount(6)
            .build();

        for (let i = 0; i < N; i++) {
            ambientCmd({
                direction: vec3.random([], Math.random()),
                src: ambientPP.ping(),
                dest: ambientPP.pong(),
            });
            ambientPP.swap();
        }

        // Combine the shadows and the ambient lighting
        const finalCmd = eqGL
            .new()
            .vert(positionVShader)
            .frag(combinedFShader)
            .attribute("position", [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
            .texture("tSoftShadow", shadowPP.ping())
            .texture("tAmbient", ambientPP.ping())
            .uniformf("resolution", loadedImage.width, loadedImage.height)
            .viewport(0, 0, loadedImage.width, loadedImage.height)
            .framebuffer(noColor ? null : fboFinal)
            .vertexCount(6)
            .build();

        finalCmd();
    }

    if (!noColor) {
        // Apply the provided colormap
        const colorScaleCmd = eqGL
            .new()
            .vert(positionVShader)
            .frag(colorFShader)
            .attribute("position", [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
            .texture("u_image", fboFinal)
            .texture("u_raw_image", rawTexture)
            .texture("u_colormap", eqGL.texture({ image: loadedColorMap }))
            .uniformf("u_colormap_length", loadedColorMap.width)
            .uniformf("u_resolution", loadedImage.width, loadedImage.height)
            .uniformf("u_scale_type", scaleType === "log" ? 1.0 : 0.0) // 1.0 is logarithmic
            .uniformf("u_max_color_value", cutPointMax)
            .uniformf("u_min_color_value", cutPointMin)
            .uniformi("u_black_to_alpha", Boolean(setBlackToAlpha))
            .viewport(0, 0, loadedImage.width, loadedImage.height)
            .vertexCount(6)
            .build();

        colorScaleCmd();
    }

    eqGL.clean();
};

/**
 * PingPong is a structure for swapping between two framebuffers
 * @param {EQGLContext} eqGL
 * @param {Object} opts
 */
function PingPong(eqGL, opts) {
    const fbos = [eqGL.framebuffer(opts), eqGL.framebuffer(opts)];

    let index = 0;

    function ping() {
        return fbos[index];
    }

    function pong() {
        return fbos[1 - index];
    }

    function swap() {
        index = 1 - index;
    }

    return {
        ping,
        pong,
        swap,
    };
}

/**
 * The purpose of this function is to make the soft-shadows and ambient-lightning iterations
 * not so costly. For small images N = 128 is fine, but for bigger images N = 10 is too much.
 *
 * This function is not throughly tested on different sizes and can not be considered perfect.
 * @param {Number} width
 * @param {Number} height
 * @returns {Number}
 */
function calcN(width, height) {
    const resolution = width * height;

    if (resolution <= 90000) {
        // 300x300
        return 128;
    } else if (resolution <= 360000) {
        // 600x600
        return 84;
    } else if (resolution <= 490000) {
        // 700x700
        return 48;
    } else if (resolution <= 810000) {
        // 900x900
        return 18;
    } else if (resolution < 2293760) {
        // 1792x1280
        return 8;
    }

    return 1; // resolution >= 1792x1280
}
