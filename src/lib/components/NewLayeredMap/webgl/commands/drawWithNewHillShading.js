import EQGL, { EQGLContext } from '../eqGL';
import vec3 from '../vec3';

// Shaders
import vertexShader from '../../shaders/baseVertexShader.vs.glsl';
import fragmentShader from '../../shaders/baseFragmentShader.fs.glsl';
import elevationVShader from '../../shaders/hillshading/elevation.vs.glsl';
import elevationFShader from '../../shaders/hillshading/elevation.fs.glsl';
import normalsFShader from '../../shaders/hillshading/normals.fs.glsl';
import directLightningsFShader from '../../shaders/hillshading/directlightning.fs.glsl';
import softShadowFShader from '../../shaders/hillshading/softshadow.fs.glsl';
import ambientFShader from '../../shaders/hillshading/ambient.fs.glsl';
import combinedFShader from '../../shaders/hillshading/combined.fs.glsl';

/**
 * @param {WebGLRenderingContext} gl
 */
export default async (gl, canvas, loadedImage, loadedColorMap) => {

    document.body.appendChild(loadedImage);

    gl.getExtension('OES_texture_float');
    gl.getExtension('OES_texture_float_linear');

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    // gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    // gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, true)
    // gl.pixelStorei(gl.UNPACK_ALIGNMENT, true)

    /**
     * @type {EQGLContext}
     */
    const eqGL = EQGL(gl, canvas);

    const width = loadedImage.width;
    const height = loadedImage.height;

    canvas.width = width;
    canvas.height = height;

    const fboElevation = eqGL.framebuffer({ width: width, height: height});

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

    const fboNormal = eqGL.framebuffer({ width: width, height: height});

    const normalCmd = eqGL.new()
        .vert(elevationVShader)
        .frag(normalsFShader)
        .attribute("position", [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
        .texture("tElevation", fboElevation)
        .uniformf("pixelScale", 35.18628838746866)
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

    const shadowPP = PingPong(eqGL, {
        width: loadedImage.width,
        height: loadedImage.height,
    });

    const softShadowsCmd = eqGL.new()
        .vert(elevationVShader)
        .frag(softShadowFShader)
        .attribute("position", [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
        .texture("tElevation", fboElevation)
        .texture("tNormal", fboNormal)
        .texture("tSrc", eqGL.variable("src"))
        .uniform("sunDirection", "3f", eqGL.variable("sunDirection"))
        .uniformf("pixelScale", 152.70299374405343)
        .uniformf("resolution", loadedImage.width, loadedImage.height)
        .viewport(0, 0, loadedImage.width, loadedImage.height)
        .framebuffer(eqGL.variable("dest"))
        .vertexCount(6)
        .build();

    
    for (let i = 0; i < 128; i++) {
        const sunDirection = vec3.normalize(
            [],
            vec3.add(
                [],
                vec3.scale([], vec3.normalize([], [1, 1, 1]), 149600000000),
                vec3.random([], 695508000 * 100)
            )
        );

        softShadowsCmd({
            sunDirection: sunDirection,
            src: shadowPP.ping(),
            dest: /* i === 127 ? undefined : */ shadowPP.pong()
        });
        shadowPP.swap();
    }

    const ambientPP = PingPong(eqGL, {
        width: loadedImage.width,
        height: loadedImage.height,
    });

    const ambientCmd = eqGL.new()
        .vert(elevationVShader)
        .frag(ambientFShader)
        .attribute("position", [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
        .texture("tElevation", fboElevation)
        .texture("tNormal", fboNormal)
        .texture("tSrc", eqGL.variable("src"))
        .uniform("direction", "3f", eqGL.variable("direction"))
        .uniformf("pixelScale", 152.70299374405343)
        .uniformf("resolution", loadedImage.width, loadedImage.height)
        .framebuffer(eqGL.variable("dest"))
        .viewport(0, 0, loadedImage.width, loadedImage.height)
        .vertexCount(6)
        .build();

    for (let i = 0; i < 128; i++) {
        ambientCmd({
            direction: vec3.random([], Math.random()),
            src: ambientPP.ping(),
            dest: ambientPP.pong()
        });
        ambientPP.swap();
    }

    const finalCmd = eqGL.new()
        .vert(elevationVShader)
        .frag(combinedFShader)
        .attribute("position", [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
        .texture("tSoftShadow", shadowPP.ping())
        .texture("tAmbient", ambientPP.ping())
        .texture("u_colormap", 4, loadedColorMap)
        .uniformf("resolution", loadedImage.width, loadedImage.height)
        .viewport(0, 0, loadedImage.width, loadedImage.height)
        .vertexCount(6)
        .build();

    finalCmd();
}


/**
 * PingPong is a structure for swapping between two framebuffers
 * @param {EQGLContext} eqGL 
 * @param {Object} opts 
 */
function PingPong(eqGL, opts) {
    const fbos = [eqGL.framebuffer(opts), eqGL.framebuffer(opts)];
  
    let index = 0;
  
    function ping() {
      return fbos[index];
    }
  
    function pong() {
      return fbos[1 - index];
    }
  
    function swap() {
      index = 1 - index;
    }
  
    return {
      ping,
      pong,
      swap
    };
  }