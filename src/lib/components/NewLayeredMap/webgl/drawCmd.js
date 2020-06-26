import {  
    bindBuffer, bindTexture, createAndInitProgram
} from './webglUtils';

/**
 * A number, or a string containing a number.
 * @typedef {Object} DrawCmd
 * @property {Object} attributes - The attributes - { [attributeName]: { value } }
 * @property {Object} uniforms - The uniforms - { [uniformName]: { value, type } }
 * @property {Object} textures - The textures - { [textureName]: { textureUnit, textureImage }}
 * @property {Number} vertexCount - The number of indicies to draw with gl.drawArrays(..., ..., vertexCount)
 * @property {String} frag - The fragment shader
 * @property {String} vert - The vertex shader
 */

/**
 * drawCommand draws a given command based with WebGL
 * @param {WebGLRenderingContext} gl - The WebGLContext 
 * @param {HTMLCanvasElement} canvas - The corresponding canvas belonging to the WebGLContext. 
 * @param {DrawCmd} cmd - The command to draw
 */
export const drawCommand = (gl, canvas, cmd) => {

    gl.getExtension("OES_texture_float");

    
    // Clear canvas
    gl.clearColor(...(cmd.bgColor || [0, 0, 0, 0]));
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell WebGL how to convert from clip space ([-1, 1] x [-1, 1]) back to pixel space ([0, w] x [0, h]):
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);


    // Initialize shaders
    const program = createAndInitProgram(
        gl,
        cmd.vert,
        cmd.frag
    );   
    
    // Add the attributes
    Object.entries(cmd.attributes)
        .forEach(([attributeName, { value }]) => {
            bindBuffer(gl, attributeName, value);
        });

    // Add the textures
    Object.entries(cmd.textures)
        .forEach(([textureName, { textureUnit, textureImage }]) => {
            bindTexture(gl, textureUnit, textureName, textureImage);
        })

    // Add uniforms
    Object.entries(cmd.uniforms)
        .forEach(([uniformName, { value, type = '1f' }]) => {
            const uniformLocation = gl.getUniformLocation(program, uniformName);
            const uniformFuncName = `uniform${type}`;
            if(gl[uniformFuncName] instanceof Function) {
                gl[uniformFuncName](uniformLocation, ...value);
            } else {
                console.error(`Did not find gl.${uniformFuncName}. Did you give an incorrect type?`)
            }
        });

    // Draw onto the canvas
    gl.drawArrays(gl.TRIANGLES, 0, cmd.vertexCount); 
}

export default drawCommand;