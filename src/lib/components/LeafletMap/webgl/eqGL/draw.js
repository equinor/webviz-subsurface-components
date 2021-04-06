/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import { FrameBuffer } from "./index";
import Variable from "./variable";
import {
    bindBuffer,
    bindTexture,
    createProgram,
    createShader,
} from "./webglutils";
import Texture from "./texture";

/**
 * A number, or a string containing a number.
 * @typedef {Object} DrawCmd
 * @property {Number} id
 * @property {String} frag - The fragment shader
 * @property {String} vert - The vertex shader
 * @property {Object} attributes - The attributes - { [attributeName]: { value } }
 * @property {Object} uniforms - The uniforms - { [uniformName]: { value, type } }
 * @property {Object} textures - The textures - { [textureName]: { textureUnit, textureImage }}
 * @property {Number} vertexCount - The number of indicies to draw with gl.drawArrays(..., ..., vertexCount)
 * @property {Array<Number>} bgColor - The color of clear the canvas with
 * @property {FrameBuffer} framebuffer - The framebuffer to render the texture to
 * @property {Array<Number>} viewport - [x, y, width, height]
 */

/**
 * drawCommand draws a given command based with WebGL
 * @param {EQGLContext} context - The EQGLContext
 * @param {DrawCmd} cmd - The command to draw
 */
export const drawCommand = (context, cmd, props = {}) => {
    const gl = context._gl;

    // Check if one should write to a framebuffer or directly to the canvas
    const framebuffer = extractValue(cmd.framebuffer, props);
    if (framebuffer) {
        framebuffer.bind(gl);
    } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Write directly to the canvas
    }

    // Clear canvas
    gl.clearColor(...(cmd.bgColor || [0, 0, 0, 0]));
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (cmd.viewport) {
        gl.viewport(...extractValue(cmd.viewport, props));
    } else {
        // Tell WebGL how to convert from clip space ([-1, 1] x [-1, 1]) back to pixel space ([0, w] x [0, h]):
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }

    // Initialize program and shaders
    let program = null;
    if (context._programs[cmd.id]) {
        const { p } = context._programs[cmd.id];
        program = p; //createProgram(gl, vert, frag);
    } else {
        // A program has not yet been made for this command - create one
        const vert = createShader(
            gl,
            gl.VERTEX_SHADER,
            extractValue(cmd.vert, props)
        );
        const frag = createShader(
            gl,
            gl.FRAGMENT_SHADER,
            extractValue(cmd.frag, props)
        );
        program = createProgram(gl, vert, frag);
        context._addProgram(cmd.id, program, vert, frag);
    }
    gl.useProgram(program);

    // Add the attributes
    Object.entries(cmd.attributes).forEach(([attributeName, { value }]) => {
        bindBuffer(gl, attributeName, extractValue(value, props));
    });

    // Add the textures
    Object.entries(cmd.textures).forEach(
        ([textureName, { textureUnit, textureImage }]) => {
            textureUnit = extractValue(textureUnit, props); // In case the first variable (textureUnit) is a Variable

            if (textureImage instanceof Image) {
                bindTexture(gl, textureUnit, textureName, textureImage);
            } else if (textureUnit instanceof FrameBuffer) {
                const uniformLocation = gl.getUniformLocation(
                    program,
                    textureName
                );
                gl.uniform1i(uniformLocation, textureUnit.index());
            } else if (textureUnit instanceof Texture) {
                const uniformLocation = gl.getUniformLocation(
                    program,
                    textureName
                );
                gl.uniform1i(uniformLocation, textureUnit.bind(gl));
            } else {
                // Only a textureUnit (Number) was provided.
                const uniformLocation = gl.getUniformLocation(
                    program,
                    textureName
                );
                gl.uniform1i(uniformLocation, textureUnit);
            }
        }
    );

    // Add uniforms
    Object.entries(cmd.uniforms).forEach(
        ([uniformName, { value, type = "1f" }]) => {
            const uniformValue = extractValue(value, props);

            const uniformLocation = gl.getUniformLocation(program, uniformName);
            const uniformFuncName = `uniform${type}`;
            if (gl[uniformFuncName] instanceof Function) {
                gl[uniformFuncName](
                    uniformLocation,
                    ...(Array.isArray(uniformValue)
                        ? uniformValue
                        : [uniformValue])
                );
            } else {
                console.error(
                    `Did not find gl.${uniformFuncName}. Did you give an incorrect type?`
                );
            }
        }
    );

    // Draw onto the canvas
    gl.drawArrays(gl.TRIANGLES, 0, cmd.vertexCount);
};

/**
 * extractValue extracts a value from props if the given variable-value has a type of Variable.
 * Unless, it just returns the normal value.
 * @param {Variable} variable
 * @param {Object.<any>} props
 * @returns {any}
 */
const extractValue = (variable, props) => {
    if (variable instanceof Variable) {
        return props[variable.name];
    } else if (
        Array.isArray(variable) &&
        variable.some((v) => v instanceof Variable)
    ) {
        // The uniformf-method gives an array
        const v = variable.find((v) => v instanceof Variable);
        return props[v.name];
    }
    return variable;
};

export default drawCommand;
