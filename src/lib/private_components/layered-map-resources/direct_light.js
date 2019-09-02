import { vec3 } from 'gl-matrix';

function direct_light(reglObj, canvas, elevation_frame, color_frame, buffer_output=true){

    let direct_light_buffer

    if (buffer_output){
        direct_light_buffer = reglObj.framebuffer({
            width: canvas.width,
            height: canvas.height,
            colorType: 'float'
        });
    }

    reglObj({
        vert: `
            precision highp float;
            attribute vec2 position;
            
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
            `,
        frag: `
            precision highp float;
          
            uniform sampler2D elevation_frame;
            uniform sampler2D color_frame;
            uniform vec2 resolution;
            uniform float elevation_scale;
            uniform vec3 light_direction;

            void main() {
                vec4 color = texture2D(color_frame, gl_FragCoord.xy/resolution).rgba;
                vec2 dl = 1.0/resolution;

                float v0 = texture2D(elevation_frame, dl * gl_FragCoord.xy).r;
                float vx = texture2D(elevation_frame, dl * (gl_FragCoord.xy + vec2(1.0, 0.0))).r;
                float vy = texture2D(elevation_frame, dl * (gl_FragCoord.xy + vec2(0.0, 1.0))).r;

                // Create tangent vector components along terrain
                // in x and y directions respectively:
                vec3 dx = vec3(elevation_scale, 0.0, vx - v0);
                vec3 dy = vec3(0.0, elevation_scale, vy - v0);

                // Calculate terrain normal vector by taking cross product of dx and dy.
                // Then calculate simple hill shading by taking dot product between
                // normal vector and light direction vector.
                float light = 0.5 * dot(normalize(cross(dx, dy)), light_direction) + 0.5;

                gl_FragColor = color * vec4(light, light, light, 1.0);
            }
            `,
        attributes: {
            position: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]
        },
        uniforms: {
            elevation_frame: elevation_frame,
            color_frame: color_frame,
            elevation_scale: 0.03,
            resolution: [canvas.width, canvas.height],
            light_direction: vec3.normalize([], [1, 1, 1])
        },
        viewport: {
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height
        },
        count: 6,
        framebuffer: direct_light_buffer
    })();

    return direct_light_buffer;   

}

export default direct_light;
