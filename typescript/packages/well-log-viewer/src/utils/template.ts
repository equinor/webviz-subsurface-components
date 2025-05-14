/**
 * Utilities for working with config templates for tracks and plots.
 */

import type {
    TemplateTrack,
    TemplateStyle,
    Template,
    TemplatePlot,
} from "../components/WellLogTemplateTypes";
import type { WellLogCurve } from "../components/WellLogTypes";
import { DEFAULT_PLOT_TYPE } from "./plots";
import { generateColor } from "./generateColor";
import { elementByName, indexOfElementByName } from "./arrays";

/**
 * Applies styles in a template to it's tracks, adding defaults values for missing fields
 * @param template The log viewer template.
 * @returns An array of styled template tracks.
 */
export function getStyledTemplateTracks(template: Template): TemplateTrack[] {
    if (!template.styles) return template.tracks;

    return template.tracks.map((track) =>
        applyStylesToTemplateTrack(track, template.styles)
    );
}

function applyStylesToTemplateTrack(
    templateTrack: TemplateTrack,
    templateStyles?: TemplateStyle[]
): TemplateTrack {
    const styledPlots = templateTrack.plots.map((plot) =>
        applyTemplateStyle(plot, templateStyles)
    );

    return {
        ...templateTrack,
        plots: styledPlots,
    };
}

function applyTemplateStyle(
    templatePlot: TemplatePlot,
    templateStyles?: TemplateStyle[]
): TemplatePlot {
    const styledTemplate = applyStyleToTemplatePlot(
        templatePlot,
        templateStyles
    );

    if (!styledTemplate.type) styledTemplate.type = DEFAULT_PLOT_TYPE;
    if (!isValidPlotType(styledTemplate.type)) {
        console.error(
            "unknown plot type '" +
                styledTemplate.type +
                "': use default type '" +
                DEFAULT_PLOT_TYPE +
                "'"
        );
        styledTemplate.type = DEFAULT_PLOT_TYPE;
    }
    if (styledTemplate.type !== "stacked") {
        if (!styledTemplate.color) styledTemplate.color = generateColor();
    }

    if (styledTemplate.type === "area") {
        if (!styledTemplate.fill) {
            //styledTemplate.fill = generateColor();
            styledTemplate.fillOpacity = 0.25;
        }
    } else if (styledTemplate.type === "gradientfill") {
        if (!styledTemplate.colorMapFunctionName) {
            //styledTemplate.fill = generateColor();
            styledTemplate.fillOpacity = 0.25;
        }
    } else if (styledTemplate.type === "differential") {
        // "differential" plot
        if (!styledTemplate.fill) styledTemplate.fill = generateColor();
        if (!styledTemplate.color2) styledTemplate.color2 = generateColor();
        if (!styledTemplate.fill2) styledTemplate.fill2 = generateColor();
    }
    return styledTemplate;
}

function applyStyleToTemplatePlot(
    templatePlot: TemplatePlot,
    templateStyles?: TemplateStyle[]
): TemplatePlot {
    if (!templateStyles || !templatePlot.style) return { ...templatePlot };

    const style = elementByName(templateStyles, templatePlot.style) ?? {};

    return { ...style, ...templatePlot };
}

// Validates that a plot type string is a recognized type
function isValidPlotType(plotType: string): boolean {
    return [
        "line",
        "linestep",
        "dot",
        "area",
        "differential",
        "gradientfill",
        "stacked",
    ].includes(plotType);
}

/**
 * Determines if a template track is a stacked track.
 * @param templateTrack The template track to check.
 * @param templateStyles Optional styles to consider.
 * @returns True if the template track is a stacked track, false otherwise.
 */
export function isStackedTrackTemplate(
    templateTrack: TemplateTrack,
    templateStyles?: TemplateStyle[]
): boolean {
    // Stacked tracks only render the first plot, so we only care about the first
    const firstTrackPlot = templateTrack.plots?.[0] ?? {};

    if (firstTrackPlot.type === "stacked") return true;
    if (!firstTrackPlot.style || !templateStyles) return false;

    const iStyle = indexOfElementByName(templateStyles, firstTrackPlot.style);

    if (iStyle < 0) return false;
    return templateStyles[iStyle]?.type === "stacked";
} // Remove any leading numbers followed by whitespace from the description
// Examples:
// * `"0  Depth" -> "Depth"`
// * `"1  BVW:CPI:rC:0001:v1" -> "BVW:CPI:rC:0001:v1"`
// * `"02 DRAW DOWN PRESSURE" -> "DRAW DOWN PRESSURE"`
function shortDescription(description: string): string {
    return description.replace(/^\d+\s+/, "");
}

/**
 * Generates a title shown at the top of the track.
 * @param curves The well log curves.
 * @param templateTrack The template track.
 * @returns The generated track header.
 */
export function makeTrackHeader(
    curves: WellLogCurve[],
    templateTrack: TemplateTrack
): string {
    if (templateTrack.title) return templateTrack.title;
    if (!templateTrack.plots[0]) return "";

    const plotTemplate = templateTrack.plots[0];
    const curve = elementByName(curves, plotTemplate.name);

    // Something went wrong
    if (!curve) return plotTemplate.name;
    return curve.description ? shortDescription(curve.description) : curve.name;
}

// export function templateTracksFromController(log): Template
