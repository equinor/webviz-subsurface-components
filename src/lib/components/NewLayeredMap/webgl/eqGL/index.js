import DrawCmdBuilder from './builder';
import FrameBuffer from './framebuffer';
import Variable from './variable';

export { default as FrameBuffer } from './framebuffer';
export * as Utils from './utils';

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
        return new FrameBuffer(this._gl, width, height);
    }

    /**
     * @param {String} variableName
     * @returns {Variable}
     */
    variable(variableName) {
        return new Variable(variableName);
    }


    _addProgram(cmdId, program, vert, frag) {
        this._programs[cmdId] = { p: program, vert, frag };
    }
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
}

export default eqGL;

