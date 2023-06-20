export type TemplatePlotScaleTypes = "linear" | "log";

export type TemplatePlotTypes =
    | ""
    | "line"
    | "linestep"
    | "dot"
    | "area"
    | "differential"
    | "gradientfill"
    | "stacked"
    | "canvas";

export type CSSColor = string;
// rgbhexcolor pattern: "^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$"
// rgbcolor pattern:  "^rgb\\((25[0-5]|2[0-4][0-9]|1[0-9]?[0-9]?|[1-9][0-9]?|[0-9]), ?(25[0-5]|2[0-4][0-9]|1[0-9]?[0-9]?|[1-9][0-9]?|[0-9]), ?(25[0-5]|2[0-4][0-9]|1[0-9]?[0-9]?|[1-9][0-9]?|[0-9])\\)$"

export type TemplatePlotProps = {
    type: TemplatePlotTypes;
    scale?: TemplatePlotScaleTypes; // 'linear' or 'log', default 'linear'
    domain?: [number, number]; // min, max values

    color: CSSColor;
    inverseColor?: CSSColor;

    fill?: CSSColor; // for 'area' plot
    fillOpacity?: number; // for 'area' and 'gradientfill' plots! default 0.25
    colorTable?: string; // table id (name) for 'gradientfill' plot
    inverseColorTable?: string; // table id (name) for 'gradientfill' plot
    colorScale?: TemplatePlotScaleTypes; // for 'linear' plot scale. default equal to plot scale
    inverseColorScale?: TemplatePlotScaleTypes; // for 'linear' plot scale. default equal to plot scale

    color2?: CSSColor; // for 'differetial' plot
    fill2?: CSSColor; // for 'differetial' plot
    //...
}; // Part of JSON

export interface TemplatePlot extends TemplatePlotProps {
    name: string;
    style?: string;
    scale?: TemplatePlotScaleTypes | undefined;
    name2?: string; // for differential plot
} // Part of JSON

export type TemplateTrack = {
    title: string;
    required?: boolean;
    plots: TemplatePlot[];
    scale?: TemplatePlotScaleTypes; // 'linear' or 'log', default first plot scale
    domain?: [number, number]; // min, max values, default all plots domain
}; // Part of JSON

export interface TemplateStyle extends TemplatePlotProps {
    name: string;
} // Part of JSON

export interface Template {
    name: string;
    scale: {
        primary: string;
        allowSecondary?: boolean;
    };
    tracks: TemplateTrack[];
    styles?: TemplateStyle[];
    //...
} // JSON
