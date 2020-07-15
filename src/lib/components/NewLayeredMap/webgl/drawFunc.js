import { drawWithColormap, drawWithHillShading, drawWithAdvancedHillShading } from './commands';

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

    const cutOffPoints = {
        cutPointMin: config.cutPointMin || 0,
        cutPointMax: config.cutPointMax || 1000,
    }

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
            drawWithAdvancedHillShading(gl, canvas, loadedImage, loadedColorMap, {
                ...config.colorScale,
                ...shader,
                ...cutOffPoints,
            });
            break;
        }


        default: {
            drawWithColormap(gl, canvas, loadedImage, loadedColorMap, {
                ...config.colorScale,
                ...shader,
                ...cutOffPoints,
            });
        }
    }
}

