function alter_image(map_base64, colormap_base64, hillshading, canvas){

    const createShader = (gl, shaderType, shaderSource) => {
        /**
         * Create shader given type and source code
         *
         * @param {WebGL context} gl - The WebGL context to use
         * @param {shader} shadertype - Either gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
         * @param {shaderSource} string - The shader source code
         */

        const shader = gl.createShader(shaderType)
        gl.shaderSource(shader, shaderSource)
        gl.compileShader(shader)
        return shader
    }

    const createProgram = (gl, vertexShader, fragmentShader) => {
        /**
         * Create and link a WebGL program
         *
         * @param {WebGL context} gl - The WebGL context to use
         * @param {shader} vertexShader - The compiled vertex shader to attach
         * @param {shader} fragmentShader - The compiled fragment shader to attach
         */

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
    
        uniform vec2 u_resolution_vertex;
    
        varying vec2 v_texCoord;
    
        void main() {
           // Convert from pixel range ([0, w] x [0, h]) to clip space ([-1, 1] x [-1, 1]):
           vec2 clipSpace = (a_position / u_resolution_vertex) * 2.0 - 1.0;
    
           // Flip y axis
           gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    
           // Pass the texCoord to the fragment shader
           v_texCoord = a_texCoord;
        }
    `

    const fragmentShaderSourceWithoutHillshading = `
      precision mediump float;
    
      uniform sampler2D u_image;
      uniform sampler2D u_colormap_frame;
      uniform float u_colormap_length;

      varying vec2 v_texCoord;
    
      void main() {
          float map_array = texture2D(u_image, v_texCoord).r;
          gl_FragColor = texture2D(u_colormap_frame, vec2((map_array * (u_colormap_length - 1.0) + 0.5) / u_colormap_length, 0.5));
      }
    `

    const fragmentShaderSourceWithHillshading = `
      precision mediump float;
    
      uniform sampler2D u_image;
      uniform sampler2D u_colormap_frame;
      uniform vec2 u_resolution_fragment;
      uniform float u_colormap_length;
      uniform float u_elevation_scale;
      uniform vec3 u_light_direction;

      varying vec2 v_texCoord;
    
      void main() {

          vec2 dl = 1.0/u_resolution_fragment;

          vec2 pixelPos = vec2(gl_FragCoord.x, u_resolution_fragment.y - gl_FragCoord.y);

          float v0 = texture2D(u_image, dl * pixelPos).r;
          float vx = texture2D(u_image, dl * (pixelPos + vec2(1.0, 0.0))).r;
          float vy = texture2D(u_image, dl * (pixelPos + vec2(0.0, 1.0))).r;

          // Create tangent vector components along terrain
          // in x and y directions respectively:
          vec3 dx = vec3(u_elevation_scale, 0.0, vx - v0);
          vec3 dy = vec3(0.0, u_elevation_scale, v0 - vy);

          // Calculate terrain normal vector by taking cross product of dx and dy.
          // Then calculate simple hill shading by taking dot product between
          // normal vector and light direction vector.
          float light = 0.5 * dot(normalize(cross(dx, dy)), u_light_direction) + 0.5;

          float map_array = texture2D(u_image, v_texCoord).r;
          vec4 color = texture2D(u_colormap_frame, vec2((map_array * (u_colormap_length - 1.0) + 0.5) / u_colormap_length, 0.5));

          gl_FragColor = color * vec4(light, light, light, 1.0);
      }
    `

    const load_image = src =>
        new Promise(resolve => {
            const img = new Image();
            img.src = src
            img.onload = () => resolve(img)
        });


    Promise.all([load_image(map_base64), load_image(colormap_base64)])
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
                createShader(gl, gl.FRAGMENT_SHADER, hillshading ? fragmentShaderSourceWithHillshading : fragmentShaderSourceWithoutHillshading)
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
            bindTexture(gl, 1, 'u_colormap_frame', colormap_image)

            gl.uniform2f(
                gl.getUniformLocation(program, 'u_resolution_vertex'),
                gl.canvas.width,
                gl.canvas.height
            )

            gl.uniform1f(
                gl.getUniformLocation(program, 'u_colormap_length'),
                colormap_image.width
            )

            if (hillshading){
                gl.uniform2f(
                    gl.getUniformLocation(program, 'u_resolution_fragment'),
                    gl.canvas.width,
                    gl.canvas.height
                )

                const light_direction = [1, 1, 1]
                const vectorLength = Math.sqrt(light_direction[0]**2 + light_direction[1]**2 + light_direction[2]**2)
        
                gl.uniform3f(
                    gl.getUniformLocation(program, 'u_light_direction'),
                    light_direction[0] / vectorLength,
                    light_direction[1] / vectorLength,
                    light_direction[2] / vectorLength
                )

                const elevationScale = 0.03
                gl.uniform1f(
                    gl.getUniformLocation(program, 'u_elevation_scale'),
                    elevationScale
                )
            }

            const numberIndices = 6
            gl.drawArrays(gl.TRIANGLES, 0, numberIndices)
    })
}

export default alter_image
