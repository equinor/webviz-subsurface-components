/* This file contains functions wich are missed on exports from "@equinor/videx-wellog" see \src\plots\legend\common.ts */

import { setProps, setAttrs } from "@equinor/videx-wellog";
import { LegendBounds } from "@equinor/videx-wellog/dist/utils/legend-helper";
// eslint-disable-next-line
declare type D3Selection = any; // not exported from videx-wellog! import { D3Selection } from "@equinor/videx-wellog/dist/common/interfaces';

/**
 * Renders label, min/max values for domain and unit
 */
export function renderTextLabels(
    g: D3Selection,
    bounds: LegendBounds,
    label: string,
    unit: string,
    domain: number[],
    color: string,
    addLabelBg = false
): void {
    const { height: h, width: w, top, left } = bounds;
    const lineY = top + h * 0.5;
    const textSize = h * 0.35;
    const subTextSize = textSize * 0.85;
    const subY = lineY + subTextSize;
    const centerX = left + w / 2;
    const [min, max] = domain;

    // label
    const labelX = centerX;
    const labelY = top + textSize;
    const labelTransform = `translate(${labelX},${labelY})`;

    let labelBg;
    if (addLabelBg) {
        labelBg = g
            .append("rect")
            .classed("label-bg", true)
            .attr("fill", "white");
    }

    const labelText = g.append("text").text(label);
    setProps(labelText, {
        styles: {
            "text-anchor": "middle",
            fill: color,
        },
        attrs: {
            class: "legend-label",
            "font-size": `${textSize}px`,
            transform: labelTransform,
        },
    });

    if (addLabelBg) {
        const bbox = labelText.node().getBBox();
        setAttrs(labelBg, {
            x: centerX + bbox.x - 1,
            y: top + 1,
            width: bbox.width + 2,
            height: h * 0.5 - 2,
        });
    }

    // unit
    if (unit) {
        const unitX = centerX;
        const unitTransform = `translate(${unitX},${subY})`;
        const unitText = g.append("text").text(unit);
        setProps(unitText, {
            styles: {
                "text-anchor": "middle",
                fill: color,
            },
            attrs: {
                class: "legend-unit",
                "font-size": `${subTextSize}px`,
                transform: unitTransform,
            },
        });
    }

    const minText =
        Math.abs(min) > 1000 && min % 1000 === 0
            ? `${Math.round(min / 1000)}k`
            : `${min}`;
    const maxText =
        Math.abs(max) > 1000 && max % 1000 === 0
            ? `${Math.round(max / 1000)}k`
            : `${max}`;
    // domain
    const minDomain = g.append("text").text(minText);
    setProps(minDomain, {
        styles: {
            "text-anchor": "start",
            fill: color,
        },
        attrs: {
            class: "legend-domain",
            "font-size": `${subTextSize}px`,
            x: left + 2,
            y: subY,
        },
    });
    const maxDomain = g.append("text").text(maxText);
    setProps(maxDomain, {
        styles: {
            "text-anchor": "end",
            fill: color,
        },
        attrs: {
            class: "legend-domain",
            "font-size": `${subTextSize}px`,
            x: left + w - 2,
            y: subY,
        },
    });
}

/**
 * Renders a basic/standard set of layout that are common for most plot-type legends
 */
export function renderBasicPlotLegend(
    g: D3Selection,
    bounds: LegendBounds,
    label: string,
    unit: string,
    domain: number[],
    color: string,
    addLabelBg = false
): void {
    const x1 = bounds.left + 2;
    const x2 = Math.max(x1, bounds.left + bounds.width - 2);

    const lineY = bounds.top + bounds.height * 0.5;
    const lineWidth = bounds.height * 0.1;

    const line = g.append("line");
    setProps(line, {
        attrs: {
            x1,
            x2,
            y1: lineY,
            y2: lineY,
        },
        styles: {
            "stroke-width": lineWidth,
            stroke: color,
            fill: color,
        },
    });

    renderTextLabels(g, bounds, label, unit, domain, color, addLabelBg);
}
