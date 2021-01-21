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
    completions: number[];
    type: string;
    region: string;
}

export interface UISettings {
    componentHeight: string | number;
    timeIndexRange: [number, number];
}
