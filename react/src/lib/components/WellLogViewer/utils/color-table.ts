import { ColorTable } from "../components/ColorTableTypes";

/*
  Binary serach in array of elements [number, ...]
  */
function binarySearch(array: number[][], v: number) {
    let lo = -1,
        hi = array.length;
    while (1 + lo < hi) {
        const mi = lo + ((hi - lo) >> 1);
        if (array[mi][0] >= v) {
            hi = mi;
        } else {
            lo = mi;
        }
    }
    return hi;
}

/*
  get HTML string in #xxxxxx format with color value given in the first 3 elements of array
*/
export function colorToString(
    color: [number, number, number] | undefined, // [r,g,b]
    cDefault: string
): string {
    if (!color) return cDefault;
    // old code was based on following algorithm for every x component :
    // c = Math.round(color[x] * 255) // component values from range [0.0, 1.0] is mapped to the range [0,255]
    // const p =
    //    0x1000000 | // force value to have 7 hex digits : 1rrggbb
    //    (Math.round(color[0] * 255) << 16) |
    //    (Math.round(color[1] * 255) << 8) |
    //    Math.round(color[2] * 255);
    // it results in: 
    // [0.0, 0.5/255) = [0.0, 0.00196078431372549) => 0
    // [0.5/255, 1.5/255) = [0.00196078431372549, 0.0058823529411764705) => 1
    // [1.5/255, 2.5/255) = [0.0058823529411764705, 0.00980392156862745) => 2
    // ...
    // [253.5/255, 254.5/255) = [0.9941176470588236, 0.9980392156862745) => 254
    // [254.5/255, 1.0] = [0.9980392156862745, 1.0] => 255
    // but the first and the last subranges is 2 times smaller than another ones!
    //
    // So use more accurate algorithm for every x component :
    // 1) c=Math.floor(color[x] * 256) // make all component values from range [0.0, 1.0] to be mapped to the range [0,255] and only one value 1.0 is mapped to 256
    //    if(c>255) c=255 // Special processing for component value 1.0.
    // 2) slighly decrease a factor 256 to exclude a need of special processing for component value 1.0.
    //    c=Math.floor(color[x] * 255.9999999999999) // make all component values from range [0.0, 1.0] to be mapped to the range [0,255]
    //           // because Math.floor(1.0*255.9999999999999) === 255
    // 3) we do not need to call Math.floor() before shift or binary OR operations because these operators convert their operands to integers 
    const p =
        0x1000000 | // force value to have 7 hex digits : 1rrggbb
        ((color[0] * 255.999999) << 16) |
        ((color[1] * 255.999999) << 8) |
        (color[2] * 255.999999);
    return "#" + p.toString(16).substr(1); // cut the first (additional) character and add leading '#' character
}
/*
  get HTML string in #xxxxxx format with color value given in the [1],[2],[3] elements of array (skip the first element [0] containing stop value)
*/
export function color4ToString(
    color: [number, number, number, number] // [stop, r,g,b]
): string {
    // see colorToString()
    const p =
        0x1000000 |
        ((color[1] * 255.999999) << 16) |
        ((color[2] * 255.999999) << 8) |
        (color[3] * 255.999999);
    return "#" + p.toString(16).substr(1);
}

/*
  get HTML string with interpolated color value in #xxxxxx format
*/
export function getInterpolatedColorString(
    colorTable: ColorTable,
    v: number
): string {
    // TODO: Do not compute these 3 constants (cNaN, cBelow, cAbove) every time!
    const cNaN = colorToString(colorTable.colorNaN, "#ffffff"); // "white"

    if (Number.isNaN(v)) return cNaN;
    const cBelow = colorToString(colorTable.colorBelow, cNaN);
    const cAbove = colorToString(colorTable.colorAbove, cBelow);

    const colors = colorTable.colors;
    const j = binarySearch(colors, v);
    let c: string;
    if (j <= 0) c = cBelow;
    else if (j >= colors.length) c = cAbove;
    else {
        // linear interpolate on interval [colors[j-1][0], colors[j-1][0]]
        const color0 = colors[j - 1];
        const color = colors[j];

        const f = (v - color0[0]) / (color[0] - color0[0]);

        const p = // see also color4ToString()
            0x1000000 |
            (((color0[1] + f * (color[1] - color0[1])) * 255.999999) << 16) |
            (((color0[2] + f * (color[2] - color0[2])) * 255.999999) << 8) |
            ((color0[3] + f * (color[3] - color0[3])) * 255.999999);
        c = "#" + p.toString(16).substr(1);
    }

    return c;
}
