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
    
      varying vec2 v_texCoord;
    
      void main() {
          gl_FragColor = texture2D(u_image, v_texCoord);
      }
`

    const load_texture = src =>
        new Promise(resolve => {
            const img = new Image();
            img.src = src
            img.onload = () => resolve(img)
        });


    Promise.all([load_texture(map_base64)])
        .then(function(textures) {

            const map_image = textures[0]

            const gl = canvas.getContext('webgl')
 
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
            
            const positionBuffer = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)  
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                0, 0,
                map_image.width, 0,
                0, map_image.height,
                0, map_image.height,
                map_image.width, 0,
                map_image.width, map_image.height
            ]), gl.STATIC_DRAW)

            const texcoordBuffer = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW)

            gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, map_image)
 
            gl.useProgram(program)
            gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), gl.canvas.width, gl.canvas.height)

            const positionAttribLocation = gl.getAttribLocation(program, 'a_position')
            gl.enableVertexAttribArray(positionAttribLocation)
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
            gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0)

            const texcoordAttribLocation = gl.getAttribLocation(program, 'a_texCoord')
            gl.enableVertexAttribArray(texcoordAttribLocation)
            gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
            gl.vertexAttribPointer(texcoordAttribLocation, 2, gl.FLOAT, false, 0, 0)

            gl.drawArrays(gl.TRIANGLES, 0, 6)

    })
}

export default alter_image;
