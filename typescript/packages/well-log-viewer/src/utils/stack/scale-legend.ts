import { select } from "d3";
/* Missed exports from "@equinor/videx-wellog !!! */
// eslint-disable-next-line
declare type D3Selection = any; // import { D3Selection } from "@equinor/videx-wellog/dist/common/interfaces';
import type {
    LegendBounds,
    LegendConfig,
    LegendOnUpdateFunction,
} from "@equinor/videx-wellog/dist/utils/legend-helper";
import { setAttrs } from "@equinor/videx-wellog";

import type { ScaleTrack } from "@equinor/videx-wellog";
import { StackedTrack, DualScaleTrack } from "@equinor/videx-wellog";

/**
 * Callback when legend needs to be updated
 *
 * The implementation is similar to onUpdateLegend() from videx-wellog/src/tracks/scale/common.ts
 */
export function onUpdateLegend(
    elm: D3Selection,
    bounds: LegendBounds,
    track: StackedTrack | ScaleTrack | DualScaleTrack
): void {
    const lg = select(elm);

    const { horizontal, label, abbr } = track.options;

    const vertText = horizontal; // text orientation

    let { height: h, width: w, top } = bounds;
    h += top; // h = elm.getBoundingClientRect().height or width
    if (horizontal != vertText) {
        // correct back (see updateLegend() in videx-wellog/src/tracks/graph/graph-legend.ts)
        top = 0;
        const tmp = h;
        h = w;
        w = tmp;
        //w = horizontal
        //    ? elm.getBoundingClientRect().width
        //    : elm.getBoundingClientRect().height;
    }

    const lineSize = Math.min(12, h / 3.3);

    const lsp = lineSize * 0.1;

    const x = w / 2;

    top = 5; // some euristic value

    let y0 = top + h;
    {
        // center line alignment
        const dh = h - lineSize * 3.3;
        y0 -= dh / 2;
    }

    const y3 = y0 - lineSize / 1.2;
    const y2 = y3 - lineSize + lsp;
    const y1 = y2 - lineSize - lsp;

    const bScaleTrack = !(track instanceof StackedTrack);

    let textSize = lineSize;
    textSize = Math.max(6, Math.min(textSize, w * (bScaleTrack ? 0.25 : 0.15)));

    const g = lg.select(".legend");
    const lbl = g.select("text.scale-title");
    setAttrs(lbl, {
        transform: vertText
            ? `translate(${bScaleTrack ? y1 : y2}, ${x})rotate(-90)`
            : `translate(${x},${bScaleTrack ? y1 : y2})`,
        "font-size": `${textSize}px`,
        fill:
            track instanceof DualScaleTrack && track.isMaster
                ? "black"
                : "#555",
    });
    lbl.text(abbr || label || "???");

    if (bScaleTrack && track.extent) {
        const val = g.select("text.scale-range");
        setAttrs(val, {
            transform: vertText
                ? `translate(${y2},${x})rotate(-90)`
                : `translate(${x},${y2})`,
            "font-size": `${textSize}px`,
        });
        const [min, max] = track.extent;
        const span = Math.round((max - min) * 2) / 2;
        val.text(Number.isNaN(span) ? "-" : span);

        const unit = g.select("text.scale-units");
        setAttrs(unit, {
            transform: vertText
                ? `translate(${y3},${x})rotate(-90)`
                : `translate(${x},${y3})`,
            "font-size": `${textSize / 1.2}px`,
        });
        unit.text(track.options.units || "units");
    }
}

/**
 * Config object required for track config in order to add legend
 * The implementation is similar to scaleLegendConfig from videx-wellog/src/tracks/scale/common.ts
 */
export const scaleLegendConfig: LegendConfig = {
    elementType: "svg",
    getLegendRows: () => 2,
    onInit: (elm, track, updateTrigger) => {
        track.legendUpdate = updateTrigger;

        const lg = select(elm);
        lg.selectAll("g.legend").remove();

        const g = lg.append("g").attr("class", "legend");

        g.append("text")
            .classed("scale-title", true)
            .attr("font-weight", "600")
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
