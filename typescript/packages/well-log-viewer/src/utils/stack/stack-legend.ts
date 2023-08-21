import { select } from "d3";
/* Missed exports from "@equinor/videx-wellog !!! */
// eslint-disable-next-line
declare type D3Selection = any; //import { D3Selection } from "@equinor/videx-wellog/dist/common/interfaces';
import type {
    LegendBounds,
    LegendConfig,
    LegendOnUpdateFunction,
} from "@equinor/videx-wellog/dist/utils/legend-helper";
import { setAttrs } from "@equinor/videx-wellog";

import type { StackedTrack } from "@equinor/videx-wellog";

/**
 * Callback when legend needs to be updated
 *
 * The implementation is similar to onUpdateLegend() from videx-wellog/src/tracks/scale/common.ts
 */
function onUpdateLegend(
    elm: D3Selection,
    bounds: LegendBounds,
    track: StackedTrack
): void {
    const lg = select(elm);

    //if (!track.extent) return;

    const { horizontal, label, abbr } = track.options;
    //const [min, max] = track.extent;
    //const span = Math.round((max - min) * 2) / 2;

    const { height: h, width: w, top } = bounds;

    const textSize = Math.min(
        12 * /*decrease a litle:*/ 0.9,
        w * 0.22 * /*decrease a litle:*/ 0.9
    );
    const lsp = textSize * 0.1;

    const x = horizontal ? h : w / 2;

    const y0 = horizontal ? w / 2 + 2 * (textSize + lsp) : top + h;
    const y3 = y0 - textSize / 1.2;
    const y2 = y3 - textSize + lsp;
    const y1 = y2 - textSize - lsp;

    const g = lg.select(".scale-legend");
    const lbl = g.select("text.scale-title");
    setAttrs(lbl, {
        transform: `translate(${x},${y1})`,
        "font-size": `${textSize}px`,
        fill: "black",
    });
    lbl.text(abbr || label || "???");

    const val = g.select("text.scale-range");
    setAttrs(val, {
        transform: `translate(${x},${y2})`,
        "font-size": `${textSize}px`,
    });
    //val.text(Number.isNaN(span) ? '-' : span);

    const unit = g.select("text.scale-units");
    setAttrs(unit, {
        transform: `translate(${x},${y3})`,
        "font-size": `${textSize / 1.2}px`,
    });
    //unit.text(track.options.units || 'units');
}

/**
 * Config object required for stacked track config in order to add legend
 *
 * The implementation is similar to scaleLegendConfig from videx-wellog/src/tracks/scale/common.ts
 */
export const stackLegendConfig: LegendConfig = {
    elementType: "svg",
    getLegendRows: () => 2,
    onInit: (elm, track, updateTrigger) => {
        track.legendUpdate = updateTrigger;

        const lg = select(elm);
        lg.selectAll("g.scale-legend").remove();

        const g = lg.append("g").attr("class", "scale-legend");

        g.append("text")
            .classed("scale-title", true)
            .attr("font-weight", /*"600" decrease a litle: */ "400")
            .style("text-anchor", "middle");

        g.append("text")
            .attr("class", "scale-range")
            .style("text-anchor", "middle");
        g.append("text")
            .attr("class", "scale-units")
            .style("text-anchor", "middle");
    },
    onUpdate: onUpdateLegend as LegendOnUpdateFunction,
};
