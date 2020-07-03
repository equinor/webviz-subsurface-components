import DrawCmdBuilder from '../drawCmdBuilder';
import drawCommand from '../drawCmd';

// Shaders
import vertexShader from '../../shaders/baseVertexShader.vs.glsl';
import fragmentShader from '../../shaders/baseFragmentShader.fs.glsl';

/**
 * @param {WebGLRenderingContext} gl
 */
export default (gl, canvas, loadedImage, loadedColorMap) => {

    const width = loadedImage.width;
    const height = loadedImage.height;

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
        .setVertexCount(6)
        .build();

    drawCommand(gl, canvas, drawCmd);
}