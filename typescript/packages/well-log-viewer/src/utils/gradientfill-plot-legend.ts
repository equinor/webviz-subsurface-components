import type { LegendBounds } from "@equinor/videx-wellog/dist/utils/legend-helper";
import type { LegendInfo } from "@equinor/videx-wellog/dist/plots/legend/interfaces";
import type { GradientFillPlotOptions } from "./gradientfill-plot";
import type GradientFillPlot from "./gradientfill-plot";
import { setAttrs } from "@equinor/videx-wellog";

/* Missed exports from "@equinor/videx-wellog !!! */
// eslint-disable-next-line
declare type D3Selection = any; //import { D3Selection } from "@equinor/videx-wellog/dist/common/interfaces';
import { renderBasicPlotLegend } from "./legend/common"; //import { renderBasicPlotLegend } from "@equinor/videx-wellog/dist/plots/legend/common';
/* End of missed from "@equinor/videx-wellog */

import type { ColormapFunction, ColorTable } from "./color-function";
import { isFunction } from "./color-function";
import { getInterpolatedColorString } from "./color-table";

import { color4ToString } from "./color-table";

type GradientStop = {
    /** Pre-formatted percentage string, e.g. `"40%"`. */
    offset: string;
    color: string;
};

/**
 * Builds the gradient's colour stops. Pure: the result depends only on the
 * colormap and the optional logarithmic ratio, never on render order or on
 * how many gradients were built before it. Kept separate from the DOM code
 * so the stops can be hashed into the gradient's id before being appended.
 */
function computeGradientStops(
    colormapFunction: ColormapFunction,
    rLogarithmic?: number
): GradientStop[] {
    const stops: GradientStop[] = [];

    if (rLogarithmic !== undefined) {
        const yDelta = Math.log(rLogarithmic); // log(max/min)
        const d = rLogarithmic - 1;
        const nIntervals = 25;
        for (let i = 0; i <= nIntervals; i++) {
            const fraction = i / nIntervals;
            const y = 1 + fraction * d;
            const v = Math.log(y) / yDelta;
            stops.push({
                offset: fraction * 100.0 + "%",
                color: getInterpolatedColorString(colormapFunction, v),
            });
        }
    } else if (isFunction(colormapFunction)) {
        const nIntervals = 25; // set some not very big value to smooth filling
        for (let i = 0; i <= nIntervals; i++) {
            const fraction = i / nIntervals;
            stops.push({
                offset: fraction * 100.0 + "%",
                color: getInterpolatedColorString(colormapFunction, fraction),
            });
        }
    } else {
        const table = colormapFunction as ColorTable;
        const colors = table.colors;
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            stops.push({
                offset: color[0] * 100.0 + "%",
                color: color4ToString(color),
            });
        }
    }

    return stops;
}

/** FNV-1a, rendered base36. Small, dependency-free and stable across runs. */
function hashString(text: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(36);
}

/**
 * Builds the gradient's DOM id from the plot it belongs to plus a hash of
 * the stops themselves, so the id is fully determined by what the gradient
 * *is* rather than by how many gradients happened to be created before it.
 *
 * Both inputs are order-independent: `plot.id` is derived from the template
 * (see `buildPlotConfig`), and the stops come from `computeGradientStops`.
 * Two ids therefore collide only when the plot slot and every stop match -
 * i.e. the gradients are interchangeable, so sharing one definition renders
 * identically.
 */
function makeGradientId(
    plot: GradientFillPlot,
    idSuffix: string,
    stops: GradientStop[]
): string {
    const key = stops.map((s) => s.offset + ":" + s.color).join("|");
    // The "grad-" prefix keeps the id a valid NCName even when plot.id
    // starts with a digit, as the template-derived "<set>-<curve>" form does.
    const base = String(plot.id).replace(/[^A-Za-z0-9_-]/g, "-");
    return (
        "grad-" +
        base +
        (idSuffix ? "-" + idSuffix : "") +
        "-" +
        hashString(key)
    );
}

function createGradient(
    g: D3Selection,
    colormapFunction: ColormapFunction,
    plot: GradientFillPlot,
    idSuffix: string,
    rLogarithmic?: number
): string {
    const stops = computeGradientStops(colormapFunction, rLogarithmic);
    const id = makeGradientId(plot, idSuffix, stops);

    // Identical gradients share an id, so reuse an existing definition
    // rather than emitting a duplicate. Re-checked on every render because
    // legend groups are cleared and rebuilt on each redraw.
    const svgRoot = g.node()?.ownerSVGElement;
    if (svgRoot?.querySelector(`[id="${id}"]`)) {
        return id;
    }

    const lg = g
        .append("defs")
        .append("linearGradient")
        .attr("id", id) //id of the gradient
        .attr("x1", "0%")
        .attr("x2", "100%") //since it's a horizontal linear gradient
        .attr("y1", "0%")
        .attr("y2", "0%");

    for (const stop of stops) {
        lg.append("stop")
            .attr("offset", stop.offset)
            .style("stop-color", stop.color);
    }

    return id;
}

/**
 * Renders area legend to a SVG group element according to bounds.
 */
export default function renderGradientFillPlotLegend(
    g: D3Selection,
    bounds: LegendBounds,
    legendInfo: LegendInfo,
    plot: GradientFillPlot
): void {
    const options = plot.options as GradientFillPlotOptions;
    const { top, left, width, height } = bounds;
    const shadeH = height / 2;
    const shadeY = top;
    const fillOpacity = Math.min((options.fillOpacity || 0.0) + 0.25, 1);

    if (options.inverseColor || options.inverseColorMapFunction) {
        const [min, max] = plot.scale.domain();
        const minIsLeft = min <= max;
        const centerX = left + width / 2;
        const useMinAsBase =
            options.useMinAsBase === undefined ? true : options.useMinAsBase;

        const shadeW = Math.max(0, width - 2);

        let fillNrm =
            useMinAsBase && minIsLeft
                ? plot.options.color
                : options.inverseColor;

        let fillInv =
            useMinAsBase && minIsLeft
                ? options.inverseColor
                : plot.options.color;

        /* Start GradientFill code */
        let colormapFunction: ColormapFunction | undefined =
            useMinAsBase && minIsLeft
                ? options.colorMapFunction
                : options.inverseColorMapFunction;
        if (colormapFunction) {
            const id = createGradient(
                g,
                colormapFunction,
                plot,
                "a",
                options.scale === "linear" && options.colorScale === "log"
                    ? max / min
                    : undefined
            );
            fillNrm = "url(#" + id + ")";
        }
        colormapFunction =
            useMinAsBase && minIsLeft
                ? options.inverseColorMapFunction
                : options.colorMapFunction;
        if (colormapFunction) {
            const id = createGradient(
                g,
                colormapFunction,
                plot,
                "b",
                options.scale === "linear" &&
                    (options.inverseColorScale || options.colorScale) === "log"
                    ? max / min
                    : undefined
            );
            fillInv = "url(#" + id + ")";
        }
        /* End GradientFill code */

        setAttrs(g.append("rect"), {
            x: left + 2,
            y: shadeY,
            width: shadeW / 2,
            height: shadeH,
            fill: fillNrm,
            "fill-opacity": fillOpacity,
        });

        setAttrs(g.append("rect"), {
            x: centerX,
            y: shadeY,
            width: shadeW / 2,
            height: shadeH,
            fill: fillInv,
            "fill-opacity": fillOpacity,
        });
    } else {
        let fillNrm = plot.options.color; // see area-plot-legend.ts! should be? plot.options.fill || plot.options.color;
        /* Start GradientFill code */
        const colormapFunction = options.colorMapFunction;
        if (colormapFunction) {
            const [min, max] = plot.scale.domain();
            const id = createGradient(
                g,
                colormapFunction,
                plot,
                "",
                options.scale === "linear" && options.colorScale === "log"
                    ? max / min
                    : undefined
            );
            fillNrm = "url(#" + id + ")";
        }
        /* End GradientFill code */

        setAttrs(g.append("rect"), {
            x: left + 2,
            y: shadeY,
            width: Math.max(0, width - 4),
            height: shadeH,
            fill: fillNrm,
            "fill-opacity": fillOpacity,
        });
    }

    renderBasicPlotLegend(
        g,
        bounds,
        legendInfo.label ? legendInfo.label : "",
        legendInfo.unit ? legendInfo.unit : "",
        plot.scale.domain(),
        plot.options.color ? plot.options.color : "",
        true
    );
}
