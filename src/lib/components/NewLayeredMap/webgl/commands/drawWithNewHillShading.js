import { loadImage } from '../webglUtils';
import EQGL from '../eqGL';

// Shaders
import vertexShader from '../../shaders/baseVertexShader.vs.glsl';
import fragmentShader from '../../shaders/baseFragmentShader.fs.glsl';
import elevationVShader from '../../shaders/hillshading/elevation.vs.glsl';
import elevationFShader from '../../shaders/hillshading/elevation.fs.glsl';
import normalsFShader from '../../shaders/hillshading/normals.fs.glsl';
import directLightningsFShader from '../../shaders/hillshading/directlightning.fs.glsl';

/**
 * @param {WebGLRenderingContext} gl
 */
export default async (gl, canvas, loadedImage, loadedColorMap) => {

    gl.getExtension('OES_texture_float');
    gl.getExtension('OES_texture_float_linear');

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    // gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    // gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, true)
    // gl.pixelStorei(gl.UNPACK_ALIGNMENT, true)

    const eqGL = EQGL(gl, canvas);

    const width = loadedImage.width;
    const height = loadedImage.height;

    canvas.width = width;
    canvas.height = height;

    const fboElevation = eqGL.framebuffer(5, { width: width, height: height});

    const elevationCmd = eqGL.new()
        .vert(elevationVShader)
        .frag(elevationFShader)
        .attribute("position", [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
        .texture("tElevation", 0, loadedImage)
        //.uniformf("elevationScale", 0.0005)
        .uniformf("elevationScale", 4.0)
        .uniformf("resolution", loadedImage.width, loadedImage.height)
        .vertexCount(6)
        .viewport(0, 0, loadedImage.width, loadedImage.height)
        .framebuffer(fboElevation)
        .build();

    elevationCmd();

    const fboNormal = eqGL.framebuffer(3, { width: width, height: height});

    const normalCmd = eqGL.new()
        .vert(elevationVShader)
        .frag(normalsFShader)
        .attribute("position", [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
        .texture("tElevation", fboElevation)
        .uniformf("pixelScale", 152.70299374405343)
        .uniformf("resolution", loadedImage.width, loadedImage.height)
        .vertexCount(6)
        .viewport(0, 0, loadedImage.width, loadedImage.height)
        .framebuffer(fboNormal)
        .build();
    
    normalCmd();

    const directCmd = eqGL.new()
        .vert(elevationVShader)
        .frag(directLightningsFShader)
        .attribute("position", [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
        .texture("tNormal", fboNormal)
        .uniformf("sunDirection", [0.5773502691896258, 0.5773502691896258, 0.5773502691896258])
        .uniformf("resolution", loadedImage.width, loadedImage.height)
        .vertexCount(6)
        .viewport(0, 0, loadedImage.width, loadedImage.height)
        .build();
    
    directCmd();

    // const fboDirect = eqGL.framebuffer(6, { width: width, height: height});
}