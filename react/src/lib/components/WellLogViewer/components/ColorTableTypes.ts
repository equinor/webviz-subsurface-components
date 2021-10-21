export interface ColorTable {
    name?: string;
    discrete?: boolean; // default false
    colorNaN?: [number, number, number]; // default "white"
    colorBelow ?: [number, number, number]; // default colorNaN
    colorAbove?: [number, number, number]; // default colorNaN
    colors: [number, number, number, number][];
}


