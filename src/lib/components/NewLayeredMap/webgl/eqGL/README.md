# 🌍 EqGL - WebGL abstraction framework
EqGL is an abstract framework for webgl, making it easier to write WebGL-code, resulting in less and more readable code. This framework is highly inspiried by [ReGL](https://github.com/regl-project/regl), but is simplified and less feature rich. EqGL is supposed to be a good alternative to ReGL, were one just wants to avoid nasty WebGL code and big dependencies.

## ⛰ Usage

### Creating a new EqGL context
```javascript
import EQGL from '../eqGL'; // Make sure path is correct

const canvas = document.createElement("canvas");
const gl = canvas.getContext("webgl");

// Create new WebGL context
const eqGL = EQGL(gl, canvas);
```

### Using the EqGL context
The EqGLContext is basically just a wrapper around the WebGL context and is used by building DrawCommands - where a DrawCommand is a set of defined shaders, attributes, textures, uniforms...etc.
```javascript
// Create new WebGL context
const eqGL = EQGL(gl, canvas);

const builder = eqGL.new();

const drawCmd = builder
    .vert(vertexShader);
    .frag(fragmentShader);
    .attribute("attributeName", 12 /* Attribute value */)
    .texture("uniformName", textureIndex, image)
    .uniformf("uniformName2", 100, 200) // gl.uniform2f(...)
    .build()

drawCmd(); // Draws to canvas
```

### DrawCommands with Variables
The DrawCommands can be run several times, and one might want to change the given parameters for each run. This can be done through variables.

```javascript
// Create new WebGL context
const eqGL = EQGL(gl, canvas);

const builder = eqGL.new();

const drawCmd = builder
    .vert(vertexShader);
    .frag(fragmentShader);
    .attribute("attributeName", 12)
    .texture("uniformName", textureIndex, image)
    .uniformf("uniformName2", 100, 200)
    .uniformf("uniformName3", eqGl.variable("myVar")) // The variable
    .build()

for(let i = 0; i < 10; i++) {
    drawCmd({
        myVar: i // Setting the variable here
    })
};
```

### Using framebuffers
To use framebuffers in EqGL is quite similar to ReGL. For a bigger example, take a look at the [hillshader](https://github.com/equinor/webviz-subsurface-components/tree/master/src/lib/components/NewLayeredMap/webgl/commands/drawWithAdvancedHillShading.js).
```javascript
// The framebuffer textures now uses floats
gl.getExtension('OES_texture_float');

// Create new framebuffer
const fboElevation = eqGL.framebuffer({ width: width, height: height});

const elevationCmd = eqGL.new()
    .vert(positionVShader)
    .frag(elevationFShader)
    .attribute("position", [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
    .texture("tElevation", 0, loadedImage)
    .vertexCount(6)
    .viewport(0, 0, loadedImage.width, loadedImage.height)
    .framebuffer(fboElevation) // Set framebuffer
    .build();

// Draw to framebuffer
elevationCmd();

const normalCmd = eqGL.new()
        .vert(positionVShader)
        .frag(normalsFShader)
        .attribute("position", [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1])
        .texture("tElevation", fboElevation) // Using the framebuffer as texture
        .vertexCount(6)
        .viewport(0, 0, loadedImage.width, loadedImage.height)
        .build();

// Draw to canvas
normalCmd();
```

## 🌌 Further work and improvements
### Improvements
* Currently the framebuffer creates a new texture with floats. This requires the user to enable the extension _OES_texture_float_. It might not always be necessary to use gl.FLOAT and might be better with gl.UNSIGNED_BYTE. Therefore, it would be nice to make it possible to be explicit when one wants to use floats, just like in ReGL:
```javascript

eqGL.framebuffer({
    width: width,
    height: height,
    type: 'float', // Add support for this, were default is UNSIGNED_BYTE
})
```
### Further work
* Support more WebGL features
    * Maybe `egGL.texture({ texture: image, flipY: true })` would be handy, since now one have to manually define a _texture-index_. EqGL can do this internally, just like the framebuffer.
    * Add support for renderbuffers. 
    * What do [ReGL](https://github.com/regl-project/regl) have that we do not? 🤔 