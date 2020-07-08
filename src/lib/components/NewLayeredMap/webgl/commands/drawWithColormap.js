import DrawCmdBuilder from '../drawCmdBuilder';
import drawCommand from '../drawCmd';

// Shaders
import vertexShader from '../../shaders/baseVertexShader.vs.glsl';
import fragmentShader from '../../shaders/baseFragmentShader.fs.glsl';

/**
 * @param {WebGLRenderingContext} gl
 */
export default (gl, canvas, loadedImage, loadedColorMap, scale, cutoffPoints, cutoffMethod) => {
    const maxColorValue = cutoffPoints[0];
    const minColorValue = cutoffPoints[1]  == 255 ? 0: 255- cutoffPoints[1];
    const width = loadedImage.width;
    const height = loadedImage.height;
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
    const cutoffMethodTest = cutoffMethod == "delete" ? 0 : 1; // remove  this?
    canvas.width = width;
    canvas.height = height;

    const drawCmd = new DrawCmdBuilder()
        .setVertexShader(vertexShader)
        .setFragmentShader(fragmentShader)
        .addAttribute('a_texCoord', [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]) // The vertices of two triangles, creating a square
        .addAttribute('a_position', [0, 0, width, 0, 0, height, 0, height, width, 0, width, height])
        .addTexture('u_image', 0, loadedImage)
        .addTexture('u_colormap_frame', 1, loadedColorMap)
        .addUniformF('u_resolution_vertex', gl.canvas.width, gl.canvas.height)  
        .addUniformF('u_colormap_length', loadedColorMap.width)
        .addUniformF('u_scale', scaleType)  
        .addUniformF('u_max_color_value', maxColorValue)  
        .addUniformF('u_min_color_value', minColorValue)
        .addUniformF('u_cutoff_method', cutoffMethodTest)  
        .setVertexCount(6)
        .build();

    drawCommand(gl, canvas, drawCmd);
}