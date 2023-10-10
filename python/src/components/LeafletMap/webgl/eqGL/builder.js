/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import drawCmd from "./draw";

let CMD_COUNTER = 0;

/**
 * DrawCmdBuilder is a builder for building draw commands that can be used
 * in WebGL environments. It basically creates a configuration on how to draw with WebGL.
 */
class DrawCmdBuilder {
    /**
     *
     * @param {EQGLContext} context
     */
    constructor(context) {
        this._context = context;

        this._vertexShader = null;
        this._fragmentShader = null;

        this._attributes = {};
        this._uniforms = {};
        this._textures = {};

        this._vertexCount = 0; // The number of vertices to draw
        this._framebuffer = null;

        this.cmd = null;
    }

    vert(vertexShader) {
        this._vertexShader = vertexShader;
        return this;
    }

    frag(fragmentShader) {
        this._fragmentShader = fragmentShader;
        return this;
    }

    attribute(attributeName, value) {
        this._attributes[attributeName] = { value };
        return this;
    }

    uniformf(uniformName) {
        const args = arguments;
        const values = Object.values(args).slice(1); // Remove the "uniformName"
        if (values.length === 0) {
            return;
        }

        let type = `${values.length}f`; // Assume it is not an array
        if (Array.isArray(values[0])) {
            type = `${values[0].length}fv`; // It is an array
        }
        this.uniform(uniformName, type, values);
        return this;
    }

    uniformi(uniformName) {
        const args = arguments;
        const values = Object.values(args).slice(1); // Remove the "uniformName"
        if (values.length === 0) {
            return;
        }

        let type = `${values.length}i`; // Assume it is not an array
        if (Array.isArray(values[0])) {
            type = `${values[0].length}iv`; // It is an array
        }
        this.uniform(uniformName, type, values);
        return this;
    }

    uniform(uniformName, type, value) {
        this._uniforms[uniformName] = { value, type };
        return this;
    }

    /**
     *
     * @param {String} textureName
     * @param {Number|Texture|FrameBuffer|Variable} textureUnit
     * @param {HTMLImageElement} textureImage
     *
     * @example
     * // With texture
     * eqGL.new().texture("u_image", eqGl.texture({image}))
     *
     * @example
     * // With raw image and custom textureIndex
     * eqGL.new().texture("u_image", 0, image)
     *
     * @example
     * // With framebuffer
     * const fb = eqGl.framebuffer({width, height})
     * ...
     * eqGL.new().texture("u_image", fb)
     */
    texture(textureName, textureUnit, textureImage) {
        this._textures[textureName] = {
            textureUnit,
            textureImage,
        };
        return this;
    }

    vertexCount(vertexCount) {
        this._vertexCount = vertexCount;
        return this;
    }

    viewport(x, y, width, height) {
        this._viewport = [x, y, width, height];
        return this;
    }

    /**
     *
     * @param {FrameBuffer|Variable} framebuffer
     */
    framebuffer(framebuffer) {
        this._framebuffer = framebuffer;
        return this;
    }

    /**
     * @param {DrawCmdBuilder} builder
     */
    extend(builder) {
        Object.assign(this, builder);
        return this;
    }

    build() {
        this.cmd = {
            id: CMD_COUNTER++,

            frag: this._fragmentShader,
            vert: this._vertexShader,

            attributes: this._attributes,

            uniforms: this._uniforms,

            textures: this._textures,

            vertexCount: this._vertexCount,

            viewport: this._viewport,

            framebuffer: this._framebuffer,
        };

        return (props) => drawCmd(this._context, this.cmd, props);
    }
}

export default DrawCmdBuilder;
