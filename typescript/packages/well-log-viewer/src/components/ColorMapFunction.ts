import type { colorTablesObj } from "@emerson-eps/color-tables/dist/component/colorTableTypes";
export type ColorTable = colorTablesObj;
export type ColorFunction = {
    name: string;
    func: (v: number) => [number, number, number]; // input number is between 0.0 and 1.0; returned numbers are between 0 and 255
};

export type ColorMapFunction = ColorTable | ColorFunction;

export function isFunction(
    colorMapFunction: ColorMapFunction | undefined
): boolean {
    if (!colorMapFunction) return false;
    return !!(colorMapFunction as ColorFunction).func;
}
