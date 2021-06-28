/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import DrawCmdBuilder from "./builder";
import FrameBuffer from "./framebuffer";
import Variable from "./variable";
import Texture from "./texture";

export { default as FrameBuffer } from "./framebuffer";
export * as Utils from "./webglutils";

export class EQGLContext {
    /**
     *
     * @param {WebGLRenderingContext} gl
     * @param {HTMLCanvasElement} canvas
     */
    constructor(gl, canvas) {
        this._gl = gl;
        this._canvas = canvas;

        // Store already compiled programs
        this._programs = {};

        this.TEXTURE_INDEX_COUNT =
            gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS) - 1;
    }

    /**
     * @returns {DrawCmdBuilder}
     */
    new() {
        return new DrawCmdBuilder(this);
    }

    /**
     * @param {Number} textureIndex
     * @param {Object} options
     * @returns {FrameBuffer}
     */
    framebuffer(options) {
        const width = options.width || 0;
        const height = options.height || 0;
        return new FrameBuffer(
            this._gl,
            this._nextTextureIndex(),
            width,
            height
        );
    }

    /**
     * @param {String} variableName
     * @returns {Variable}
     */
    variable(variableName) {
        return new Variable(variableName);
    }

    /**
     *
     * @param {Object} options
     * @param {HTMLImageElement} options.image
     * @param {Object} options.params - Custom gl.texParamteri-configuration
     */
    texture(options = {}) {
        return new Texture(this._gl, this._nextTextureIndex(), options);
    }

    _addProgram(cmdId, program, vert, frag) {
        this._programs[cmdId] = { p: program, vert, frag };
    }

    _nextTextureIndex = () => {
        if (this.TEXTURE_INDEX_COUNT === -1) {
            this.TEXTURE_INDEX_COUNT =
                this._gl.getParameter(this._gl.MAX_TEXTURE_IMAGE_UNITS) - 1;
        }

        return this.TEXTURE_INDEX_COUNT--;
    };

    /**
     * Cleans and clears the entrie context.
     */
    clean = () => {
        const numTextureUnits = this._gl.getParameter(
            this._gl.MAX_TEXTURE_IMAGE_UNITS
        );
        for (let unit = 0; unit <= numTextureUnits; unit++) {
            this._gl.activeTexture(this._gl.TEXTURE0 + unit);
            this._gl.bindTexture(this._gl.TEXTURE_2D, null);
            this._gl.bindTexture(this._gl.TEXTURE_CUBE_MAP, null);
        }
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, null);
        this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, null);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);

        this._canvas = null;
        this._gl = null;
        this._programs = null;
    };
}

/**
 * @typedef {Function} eqGL
 * @returns {EQGLContext}
 */

/**
 * @type {eqGL}
 * @property {WebGLRenderingContext} gl
 * @property {HTMLCanvasElement} canvas
 */
const eqGL = (gl, canvas) => {
    return new EQGLContext(gl, canvas);
};

export default eqGL;
