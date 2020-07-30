import EQGL from "../eqGL";

// Shaders
import positionVShader from "../../shaders/position.vs.glsl";
import colorFShader from "../../shaders/color.fs.glsl";

/**
 * @param {WebGLRenderingContext} gl
 */
export default (gl, canvas, loadedImage, loadedColorMap, options = {}) => {
    const {
        scaleType = "linear",
        cutPointMin = 0.0,
        cutPointMax = 1000.0,
        setBlackToAlpha = false,
    } = options;

    gl.getExtension("OES_texture_float");
    //gl.getExtension('OES_texture_float_linear');

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const width = loadedImage.width;
    const height = loadedImage.height;

    canvas.width = width;
    canvas.height = height;

    const eqGL = EQGL(gl, canvas);

    const rawTexture = eqGL.texture({ image: loadedImage });

    const drawCmd = eqGL
        .new()
        .vert(positionVShader)
        .frag(colorFShader)
        .attribute("position", [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
        .texture("u_image", rawTexture)
        .texture("u_raw_image", rawTexture)
        .texture("u_colormap", eqGL.texture({ image: loadedColorMap }))
        .uniformf("u_colormap_length", loadedColorMap.width)
        .uniformf("u_resolution", loadedImage.width, loadedImage.height)
        .uniformf("u_scale_type", scaleType === "log" ? 1.0 : 0.0) // 1.0 is logarithmic
        .uniformf("u_max_color_value", cutPointMax)
        .uniformf("u_min_color_value", cutPointMin)
        .uniformi("u_black_to_alpha", Boolean(setBlackToAlpha))
        .viewport(0, 0, width, height)
        .vertexCount(6)
        .build();

    drawCmd();
};
