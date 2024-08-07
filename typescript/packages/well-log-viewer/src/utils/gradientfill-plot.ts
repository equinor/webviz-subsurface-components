import { area } from "d3";
import type { Scale } from "@equinor/videx-wellog/dist/common/interfaces";
import { Plot } from "@equinor/videx-wellog";

import type { DefinedFunction } from "@equinor/videx-wellog/dist/plots/interfaces";

import renderGradientFillPlotLegend from "./gradientfill-plot-legend";
import { getInterpolatedColorString } from "./color-table";

import type { ColorTable } from "../components/ColorTableTypes";

import type { AreaPlotOptions } from "@equinor/videx-wellog/dist/plots/interfaces";

export interface GradientFillPlotOptions extends AreaPlotOptions {
    colorTable?: ColorTable | ((v: number) => [number, number, number]);
    inverseColorTable?: ColorTable | ((v: number) => [number, number, number]);
    colorScale?: "linear" | "log";
    inverseColorScale?: "linear" | "log";
}

/*
 * Create gradient based on colorTable
 */
function createGradient(
    ctx: CanvasRenderingContext2D,
    yscale: Scale,
    horizontal: boolean | undefined,
    plotdata: number[][],
    xscale: Scale,
    colorTable: ColorTable | ((v: number) => [number, number, number]),
    scale: undefined | string // "linear" | "log"
): CanvasGradient {
    const dataFrom = plotdata[0];
    const dataTo = plotdata[plotdata.length - 1];
    const sFrom = yscale(dataFrom[0]);
    const sTo = yscale(dataTo[0]);

    const gradient: CanvasGradient = horizontal
        ? ctx.createLinearGradient(sFrom, 0, sTo, 0)
        : ctx.createLinearGradient(0, sFrom, 0, sTo);

    if (scale === "log") {
        const [min, max] = xscale.domain();
        const xFrom = dataFrom[0];
        const xDelta = dataTo[0] - xFrom;
        const yFrom = Math.log(min);
        const yDelta = Math.log(max) - yFrom;
        for (const data of plotdata) {
            const stop = (data[0] - xFrom) / xDelta;
            if (0 <= stop && stop <= 1.0) {
                const v = (Math.log(data[1]) - yFrom) / yDelta;
                const c = getInterpolatedColorString(colorTable, v);
                gradient.addColorStop(stop, c);
            }
        }
    } else {
        // "linear"
        const xFrom = dataFrom[0];
        const xDelta = dataTo[0] - xFrom;
        const yFrom = xscale.domain()[0];
        const yDelta = xscale.domain()[1] - yFrom;
        for (const data of plotdata) {
            // TODO: add some additional intermediate stop positions when y changes significantly
            // and color-table stops exists between consequent y values
            const stop = (data[0] - xFrom) / xDelta;
            if (0 <= stop && stop <= 1.0) {
                const v = (data[1] - yFrom) / yDelta;
                const c = getInterpolatedColorString(colorTable, v);
                gradient.addColorStop(stop, c);
            }
        }
    }

    return gradient;
}

/**
 * GradientFill plot
 */
export default class GradientFillPlot extends Plot {
    constructor(id: string | number, options: GradientFillPlotOptions = {}) {
        super(id, options);
        // subclass render function.
        // eslint-disable-next-line
        (this.options as any).renderLegend = renderGradientFillPlotLegend; // see updateLegendRows() in videx-wellog\src\tracks\graph\graph-legend.ts 
    }

    /**
     * Renders area plot to canvas context
     * @param ctx canvas context instance
     * @param scale y-scale
     */
    plot(ctx: CanvasRenderingContext2D, scale: Scale): void {
        const { scale: xscale, data: plotdata } = this;
        if (!xscale) return;

        const options = this.options as GradientFillPlotOptions;
        if (options.hidden) return;

        const useMinAsBase =
            options.useMinAsBase === undefined ? true : options.useMinAsBase;

        const [d0, d1] = xscale.domain();
        const dmin = Math.min(d0, d1);
        const dmax = Math.max(d0, d1);

        const rmin = xscale(dmin);
        const rmax = xscale(dmax);

        const zeroValue = useMinAsBase ? rmin : rmax;

        ctx.save();

        const areaFunction = area()
            // this.options.defined is always initialized by some function
            .defined((d) => (options.defined as DefinedFunction)(d[1], d[0]))
            .context(ctx);

        if (options.horizontal) {
            areaFunction
                .y1((d) => xscale(d[1]))
                .y0(zeroValue)
                .x((d) => scale(d[0]));
        } else {
            areaFunction
                .x1((d) => xscale(d[1]))
                .x0(zeroValue)
                .y((d) => scale(d[0]));
        }

        ctx.globalAlpha = options.fillOpacity || 1;

        if (options.inverseColor || options.inverseColorTable) {
            const inverseValue = useMinAsBase ? rmax : rmin;

            const inverseAreaFunction = area()
                // this.options.defined is always initialized by some function
                .defined((d) =>
                    (options.defined as DefinedFunction)(d[1], d[0])
                )
                .context(ctx);

            if (options.horizontal) {
                inverseAreaFunction
                    .y1((d) => xscale(d[1]))
                    .y0(inverseValue)
                    .x((d) => scale(d[0]));
            } else {
                inverseAreaFunction
                    .x1((d) => xscale(d[1]))
                    .x0(inverseValue)
                    .y((d) => scale(d[0]));
            }
            ctx.beginPath();
            inverseAreaFunction(plotdata);
            ctx.fillStyle = options.inverseColor || "";
            /* Start GradientFill code */
            const colorTable = options.inverseColorTable;
            if (colorTable)
                ctx.fillStyle = createGradient(
                    ctx,
                    scale,
                    options.horizontal,
                    plotdata,
                    xscale,
                    colorTable,
                    options.inverseColorScale ||
                        options.colorScale ||
                        options.scale
                );
            /* End GradientFill code */

            ctx.fill();
        }

        ctx.beginPath();
        areaFunction(plotdata);
        ctx.lineWidth = options.width || 0.0;

        ctx.fillStyle = options.fill || options.color || "";
        /* Start GradientFill code */
        const colorTable = options.colorTable;
        if (colorTable)
            ctx.fillStyle = createGradient(
                ctx,
                scale,
                options.horizontal,
                plotdata,
                xscale,
                colorTable,
                options.colorScale || options.scale
            );
        /* End GradientFill code */

        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.strokeStyle = options.color || "";
        ctx.stroke();

        ctx.restore();
    }
}
