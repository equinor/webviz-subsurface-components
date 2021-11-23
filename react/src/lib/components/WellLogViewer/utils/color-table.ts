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
    const p =
        0x1000000 | // force value to have 7 hex digits : 1rrggbb
        (color[0] << 16) |
        (color[1] << 8) |
        color[2];
    return "#" + p.toString(16).substr(1); // cut the first (additional) character and add leading '#' character
}
/*
  get HTML string in #xxxxxx format with color value given in the [1],[2],[3] elements of array (skip the first element [0] containing stop value)
*/
export function color4ToString(
    color: [number, number, number, number] // [stop, r,g,b]
): string {
    // see colorToString()
    const p = 0x1000000 | (color[1] << 16) | (color[2] << 8) | color[3];
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
        // linear interpolation on interval [colors[j-1][0], colors[j][0]]
        const color0 = colors[j - 1];
        const color = colors[j];

        const f = (v - color0[0]) / (color[0] - color0[0]);

        const p = // see also color4ToString()
            0x1000000 |
            ((color0[1] + f * (color[1] - color0[1])) << 16) |
            ((color0[2] + f * (color[2] - color0[2])) << 8) |
            (color0[3] + f * (color[3] - color0[3]));
        c = "#" + p.toString(16).substr(1);
        if (c.length !== 7) {
            console.error("wrong color table ");
            console.log(c, p, p.toString(16), f, color, color0);
            return cNaN;
        }
    }
    return c;
}
