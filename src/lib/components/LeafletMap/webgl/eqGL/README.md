This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.

Copyright (C) 2020 - Equinor ASA.

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
    .texture("uniformName", eqGL.texture({image: image }))
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
    .texture("uniformName", eqGL.texture({ image }))
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
    .texture("tElevation", 0, loadedImage) // Manually set the textureUnit
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

## ⛺ Textures
Textures are basically images passed to the shaders. Normally, in WebGL, you would have to bind textures to buffers by assigning the textures with a _textureUnit_ number. Keeping track of these numbers be cumbersome, but can be avoided by letting EqGL keep track of them for you. There are mulitple ways of using textures in EqGL:

### Letting EqGL keep track of everything (recommended)
EqGL has a _texture_ method that binds the image to a buffer and automatically assigns it a _textureUnit_ number.
```javascript
const tex = eqGL.texture({ image: image })

const drawCmd = eqGL.new()
    .vert(vertexShader);
    .frag(fragmentShader);
    .texture("uniformName", tex) // Using the texture
    .build()
```

### Doing it manually
```javascript
const drawCmd = eqGL.new()
    .vert(vertexShader);
    .frag(fragmentShader);
    .texture("uniformName", textureUnit, image)
    .build()
```

### Using framebuffers
Framebuffers are basically textures stored in a buffer, which can be used as _Sample2D_ inputs:
```javascript
// Creating a new framebuffer
const fbo = eqGL.framebuffer({ width: width, height: height});

const firstCmd = eqGL.new()
    .vert(vertexShader);
    .frag(fragmentShader);
    .texture("uniformName", eqGL.texture({ image }))
    .framebuffer(fbo) // Drawing to the framebuffer
    .build()

firstCmd()

const secondCmd = eqGL.new()
    .vert(vertexShader);
    .frag(fragmentShader);
    .texture("uniformName", fbo) // <-- Using the framebuffer as a texture
    .build()

secondCmd()
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
    * Add support for renderbuffers.
    * What do [ReGL](https://github.com/regl-project/regl) have that we do not? 🤔
