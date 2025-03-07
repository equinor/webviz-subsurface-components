import type { colorTablesObj } from "@emerson-eps/color-tables/dist/component/colorTableTypes";
import { elementByName } from "./arrays";

export type ColorTable = colorTablesObj;
export type ColorFunction = {
    name: string;
    func: (v: number) => [number, number, number]; // input number is between 0.0 and 1.0; returned numbers are between 0 and 255
};

export type ColorMapFunction = colorTablesObj | ColorFunction;

export function isFunction(
    colorMapFunction: ColorMapFunction | undefined
): boolean {
    if (!colorMapFunction) return false;
    return !!(colorMapFunction as ColorFunction).func;
}

export function getColorMapFunction(
    functionName?: string,
    colorMapFunctions?: ColorMapFunction[]
): ColorMapFunction | undefined {
    if (!functionName) return undefined;
    if (!colorMapFunctions) {
        console.error("No color functions provided for graph!");
        colorMapFunctions = [];
    }

    const colorFunction = elementByName(colorMapFunctions, functionName);

    if (!colorFunction) {
        console.error(`Color function '${functionName}' not found`);
    }

    return colorFunction;
}
