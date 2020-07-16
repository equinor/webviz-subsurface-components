import EQGL from '../eqGL';

// Shaders
import positionVShader from '../../shaders/position.vs.glsl';
import imageFShader from '../../shaders/image.fs.glsl';

/**
 * @param {WebGLRenderingContext} gl
 */
export default (gl, canvas, loadedImage, options = {}) => {
    const { 
        cutPointMin = 0.0,
        cutPointMax = 1000.0,
    } = options;

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const width = loadedImage.width;
    const height = loadedImage.height;
  
    canvas.width = width;
    canvas.height = height;

    const eqGL = EQGL(gl, canvas);

    const drawCmd = eqGL.new()
        .vert(positionVShader)
        .frag(imageFShader)
        .attribute('position', [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
        .texture('u_image', 2, loadedImage)
        .uniformf("u_resolution", loadedImage.width, loadedImage.height)
        .uniformf("u_max_color_value", cutPointMax)
        .uniformf("u_min_color_value", cutPointMin)
        .viewport(0, 0, width, height)  
        .vertexCount(6)
        .build();

    drawCmd();
}