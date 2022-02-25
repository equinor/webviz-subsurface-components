export interface colorTablesObj {
    name: string;
    discrete: boolean;
    colors: [number, number, number, number][];
}
export type colorTablesArray = Array<colorTablesObj>;