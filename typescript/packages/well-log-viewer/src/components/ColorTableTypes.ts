import type { colorTablesObj } from "@emerson-eps/color-tables/dist/component/colorTableTypes";
export type ColorTable = colorTablesObj;
export type ColorFunction = {
    name: string;
    func: (v: number) => [number, number, number];
};
