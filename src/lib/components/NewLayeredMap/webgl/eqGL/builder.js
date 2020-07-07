import { EQGLContext, FrameBuffer } from './index';
import drawCmd from './draw';

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
        if(values.length === 0) {
            return;
        }   

        let type = `${values.length}f`; // Assume it is not an array
        if(Array.isArray(values[0])) {
            type = `${values[0].length}fv`; // It is an array
        }
        this.uniform(uniformName, type, values );
        return this;
    }

    uniform(uniformName, type, value) {
        this._uniforms[uniformName] = { value, type };
        return this;
    }

    texture(textureName, textureUnit, textureImage) {
        this._textures[textureName] = {
            textureUnit,
            textureImage,
        }
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
     * @param {FrameBuffer} framebuffer 
     */
    framebuffer(framebuffer) {
        this._framebuffer = framebuffer;
        return this;
    }

    build() {
        
        this.cmd = {
            frag: this._fragmentShader,
            vert: this._vertexShader,

            attributes: this._attributes,

            uniforms: this._uniforms,

            textures: this._textures,

            vertexCount: this._vertexCount,

            viewport: this._viewport,

            framebuffer: this._framebuffer,
        }

        return () => drawCmd(this._context, this.cmd);
    }
}


export default DrawCmdBuilder;