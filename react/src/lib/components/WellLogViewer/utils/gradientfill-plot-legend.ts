import { LegendBounds } from "@equinor/videx-wellog/dist/utils/legend-helper";
import { LegendInfo } from "@equinor/videx-wellog/dist/plots/legend/interfaces";
import { GradientFillPlotOptions } from "./gradientfill-plot";
import GradientFillPlot from "./gradientfill-plot";
import { setAttrs } from "@equinor/videx-wellog";

/* Missed exports from "@equinor/videx-wellog !!! */
// eslint-disable-next-line
declare type D3Selection = any; //import { D3Selection } from "@equinor/videx-wellog/dist/common/interfaces';
import { renderBasicPlotLegend } from "./legend/common"; //import { renderBasicPlotLegend } from "@equinor/videx-wellog/dist/plots/legend/common';
/* End of missed from "@equinor/videx-wellog */

import { ColorTable } from "../components/ColorTableTypes";

import { color4ToString } from "./color-table";
let __id = 0;
function createGradient(g: D3Selection, colorTable: ColorTable): string {
    const id = "grad" + ++__id; // generate unique id
    const lg = g
        .append("defs")
        .append("linearGradient")
        .attr("id", id) //id of the gradient
        .attr("x1", "0%")
        .attr("x2", "100%") //since it's a horizontal linear gradient
        .attr("y1", "0%")
        .attr("y2", "0%");
    const colors = colorTable.colors;
    for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        const c = color4ToString(color);
        lg.append("stop")
            .attr("offset", color[0] * 100.0 + "%")
            .style("stop-color", c);
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

    if (options.inverseColor || options.inverseColorTable) {
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
        let colorTable =
            useMinAsBase && minIsLeft
                ? options.colorTable
                : options.inverseColorTable;
        if (colorTable) {
            const id = createGradient(g, colorTable);
            fillNrm = "url(#" + id + ")";
        }
        colorTable =
            useMinAsBase && minIsLeft
                ? options.inverseColorTable
                : options.colorTable;
        if (colorTable) {
            const id = createGradient(g, colorTable);
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
        const colorTable = options.colorTable;
        if (colorTable) {
            const id = createGradient(g, colorTable);
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
