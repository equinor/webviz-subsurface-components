import { color } from "d3-color";
import { interpolateRgb } from "d3-interpolate";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const colorTemplate = require("../../../../demo/example-data/welllayer_continuous_template.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const colorTables = require("../../../../demo/example-data/color-tables.json");

interface colorTables {
    name: string;
    description: string;
    colors: [number, number, number, number][];
}

interface propertiesObj {
    objectName: string;
    colorTable: string;
    context: string;
    colorInterpolation: string;
}

type propertiesArr = Array<propertiesObj>;

interface colorTemplate {
    name: string;
    properties: propertiesArr;
}

export function colorsArray(
    objectName: string
): [number, number, number, number][] {
    const properties = colorTemplate[0]["properties"];
    const propertiesData = properties.filter(
        (value: propertiesObj) => value.objectName == objectName
    );
    const colorTableData = colorTables.filter(
        (value: colorTables) => value.name == propertiesData[0].colorTable
    );
    return colorTableData[0].colors;
}

export function rgbValues(
    objectName: string,
    point: number
): number[] | { r: number; g: number; b: number; opacity: number } | undefined {
    const color_table = colorsArray(objectName);
    const colorArrays = color_table.find(
        (value: [number, number, number, number]) => {
            return point.toFixed(2) == value[0].toFixed(2);
        }
    );

    // if point and value in color table matches
    if (colorArrays) {
        return colorArrays.slice(1);
    }
    // if no match then need to do interpolation
    else {
        const index = color_table.findIndex((value: number[]) => {
            return value[0].toFixed(2) > point.toFixed(2);
        });

        const firstColorArray = color_table[index - 1];
        const secondColorArray = color_table[index];

        if ((firstColorArray || secondColorArray) != undefined) {
            const interpolatedValues = interpolateRgb(
                RGBToHex(firstColorArray).color,
                RGBToHex(secondColorArray).color
            )(Number(point.toFixed(2)));
            return color(interpolatedValues)?.rgb();
        }
        return undefined;
    }
}

export function RGBToHex(rgb: number[]): { color: string; offset: number } {
    let r = Math.round(rgb[1] * 255).toString(16),
        g = Math.round(rgb[2] * 255).toString(16),
        b = Math.round(rgb[3] * 255).toString(16);
    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;
    const offset = rgb[0] * 100.0;

    return { color: "#" + r + g + b, offset: offset };
}
