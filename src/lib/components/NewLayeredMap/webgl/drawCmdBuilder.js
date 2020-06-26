/**
 * DrawCmdBuilder is a builder for building draw commands that can be used
 * in WebGL environments. It basically creates a configuration on how to draw with WebGL. 
 */
class DrawCmdBuilder {

    constructor() {
        this._vertexShader = null;
        this._fragmentShader = null;

        this._attributes = {};
        this._uniforms = {};
        this._textures = {};

        this._vertexCount = 0; // The number of vertices to draw
    }

    setVertexShader(vertexShader) {
        this._vertexShader = vertexShader;
        return this;
    }

    setFragmentShader(fragmentShader) {
        this._fragmentShader = fragmentShader;
        return this;
    }

    addAttribute(attributeName, value) {
        this._attributes[attributeName] = { value };
        return this;
    }

    addUniformF(uniformName) {
        const args = arguments;
        const values = Object.values(args).slice(1); // Remove the "uniformName"
        if(values.length === 0) {
            return;
        }   

        let type = `${values.length}f`; // Assume it is not an array
        if(Array.isArray(values[0])) {
            type = `${values[0].length}fv`; // It is an array
        }
        this.addUniformByType(uniformName, type, values );
        return this;
    }

    addUniformByType(uniformName, type, value) {
        this._uniforms[uniformName] = { value, type };
        return this;
    }

    addTexture(textureName, textureUnit, textureImage) {
        this._textures[textureName] = {
            textureUnit,
            textureImage,
        }
        return this;
    }

    setVertexCount(vertexCount) {
        this._vertexCount = vertexCount;
        return this;
    }

    build() {
        
        return {
            frag: this._fragmentShader,
            vert: this._vertexShader,

            attributes: this._attributes,

            uniforms: this._uniforms,

            textures: this._textures,

            vertexCount: this._vertexCount,
        }

    }
}


export default DrawCmdBuilder;