export const loadImage = (src, config = {}) =>
    new Promise(resolve => {
        const img = new Image();
        if(config.crossOrigin || config.crossOrigin === '') {
            requestCORSIfNotSameOrigin(img, src, config.crossOrigin === true ? '' : config.crossOrigin);
        }
        
        img.crossOrigin = 'anonymous'
        img.src = src;
        img.onload = () => resolve(img);
});

const requestCORSIfNotSameOrigin = (img, url, value) => {
    if ((new URL(url, window.location.href)).origin !== window.location.origin && !url.startsWith("data:")) {
        img.crossOrigin = value;
    }
}


/**
 * 
 * @param {HTMLImageElement|String} loadedImage 
 * @param {Number} scaleX 
 * @param {Number} scaleY
 * @returns {Promise<HTMLImageElement>}
 */
export const scaleImage = async (loadedImage, scaleX, scaleY) => {
    if(typeof loadedImage === 'string') {
        loadedImage = await loadImage(loadedImage);
    }

    const scaleCanvas = document.createElement('canvas');
    const ctx = scaleCanvas.getContext("2d");
    scaleCanvas.width = loadedImage.width * scaleX;
    scaleCanvas.height = loadedImage.height * scaleY;
    ctx.scale(scaleX, scaleY);
    ctx.drawImage(loadedImage, 0, 0);
    return scaleCanvas.toDataURL("image/png");
}

/**
 * 
 * @param {Array<String|HTMLImageElement>} tiles
 * @param {Number} xDim
 * @param {Number} yDim
 * @returns {[String, Array<HTMLImageElement>]} Base64 URL of the merged image
 */
export const imagesToGrid = async (tiles, xDim = 3, yDim = 3, options = {}) => {

    if(xDim*yDim !== tiles.length) {
        return null;
    }

    // Make sure all the images are HTMLImageElement.
    const imagePromises = tiles.map((img) => (
        typeof img === 'string' ? loadImage(img, options) : Promise.resolve(img)
    ));
    const images = await Promise.all(imagePromises);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext("2d");
    const size = images[0].width;
    canvas.width = size*3;
    canvas.height = size*3;

    // Merge them into a grid
    for(let i = 0; i < images.length; i++) {
        const x = i%3;
        const y = i/3;

        if(images[i] instanceof HTMLImageElement) {
            ctx.drawImage(images[i], x*size, y*size, size, size);
        }
    }
    return [canvas.toDataURL(), images];
}