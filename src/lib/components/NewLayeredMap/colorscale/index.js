/**
 * @typedef {Array<Number>} Color
 */

/**
 * interpolateByFactor interpolates a color towards another color by a given factor.
 * @param {Color} color1 Array of RGB values
 * @param {Color} color2 Array of RGB values
 * @param {Number} factor - Between 0 and 1
 * @returns {Color}
 */
export const interpolateByFactor = (color1, color2, factor) => {
    
    const result = color1.slice();
    for(let i = 0; i < result.length; i++) {
        result[i] = Math.round(result[i] + factor*(color2[i] - color1[i])); 
    }
    return result;
}

/**
 * interpolateColors linearly interpolates a list of colors with given amount of steps.
 * @param {Array<Color>} colors - The colors that should be interpolated 
 * @param {Number} steps - An unsigned integer. Default is 256. 
 * @returns {Array<Color>} The result of the interpolated colors in the form of an array of colors.
 */
export const interpolateColors = (colors, steps = 256) => {
    const stepsBetweenColor = steps/(colors.length - 1);
    console.log("StepsBetweenColors:", stepsBetweenColor, colors.length, colors.length*stepsBetweenColor, colors.length*stepsBetweenColor % steps);
    const stepFactor = 1 / (stepsBetweenColor - 1);
    const interpolatedColors = [];

    for(let col = 0; col < colors.length - 1; col++) {
        for(let i = 0; i < stepsBetweenColor; i++) {
            interpolatedColors.push(interpolateByFactor(colors[col], colors[col+1], stepFactor*i));
        }
    }
    interpolatedColors.push(colors[colors.length-1]);
    console.log("Interpolated Colors Length:", interpolatedColors.length);

    return interpolatedColors;
}

/**
 * buildColormap takes a set of colors and creates a N x 1 image with those colors.
 * @param {Array<Color>} colors - The colors to base the image on.
 * @returns {String} A dataURL-string.
 */
export const buildColormap = (colors) => {
    const t0 = performance.now();

    const size = colors.length;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext("2d");


    // Set pixel by pixel with fillStyle and fillRect. An alternative is to use ImageData, but according to
    // this post - fillRect was more performant:
    // https://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas
/*     for(let i = 0; i < size; i++) {
        ctx.fillStyle = `rgba(${colors[i][0]}, ${colors[i][1]}, ${colors[i][2]}, ${1})`
        ctx.fillRect(i, 0, 1, 1);
    } */

    const imageData = ctx.createImageData(256, 1);
    canvas.width = 256;
    canvas.height = 1;
    for(let i = 0; i < size; i++) {
        imageData.data[i*4 + 0] = colors[i][0];
        imageData.data[i*4 + 1] = colors[i][1];
        imageData.data[i*4 + 2] = colors[i][2];
        imageData.data[i*4 + 3] = colors[i][3] || 255;
    }
    ctx.putImageData(imageData, 0, 0);


    const url =  canvas.toDataURL("image/png");
    const t1 = performance.now();
    console.log(`Time: ${t1-t0} ms`)

    return url;
}

/**
 * buildColormapFromHexColors builds a N x 1 colormap image based on an array of colors in hex-format.
 * @param {Array<String>} hexColors
 * @returns {String} A dataURL-string.
 */
export const buildColormapFromHexColors = (hexColors, step=256) => {
    const colors = hexColors.map(hexToRGB);
    const interpolated = interpolateColors(colors, step);
    return buildColormap(interpolated);
}

/**
 * hexToRGB converts a color from hex format to rgb-format. 
 * @param {String} hex - A color in hex format
 * 
 * @example
 * const [r, g, b] = hexToRGB("#ffeeaa") 
 */
export const hexToRGB = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
}
