import type {
    Color,
    LayersList,
    UpdateParameters,
    Viewport,
} from "@deck.gl/core";
import {
    COORDINATE_SYSTEM,
    CompositeLayer,
    OrthographicViewport,
} from "@deck.gl/core";
import { TextLayer } from "@deck.gl/layers";
import { ticks } from "d3-array";
import { cloneDeep } from "lodash";

import type { BoundingBox3D, Point3D } from "../../utils";
import type {
    ExtendedLayerProps,
    ReportBoundingBoxAction,
} from "../utils/layerTools";
import { FixedSizeExtension } from "../../extensions/fixed-size-extension";
import BoxLayer from "./boxLayer";

export interface AxesLayerProps extends ExtendedLayerProps {
    /**
     *  [xmin, ymin, zmin, xmax, ymax, zmax]
     *  Note that z values are default interpreted as going downwards. See property "ZIncreasingDownwards".
     *  So by default zmax is expected to be bigger than zmin.
     */
    bounds: BoundingBox3D;
    labelColor?: Color;

    /**
     * Font size for tick labels, specified in pixels. Axis labels are +7 pixels relative to this size.
     * @default 12
     */
    labelFontSize: number;

    fontFamily?: string;
    axisColor?: Color;

    /** If true means that input z values are interpreted as depths.
     * For example a depth of 2000 will be further down than a depth value of 1000.
     * @default true
     */
    ZIncreasingDownwards: boolean;

    // Non public properties:
    reportBoundingBox?: React.Dispatch<ReportBoundingBoxAction>;
}

const defaultProps = {
    "@@type": "AxesLayer",
    name: "Axes",
    id: "axes-layer",
    visible: true,
    ZIncreasingDownwards: true,
    labelFontSize: 12,
};

type TextLayerData = {
    label: string;
    from: Point3D; // tick line start
    to: Point3D; // tick line end
    size: number; // font size
};

export default class AxesLayer extends CompositeLayer<AxesLayerProps> {
    rebuildData(reportBoundingBox: boolean): void {
        const bounds = cloneDeep(this.props.bounds);

        if (this.props.ZIncreasingDownwards) {
            bounds[2] *= -1;
            bounds[5] *= -1;
        }

        if (bounds[2] > bounds[5]) {
            // Swap z values to ensure smallest first.
            [bounds[2], bounds[5]] = [bounds[5], bounds[2]];
        }

        if (bounds[0] > bounds[3]) {
            // Swap x values to ensure smallest first.
            [bounds[0], bounds[3]] = [bounds[3], bounds[0]];
        }

        if (bounds[1] > bounds[4]) {
            // Swap y values to ensure smallest first.
            [bounds[1], bounds[4]] = [bounds[4], bounds[1]];
        }

        const box_lines = GetBoxLines(bounds);

        const is_orthographic =
            this.context.viewport.constructor === OrthographicViewport;
        const zScale = this.props.modelMatrix ? this.props.modelMatrix[10] : 1;

        const [tick_lines, tick_labels] = GetTickLines(
            this.props.ZIncreasingDownwards,
            is_orthographic,
            bounds,
            this.context.viewport,
            zScale
        );

        const textlayerData = maketextLayerData(
            is_orthographic,
            tick_lines,
            tick_labels,
            bounds,
            this.props.labelFontSize
        );

        this.setState({ box_lines, tick_lines, textlayerData });

        if (
            typeof this.props.reportBoundingBox !== "undefined" &&
            reportBoundingBox
        ) {
            this.props.reportBoundingBox({ layerBoundingBox: bounds });
        }
    }

    initializeState(): void {
        const reportBoundingBox = true;
        this.rebuildData(reportBoundingBox);
    }

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

    updateState(): void {
        const reportBoundingBox = false;
        this.rebuildData(reportBoundingBox);
    }

    getAnchor(d: TextLayerData, is_orthographic: boolean): string {
        const is_xaxis = d.from[1] !== d.to[1];
        if (is_orthographic && is_xaxis) {
            return "middle";
        }

        const zScale = this.props.modelMatrix ? this.props.modelMatrix[10] : 1;

        const p0: Point3D = [d.from[0], d.from[1], d.from[2] * zScale];
        const p1: Point3D = [d.to[0], d.to[1], d.to[2] * zScale];

        const screen_from = this.context.viewport.project(p0);
        const screen_to = this.context.viewport.project(p1);
        const is_labels = d.label !== "X" && d.label !== "Y" && d.label !== "Z"; // labels on axis or XYZ annotations
        if (is_labels) {
            if (screen_from[0] < screen_to[0]) {
                return "start";
            }
        }

        return "end";
    }

    getLabelPosition(d: TextLayerData): Point3D {
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

    getBaseLine(d: TextLayerData, is_orthographic: boolean): string {
        const is_x_annotaion = d.label === "X";
        if (is_x_annotaion) {
            return "center";
        }

        const is_xaxis_label = d.from[1] !== d.to[1];
        return is_orthographic && is_xaxis_label ? "top" : "center";
    }

    renderLayers(): LayersList {
        const is_orthographic =
            this.context.viewport.constructor === OrthographicViewport;

        const boxLines = this.state["box_lines"] as number[];
        const tickLines = this.state["tick_lines"] as number[];

        const lines = [...boxLines, ...tickLines];

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
                data: this.state["textlayerData"],
                id: "text-layer",
                pickable: true,
                getPosition: (d: TextLayerData) => this.getLabelPosition(d),
                getText: (d: TextLayerData) => d.label,
                sizeUnits: "pixels",
                getSize: (d: TextLayerData) => d.size,
                getAngle: 0,
                getTextAnchor: (d: TextLayerData) =>
                    this.getAnchor(d, is_orthographic),
                getAlignmentBaseline: (d: TextLayerData) =>
                    this.getBaseLine(d, is_orthographic),
                coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
                getColor: this.props.labelColor || [0, 0, 0, 255],
                extensions: [new FixedSizeExtension()],
            })
        );

        return [box_layer, text_layer];
    }
}

AxesLayer.layerName = "AxesLayer";
AxesLayer.defaultProps = defaultProps;

//-- Local functions. -------------------------------------------------

function lineLengthInPixels(
    p0: Point3D,
    p1: Point3D,
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
    is_orthographic: boolean,
    tick_lines: number[],
    tick_labels: string[],
    bounds: BoundingBox3D,
    labelFontSize: number
): [TextLayerData] {
    const x_min = bounds[0];
    const x_max = bounds[3];

    const y_min = bounds[1];
    const y_max = bounds[4];

    const z_min = bounds[2];
    const z_max = bounds[5];

    const dx = Math.abs(x_max - x_min);
    const dy = Math.abs(y_max - y_min);
    const dz = Math.abs(z_max - z_min);

    const offset = ((dx + dy + dz) / 3.0) * 0.1;

    const axisAnnotationData = {
        label: "X",
        from: [0.0, 0.0, 0.0],
        to: [x_max + offset, y_min, z_min],
        size: labelFontSize + 7,
    };

    const data = [
        axisAnnotationData,
        {
            ...axisAnnotationData,
            label: "Y",
            to: [x_min, y_max + offset, z_min],
        },
    ];

    if (!is_orthographic) {
        data.push({
            ...axisAnnotationData,
            label: "Z",
            to: [x_min, y_min, z_max + offset],
        });
    }

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
            size: labelFontSize,
        });
    }

    return data as [TextLayerData];
}

function GetTicks(
    min: number,
    max: number,
    axis_pixel_length: number
): number[] {
    const nTicks = Math.min(Math.round(axis_pixel_length / 100) + 1, 20);
    return ticks(min, max, nTicks);
}

function GetTickLines(
    isZIncreasingDownwards: boolean,
    is_orthographic: boolean,
    bounds: BoundingBox3D,
    viewport: Viewport,
    zScale: number
): [number[], string[]] {
    const ndecimals = 0;
    const n_minor_ticks = 3;

    const x_min = bounds[0];
    const x_max = bounds[3];

    const y_min = bounds[1];
    const y_max = bounds[4];

    const z_min = bounds[2];
    const z_max = bounds[5];

    const lines: number[] = [];
    const tick_labels: string[] = [];

    // ADD TICK LINES.
    const dx = x_max - x_min;
    const dy = y_max - y_min;
    const dz = z_max - z_min;

    let x_tick = 0.0;
    let y_tick = 0;
    let z_tick = 0;

    const delta = ((dx + dy + dz) / 3.0) * 0.025;

    const Lz = lineLengthInPixels(
        [x_min, y_min, z_min * zScale],
        [x_min, y_min, z_max * zScale],
        viewport
    );

    // Z tick marks. Only in 3D.
    if (!is_orthographic) {
        const z_ticks = GetTicks(z_min, z_max, Lz);

        x_tick = x_min;
        y_tick = y_min;
        for (let i = 0; i < z_ticks.length; i++) {
            const tick = z_ticks[i];

            const sign = isZIncreasingDownwards ? -1 : 1;
            const tick_label_num = sign * tick;
            const label = tick_label_num.toFixed(ndecimals);
            tick_labels.push(label);

            // tick line start
            lines.push(x_tick, y_tick, tick);

            // tick line end. let tick mark point 45 degrees out from z axis.
            const x = -delta * Math.cos(3.14157 / 4);
            const y = -delta * Math.sin(3.14157 / 4);
            lines.push(x_tick + x, y_tick + y, tick);
        }

        // Add minor Z ticks.
        if (z_ticks.length > 1) {
            const tick1 = z_ticks[0];
            const tick2 = z_ticks[1];
            const d = (tick2 - tick1) / (n_minor_ticks + 1);
            const z_start = tick1;

            // up
            let i = 0;
            while (z_start + (i + 1) * d < z_max) {
                const tick = z_start + (i + 1) * d;
                tick_labels.push("");
                i++;
                // tick line start
                lines.push(x_tick, y_tick, tick);

                // tick line end.
                const x = -0.5 * delta * Math.cos(3.14157 / 4);
                const y = -0.5 * delta * Math.sin(3.14157 / 4);
                lines.push(x_tick + x, y_tick + y, tick);
            }

            // down
            i = 0;
            while (z_start - (i + 1) * d > z_min) {
                const tick = z_start - (i + 1) * d;
                tick_labels.push("");
                i++;
                // tick line start
                lines.push(x_tick, y_tick, tick);

                // tick line end.
                const x = -0.5 * delta * Math.cos(3.14157 / 4);
                const y = -0.5 * delta * Math.sin(3.14157 / 4);
                lines.push(x_tick + x, y_tick + y, tick);
            }
        }
    }

    // X axis labels.
    const Lx = lineLengthInPixels(
        [x_min, y_min, z_min * zScale],
        [x_max, y_min, z_min * zScale],
        viewport
    );

    const x_ticks = GetTicks(x_min, x_max, Lx);
    y_tick = y_min;
    z_tick = z_min;
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
    const Ly = lineLengthInPixels(
        [x_min, y_min, z_min * zScale],
        [x_min, y_max, z_min * zScale],
        viewport
    );

    const y_ticks = GetTicks(y_min, y_max, Ly);
    for (let i = 0; i < y_ticks.length; i++) {
        const tick = y_ticks[i];

        const label = tick.toFixed(ndecimals);
        tick_labels.push(label);

        const x_tick = x_min;
        const z_tick = z_min;

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

function GetBoxLines(bounds: BoundingBox3D): number[] {
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
