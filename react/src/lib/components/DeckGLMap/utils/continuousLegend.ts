import { color } from "d3-color";
import { interpolateRgb } from "d3-interpolate";

const colorTemplate = require("../../../../demo/example-data/wellayer_template.json")
const colorTables = require("../../../../demo/example-data/color-tables.json")
const colorTemplateData: any = colorTemplate;
const colorTableData: any = colorTables;

export function colorTableValues(objectName: string) {
    let properties = colorTemplateData[0]['properties']
    const propertiesData = properties.filter((value: any) => value.objectName == objectName)
    const colorTableName = propertiesData[0].colorTable
    const colorTableValues = colorTableData.filter((value: any) => value.name == colorTableName)
    const colorsArray = colorTableValues[0].colors
    return colorsArray;
}

export function rgbValues(objectName: string, point: any) {
    const color_table = colorTableValues(objectName)
    const result = color_table.find((value: any) => {
        return point.toFixed(2) == value[0].toFixed(2)
    });

    // if point and value in color table matches
    if (result) {
        return result.slice(1)
    } 
    // if no match then need to do interpolation
    else {
        let index = color_table.findIndex((value: any) => {
           return value[0].toFixed(2) > point.toFixed(2)
        });

        const firstColorArray = color_table[index-1]
        const secondColorArray = color_table[index]

        if ((firstColorArray || secondColorArray) != undefined) {
            const interpolatedValues = interpolateRgb(RGBToHex(firstColorArray).color,RGBToHex(secondColorArray).color)(point.toFixed(2))

           return color(interpolatedValues)?.rgb()
        }
    }
}

function RGBToHex(rgb: number[]) {
    let r = rgb[1].toString(16),
        g = rgb[2].toString(16),
        b = rgb[3].toString(16);
    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;

    return {color: "#" + r + g + b};
}


