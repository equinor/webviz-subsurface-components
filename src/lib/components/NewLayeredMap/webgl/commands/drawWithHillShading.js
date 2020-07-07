import DrawCmdBuilder from '../drawCmdBuilder';
import drawCommand from '../drawCmd';

// Shaders
import vertexShader from '../../shaders/baseVertexShader.vs.glsl';
import fragmentShader from '../../shaders/hillshading.fs.glsl';

const DEFAULT_ELEVATION_SCALE = 0.03;
const DEFAULT_LIGHT_DIRECTION = [1, 1, 1];

/**
 * @param {WebGLRenderingContext} gl
 */
export default (gl, canvas, loadedImage, loadedColorMap, elevationScale, lightDirection, scale) => {

    if(!elevationScale) {
        elevationScale = DEFAULT_ELEVATION_SCALE;
    }
    if(!lightDirection) {
        lightDirection = DEFAULT_LIGHT_DIRECTION;
    }
    const scaleType = 0; // default, linear
    switch(scale) { // cannot pass strings to the shader, could add a map instead if there are many options? 
        case "log":
            scaleType = 1;
            break;
        case "something":
            scaleType = 2;
            break;
        default:
            break;
      }

    const width = loadedImage.width;
    const height = loadedImage.height;

    canvas.width = width;
    canvas.height = height;
    const drawCmdBuilder = new DrawCmdBuilder()
        .setVertexShader(vertexShader)
        .setFragmentShader(fragmentShader)
        .addAttribute('a_texCoord', [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]) // The vertices of two triangles, creating a square
        .addAttribute('a_position', [0, 0, width, 0, 0, height, 0, height, width, 0, width, height])
        .addTexture('u_image', 0, loadedImage)
        .addTexture('u_colormap_frame', 1, loadedColorMap)
        .addUniformF('u_resolution_vertex', gl.canvas.width, gl.canvas.height)  
        .addUniformF('u_colormap_length', loadedColorMap.width)
        .addUniformF('u_scale', scaleType)    
        .setVertexCount(6);

    // Add hillshading properties
    const vectorLength = Math.sqrt(
        lightDirection[0] ** 2 +
        lightDirection[1] ** 2 +
        lightDirection[2] ** 2
    );

    drawCmdBuilder
        .addUniformF("u_resolution_fragment", gl.canvas.width, gl.canvas.height)
        .addUniformF("u_light_direction", ...lightDirection.map(dir => dir/vectorLength))
        .addUniformF("u_elevation_scale", elevationScale)

    const drawCmd = drawCmdBuilder.build();

    drawCommand(gl, canvas, drawCmd);
}