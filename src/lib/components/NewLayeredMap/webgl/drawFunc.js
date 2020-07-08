import { drawWithColormap, drawWithHillShading } from './commands';

// Utils
import { loadImage } from './webglUtils';

export default async (gl, canvas, image, colormap, config = {}) => {
    
gl.getExtension("OES_texture_float");
    
    const imagesToLoad = [loadImage(image, config)]; 
    if (colormap) {
        imagesToLoad.push(loadImage(colormap, config));
    }

    const [loadedImage, loadedColorMap = null] = await Promise.all(imagesToLoad).catch(console.error);

    // Select which draw command to draw
    const shader = config.shader || {};
    const scale = config.scale || {};
    const cutoffPoints = config.cutoffPoints || {};
    const cutoffMethod = config.cutoffMethod || {};


    switch(shader.type) {

        case 'hillshading': {
            drawWithHillShading(
                gl, 
                canvas, 
                loadedImage, 
                loadedColorMap,
                shader.elevationScale || null,
                shader.lightDirection || null,
                scale,
                cutoffPoints
            )
            break;
        }

        default: {
            drawWithColormap(gl, canvas, loadedImage, loadedColorMap, scale, cutoffPoints, cutoffMethod);
        }
    }
}

