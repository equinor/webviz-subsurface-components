import DrawCmdBuilder from './builder';
import FrameBuffer from './framebuffer';

export { default as FrameBuffer } from './framebuffer'

export class EQGLContext {

    /**
     * 
     * @param {WebGLRenderingContext} gl 
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(gl, canvas) {
        this._gl = gl;
        this._canvas = canvas;
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
    framebuffer(textureIndex, options) {
        const width = options.width || 0;
        const height = options.height || 0;
        return new FrameBuffer(this._gl, textureIndex, width, height);
    }
}



/**
 * @typedef {Function} eqGL
 * @property {WebGLRenderingContext} gl
 * @property {HTMLCanvasElement} canvas
 * @returns {EQGLContext}
 */
const eqGL = (gl, canvas) => {
    return new EQGLContext(gl, canvas);
}

export default eqGL;

