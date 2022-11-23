import {
    COORDINATE_SYSTEM,
    Color,
    CompositeLayer,
    Viewport,
    UpdateParameters,
    LayersList,
    OrthographicViewport,
} from "@deck.gl/core/typed";
import BoxLayer from "./boxLayer";
import { Position3D, ExtendedLayerProps } from "../utils/layerTools";
import { layersDefaultProps } from "../layersDefaultProps";
import { TextLayer } from "@deck.gl/layers/typed";

export interface Axes2DLayerProps<D> extends ExtendedLayerProps<D> {
    labelColor?: Color;
    labelFontSize?: number;
    fontFamily?: string;
    axisColor?: Color;
    marginH: number;
    marginV: number;
}

type TextLayerData = {
    label: string;
    from: Position3D; // tick line start
    to: Position3D; // tick line end
    size: number; // font size
};

export default class Axes2DLayer extends CompositeLayer<
    Axes2DLayerProps<unknown>
> {
    shouldUpdateState({
        props,
        oldProps,
        context,
        changeFlags,
    }: UpdateParameters<this>): boolean {
        return (
            super.shouldUpdateState({
                props,
                oldProps,
                context,
                changeFlags,
            }) || changeFlags.viewportChanged
        );
    }

    getAnchor(d: TextLayerData): string {
        const is_xaxis = d.from[1] !== d.to[1];
        if (is_xaxis) {
            return "middle";
        }

        const screen_from = this.context.viewport.project(d.from);
        const screen_to = this.context.viewport.project(d.to);
        const is_labels = d.label !== "X" && d.label !== "Y" && d.label !== "Z"; // labels on axis or XYZ annotations
        if (is_labels) {
            if (screen_from[0] < screen_to[0]) {
                return "start";
            }
        }

        return "end";
    }

    getLabelPosition(d: TextLayerData): Position3D {
        const is_labels = d.label !== "X" && d.label !== "Y" && d.label !== "Z"; // labels on axis or XYZ annotations
        if (is_labels) {
            const tick_vec = [d.to[0] - d.from[0], d.to[1] - d.from[1]];
            if (d.to[2] && d.from[2]) tick_vec.push(d.to[2] - d.from[2]);

            const s = 0.5;
            return [
                d.to[0] + s * tick_vec[0],
                d.to[1] + s * tick_vec[1],
                d.to[2] + s * tick_vec[2],
            ];
        } else {
            // XYZ axis annotaion.
            return d.to;
        }
    }

    getBaseLine(d: TextLayerData): string {
        const is_x_annotaion = d.label === "X";
        if (is_x_annotaion) {
            return "center";
        }

        const is_xaxis_label = d.from[1] !== d.to[1];
        return is_xaxis_label ? "top" : "center";
    }

    renderLayers(): LayersList {
        const vpBounds = this.context.viewport.getBounds();

        const mh = this.props.marginH / 100; // to percentage.
        const mv = this.props.marginV / 100;

        const dx = vpBounds[2] - vpBounds[0];
        const dy = vpBounds[3] - vpBounds[1];

        const xMarginLeft = dx * mh;
        const xMarginRight = dx * mh;
        const yMarginTop = dy * mv;
        const yMarginBottom = dy * mv;

        const xMin = vpBounds[0] + xMarginLeft;
        const xMax = vpBounds[2] + xMarginRight; // Note: "+" so that the axis extends outside viewport
        const yMin = vpBounds[1] + yMarginBottom;
        const yMax = vpBounds[3] + yMarginTop; // Note: "+" so that the axis extends outside viewport

        const bounds = [xMin, yMin, xMax, yMax] as [
            number,
            number,
            number,
            number
        ];

        const is_orthographic =
            this.context.viewport.constructor === OrthographicViewport;

        if (!is_orthographic) {
            return [];
        }

        const box_lines = GetBoxLines(bounds);

        const [tick_lines, tick_labels] = GetTickLines(
            bounds,
            this.context.viewport
        );

        const textlayerData = maketextLayerData(
            tick_lines,
            tick_labels,
            bounds,
            this.props.labelFontSize
        );

        const lines = [...box_lines, ...tick_lines];

        const box_layer = new BoxLayer(
            this.getSubLayerProps({
                lines,
                coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
                color: this.props.axisColor || [0, 0, 0, 255],
            })
        );

        const text_layer = new TextLayer(
            this.getSubLayerProps({
                fontFamily: this.props.fontFamily ?? "Monaco, monospace",
                data: textlayerData,
                id: "text-layer",
                pickable: true,
                getPosition: (d: TextLayerData) => this.getLabelPosition(d),
                getText: (d: TextLayerData) => d.label,
                sizeUnits: "pixels",
                getSize: (d: TextLayerData) => d.size,
                getAngle: 0,
                getTextAnchor: (d: TextLayerData) => this.getAnchor(d),
                getAlignmentBaseline: (d: TextLayerData) => this.getBaseLine(d),
                coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
                getColor: this.props.labelColor || [0, 0, 0, 255],
            })
        );

        return [box_layer, text_layer];
    }
}

Axes2DLayer.layerName = "Axes2DLayer";
Axes2DLayer.defaultProps = layersDefaultProps["Axes2DLayer"] as Axes2DLayer;

//-- Local functions. -------------------------------------------------

function LineLengthInPixels(
    p0: Position3D,
    p1: Position3D,
    viewport: Viewport
): number {
    const screen_from = viewport.project(p0);
    const screen_to = viewport.project(p1);

    const v = [
        screen_from[0] - screen_to[0],
        screen_from[1] - screen_to[1],
        screen_from[2] - screen_to[2],
    ];
    const L = Math.sqrt(v[0] * v[0] + v[1] * v[1]); // Length of axis on screen in pixles.
    return L;
}

function maketextLayerData(
    tick_lines: number[],
    tick_labels: string[],
    bounds: [number, number, number, number],
    labelFontSize?: number
): [TextLayerData] {
    const data = [];
    for (let i = 0; i < tick_lines.length / 6; i++) {
        const from = [
            tick_lines[6 * i + 0],
            tick_lines[6 * i + 1],
            tick_lines[6 * i + 2],
        ];
        const to = [
            tick_lines[6 * i + 3],
            tick_lines[6 * i + 4],
            tick_lines[6 * i + 5],
        ];
        const label = tick_labels[i];

        data.push({
            label: label,
            from: from,
            to: to,
            size: labelFontSize ?? 11,
        });
    }

    return data as [TextLayerData];
}

function GetTicks(
    min: number,
    max: number,
    axis_pixel_length: number
): number[] {
    let step = Math.min(Math.round(axis_pixel_length / 100) + 1, 20);
    const range = max - min;

    const delta = Math.abs(range) / step;
    let decade = 1;
    if (delta >= 10) {
        const logde = Math.log10(delta);
        const pot = Math.floor(logde);
        decade = Math.pow(10.0, pot);
    }
    let scaled_delta = Math.round(delta / decade);
    if (scaled_delta == 3) scaled_delta = 2;
    else if (scaled_delta == 4 || scaled_delta == 6 || scaled_delta == 7)
        scaled_delta = 5;
    else if (scaled_delta > 7) scaled_delta = 10;
    else if (scaled_delta < 1) scaled_delta = 1;

    const incr = scaled_delta * decade;
    const start = Math.ceil(min / incr) * incr;
    const stop = Math.floor(max / incr) * incr;
    const calc_step = Math.floor(Math.abs(stop - start) / incr);
    step = calc_step > 0 ? calc_step : 0;

    const ticks: number[] = [];

    //ticks.push(min);
    for (let i = 0; i <= step; i++) {
        const x = start + i * incr;
        ticks.push(x);
    }

    return ticks;
}

function GetTickLines(
    bounds: [number, number, number, number],
    viewport: Viewport
): [number[], string[]] {
    const ndecimals = 0;
    const n_minor_ticks = 3;

    const x_min = bounds[0];
    const x_max = bounds[2];

    const y_min = bounds[1];
    const y_max = bounds[3];

    const lines: number[] = [];
    const tick_labels = [];

    // ADD TICK LINES.
    const dx = x_max - x_min;
    const dy = y_max - y_min;

    let y_tick = 0;

    const delta = ((dx + dy) / 2.0) * 0.015;

    // X axis labels.
    const Lx = LineLengthInPixels(
        [x_min, y_min, 0],
        [x_max, y_min, 0],
        viewport
    );

    const x_ticks = GetTicks(x_min, x_max, Lx);
    y_tick = y_min;
    const z_tick = 0;
    for (let i = 0; i < x_ticks.length; i++) {
        const tick = x_ticks[i];

        const label = tick.toFixed(ndecimals);
        tick_labels.push(label);

        // tick line start
        lines.push(tick, y_tick, z_tick);

        // tick line end.
        const z = 0.0;
        const y = -delta;
        lines.push(tick, y_tick + y, z_tick + z);
    }

    // Add minor X ticks.
    if (x_ticks.length > 1) {
        const tick1 = x_ticks[0];
        const tick2 = x_ticks[1];
        const d = (tick2 - tick1) / (n_minor_ticks + 1);
        const x_start = tick1;

        // up
        let i = 0;
        while (x_start + (i + 1) * d < x_max) {
            const tick = x_start + (i + 1) * d;
            tick_labels.push("");
            i++;
            // tick line start
            lines.push(tick, y_tick, z_tick);

            // tick line end.
            const z = 0.0;
            const y = -0.5 * delta;
            lines.push(tick, y_tick + y, z_tick + z);
        }

        // down
        i = 0;
        while (x_start - (i + 1) * d > x_min) {
            const tick = x_start - (i + 1) * d;
            tick_labels.push("");
            i++;
            // tick line start
            lines.push(tick, y_tick, z_tick);

            // tick line end.
            const z = 0.0;
            const y = -0.5 * delta;
            lines.push(tick, y_tick + y, z_tick + z);
        }
    }

    // Y axis labels.
    const Ly = LineLengthInPixels(
        [x_min, y_min, 0], // XXX fjern z dependency...
        [x_min, y_max, 0],
        viewport
    );
    const y_ticks = GetTicks(y_min, y_max, Ly);
    for (let i = 0; i < y_ticks.length; i++) {
        const tick = y_ticks[i];

        const label = tick.toFixed(ndecimals);
        tick_labels.push(label);

        const x_tick = x_min;
        const z_tick = 0; // XXX fjern z dependency...

        // tick line start
        lines.push(x_tick, tick, z_tick);

        // tick line end.
        const z = 0.0;
        const x = -delta;
        lines.push(x_tick + x, tick, z_tick + z);

        // Add minor Y ticks.
        if (y_ticks.length > 1) {
            const tick1 = y_ticks[0];
            const tick2 = y_ticks[1];
            const d = (tick2 - tick1) / (n_minor_ticks + 1);
            const y_start = tick1;

            // up
            let i = 0;
            while (y_start + (i + 1) * d < y_max) {
                const tick = y_start + (i + 1) * d;
                tick_labels.push("");
                i++;
                // tick line start
                lines.push(x_tick, tick, z_tick);

                // tick line end.
                const z = 0.0;
                const x = -0.5 * delta;
                lines.push(x_tick + x, tick, z_tick + z);
            }

            // down
            i = 0;
            while (y_start - (i + 1) * d > y_min) {
                const tick = y_start - (i + 1) * d;
                tick_labels.push("");
                i++;
                // tick line start
                lines.push(x_tick, tick, z_tick);

                // tick line end.
                const z = 0.0;
                const x = -0.5 * delta;
                lines.push(x_tick + x, tick, z_tick + z);
            }
        }
    }

    return [lines, tick_labels];
}

function GetBoxLines(bounds: [number, number, number, number]): number[] {
    const x_min = bounds[0];
    const x_max = bounds[2];

    const y_min = bounds[1];
    const y_max = bounds[3];

    const z_min = 0;

    // ADD LINES OF BOUNDING BOX.
    const lines = [
        // TOP
        x_min,
        y_min,
        z_min,

        x_max,
        y_min,
        z_min,

        x_min,
        y_min,
        z_min,

        x_min,
        y_max,
        z_min,
    ];

    return lines;
}
