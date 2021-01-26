export interface Data {
    stratigraphy: Zone[];
    wells: Well[];
    timeSteps: string[];
}
export interface Zone {
    name: string;
    color: string;
}
export interface Well {
    name: string;
    completions: Record<string, Completions>;
    type: string;
    region: string;
}

export interface Completions {
    t: number[];
    f: number[];
}

export interface UISettings {
    componentHeight: string | number;
    timeIndexRange: [number, number];
}
