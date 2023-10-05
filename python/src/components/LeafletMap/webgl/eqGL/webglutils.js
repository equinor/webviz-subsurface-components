/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

export const loadShader = (shaderPath) =>
    fetch(shaderPath).then((res) => res.text());

export const createShader = (gl, shaderType, shaderSource) => {
    /**
     * Create shader given type and source code
     *
     * @param {WebGL context} gl - The WebGL context to use
     * @param {shader} shadertype - Either gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
     * @param {shaderSource} string - The shader source code
     */

    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    didShaderCompile(gl, shader, shaderType);
    return shader;
};

export const createProgram = (gl, vertexShader, fragmentShader) => {
    /**
     * Create and link a WebGL program
     *
     * @param {WebGL context} gl - The WebGL context to use
     * @param {shader} vertexShader - The compiled vertex shader to attach
     * @param {shader} fragmentShader - The compiled fragment shader to attach
     */

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    didProgramLink(gl, program);
    return program;
};

export const createAndInitProgram = (gl, shaderVertex, shaderFragment) => {
    // Initialize shaders
    const program = createProgram(
        gl,
        createShader(gl, gl.VERTEX_SHADER, shaderVertex),
        createShader(gl, gl.FRAGMENT_SHADER, shaderFragment)
    );

    // Initialize program
    gl.useProgram(program);
    return program;
};

export const bindBuffer = (gl, attribName, array) => {
    /**
     * Bind data to buffer and link it to a given attribute name in the
     * current program attached to the WebGL context.
     *
     * @param {WebGL context} gl - The WebGL context to use
     * @param {string} attribName - The attribute name used in the shader code
     * @param {array} array - The array data to bind to the buffer
     */

    const program = gl.getParameter(gl.CURRENT_PROGRAM);

    const newBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, newBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
    const attribLocation = gl.getAttribLocation(program, attribName);
    gl.enableVertexAttribArray(attribLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, newBuffer);
    gl.vertexAttribPointer(attribLocation, 2, gl.FLOAT, false, 0, 0);
};

export const bindTexture = (gl, textureIndex, uniformName, image) => {
    /**
     * Bind texture to a given uniform name in the current program attached
     * to the WebGL context.
     *
     * @param {WebGL context} gl - The WebGL context to use
     * @param {int} textureIndex - The texture index to use (all computers support <= 4)
     * @param {string} uniformName - The uniform name used in the shader code
     * @param {image element} image - The image element to use as input data for the texture
     */

    const program = gl.getParameter(gl.CURRENT_PROGRAM);

    gl.activeTexture(gl.TEXTURE0 + textureIndex);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(gl.getUniformLocation(program, uniformName), textureIndex);
};

export const didShaderCompile = (gl, shader, name) => {
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(
            `ERROR: Was not able to compile the ${name} shader. Vertex: ${
                name === gl.VERTEX_SHADER
            } - Frag: ${name === gl.FRAGMENT_SHADER}`,
            gl.getShaderInfoLog(shader)
        );
        return false;
    }
    return true;
};

export const didProgramLink = (gl, program) => {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("ERROR: linking program!", gl.getProgramInfoLog(program));
        return false;
    }
    return true;
};

export const isProgramValid = (gl, program) => {
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        return false;
    }
    return true;
};
