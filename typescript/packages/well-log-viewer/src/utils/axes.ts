export interface AxesInfo {
    primaryAxis: string;
    secondaryAxis: string;
    titles: Record<string, string>; // language dependent strings
    mnemos: Record<string, string[]>;
}

export const axisTitles: Record<string, string> = {
    // language dependent
    md: "MD",
    tvd: "TVD",
    time: "TIME",
};

// mnemos could be case insentitive ("Depth")
export const axisMnemos: Record<string, string[]> = {
    // depth based logging data
    md: [
        "DEPTH",
        "DEPT",
        "MD" /*Measured Depth*/,
        "TDEP" /*"Tool DEPth"*/,
        "MD_RKB" /*Rotary Relly Bushing*/,
    ],
    tvd: [
        "TVD" /*True Vertical Depth*/,
        "TVDSS" /*SubSea*/,
        "DVER" /*"VERtical Depth"*/,
        "TVD_MSL" /*below Mean Sea Level*/,
    ],
    //  time based logging data
    time: ["TIME"],
};

export function getAxisTitle(axes: AxesInfo, axisName: string): string {
    return axes.titles ? axes.titles[axisName] : axisName;
}
