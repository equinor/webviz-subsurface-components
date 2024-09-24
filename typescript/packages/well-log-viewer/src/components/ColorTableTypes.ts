import type { colorTablesObj } from "@emerson-eps/color-tables/dist/component/colorTableTypes";
export type colorFunctionsObj = {
    name: string;
    func: (v: number) => [number, number, number];
};

export type ColorFunction = colorTablesObj | colorFunctionsObj;

export function isFunction(colorFunction: ColorFunction | undefined): boolean {
    if (!colorFunction) return false;
    return !!(colorFunction as colorFunctionsObj).func;
}
