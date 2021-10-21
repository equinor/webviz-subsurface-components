import { ColorTable } from "../components/ColorTableTypes"

function binarySearch(array: number[][], v: number) {
    let lo = -1, hi = array.length;
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


export function colorToString(color: [number, number, number] | undefined, cDefault: string): string {
    if (!color) return cDefault;
    const p = 0x1000000
        | (color[0] * 255 << 16)
        | (color[1] * 255 << 8)
        | (color[2] * 255)
    return "#" + p.toString(16).substr(1)
}
export function colorToString4(color: [number, number, number, number]): string {
    const p = 0x1000000
        | (color[1] * 255 << 16)
        | (color[2] * 255 << 8)
        | (color[3] * 255)
    return "#" + p.toString(16).substr(1)
}

/*
  get HTML string with interpolated color value in #xxxxxx format
*/
export function getInterpolatedColorString(colorTable: ColorTable, v: number): string {
    const cNaN = colorToString(colorTable.colorNaN, "#ffffff") // "white"
    const cBelow = colorToString(colorTable.colorBelow, cNaN);
    const cAbove = colorToString(colorTable.colorAbove, cNaN);
    let c:string;

    if (Number.isNaN(v)) {
        c = cNaN
    }
    else {
        const colors = colorTable.colors;
        let j = binarySearch(colors, v);
        if (j <= 0) {
            c = cBelow
        }
        else if (j >=  colorTable.colors.length) {
            c = cAbove
        }
        else {
            const color0 = colors[j - 1];
            const color = colors[j];
            {
                const f = (v - color0[0]) / (color[0] - color0[0]);

                const p = 0x1000000
                    | ((color0[1] + f * (color[1] - color0[1])) * 255 << 16)
                    | ((color0[2] + f * (color[2] - color0[2])) * 255 << 8)
                    | ((color0[3] + f * (color[3] - color0[3])) * 255)
                c = "#" + p.toString(16).substr(1)
            }
        }
    }

    return c;
}