import EQGL from "../eqGL";

// Shaders
import positionVShader from "../../shaders/position.vs.glsl";
import imageFShader from "../../shaders/image.fs.glsl";
import blackAlphaFShader from "../../shaders/blackalpha.fs.glsl";

/**
 * @param {WebGLRenderingContext} gl
 */
export default (gl, canvas, loadedImage, options = {}) => {
    const {
        cutPointMin = 0.0,
        cutPointMax = 1000.0,

        setBlackToAlpha = false,
    } = options;

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const width = loadedImage.width;
    const height = loadedImage.height;

    canvas.width = width;
    canvas.height = height;

    const eqGL = EQGL(gl, canvas);

    const rawTexture = eqGL.texture({ image: loadedImage });
    let inputTexture = rawTexture;

    if (setBlackToAlpha) {
        // Set black (0, 0, 0) color-values with alpha = 0
        const fboBlackAlpha = eqGL.framebuffer({
            width: width,
            height: height,
        });

        const blackToAlphaCmd = eqGL
            .new()
            .vert(positionVShader)
            .frag(blackAlphaFShader)
            .attribute("position", [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
            .texture("u_image", inputTexture)
            .uniformf("u_resolution", loadedImage.width, loadedImage.height)
            .viewport(0, 0, width, height)
            .framebuffer(fboBlackAlpha)
            .vertexCount(6)
            .build();

        blackToAlphaCmd();

        inputTexture = fboBlackAlpha;
    }

    const drawCmd = eqGL
        .new()
        .vert(positionVShader)
        .frag(imageFShader)
        .attribute("position", [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
        .texture("u_image", inputTexture)
        .uniformf("u_resolution", loadedImage.width, loadedImage.height)
        .uniformf("u_max_color_value", cutPointMax)
        .uniformf("u_min_color_value", cutPointMin)
        .viewport(0, 0, width, height)
        .vertexCount(6)
        .build();

    drawCmd();
};
