import EQGL from '../eqGL';

// Shaders
import vertexShader from '../../shaders/baseVertexShader.vs.glsl';
import fragmentShader from '../../shaders/hillshading.fs.glsl';

const DEFAULT_ELEVATION_SCALE = 0.03;
const DEFAULT_LIGHT_DIRECTION = [1, 1, 1];

/**
 * @param {WebGLRenderingContext} gl
 */
export default (gl, canvas, loadedImage, loadedColorMap, elevationScale, lightDirection) => {

    if(!elevationScale) {
        elevationScale = DEFAULT_ELEVATION_SCALE;
    }
    if(!lightDirection) {
        lightDirection = DEFAULT_LIGHT_DIRECTION;
    }

    const width = loadedImage.width;
    const height = loadedImage.height;

    canvas.width = width;
    canvas.height = height;

    const eqGL = EQGL(gl, canvas);

    const drawCmdBuilder = eqGL.new()
        .vert(vertexShader)
        .frag(fragmentShader)
        .attribute('a_texCoord', [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]) // The vertices of two triangles, creating a square
        .attribute('a_position', [0, 0, width, 0, 0, height, 0, height, width, 0, width, height])
        .texture('u_image', 0, loadedImage)
        .texture('u_colormap_frame', 1, loadedColorMap)
        .uniformf('u_resolution_vertex', gl.canvas.width, gl.canvas.height)  
        .uniformf('u_colormap_length', loadedColorMap.width) 
        .vertexCount(6);

    // Add hillshading properties
    const vectorLength = Math.sqrt(
        lightDirection[0] ** 2 +
        lightDirection[1] ** 2 +
        lightDirection[2] ** 2
    );

    drawCmdBuilder
        .uniformf("u_resolution_fragment", gl.canvas.width, gl.canvas.height)
        .uniformf("u_light_direction", ...lightDirection.map(dir => dir/vectorLength))
        .uniformf("u_elevation_scale", elevationScale)

    drawCmdBuilder.build()();
}