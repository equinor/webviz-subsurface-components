import type { colorTablesObj } from "@emerson-eps/color-tables/dist/component/colorTableTypes";
export type ColorTable = colorTablesObj;
export type colorFunctionsObj = {
    name: string;
    func: (v: number) => [number, number, number];
};

export type ColorMapFunction = ColorTable | colorFunctionsObj;

export function isFunction(
    colorFunction: ColorMapFunction | undefined
): boolean {
    if (!colorFunction) return false;
    return !!(colorFunction as colorFunctionsObj).func;
}

import PropTypes from "prop-types";
export const ColorFunctionType = PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
]);
