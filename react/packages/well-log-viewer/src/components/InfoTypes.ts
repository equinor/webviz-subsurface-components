export interface Info {
    name?: string;
    units?: string;
    color: string;
    value: number;
    discrete?: string /*string for discrete*/;
    type: string; // "seperator"; "line", "linestep", "area", "dot", ...
    trackId: number | string;

    groupStart?: string; // for category
    collapsed?: boolean; // group is collapsed
}

export interface InfoOptions {
    allTracks?: boolean; // show not only visible tracks
    grouping?: string; // how group values. "" | "by_track"
}
