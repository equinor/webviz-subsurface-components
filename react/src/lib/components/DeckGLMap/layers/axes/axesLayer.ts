import { CompositeLayer } from "@deck.gl/core";
import BoxLayer from "./boxLayer";
import { ExtendedLayerProps } from "../utils/layerTools";
import { layersDefaultProps } from "../layersDefaultProps";
import { COORDINATE_SYSTEM } from "@deck.gl/core";
import { TextLayer, TextLayerProps } from "@deck.gl/layers";
import { UpdateStateInfo } from "@deck.gl/core/lib/layer";

export interface AxesLayerProps<D> extends ExtendedLayerProps<D> {
    bounds: [number, number, number, number, number, number];
}

type TextLayerData = {
    label: string;
    from: [number, number, number]; // tick line start
    to: [number, number, number]; // tick line end
    size: number; // font size
};

export default class AxesLayer extends CompositeLayer<
    unknown,
    AxesLayerProps<unknown>
> {
    initializeState(): void {
        const box_lines = GetBoxLines(this.props.bounds);
        const [tick_lines, tick_labels] = GetTickLines(this.props.bounds);
        const textlayer_data = maketextLayerData(
            tick_lines,
            tick_labels,
            this.props.bounds
        );

        this.setState({ box_lines, tick_lines, tick_labels, textlayer_data });
    }

    shouldUpdateState({
        props,
        oldProps,
        context,
        changeFlags,
    }: UpdateStateInfo<AxesLayerProps<unknown>>): boolean | string | null {
        return (
            super.shouldUpdateState({
                props,
                oldProps,
                context,
                changeFlags,
            }) || changeFlags.viewportChanged
        );
    }

    updateState(): void {
        const textlayerData = maketextLayerData(
            this.state.tick_lines,
            this.state.tick_labels,
            this.props.bounds
        );
        this.setState({ textlayerData });
    }

    getAnchor(d: TextLayerData): string {
        const screen_from = this.context.viewport.project(d.from);
        const screen_to = this.context.viewport.project(d.to);

        if (d.label !== "X" && d.label !== "Y" && d.label !== "Z") {
            if (screen_from[0] < screen_to[0]) {
                return "start";
            }
        }
        return "end";
    }

    renderLayers(): [BoxLayer, TextLayerProps<TextLayerData>] {
        const lines = [...this.state.box_lines, ...this.state.tick_lines];

        const box_layer = new BoxLayer(
            this.getSubLayerProps({
                lines,
                coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            })
        );

        const text_layer = new TextLayer(
            this.getSubLayerProps({
                data: this.state.textlayerData,
                id: "text-layer",
                pickable: true,
                getPosition: (d: TextLayerData) => d.to,
                getText: (d: TextLayerData) => d.label,
                sizeUnits: "pixels",
                getSize: (d: TextLayerData) => d.size,
                getAngle: 0,
                getTextAnchor: (d: TextLayerData) => this.getAnchor(d),
                getAlignmentBaseline: "center",
                coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            })
        );

        return [box_layer, text_layer];
    }
}

AxesLayer.layerName = "AxesLayer";
AxesLayer.defaultProps = layersDefaultProps[
    "AxesLayer"
] as AxesLayerProps<unknown>;

//-- Local functions. -------------------------------------------------

function maketextLayerData(
    tick_lines: number[],
    tick_labels: string[],
    bounds: [number, number, number, number, number, number]
): [TextLayerData] {
    const x_min = bounds[0];
    const x_max = bounds[3];

    const y_min = bounds[1];
    const y_max = bounds[4];

    const z_min = bounds[2];
    const z_max = bounds[5];

    // const dx = x_max - x_min;  // keep!
    // const dy = y_max - y_min;
    const dz = z_max - z_min;

    const offset = dz * 0.2;
    const data = [
        {
            label: "X",
            from: [0.0, 0.0, 0.0],
            to: [x_max + offset, y_min, z_min],
            size: 26,
        },
        {
            label: "Y",
            from: [0.0, 0.0, 0.0],
            to: [x_min, y_max + offset, z_min],
            size: 26,
        },
        {
            label: "Z",
            from: [0.0, 0.0, 0.0],
            to: [x_min, y_min, z_max + offset],
            size: 26,
        },
    ];

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

        data.push({ label: label, from: from, to: to, size: 12 });
    }

    return data as [TextLayerData];
}

function GetTicks(min: number, max: number): number[] {
    let step = 4;

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
    if (calc_step > 0) {
        step = calc_step;
    }

    const ticks: number[] = [];

    //ticks.push(min);  SKIP FIRST AND LAST
    for (let i = 0; i <= step; i++) {
        const x = start + i * incr;
        ticks.push(x);
    }

    return ticks;
}

function GetTickLines(
    bounds: [number, number, number, number, number, number]
): [number[], string[]] {
    const ndecimals = 1;

    const x_min = bounds[0];
    const x_max = bounds[3];

    const y_min = bounds[1];
    const y_max = bounds[4];

    const z_min = bounds[2];
    const z_max = bounds[5];

    const lines: number[] = [];
    const tick_labels = [];

    // ADD TICK LINES.
    // const dx = x_max - x_min;   // keep!
    // const dy = y_max - y_min;
    const dz = z_max - z_min;

    const delta = dz * 0.025; // length of tick marks.

    const z_ticks = GetTicks(z_min, z_max);
    for (let i = 0; i < z_ticks.length; i++) {
        const tick = z_ticks[i];

        const label = (-tick).toFixed(ndecimals); // minus sign: positive depth along negative z axis.
        tick_labels.push(label);

        const x_tick = x_min;
        const y_tick = y_min;

        // tick line start
        lines.push(x_tick);
        lines.push(y_tick);
        lines.push(tick);

        // tick line end. lLt tick mark point 45 degrees out from z axis.
        const x = -delta * Math.cos(3.14157 / 4);
        const y = -delta * Math.sin(3.14157 / 4);
        lines.push(x_tick + x);
        lines.push(y_tick + y);
        lines.push(tick);
    }

    const x_ticks = GetTicks(x_min, x_max);
    for (let i = 0; i < x_ticks.length; i++) {
        const tick = x_ticks[i];

        const label = tick.toFixed(ndecimals);
        tick_labels.push(label);

        const y_tick = y_min;
        const z_tick = z_min;

        // tick line start
        lines.push(tick);
        lines.push(y_tick);
        lines.push(z_tick);

        // tick line end. lLt tick mark point 45 degrees out from z axis.
        const z = 0.0;
        const y = -delta;
        lines.push(tick);
        lines.push(y_tick + y);
        lines.push(z_tick + z);
    }

    const y_ticks = GetTicks(y_min, y_max);
    for (let i = 0; i < y_ticks.length; i++) {
        const tick = y_ticks[i];

        const label = tick.toFixed(ndecimals);
        tick_labels.push(label);

        const x_tick = x_min;
        const z_tick = z_min;

        // tick line start
        lines.push(x_tick);
        lines.push(tick);
        lines.push(z_tick);

        // tick line end. lLt tick mark point 45 degrees out from z axis.
        const z = 0.0;
        const x = -delta;
        lines.push(x_tick + x);
        lines.push(tick);
        lines.push(z_tick + z);
    }

    return [lines, tick_labels];
}

function GetBoxLines(
    bounds: [number, number, number, number, number, number]
): number[] {
    const x_min = bounds[0];
    const x_max = bounds[3];

    const y_min = bounds[1];
    const y_max = bounds[4];

    const z_min = bounds[2];
    const z_max = bounds[5];

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

        x_min,
        y_max,
        z_min,

        x_max,
        y_max,
        z_min,

        x_max,
        y_max,
        z_min,

        x_max,
        y_min,
        z_min,

        // BOTTOM
        x_min,
        y_min,
        z_max,

        x_max,
        y_min,
        z_max,

        x_min,
        y_min,
        z_max,

        x_min,
        y_max,
        z_max,

        x_min,
        y_max,
        z_max,

        x_max,
        y_max,
        z_max,

        x_max,
        y_max,
        z_max,

        x_max,
        y_min,
        z_max,

        // PILLARS
        x_min,
        y_min,
        z_min,

        x_min,
        y_min,
        z_max,

        x_max,
        y_min,
        z_min,

        x_max,
        y_min,
        z_max,

        x_max,
        y_max,
        z_min,

        x_max,
        y_max,
        z_max,

        x_min,
        y_max,
        z_min,

        x_min,
        y_max,
        z_max,
    ];

    return lines;
}
