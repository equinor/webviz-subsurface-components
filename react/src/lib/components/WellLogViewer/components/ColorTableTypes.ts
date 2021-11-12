export interface ColorTable {
    name: string;
    colors: [number, number, number, number][];
    discrete?: boolean; // default false

    colorNaN?: [number, number, number]; // default "white"
    colorBelow?: [number, number, number]; // default colorNaN
    colorAbove?: [number, number, number]; // default colorBelow
}
