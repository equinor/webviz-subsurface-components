function greyscale2colormap(reglObj, canvas, map_frame, colormap_frame, buffer_output=true){

    let map_elevation_buffer

    if (buffer_output){
        map_elevation_buffer = reglObj.framebuffer({
            width: canvas.width,
            height: canvas.height,
            colorType: 'float'
        });
    }

    const colormap_length = colormap_frame.width

    reglObj({
                vert: `
                    precision mediump float;
                    attribute vec2 position;

                    void main() {
                       gl_Position = vec4(position, 0.0, 1.0);
                    }
                `,
                frag: `
                    precision highp float;
                    uniform sampler2D map_frame;
                    uniform sampler2D colormap_frame;
                    uniform vec2 resolution;
                    uniform float colormap_length;

                    void main() {
                        // Get the map data (it is greyscale so we can take any of the rgb values).
                        float map_array = texture2D(map_frame, gl_FragCoord.xy/resolution).r;

                        // Scale the map_array to corresponding colormap index, and add a
                        // 0.5 pixel offset such that we sample at the "center" of each
                        // pixel in the colormap:
                        gl_FragColor = texture2D(colormap_frame, vec2((map_array * (colormap_length - 1.0) + 0.5) / colormap_length, 0.5));
                    }
                `,
                attributes: {
                    position: [-1, -1, 1, 1, -1, 1, -1, -1, 1, -1, 1, 1]
                },
                count: 6,
                uniforms: {
                    map_frame: map_frame,
                    resolution: [canvas.width, canvas.height],
                    colormap_frame: colormap_frame,
                    colormap_length: colormap_length
                },
                viewport: {x: 0,
                           y: 0,
                           width: canvas.width,
                           height: canvas.height},
                framebuffer: map_elevation_buffer
            })();
        
    return map_elevation_buffer;

}

export default greyscale2colormap;
