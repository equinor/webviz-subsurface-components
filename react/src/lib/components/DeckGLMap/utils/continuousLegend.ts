import { color } from "d3-color";
import { interpolateRgb } from "d3-interpolate";

interface colorTables {
    name: string;
    description: string;
    colors: [number, number, number, number][];
}
type colorTablesArray = Array<colorTables>;

interface propertiesObj {
    objectName: string;
    colorTable: string;
    context: string;
    colorInterpolation: string;
}

type propertiesArr = Array<propertiesObj>;

interface template {
    name: string;
    properties: propertiesArr;
}

type templateArray = Array<template>;

// Based on objectName return the colors array from color.tables.json file
export function colorsArray(
    objectName: string,
    template: templateArray,
    colorTables: colorTablesArray
): [number, number, number, number][] {
    const properties = template[0]["properties"];
    const propertiesData = properties.filter(
        (value: propertiesObj) => value.objectName == objectName
    );
    const colorTableData = colorTables.filter(
        (value: colorTables) =>
            value.name.toLowerCase() ==
            propertiesData[0].colorTable.toLowerCase()
    );
    return colorTableData[0].colors;
}

// return the colors based on the point
export function rgbValues(
    objectName: string,
    point: number,
    template: templateArray,
    colorTables: colorTablesArray
): number[] | { r: number; g: number; b: number; opacity: number } | undefined {
    const color_table = colorsArray(objectName, template, colorTables);
    const colorArrays = color_table.find(
        (value: [number, number, number, number]) => {
            return point == value[0];
        }
    );

    // if point and value in color table matches
    if (colorArrays) {
        return colorArrays.slice(1);
    }
    // if no match then need to do interpolation
    else {
        const index = color_table.findIndex((value: number[]) => {
            return value[0] > point;
        });

        const firstColorArray = color_table[index - 1];
        const secondColorArray = color_table[index];

        if ((firstColorArray || secondColorArray) != undefined) {
            const interpolatedValues = interpolateRgb(
                RGBToHex(firstColorArray).color,
                RGBToHex(secondColorArray).color
            )(point);
            return color(interpolatedValues)?.rgb();
        }
        return undefined;
    }
}

// return the color in rgb format
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
