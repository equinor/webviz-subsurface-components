let TEXTURE_INDEX_COUNT = -1;

class FrameBuffer {
    
    /**
     * 
     * @param {WebGLRenderingContext} gl 
     * @param {Number} textureIndex 
     * @param {Number} width 
     * @param {Number} height 
     */
    constructor(gl, width, height) {
        if(TEXTURE_INDEX_COUNT === -1) {
            TEXTURE_INDEX_COUNT = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        }


        this._textureIndex = TEXTURE_INDEX_COUNT--;
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
        gl.activeTexture(gl.TEXTURE0 + this._textureIndex);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._fb);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0
        );
        return tex;
    }

    _createFrameBuffer(gl) {
        const fb = gl.createFramebuffer();
        return fb;
    }
}

export default FrameBuffer;

