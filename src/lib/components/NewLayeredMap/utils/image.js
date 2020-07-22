export const loadImage = (src, config = {}) =>
    new Promise(resolve => {
        const img = new Image();
        if(config.crossOrigin || config.crossOrigin === '') {
            requestCORSIfNotSameOrigin(img, src, config.crossOrigin === true ? '' : config.crossOrigin);
        }

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