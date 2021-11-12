export type TemplatePlotProps = {
    type: string;
    scale?: string; // 'linear' or 'log', default 'linear'

    color: string;
    inverseColor?: string;

    fill?: string; // for 'area' plot
    fillOpacity?: number; // for 'area' and 'gradientfill' plots! default 0.25
    colorTable?: string; // table id (name) for 'gradientfill' plot
    inverseColorTable?: string; // table id (name) for 'gradientfill' plot

    color2?: string; // for 'differetial' plot
    fill2?: string; // for 'differetial' plot
    //...
}; // Part of JSON

export type TemplateTrack = {
    title: string;
    required?: boolean;
    plots: TemplatePlot[];
}; // Part of JSON
export interface TemplatePlot extends TemplatePlotProps {
    name: string;
    style?: string;
    name2?: string; // for differential plot
} // Part of JSON
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
    styles: TemplateStyle[];
    //...
} // JSON
