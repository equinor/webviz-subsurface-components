function alter_image(map_base64, colormap_base64, hillshading, canvas){

    const createShader = (gl, shaderType, shaderSource) => {
        const shader = gl.createShader(shaderType)
        gl.shaderSource(shader, shaderSource)
        gl.compileShader(shader)
        return shader
    }

    const createProgram = (gl, vertexShader, fragmentShader) => {
        const program = gl.createProgram()
        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragmentShader)
        gl.linkProgram(program)
        return program
    }

    const bindBuffer = (gl, attribName, array) => {
        /**
         * Bind data to buffer and link it to a given attribute name in the
         * current program attached to the WebGL context.
         *
         * @param {WebGL context} gl - The WebGL context to use
         * @param {string} attribName - The attribute name used in the shader code
         * @param {array} array - The array data to bind to the buffer
         */

        const program = gl.getParameter(gl.CURRENT_PROGRAM)

        const newBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, newBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW)
        const attribLocation = gl.getAttribLocation(program, attribName)
        gl.enableVertexAttribArray(attribLocation)
        gl.bindBuffer(gl.ARRAY_BUFFER, newBuffer)
        gl.vertexAttribPointer(attribLocation, 2, gl.FLOAT, false, 0, 0)
    }

    const bindTexture = (gl, textureIndex, uniformName, image) => {
        /**
         * Bind texture to a given uniform name in the current program attached
         * to the WebGL context.
         *
         * @param {WebGL context} gl - The WebGL context to use
         * @param {int} textureIndex - The texture index to use (all computers support <= 4)
         * @param {string} uniformName - The uniform name used in the shader code
         * @param {image element} image - The image element to use as input data for the texture
         */

        const program = gl.getParameter(gl.CURRENT_PROGRAM)

        gl.activeTexture(gl.TEXTURE0 + textureIndex)
        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
        gl.uniform1i(gl.getUniformLocation(program, uniformName), textureIndex)
    }


    const vertexShaderSource = `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
    
        uniform vec2 u_resolution;
    
        varying vec2 v_texCoord;
    
        void main() {
           // Convert from pixel range ([0, w] x [0, h]) to clip space ([-1, 1] x [-1, 1]):
           vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
    
           gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    
           // pass the texCoord to the fragment shader
           v_texCoord = a_texCoord;
        }
`

    const fragmentShaderSource = `
      precision mediump float;
    
      uniform sampler2D u_image;
      uniform sampler2D colormap_frame; // addition from greyscale

      varying vec2 v_texCoord;
    
      void main() {
          float map_array = texture2D(u_image, v_texCoord).r;
          gl_FragColor = texture2D(colormap_frame, vec2((map_array * (255.0 - 1.0) + 0.5) / 256.0, 0.5));
      }
`

    const load_texture = src =>
        new Promise(resolve => {
            const img = new Image();
            img.src = src
            img.onload = () => resolve(img)
        });


    Promise.all([load_texture(map_base64), load_texture(colormap_base64)])
        .then(function([map_image, colormap_image]) {

            const gl = canvas.getContext('webgl', {premultipliedAlpha: false })
            gl.getExtension('OES_texture_float')

            canvas.width = map_image.width
            canvas.height = map_image.height

            // Clear canvas
            gl.clearColor(0, 0, 0, 0)
            gl.clear(gl.COLOR_BUFFER_BIT)

            // Tell WebGL how to convert from clip space ([-1, 1] x [-1, 1]) back to pixel space ([0, w] x [0, h]):
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

            const program = createProgram(
                gl,
                createShader(gl, gl.VERTEX_SHADER, vertexShaderSource),
                createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
            )
            
            gl.useProgram(program)

            bindBuffer(gl, 'a_texCoord', [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1])
            bindBuffer(gl, 'a_position', [
                0, 0,
                map_image.width, 0,
                0, map_image.height,
                0, map_image.height,
                map_image.width, 0,
                map_image.width, map_image.height
            ])

            bindTexture(gl, 0, 'u_image', map_image)
            bindTexture(gl, 1, 'colormap_frame', colormap_image)

            gl.uniform2f(
                gl.getUniformLocation(program, 'u_resolution'),
                gl.canvas.width,
                gl.canvas.height
            )

            gl.drawArrays(gl.TRIANGLES, 0, 6)

    })
}

export default alter_image;
