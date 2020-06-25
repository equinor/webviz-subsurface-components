// Shader
import shaderVertex from '../shaders/vertexShader.vs.glsl';
import shaderFragment from '../shaders/fragmentShader.fs.glsl';

// Utils
import { 
    loadImage, createProgram, createShader, 
    bindBuffer, bindTexture,
} from './webglUtils';

export default async (gl, canvas, image, colormap, config = {}) => {
    
    gl.getExtension("OES_texture_float");
    
    const imagesToLoad = [loadImage(image, config)]; 
    if (colormap) {
        imagesToLoad.push(loadImage(colormap, config));
    }

    const [loadedImage, loadedColorMap = null] = await Promise.all(imagesToLoad).catch(console.error);



    canvas.width = loadedImage.width;
    canvas.height = loadedImage.height;

    // Clear canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell WebGL how to convert from clip space ([-1, 1] x [-1, 1]) back to pixel space ([0, w] x [0, h]):
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Initialize shaders
    const program = createProgram(
        gl,
        createShader(gl, gl.VERTEX_SHADER, shaderVertex),
        createShader(gl, gl.FRAGMENT_SHADER, shaderFragment)
    );   

    // Initialize program
    gl.useProgram(program);

    // Create array buffers for position (x, y)
    bindBuffer(gl, "a_texCoord", [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]); // Creates two triangles
    bindBuffer(gl, "a_position", [
        0,
        0,
        loadedImage.width,
        0,
        0,
        loadedImage.height,
        0,
        loadedImage.height,
        loadedImage.width,
        0,
        loadedImage.width,
        loadedImage.height,
    ]);

    // Create buffers for textures (image, and colormap)
    bindTexture(gl, 0, "u_image", loadedImage);


    bindTexture(gl, 1, "u_colormap_frame", loadedColorMap);
 
        

    // Initialize uniforms
    gl.uniform2f(
        gl.getUniformLocation(program, "u_resolution_vertex"),
        gl.canvas.width,
        gl.canvas.height
    );

    gl.uniform1f(
        gl.getUniformLocation(program, "u_colormap_length"),
        loadedColorMap.width
    );


    switch(config.fragmentShader) {

        case 'hillshading': {

        }

        default: {

        }
    }

    // Draw arrays
    const numberIndices = 6;
    gl.drawArrays(gl.TRIANGLES, 0, numberIndices);    

    return gl;
}