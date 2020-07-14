import { drawWithColormap, drawWithHillShading, drawWithNewHillShading } from './commands';

// Utils
import { Utils } from './eqGL';

export default async (gl, canvas, image, colormap, config = {}) => {
    
    gl.getExtension("OES_texture_float");
    
    const imagesToLoad = [Utils.loadImage(image, config)]; 
    if (colormap) {
        imagesToLoad.push(Utils.loadImage(colormap, config));
    }

    const [loadedImage, loadedColorMap = null] = await Promise.all(imagesToLoad).catch(console.error);

    // Select which draw command to draw
    const shader = config.shader || {};

    switch(shader.type) {

        // Old hillshader
        case 'soft-hillshading': {
            drawWithHillShading(
                gl, 
                canvas, 
                loadedImage, 
                loadedColorMap,
                {
                    ...config.colorScale,
                    ...shader,    
                }
            )
            break;
        }

        case 'hillshading': {
            drawWithNewHillShading(gl, canvas, loadedImage, loadedColorMap, {
                ...config.colorScale,
                ...shader,
            });
            break;
        }


        default: {
            drawWithColormap(gl, canvas, loadedImage, loadedColorMap, {
                ...config.colorScale,
                ...shader,
            });
        }
    }
}

