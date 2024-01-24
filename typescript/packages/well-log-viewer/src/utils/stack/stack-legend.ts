import { select } from "d3";
/* Missed exports from "@equinor/videx-wellog !!! */
// eslint-disable-next-line
declare type D3Selection = any; //import { D3Selection } from "@equinor/videx-wellog/dist/common/interfaces';
import type {
    LegendConfig,
    LegendOnUpdateFunction,
} from "@equinor/videx-wellog/dist/utils/legend-helper";

import { onUpdateLegend } from "./scale-legend";

/**
 * Config object required for stacked track config in order to add legend
 *
 * The implementation is similar to scaleLegendConfig from ./scale-legends.ts and videx-wellog/src/tracks/scale/common.ts
 */
export const stackLegendConfig: LegendConfig = {
    elementType: "svg",
    getLegendRows: () => 2,
    onInit: (elm, track, updateTrigger) => {
        track.legendUpdate = updateTrigger;

        const lg = select(elm);
        lg.selectAll("g.legend").remove();

        const g = lg.append("g").attr("class", "legend");

        g.append("text")
            .classed("scale-title", true)
            .style("text-anchor", "middle");
    },
    onUpdate: onUpdateLegend as LegendOnUpdateFunction,
};
