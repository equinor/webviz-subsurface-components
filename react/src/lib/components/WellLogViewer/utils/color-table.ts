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
    // TODO: consider more accurate algorithm for x component :
    // c=Math.floor(color[x] * 256) // make all component values to be mapped to the range [0,255] and only one value 1.0 is mapped to 256
    // if(c>255) c=255 // Special processing for component value 1.0.
    const p =
        0x1000000 | // force value to have 7 hex digits : 1rrggbb
        (Math.round(color[0] * 255) << 16) |
        (Math.round(color[1] * 255) << 8) |
        Math.round(color[2] * 255);
    return "#" + p.toString(16).substr(1); // cut the first (additional) character anfd add leading '#' character
}
/*
  get HTML string in #xxxxxx format with color value given in the [1],[2],[3] elements of array (skip the first element [0] containing stop value)
*/
export function color4ToString(
    color: [number, number, number, number] // [stop, r,g,b]
): string {
    const p =
        0x1000000 |
        (Math.round(color[1] * 255) << 16) |
        (Math.round(color[2] * 255) << 8) |
        Math.round(color[3] * 255);
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

        const p = // see also color4ToString
            0x1000000 |
            (Math.round((color0[1] + f * (color[1] - color0[1])) * 255) << 16) |
            (Math.round((color0[2] + f * (color[2] - color0[2])) * 255) << 8) |
            Math.round((color0[3] + f * (color[3] - color0[3])) * 255);
        c = "#" + p.toString(16).substr(1);
    }

    return c;
}
