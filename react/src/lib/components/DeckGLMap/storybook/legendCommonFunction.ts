import { color } from "d3-color";
import { interpolateRgb } from "d3-interpolate";
import {
    colorTablesArray,
    colorTablesObj,
} from "@emerson-eps/color-tables/";
const colorTables = require("@emerson-eps/color-tables/dist/component/color-tables.json");
import { d3ColorScales } from "@emerson-eps/color-tables";

// Based on objectName return the colors array from color.tables.json file
export function colorsArray(
    colorName: string,
    colorTables: any
): any {
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
    colorTables: colorTablesArray | any
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
export function RGBToHex(rgb: number[]) {
    let r = Math.round(rgb[1]).toString(16),
        g = Math.round(rgb[2]).toString(16),
        b = Math.round(rgb[3]).toString(16);
    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;
    const offset = rgb[0] * 100.0;

    return { color: "#" + r + g + b, offset: offset };
}

export function sampledColor(
    colorScaleName: string,
    point: number,
    categorial?: boolean,
    min?: number,
    max?: number,
) {
    // colortable colors
    const getSelectedScale = colorTables.find((value: any) => {
        return value.name == colorScaleName;
    });

    // d3 colors
    const d3ColorName = d3ColorScales.find((value: any) => {
        return value.name == colorScaleName;
    });

    let rgb = rgbValues(point, colorScaleName, colorTables);

    // colortable continuous scale
    if (getSelectedScale?.discrete == false) {
        if (categorial && min && max) {
            const normalizedPoint = (point - min) / (max - min);
            rgb = rgbValues(normalizedPoint, colorScaleName, colorTables);
        } else {
            return rgb;
        }
        
    } else if (d3ColorName?.discrete == false) {
        if (categorial && min && max) {
            const normalizedPoint = (point - min) / (max - min);
            rgb = rgbValues(normalizedPoint, colorScaleName, colorTables);
        } else {
            return rgb;
        }
        
    }

    // d3 continuous scale
    if (typeof d3ColorName?.colors == "function") {
        const colorMappingRange = d3ColorName?.colors(point);
        rgb = color(colorMappingRange)?.rgb();
    }
    

    // colortable discrete scale
    if (getSelectedScale?.discrete == true) {
        if (categorial) {
            // compare the code and first value from colorsArray(colortable)
            const arrayOfColors: [number, number, number, number][] =
                colorsArray(colorScaleName, colorTables);

            const colorArrays = arrayOfColors.find((value: number[]) => {
                return value[0] == point;
            });
            rgb = colorArrays;
        } 
        else {
            const getSelectedScaleLength = getSelectedScale?.colors.length;
            const minValue = 0;
            const maxValue = getSelectedScaleLength - 1;
            getSelectedScale?.colors.forEach((item: any, index: any) => {
                const currentIndex = index;
                const normalizedCurrentIndex =
                    (currentIndex - minValue) / (maxValue - minValue);
                const nextIndex = index + 1;
                const normalizedNextIndex =
                    (nextIndex - minValue) / (maxValue - 0);
                //const t = (point - t0) / (t1 - t0); // t = 0.0 gives first color, t = 1.0 gives second color.
                if (
                    point >= normalizedCurrentIndex &&
                    point <= normalizedNextIndex
                ) {
                    if (
                        (item && getSelectedScale?.colors[nextIndex]) !=
                        undefined
                    ) {
                        const interpolate = interpolateRgb(
                            RGBToHex(item)?.color,
                            RGBToHex(getSelectedScale?.colors[nextIndex])?.color
                        )(point);
                        rgb = color(interpolate)?.rgb();
                    }
                }
            });
        }
    }

    // d3 discrete scale
    if (typeof d3ColorName?.colors == "object") {
        if (categorial) {
            const d3ColorArrays = d3ColorName?.colors.find(
                (_value: any, index: number) => {
                    return index == point;
                }
            );

            rgb = color(d3ColorArrays as string)?.rgb();
        } 
        else {
            const max = d3ColorName?.colors.length - 1;
            d3ColorName?.colors.forEach((item: string, index: number) => {
                const currentIndex = index;
                const normalizedCurrentIndex = (currentIndex - 0) / (max - 0);
                const nextIndex = index + 1;
                const normalizedNextIndex = (nextIndex - 0) / (max - 0);
                //const t = (point - t0) / (t1 - t0); // t = 0.0 gives first color, t = 1.0 gives second color.
                if (
                    point >= normalizedCurrentIndex &&
                    point <= normalizedNextIndex
                ) {
                    const interpolate = interpolateRgb(
                        item,
                        d3ColorName[nextIndex]
                    )(point);
                    rgb = color(interpolate)?.rgb();
                }
            });
        }
    }

    return rgb;
}

export function createColorMapFunction(colorScaleName: string) {
    return (x: number, categorial: boolean, min: number, max: number) => {
        return sampledColor(colorScaleName, x, categorial, min, max);
    };
}