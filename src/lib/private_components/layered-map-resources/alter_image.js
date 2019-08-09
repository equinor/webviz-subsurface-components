import regl from 'regl';

function alter_image(map_base64, colormap_base64){

    const canvas = document.createElement('canvas');
    const reglObj = regl(canvas)

    const load_texture = src =>
        new Promise(resolve => {
            const img = new Image();
            img.src = src
            img.onload = () => resolve({'texture': reglObj.texture(img),
                                        'width': img.width,
                                        'height': img.height});
        });

    return Promise.all([load_texture(map_base64), load_texture(colormap_base64)])
        .then(function(textures) {

            const map_image = textures[0].texture
            canvas.width = textures[0].width;
            canvas.height = textures[0].height;

            const colormap = textures[1].texture
            const colormap_length = textures[1].width

            const greyscale2colormap = reglObj({
                vert: `
                    precision mediump float;
                    attribute vec2 position;

                    void main() {
                       gl_Position = vec4(position, 0, 1);
                    }
                `,
                frag: `
                    precision mediump float;
                    uniform sampler2D map_image;
                    uniform sampler2D colormap;
                    uniform vec2 resolution;
                    uniform float colormap_length;

                    void main() {
                        // Find the pixel coordinate (range [0, 1]).
                        vec2 coord = gl_FragCoord.xy/resolution;
                        // Get the map data (it is greyscale so we can take any of the rgb values).
                        // At the same time, flip Y axis (such that original input image direction is kept).
                        float map_array = texture2D(map_image, vec2(coord[0], 1.0-coord[1])).r;

                        // Scale the map_array to corresponding colormap index, and add a
                        // 0.5 pixel offset such that we sample at the "center" of each
                        // pixel in the colormap:
                        gl_FragColor = texture2D(colormap, vec2((map_array * (colormap_length - 1.0) + 0.5) / colormap_length, 0.5));
                    }
                `,
                attributes: {
                    position: [-1, -1, 1, 1, -1, 1, -1, -1, 1, -1, 1, 1]
                },
                count: 6,
                uniforms: {
                    map_image: map_image,
                    resolution: [canvas.width, canvas.height],
                    colormap: colormap,
                    colormap_length: colormap_length
                },
                viewport: {x: 0,
                           y: 0,
                           width: canvas.width,
                           height: canvas.height}
            });

        greyscale2colormap();

        return canvas.toDataURL();
    });
}

export default alter_image;
