export interface Info {
    name?: string;
    units?: string;
    color: string;
    value: number /*|string for discrete*/;
    type: string; // "seperator"; "line", "linestep", "area", "dot", ...
    track_id: number | string;
}
