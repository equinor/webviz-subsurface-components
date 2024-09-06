import type {
    Color,
    LayerContext,
    UpdateParameters,
    Viewport,
} from "@deck.gl/core";
import {
    COORDINATE_SYSTEM,
    Layer,
    OrthographicViewport,
    project,
} from "@deck.gl/core";
import { load } from "@loaders.gl/core";
import { ImageLoader } from "@loaders.gl/images";
import type { UniformValue } from "@luma.gl/core";
import { Geometry, Model } from "@luma.gl/engine";
import { vec4 } from "gl-matrix";
import type { ExtendedLayerProps, Position3D } from "../utils/layerTools";
import fontAtlasPng from "./font-atlas.png";
import labelFragmentShader from "./label-fragment.glsl";
import labelVertexShader from "./label-vertex.glsl";
import lineFragmentShader from "./line-fragment.glsl";
import lineVertexShader from "./line-vertex.glsl";

enum TEXT_ANCHOR {
    start = 0,
    middle = 1,
    end = 2,
}

enum ALIGNMENT_BASELINE {
    top = 1,
    center = 0,
    bottom = -1,
}

type LabelData = {
    label: string;
    pos: Position3D; // tick line start
    anchor?: TEXT_ANCHOR;
    aligment?: ALIGNMENT_BASELINE;
    //font_size: number; KEEP.
};

enum ViewSide {
    Left,
    Right,
    Bottom,
    Top,
}

const zDepthAxes = 1;
const tickLineLength = 10;

export interface Axes2DLayerProps extends ExtendedLayerProps {
    marginH: number;
    marginV: number;
    formatLabelFunc?: (x: number) => string;
    labelColor?: Color;
    labelFontSizePt?: number;
    axisColor?: Color;
    backgroundColor?: Color;
    isLeftRuler: boolean;
    isRightRuler: boolean;
    isBottomRuler: boolean;
    isTopRuler: boolean;
}

const defaultProps = {
    "@@type": "Axes2DLayer",
    name: "Axes2D",
    id: "axes2d-layer",
    visible: true,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    marginH: 80, // Horizontal margin (in pixles)
    marginV: 30, // Vertical margin (in pixles)
    isLeftRuler: true,
    isRightRuler: false,
    isBottomRuler: true,
    isTopRuler: false,
    labelFontSizePt: 9,
};

// FONT ATLAS
const font_width = 86;
const yh = 97;
const fontInfo = {
    letterHeight: 92,
    spaceWidth: 0,
    spacing: -1,
    textureWidth: 1714,
    textureHeight: 200,
    glyphInfos: {
        A: { x: 0, y: 0, width: font_width },
        B: { x: font_width, y: 0, width: font_width },
        C: { x: 2 * font_width, y: 0, width: font_width },
        D: { x: 3 * font_width, y: 0, width: font_width },
        E: { x: 4 * font_width, y: 0, width: font_width },
        F: { x: 5 * font_width, y: 0, width: font_width },
        G: { x: 6 * font_width, y: 0, width: font_width },
        H: { x: 7 * font_width, y: 0, width: font_width },
        I: { x: 8 * font_width, y: 0, width: font_width },
        J: { x: 9 * font_width, y: 0, width: font_width },
        K: { x: 10 * font_width, y: 0, width: font_width },
        L: { x: 11 * font_width, y: 0, width: font_width },
        M: { x: 12 * font_width, y: 0, width: font_width },
        N: { x: 13 * font_width, y: 0, width: font_width },
        O: { x: 14 * font_width, y: 0, width: font_width },
        P: { x: 15 * font_width, y: 0, width: font_width },
        Q: { x: 16 * font_width, y: 0, width: font_width },
        R: { x: 17 * font_width, y: 0, width: font_width },
        S: { x: 18 * font_width, y: 0, width: font_width },
        T: { x: 19 * font_width, y: 0, width: font_width },

        U: { x: 0, y: yh, width: font_width },
        V: { x: font_width, y: yh, width: font_width },
        W: { x: 2 * font_width, y: yh, width: font_width },
        X: { x: 3 * font_width, y: yh, width: font_width },
        Y: { x: 4 * font_width, y: yh, width: font_width },
        Z: { x: 5 * font_width, y: yh, width: font_width },
        0: { x: 6 * font_width, y: yh, width: font_width },
        1: { x: 7 * font_width, y: yh, width: font_width },
        2: { x: 8 * font_width, y: yh, width: font_width },
        3: { x: 9 * font_width, y: yh, width: font_width },
        4: { x: 10 * font_width, y: yh, width: font_width },
        5: { x: 11 * font_width, y: yh, width: font_width },
        6: { x: 12 * font_width, y: yh, width: font_width },
        7: { x: 13 * font_width, y: yh, width: font_width },
        8: { x: 14 * font_width, y: yh, width: font_width },
        9: { x: 15 * font_width, y: yh, width: font_width },
        "+": { x: 16 * font_width, y: yh, width: font_width },
        "-": { x: 17 * font_width, y: yh, width: font_width },
        ".": { x: 18 * font_width, y: yh, width: font_width },
        ",": { x: 19 * font_width, y: yh, width: font_width },
    },
};

export default class Axes2DLayer extends Layer<Axes2DLayerProps> {
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

    updateState() {
        const fontTexture = this.state["fontTexture"];
        const { label_models, line_model, background_model } = this._getModels(
            fontTexture as UniformValue
        );

        this.setState({
            ...this.state,
            models: [...label_models, line_model, background_model],
        });
    }

    initializeState(): void {
        const promise = load(fontAtlasPng, ImageLoader, {
            image: { type: "data" }, // Will load as ImageData.
        });

        promise.then((data) => {
            const fontTexture = this.context.device.createTexture({
                width: data.width,
                height: data.height,
                format: "rgb8unorm-webgl",
                data: data as ImageBitmap,
                sampler: {
                    addressModeU: "clamp-to-edge",
                    addressModeV: "clamp-to-edge",
                    minFilter: "linear",
                    magFilter: "linear",
                },
            });

            const { label_models, line_model, background_model } =
                this._getModels(fontTexture as unknown as UniformValue);

            this.setState({
                fontTexture,
                models: [...label_models, line_model, background_model],
            });
        });
    }

    GetTickLinesAndLabels(
        min: number,
        max: number,
        viewSide: ViewSide,
        pixel2worldHor: number,
        pixel2worldVer: number
    ): [number[], LabelData[]] {
        const ndecimals = 0;
        const n_minor_ticks = 3;

        const lines: number[] = [];
        const tick_labels = [];

        const mv = this.props.marginV * pixel2worldVer;
        const mh = this.props.marginH * pixel2worldHor;

        const vpBounds = this.context.viewport.getBounds();
        let start;
        let y_tick = 0;
        let x_tick = 0;
        if (viewSide === ViewSide.Top) {
            start = vpBounds[3] - mv;
            y_tick = start;
        } else if (viewSide === ViewSide.Bottom) {
            start = vpBounds[1] + mv;
            y_tick = start;
        } else if (viewSide === ViewSide.Left) {
            start = vpBounds[0] + mh;
            x_tick = start;
        } else if (viewSide === ViewSide.Right) {
            start = vpBounds[2] - mh;
            x_tick = start;
        }

        const isTopOrBottomRuler =
            viewSide === ViewSide.Top || viewSide === ViewSide.Bottom;

        const m = tickLineLength; // Length in pixels
        const delta = isTopOrBottomRuler
            ? m * pixel2worldVer
            : m * pixel2worldHor;

        const L = isTopOrBottomRuler
            ? LineLengthInPixels(
                  [min, 0, 0],
                  [max, 0, 0],
                  this.context.viewport
              )
            : LineLengthInPixels(
                  [0, min, 0],
                  [0, max, 0],
                  this.context.viewport
              );

        const ticks = GetTicks(min, max, L); // Note: this may be replaced by NiceTicks npm package.

        const tick_length =
            viewSide === ViewSide.Left || viewSide === ViewSide.Bottom
                ? -delta
                : delta;

        for (let i = 0; i < ticks.length; i++) {
            const tick = ticks[i];

            let label = tick.toFixed(ndecimals);
            if (this.props.formatLabelFunc) {
                label = this.props.formatLabelFunc(tick) as string;
                label = label.replace("e", "E"); // this font atlas does not have "e"
                label = label.replace("\u2212", "-"); // use standard minus sign
            }
            tick_labels.push(label);

            // tick line start
            if (isTopOrBottomRuler) {
                lines.push(tick, y_tick, zDepthAxes); // tick line start
                lines.push(tick, y_tick + tick_length, zDepthAxes); // tick line end.
            } else {
                lines.push(x_tick, tick, zDepthAxes);
                lines.push(x_tick + tick_length, tick, zDepthAxes);
            }
        }

        // Add minor X ticks.
        if (ticks.length > 1) {
            const tick1 = ticks[0];
            const tick2 = ticks[1];
            const d = (tick2 - tick1) / (n_minor_ticks + 1);
            const tick_start = tick1;

            // up
            let i = 0;
            while (tick_start + (i + 1) * d < max) {
                const tick = tick_start + (i + 1) * d;
                tick_labels.push("");
                i++;

                if (isTopOrBottomRuler) {
                    lines.push(tick, y_tick, zDepthAxes); // tick line start
                    lines.push(tick, y_tick + 0.5 * tick_length, zDepthAxes); // tick line end.
                } else {
                    lines.push(x_tick, tick, zDepthAxes);
                    lines.push(x_tick + 0.5 * tick_length, tick, zDepthAxes);
                }
            }

            // down
            i = 0;
            while (tick_start - (i + 1) * d > min) {
                const tick = tick_start - (i + 1) * d;
                tick_labels.push("");
                i++;

                if (isTopOrBottomRuler) {
                    lines.push(tick, y_tick, zDepthAxes);
                    lines.push(tick, y_tick + 0.5 * tick_length, zDepthAxes);
                } else {
                    lines.push(x_tick, tick, zDepthAxes);
                    lines.push(x_tick + 0.5 * tick_length, tick, zDepthAxes);
                }
            }
        }

        const labels = this.makeLabelsData(lines, tick_labels);

        return [lines, labels];
    }

    GetBacgroundTriangleLinesHorizontal(
        x_min_w: number,
        x_max_w: number,
        isTop: boolean,
        pixel2world: number
    ): number[] {
        const mv = this.props.marginV * pixel2world;

        const vp_bounds = this.context.viewport.getBounds(); // [xmin, ymin, xmax, ymax]

        const y_max = isTop ? vp_bounds[3] : vp_bounds[1] + mv;
        const y_min = isTop ? vp_bounds[3] - mv : vp_bounds[1];

        const p1 = [x_min_w, y_max, zDepthAxes];
        const p2 = [x_max_w, y_max, zDepthAxes];
        const p3 = [x_max_w, y_min, zDepthAxes];
        const p4 = [x_min_w, y_min, zDepthAxes];

        /*eslint-disable */
        const background_lines: number[] = [
            ...p1, ...p2, ...p4,  // triangle 1
            ...p2, ...p4, ...p3,  // triangle 2 
        ];
        /*eslint-enable */

        return background_lines;
    }

    GetBacgroundTriangleLinesVertical(
        y_min_w: number,
        y_max_w: number,
        isLeft: boolean, // left or right ruler.
        pixel2world: number
    ): number[] {
        const mh = this.props.marginH * pixel2world;

        const vp_bounds = this.context.viewport.getBounds(); // [xmin, ymin, xmax, ymax]

        const x_max = isLeft ? vp_bounds[0] + mh : vp_bounds[2];
        const x_min = isLeft ? vp_bounds[0] : vp_bounds[2] - mh;

        const p1 = [x_max, y_min_w, zDepthAxes];
        const p2 = [x_max, y_max_w, zDepthAxes];
        const p3 = [x_min, y_max_w, zDepthAxes];
        const p4 = [x_min, y_min_w, zDepthAxes];

        /*eslint-disable */
        const background_lines: number[] = [
            ...p1, ...p2, ...p4,  // triangle 1
            ...p2, ...p4, ...p3,  // triangle 2 
        ];
        /*eslint-enable */

        return background_lines;
    }

    makeLabelsData(tick_lines: number[], tick_labels: string[]): LabelData[] {
        const labels: LabelData[] = [];

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

            const tick_vec = [
                to[0] - from[0],
                to[1] - from[1],
                to[2] - from[2],
            ];
            const s = 0.5;
            const pos: Position3D = [
                to[0] + s * tick_vec[0],
                to[1] + s * tick_vec[1],
                to[2] + s * tick_vec[2],
            ];

            let anchor = TEXT_ANCHOR.end;
            let aligment = ALIGNMENT_BASELINE.center;
            const is_xaxis = from[1] !== to[1];
            if (is_xaxis) {
                anchor = TEXT_ANCHOR.middle;
                aligment = ALIGNMENT_BASELINE.top;
            } else {
                const screen_from = this.context.viewport.project(from);
                const screen_to = this.context.viewport.project(to);

                if (screen_from[0] < screen_to[0]) {
                    anchor = TEXT_ANCHOR.start;
                }
            }

            labels.push({ label, pos, anchor, aligment });
        }

        return labels;
    }

    draw({
        context,
    }: {
        moduleParameters: unknown;
        uniforms: unknown;
        context: LayerContext;
    }): void {
        const is_orthographic =
            this.context.viewport.constructor === OrthographicViewport;
        if (
            typeof this.state["fontTexture"] === "undefined" ||
            !is_orthographic
        ) {
            return;
        }

        const { gl } = context;
        gl.enable(gl.POLYGON_OFFSET_FILL);

        const models = this.getModels();
        const n = models.length;

        if (n < 2) {
            // Should ever happen.
            return;
        }

        // background
        gl.polygonOffset(0, 0);
        models[n - 1].draw(context.renderPass);

        // lines
        gl.polygonOffset(0, -1);
        models[n - 2].draw(context.renderPass);

        // labels
        for (let i = 0; i < n - 2; i++) {
            models[i].draw(context.renderPass);
        }

        gl.disable(gl.POLYGON_OFFSET_FILL);
        return;
    }

    _getModels(fontTexture: UniformValue): {
        label_models: Model[];
        line_model: Model;
        background_model: Model;
    } {
        // Make models for background, lines (tick marcs and axis) and labels.

        const gl = this.context.device;

        // Margins.
        const m = 100; // Length in pixels
        let world_from = this.context.viewport.unproject([0, 0, 0]);
        let world_to = this.context.viewport.unproject([m, 0, 0]);
        let v = [
            world_from[0] - world_to[0],
            world_from[1] - world_to[1],
            world_from[2] - world_to[2],
        ];
        const pixel2worldHor = Math.sqrt(v[0] * v[0] + v[1] * v[1]) / m;

        world_from = this.context.viewport.unproject([0, 0, 0]);
        world_to = this.context.viewport.unproject([0, m, 0]);
        v = [
            world_from[0] - world_to[0],
            world_from[1] - world_to[1],
            world_from[2] - world_to[2],
        ];
        const pixel2worldVer = Math.sqrt(v[0] * v[0] + v[1] * v[1]) / m;

        const mh = this.props.marginH * pixel2worldHor;
        const mv = this.props.marginV * pixel2worldVer;

        const viewport_bounds_w = this.context.viewport.getBounds(); //bounds in world coordinates.
        const xBoundsMin = viewport_bounds_w[0];
        const xBoundsMax = viewport_bounds_w[2];
        const yBoundsMin = viewport_bounds_w[1];
        const yBoundsMax = viewport_bounds_w[3];

        let tick_and_axes_lines: number[] = [];
        let background_lines: number[] = [];
        let labelData: LabelData[] = [];

        const isB = this.props.isBottomRuler;
        const isT = this.props.isTopRuler;
        const isL = this.props.isLeftRuler;
        const isR = this.props.isRightRuler;

        const xmin = xBoundsMin + (isL ? mh : 0);
        const xmax = xBoundsMax - (isR ? mh : 0);
        const ymin = isB ? yBoundsMin + mv : yBoundsMin;
        const ymax = isT ? yBoundsMax - mv : yBoundsMax;

        //- BOTTOM RULER ----------------------------------------
        if (isB) {
            const axes = [
                xmin,
                yBoundsMin + mv,
                zDepthAxes,
                xmax,
                yBoundsMin + mv,
                zDepthAxes,
            ];

            const [ticks, labels] = this.GetTickLinesAndLabels(
                xmin,
                xmax,
                ViewSide.Bottom,
                pixel2worldHor,
                pixel2worldVer
            );
            const back_lines: number[] =
                this.GetBacgroundTriangleLinesHorizontal(
                    xBoundsMin,
                    xBoundsMax,
                    false,
                    pixel2worldVer
                );

            tick_and_axes_lines = [...tick_and_axes_lines, ...axes, ...ticks];
            background_lines = [...background_lines, ...back_lines];
            labelData = [...labelData, ...labels];
        }

        //- TOP RULER ----------------------------------------
        if (isT) {
            const axes = [
                xmin,
                yBoundsMax - mv,
                zDepthAxes,
                xmax,
                yBoundsMax - mv,
                zDepthAxes,
            ];
            const [ticks, labels] = this.GetTickLinesAndLabels(
                xmin,
                xmax,
                ViewSide.Top,
                pixel2worldHor,
                pixel2worldVer
            );

            const back_lines = this.GetBacgroundTriangleLinesHorizontal(
                xBoundsMin,
                xBoundsMax,
                true, // isTop
                pixel2worldVer
            );

            tick_and_axes_lines = [...tick_and_axes_lines, ...axes, ...ticks];
            background_lines = [...background_lines, ...back_lines];
            labelData = [...labelData, ...labels];
        }

        //- LEFT RULER ----------------------------------------
        if (isL) {
            const axes = [
                xBoundsMin + mh,
                ymin,
                zDepthAxes,
                xBoundsMin + mh,
                ymax,
                zDepthAxes,
            ];
            const [ticks, labels] = this.GetTickLinesAndLabels(
                ymin,
                yBoundsMax - mv,
                ViewSide.Left,
                pixel2worldHor,
                pixel2worldVer
            );
            const back_lines = this.GetBacgroundTriangleLinesVertical(
                ymin,
                ymax,
                true,
                pixel2worldHor
            );

            tick_and_axes_lines = [...tick_and_axes_lines, ...axes, ...ticks];
            background_lines = [...background_lines, ...back_lines];
            labelData = [...labelData, ...labels];
        }

        //- RIGHT RULER ----------------------------------------
        if (isR) {
            const axes = [
                xBoundsMax - mh,
                ymin,
                zDepthAxes,
                xBoundsMax - mh,
                ymax,
                zDepthAxes,
            ];
            const [ticks, labels] = this.GetTickLinesAndLabels(
                ymin,
                ymax,
                ViewSide.Right,
                pixel2worldHor,
                pixel2worldVer
            );

            const back_lines = this.GetBacgroundTriangleLinesVertical(
                ymin,
                ymax,
                false,
                pixel2worldHor
            );

            tick_and_axes_lines = [...tick_and_axes_lines, ...axes, ...ticks];
            background_lines = [...background_lines, ...back_lines];
            labelData = [...labelData, ...labels];
        }

        // Line models. (axis line and tick lines)
        // Color on axes and text.
        let lineColor = [0.0, 0.0, 0.0, 1.0];
        if (typeof this.props.axisColor !== "undefined") {
            lineColor = this.props.axisColor as number[];
            if (lineColor.length === 3) {
                lineColor.push(255);
            }
            lineColor = lineColor.map((x) => (x ?? 0) / 255);
        }

        const line_model = new Model(gl, {
            id: `${this.props.id}-lines`,
            vs: lineVertexShader,
            fs: lineFragmentShader,
            uniforms: { uColor: lineColor },
            geometry: new Geometry({
                topology: "line-list",
                attributes: {
                    positions: new Float32Array(tick_and_axes_lines),
                },
                vertexCount: tick_and_axes_lines.length / 3,
            }),

            modules: [project],
            isInstanced: false,
        });

        //-- Background model --
        // Color on axes background.
        let bColor = [0.5, 0.5, 0.5, 1];
        if (typeof this.props.backgroundColor !== "undefined") {
            bColor = this.props.backgroundColor as number[];
            if (bColor.length === 3) {
                bColor.push(255);
            }
            bColor = bColor.map((x) => (x ?? 0) / 255);
        }

        const background_model = new Model(gl, {
            id: `${this.props.id}-background`,
            vs: lineVertexShader,
            fs: lineFragmentShader,
            uniforms: { uColor: bColor },
            geometry: new Geometry({
                topology: "triangle-list",
                attributes: {
                    positions: new Float32Array(background_lines),
                },
                vertexCount: background_lines.length / 3,
            }),

            modules: [project],
            isInstanced: false,
        });

        //-- Labels model--
        const label_models: Model[] = [];

        const pixelScale = GetPixelsScale(
            this.props.labelFontSizePt ?? defaultProps.labelFontSizePt
        );

        for (const item of labelData) {
            const x = item.pos[0];
            const y = item.pos[1];
            const z = item.pos[2];
            const label = item.label;
            const anchor = item.anchor ?? TEXT_ANCHOR.start;
            const aligment_baseline =
                item.aligment ?? ALIGNMENT_BASELINE.center;

            if (label === "") {
                continue;
            }

            const pos_w = vec4.fromValues(x, y, z, 1); // pos world

            const len = label.length;
            const numVertices = len * 6;
            const positions = new Float32Array(numVertices * 3);
            const texcoords = new Float32Array(numVertices * 2);
            const maxX = fontInfo.textureWidth;
            const maxY = fontInfo.textureHeight;
            let offset = 0;
            let offsetTexture = 0;

            let x1 = 0;
            if (anchor === TEXT_ANCHOR.end) {
                x1 = -len;
            } else if (anchor === TEXT_ANCHOR.middle) {
                x1 = -len / 2;
            }

            let y_aligment_offset = 0;
            if (aligment_baseline === ALIGNMENT_BASELINE.center) {
                y_aligment_offset = 0.5 * pixelScale;
            } else if (aligment_baseline === ALIGNMENT_BASELINE.top) {
                y_aligment_offset = 1 * pixelScale;
            }

            for (let ii = 0; ii < len; ++ii) {
                const letter = label[ii];
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const glyphInfo = fontInfo.glyphInfos[letter];
                if (glyphInfo) {
                    // Unit square.
                    const x2 = x1 + 1;
                    const u1 = glyphInfo.x / maxX;
                    const v1 = (glyphInfo.y + fontInfo.letterHeight - 1) / maxY;
                    const u2 = (glyphInfo.x + glyphInfo.width - 1) / maxX;
                    const v2 = glyphInfo.y / maxY;

                    const h = 1;

                    // 6 vertices per letter
                    // t1
                    /*eslint-disable */
                    positions[offset + 0] = pos_w[0] + x1 * pixelScale * pixel2worldHor; // Add a distance in view coords and convert to world
                    positions[offset + 1] = pos_w[1] + (0 * pixelScale - y_aligment_offset) * pixel2worldVer;
                    positions[offset + 2] = pos_w[2];
                    texcoords[offsetTexture + 0] = u1;
                    texcoords[offsetTexture + 1] = v1;

                    positions[offset + 3] = pos_w[0] + x2 * pixelScale * pixel2worldHor;
                    positions[offset + 4] = pos_w[1] + (0 * pixelScale - y_aligment_offset) * pixel2worldVer;
                    positions[offset + 5] = pos_w[2];
                    texcoords[offsetTexture + 2] = u2;
                    texcoords[offsetTexture + 3] = v1;

                    positions[offset + 6] = pos_w[0] + x1 * pixelScale * pixel2worldHor;
                    positions[offset + 7] = pos_w[1] + (h * pixelScale - y_aligment_offset) * pixel2worldVer;
                    positions[offset + 8] = pos_w[2];
                    texcoords[offsetTexture + 4] = u1;
                    texcoords[offsetTexture + 5] = v2;

                    // t2
                    positions[offset + 9] = pos_w[0] + x1 * pixelScale * pixel2worldHor;
                    positions[offset + 10] = pos_w[1] + (h * pixelScale - y_aligment_offset) * pixel2worldVer;
                    positions[offset + 11] = pos_w[2];
                    texcoords[offsetTexture + 6] = u1;
                    texcoords[offsetTexture + 7] = v2;

                    positions[offset + 12] = pos_w[0] + x2 * pixelScale * pixel2worldHor;
                    positions[offset + 13] = pos_w[1] + (0 * pixelScale - y_aligment_offset) * pixel2worldVer;
                    positions[offset + 14] = pos_w[2];
                    texcoords[offsetTexture + 8] = u2;
                    texcoords[offsetTexture + 9] = v1;

                    positions[offset + 15] = pos_w[0] + x2 * pixelScale * pixel2worldHor;
                    positions[offset + 16] = pos_w[1] + (h * pixelScale - y_aligment_offset) * pixel2worldVer;
                    positions[offset + 17] = pos_w[2];
                    texcoords[offsetTexture + 10] = u2;
                    texcoords[offsetTexture + 11] = v2;
                    /*eslint-ensable */

                    x1 += 1;
                    offset += 18;
                    offsetTexture += 12;
                } else {
                    // we don't have this character so just advance
                    x1 += 1;
                }
            }

            const model = new Model(gl, {
                id: `${this.props.id}-${label}`,
                vs: labelVertexShader,
                fs: labelFragmentShader,
                uniforms: {
                    uAxisColor: lineColor,
                    uBackGroundColor: bColor,
                },
                bindings: {
                    // @ts-ignore 
                    fontTexture,
                },
                geometry: new Geometry({
                    topology: "triangle-list",
                    attributes: {
                        positions,
                        vTexCoord: {
                            value: texcoords,
                            size: 2,
                        },
                    },
                    vertexCount: positions.length / 3,
                }),
                bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
                modules: [project],
                isInstanced: false,
            });

            label_models.push(model);
        }

        return { label_models, line_model, background_model };
    }
}

Axes2DLayer.layerName = "Axes2DLayer";
Axes2DLayer.defaultProps = defaultProps;

//-- Local help functions. -------------------------------------------------

// KEEP for now.
// USAGE:
// const pos_w = vec4.fromValues(x, y, z, 1); // pos world
// const pos_v = multMatVec(viewMatrix, pos_w); // pos view
// function multMatVec(
//     viewMatrix: number[],
//     pos_w: vec4
// ): [number, number, number] {
//     const pos_v = vec4.transformMat4(
//         vec4.create(),
//         pos_w,
//         mat4.fromValues(
//             ...(viewMatrix.slice(0, mat4.fromValues.length) as Parameters<
//                 typeof mat4.fromValues
//             >)
//         )
//     );

//     return pos_v.slice(0, 3) as [number, number, number];
// }

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

function GetPixelsScale(labelFontSizePt: number): number {
    // Estimated number of pixels from baseline to top of font.
    // Linear interpolation based on this table: https://reeddesign.co.uk/test/points-pixels.html
    const px = Math.max(0, (8 / 9) * labelFontSizePt);
    return px;
}
