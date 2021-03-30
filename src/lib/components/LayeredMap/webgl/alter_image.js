/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import vertexShaderSource from "../shaders/vertexShader.vs.glsl";
import fragmentShaderSourceWithHillshading from "../shaders/fragmentShaderWithHillshading.fs.glsl";
import fragmentShaderSourceWithoutHillshading from "../shaders/fragmentShaderWithoutHillshading.fs.glsl";

function alter_image(
    canvas,
    map_base64,
    colormap_base64,
    hillshading,
    elevation_scale,
    light_direction
) {
    const createShader = (gl, shaderType, shaderSource) => {
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
        return shader;
    };

    const createProgram = (gl, vertexShader, fragmentShader) => {
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
        return program;
    };

    const bindBuffer = (gl, attribName, array) => {
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

    const bindTexture = (gl, textureIndex, uniformName, image) => {
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
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
        );
        gl.uniform1i(gl.getUniformLocation(program, uniformName), textureIndex);
    };

    const load_image = (src) =>
        new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
        });

    Promise.all([load_image(map_base64), load_image(colormap_base64)]).then(
        function ([map_image, colormap_image]) {
            const gl = canvas.getContext("webgl", {
                premultipliedAlpha: false,
            });
            gl.getExtension("OES_texture_float");

            canvas.width = map_image.width;
            canvas.height = map_image.height;

            // Clear canvas
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            // Tell WebGL how to convert from clip space ([-1, 1] x [-1, 1]) back to pixel space ([0, w] x [0, h]):
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            const program = createProgram(
                gl,
                createShader(gl, gl.VERTEX_SHADER, vertexShaderSource),
                createShader(
                    gl,
                    gl.FRAGMENT_SHADER,
                    hillshading
                        ? fragmentShaderSourceWithHillshading
                        : fragmentShaderSourceWithoutHillshading
                )
            );

            gl.useProgram(program);

            bindBuffer(gl, "a_texCoord", [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);
            bindBuffer(gl, "a_position", [
                0,
                0,
                map_image.width,
                0,
                0,
                map_image.height,
                0,
                map_image.height,
                map_image.width,
                0,
                map_image.width,
                map_image.height,
            ]);

            bindTexture(gl, 0, "u_image", map_image);
            bindTexture(gl, 1, "u_colormap_frame", colormap_image);

            gl.uniform2f(
                gl.getUniformLocation(program, "u_resolution_vertex"),
                gl.canvas.width,
                gl.canvas.height
            );

            gl.uniform1f(
                gl.getUniformLocation(program, "u_colormap_length"),
                colormap_image.width
            );

            if (hillshading) {
                gl.uniform2f(
                    gl.getUniformLocation(program, "u_resolution_fragment"),
                    gl.canvas.width,
                    gl.canvas.height
                );

                const vectorLength = Math.sqrt(
                    light_direction[0] ** 2 +
                        light_direction[1] ** 2 +
                        light_direction[2] ** 2
                );

                gl.uniform3f(
                    gl.getUniformLocation(program, "u_light_direction"),
                    light_direction[0] / vectorLength,
                    light_direction[1] / vectorLength,
                    light_direction[2] / vectorLength
                );

                gl.uniform1f(
                    gl.getUniformLocation(program, "u_elevation_scale"),
                    elevation_scale
                );
            }

            const numberIndices = 6;
            gl.drawArrays(gl.TRIANGLES, 0, numberIndices);
        }
    );
}

export default alter_image;
