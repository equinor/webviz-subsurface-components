export type TemplatePlotProps = {
    color: string;
    type: string;
    //...
}; // Part of JSON

export type TemplateTrack = {
    title: string;
    required?: boolean;
    plots: TemplatePlot[];
}; // Part of JSON
export interface TemplatePlot extends TemplatePlotProps {
    name: string;
    style: string;
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
