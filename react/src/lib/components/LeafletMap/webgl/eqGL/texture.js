/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

class Texture {
    constructor(gl, textureIndex, options = {}) {
        if (!options.image || !(options.image instanceof HTMLImageElement)) {
            throw new TypeError("image is not defined or is not an image");
        }

        this._textureIndex = textureIndex;
        this._options = options;
    }

    index() {
        return this._textureIndex;
    }

    /**
     *
     * @param {WebGLRenderingContext} gl
     * @returns {Number} The index of the texture
     */
    bind(gl) {
        gl.activeTexture(gl.TEXTURE0 + this._textureIndex);
        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());

        // Default params
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Custom parameters
        Object.entries(this._options.params || {}).forEach(([name, param]) => {
            gl.texParameteri(gl.TEXTURE_2D, name, param);
        });

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            Texture._getType(gl, this._options.type),
            this._options.image
        );
        return this._textureIndex;
    }

    /**
     *
     * @param {WebGLRenderingContext} gl
     * @param {String} type
     */
    static _getType(gl, type) {
        switch (type) {
            case "float": {
                return gl.FLOAT;
            }

            case "unsigned-byte": {
                return gl.UNSIGNED_BYTE;
            }

            default: {
                return gl.UNSIGNED_BYTE; // Current default
            }
        }
    }
}

export default Texture;
