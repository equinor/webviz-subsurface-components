import { drawRawImage ,drawWithColormap, drawWithHillShading, drawWithAdvancedHillShading } from './commands';

// Utils
import Utils from '../utils';

export default async (gl, canvas, image, colormap = null, config = {}) => {
    
    gl.getExtension("OES_texture_float");
    
    const imagesToLoad = [Utils.loadImage(image, config)]; 
    if (colormap) {
        imagesToLoad.push(Utils.loadImage(colormap, config));
    }

    let [loadedImage, loadedColorMap = null] = await Promise.all(imagesToLoad).catch(console.error);

    // Select which draw command to draw
    const shader = config.shader || {};

    const cutOffPoints = {
        cutPointMin: config.cutPointMin || 0,
        cutPointMax: config.cutPointMax || 1000,
    }

    if(loadedColorMap) {

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
                // Draw the image with colormap
                drawWithColormap(gl, canvas, loadedImage, loadedColorMap, {
                    ...config.colorScale,
                    ...shader,
                    ...cutOffPoints,
                });
            }
        }

    } else {
        // Draw the image raw - without colormap
        drawRawImage(gl, canvas, loadedImage, {
            ...cutOffPoints
        })
    }
}

