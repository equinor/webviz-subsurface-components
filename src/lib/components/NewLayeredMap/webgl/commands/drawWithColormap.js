import EQGL from '../eqGL';

// Shaders
import positionVShader from '../../shaders/position.vs.glsl';
import colorFShader from '../../shaders/color.fs.glsl';

/**
 * @param {WebGLRenderingContext} gl
 */
export default (gl, canvas, loadedImage, loadedColorMap, options = {}) => {
    const { 
        scaleType = 'linear',
        cutPointMin = 0.0,
        cutPointMax = 1000.0,
    } = options;

    gl.getExtension('OES_texture_float');
    //gl.getExtension('OES_texture_float_linear');

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const width = loadedImage.width;
    const height = loadedImage.height;

    canvas.width = width;
    canvas.height = height;

    const eqGL = EQGL(gl, canvas);

    const drawCmd = eqGL.new()
        .vert(positionVShader)
        .frag(colorFShader)
        .attribute('position', [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
        .texture('u_image', 2, loadedImage)
        .texture('u_colormap', 3, loadedColorMap)
        .uniformf("u_colormap_length", loadedColorMap.width)
        .uniformf("u_resolution", loadedImage.width, loadedImage.height)
        .uniformf("u_scale_type", scaleType === 'log' ? 1.0 : 0.0) // 1.0 is logarithmic
        .uniformf("u_max_color_value", cutPointMax)
        .uniformf("u_min_color_value", cutPointMin)
        .viewport(0, 0, width, height)  
        .vertexCount(6)
        .build();

    drawCmd();
}