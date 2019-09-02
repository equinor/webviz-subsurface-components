import regl from 'regl';
import greyscale2colormap from './greyscale2colormap';
import direct_light from './direct_light';

function alter_image(map_base64, colormap_base64, hillshading, canvas){

    const reglObj = regl({
                          gl: canvas.getContext('webgl', { premultipliedAlpha: false }),
                          extensions: ["OES_texture_float"]
                         })

    const load_texture = src =>
        new Promise(resolve => {
            const img = new Image();
            img.src = src
            img.onload = () => resolve({'texture': reglObj.texture({data: img, flipY: true}),
                                        'width': img.width,
                                        'height': img.height})
        });

    return Promise.all([load_texture(map_base64), load_texture(colormap_base64)])
        .then(function(textures) {

            const map_image = textures[0].texture

            canvas.width = textures[0].width;
            canvas.height = textures[0].height;

            const colormap = textures[1].texture

            const color_buffer = greyscale2colormap(reglObj, canvas, map_image, colormap, hillshading);
            if (hillshading){
                direct_light(reglObj, canvas, map_image, color_buffer, false);
            }

    });
}

export default alter_image;
