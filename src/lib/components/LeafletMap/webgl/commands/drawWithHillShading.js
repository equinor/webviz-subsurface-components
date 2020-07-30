import EQGL from "../eqGL";

// Shaders
import vertexShader from "../../shaders/hillshading/soft/softHillshading.vs.glsl";
import fragmentShader from "../../shaders/hillshading/soft/softHillshading.fs.glsl";
import positionVShader from "../../shaders/position.vs.glsl";
import blackAlphaFShader from "../../shaders/blackalpha.fs.glsl";

const DEFAULT_ELEVATION_SCALE = 0.03;
const DEFAULT_LIGHT_DIRECTION = [1, 1, 1];

/**
 * @param {WebGLRenderingContext} gl
 */
export default (gl, canvas, loadedImage, loadedColorMap, config = {}) => {
    const {
        elevationScale = DEFAULT_ELEVATION_SCALE,
        lightDirection = DEFAULT_LIGHT_DIRECTION,

        setBlackToAlpha = false,
    } = config;

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    const width = loadedImage.width;
    const height = loadedImage.height;

    canvas.width = width;
    canvas.height = height;

    const eqGL = EQGL(gl, canvas);

    // Add hillshading properties
    const vectorLength = Math.sqrt(
        lightDirection[0] ** 2 + lightDirection[1] ** 2 + lightDirection[2] ** 2
    );

    const rawTexture = eqGL.texture({ image: loadedImage });
    let inputTexture = rawTexture;

    if (setBlackToAlpha) {
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

    const elevationCmd = eqGL
        .new()
        .vert(vertexShader)
        .frag(fragmentShader)
        .attribute("a_texCoord", [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]) // The vertices of two triangles, creating a square
        .attribute("a_position", [
            0,
            0,
            width,
            0,
            0,
            height,
            0,
            height,
            width,
            0,
            width,
            height,
        ])
        .texture("u_image", inputTexture)
        .texture("u_colormap", eqGL.texture({ image: loadedColorMap }))
        .uniformf("u_colormap_length", loadedColorMap.width)
        .uniformf("u_resolution", width, height)
        .uniformf(
            "u_light_direction",
            ...lightDirection.map(dir => dir / vectorLength)
        )
        .uniformf("u_elevation_scale", elevationScale)
        .viewport(0, 0, width, height)
        .vertexCount(6)
        .build();

    elevationCmd();
};
