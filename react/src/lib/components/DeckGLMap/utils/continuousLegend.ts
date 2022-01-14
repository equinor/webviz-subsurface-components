import { color } from "d3-color";
import { interpolateRgb } from "d3-interpolate";
import {
    colorTablesArray,
    colorTablesObj,
} from "../components/ColorTableTypes";

// Based on objectName return the colors array from color.tables.json file
export function colorsArray(
    colorName: string,
    colorTables: colorTablesArray
): [number, number, number, number][] {
    const colorTableData = colorTables.filter(
        (value: colorTablesObj) =>
            value.name.toLowerCase() == colorName.toLowerCase()
    );
    return colorTableData.length > 0 ? colorTableData[0].colors : [];
}

// return the colors based on the point
export function rgbValues(
    point: number,
    colorName: string,
    colorTables: colorTablesArray
): number[] | { r: number; g: number; b: number; opacity: number } | undefined {
    const colorTableColors = colorsArray(colorName, colorTables);
    // compare the point and first value from colorTableColors
    const colorArrays = colorTableColors.find(
        (value: [number, number, number, number]) => {
            return point == value[0];
        }
    );

    // if point and value in color table matches then return particular colors
    if (colorArrays) {
        return colorArrays.slice(1);
    }
    // if no match then need to do interpolation
    else {
        // Get index of first match of colortable point greater than point
        const index = colorTableColors.findIndex((value: number[]) => {
            return value[0] > point;
        });

        const firstColorArray = colorTableColors[index - 1];
        const secondColorArray = colorTableColors[index];

        if ((firstColorArray || secondColorArray) != undefined) {
            const t0 = firstColorArray[0];
            const t1 = secondColorArray[0];
            const t = (point - t0) / (t1 - t0); // t = 0.0 gives first color, t = 1.0 gives second color.
            const interpolatedValues = interpolateRgb(
                RGBToHex(firstColorArray).color,
                RGBToHex(secondColorArray).color
            )(t);
            return color(interpolatedValues)?.rgb();
        }
        return undefined;
    }
}

// return the hex color code and offset
export function RGBToHex(rgb: number[]): { color: string; offset: number } {
    let r = Math.round(rgb[1]).toString(16),
        g = Math.round(rgb[2]).toString(16),
        b = Math.round(rgb[3]).toString(16);
    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;
    const offset = rgb[0] * 100.0;

    return { color: "#" + r + g + b, offset: offset };
}
