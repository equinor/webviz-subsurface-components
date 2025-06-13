import type { colorTablesObj } from "@emerson-eps/color-tables/dist/component/colorTableTypes";
import { elementByName } from "./arrays";

export type ColorTable = colorTablesObj;
export type ColorFunction = {
    name: string;
    func: (v: number) => [number, number, number]; // input number is between 0.0 and 1.0; returned numbers are between 0 and 255
};

export type ColorMapFunction = colorTablesObj | ColorFunction;

export function isFunction(
    colormapFunction: ColorMapFunction | undefined
): boolean {
    if (!colormapFunction) return false;
    return !!(colormapFunction as ColorFunction).func;
}

export function getColormapFunction(
    functionName?: string,
    colormapFunctions?: ColorMapFunction[]
): ColorMapFunction | undefined {
    if (!functionName) return undefined;
    if (!colormapFunctions) {
        console.error("No color functions provided for graph!");
        colormapFunctions = [];
    }

    const colorFunction = elementByName(colormapFunctions, functionName);

    if (!colorFunction) {
        console.error(`Color function '${functionName}' not found`);
    }

    return colorFunction;
}
