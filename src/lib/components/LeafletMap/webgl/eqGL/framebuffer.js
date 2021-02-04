/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

class FrameBuffer {
    /**
     *
     * @param {WebGLRenderingContext} gl
     * @param {Number} textureIndex
     * @param {Number} width
     * @param {Number} height
     */
    constructor(gl, textureIndex, width, height) {
        this._textureIndex = textureIndex;
        this._fb = this._createFrameBuffer(gl);
        this._texture = this._createTexture(gl, width, height);
    }

    index() {
        return this._textureIndex;
    }

    bind(gl) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._fb);
    }

    /**
     *
     * @param {WebGLRenderingContext} gl
     * @param {Number} width
     * @param {Number} height
     */
    _createTexture(gl, width, height) {
        const tex = gl.createTexture();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._fb);
        gl.activeTexture(gl.TEXTURE0 + this._textureIndex);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            width,
            height,
            0,
            gl.RGBA,
            gl.FLOAT,
            null
        );
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            tex,
            0
        );
        return tex;
    }

    _createFrameBuffer(gl) {
        const fb = gl.createFramebuffer();
        return fb;
    }
}

export default FrameBuffer;
