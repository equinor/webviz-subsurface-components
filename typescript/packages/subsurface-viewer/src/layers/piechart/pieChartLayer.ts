import type { PickingInfo, Color, UpdateParameters } from "@deck.gl/core/typed";
import { Layer, picking, project } from "@deck.gl/core/typed";

import GL from "@luma.gl/constants";
import { Model, Geometry } from "@luma.gl/engine";

import { Vector2 } from "@math.gl/core";

import type { LayerPickInfo, PropertyDataType } from "../utils/layerTools";
import { createPropertyData } from "../utils/layerTools";
import type { ExtendedLayerProps } from "../utils/layerTools";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

type PieProperties = [{ color: Color; label: string }];

type PieData = {
    x: number;
    y: number;
    R: number;
    fractions: [{ value: number; idx: number }];
};

// These are the data PieChartLayer expects.
interface PiesData {
    pies: PieData[];
    properties: PieProperties;
}

export interface PieChartLayerProps<D> extends ExtendedLayerProps {
    selectedPie: D;

    // Enable/disable depth testing when rendering layer. Default true.
    depthTest: boolean;
}

const defaultProps = {
    "@@type": "PieChartLayer",
    name: "Pie chart",
    id: "pie-layer",
    pickable: true,
    visible: true,
    selectedPie: "@@editedData.selectedPie", // used to get data from deckgl layer
    depthTest: true,
};

export default class PieChartLayer extends Layer<PieChartLayerProps<PiesData>> {
    initializeState(): void {
        return;
    }

    shouldUpdateState(): boolean {
        return true;
    }

    updateState({ context }: UpdateParameters<this>): void {
        if (!this.state?.["model"]) {
            const pieData = this.props.data as unknown as PiesData;
            if (pieData?.pies) {
                const { gl } = context;
                this.setState(this.getModel(gl, pieData));
            }
        }
    }

    //eslint-disable-next-line
    getModel(gl: any, pieData: PiesData) {
        const vertexs: number[] = [];
        const colors: number[] = [];
        const mx: number[] = [];
        const my: number[] = [];
        const doScale: number[] = [];
        const pieInfo: string[][] = [];
        const pieInfoIndex: number[] = [];

        const dA = 5; // delta angle

        let infoIndex = 0;
        for (const pie of pieData.pies) {
            const x = pie.x;
            const y = pie.y;
            const R = pie.R;

            // Normalize
            let sum = 0;
            for (const frac of pie.fractions) {
                sum += frac.value;
            }

            if (sum === 0) {
                continue;
            }

            let start_a = -90.0;
            for (let i = 0; i < pie.fractions.length; i++) {
                const frac = pie.fractions[i].value / sum;
                const end_a = start_a + frac * 360.0;

                const prop = pieData.properties[pie.fractions[i].idx];
                let col: number[] = (prop?.color as number[]) ?? [
                    255, 0, 255, 255,
                ]; // magenta
                col = col.map(
                    (x) => (x ?? 0) / 255 // Normalize to [0,1] range.
                );

                const name = prop?.label ?? "no label";
                const frac_string = (frac * 100).toFixed(1) + "%";
                pieInfo.push([name, frac_string]);

                // Make triangles for one pie pice.
                for (let a = start_a; a < end_a; a += dA) {
                    const a1 = a;
                    const rad1 = (a1 * (2.0 * Math.PI)) / 360.0;
                    const xx1 = R * Math.cos(rad1) + x;
                    const yy1 = R * Math.sin(rad1) + y;

                    const a2 = Math.min(a1 + dA, end_a);
                    const rad2 = (a2 * (2.0 * Math.PI)) / 360.0;
                    const xx2 = R * Math.cos(rad2) + x;
                    const yy2 = R * Math.sin(rad2) + y;

                    vertexs.push(x, y, 0);
                    mx.push(x);
                    my.push(y);
                    colors.push(...col);
                    pieInfoIndex.push(infoIndex);
                    doScale.push(0);

                    vertexs.push(xx1, yy1, 0);
                    mx.push(x);
                    my.push(y);
                    colors.push(...col);
                    pieInfoIndex.push(infoIndex);
                    doScale.push(1);

                    vertexs.push(xx2, yy2, 0);
                    mx.push(x);
                    my.push(y);
                    colors.push(...col);
                    pieInfoIndex.push(infoIndex);
                    doScale.push(1);
                }

                infoIndex++;

                start_a = end_a;
            }
        }

        const model = new Model(gl, {
            id: `${this.props.id}-pie`,
            vs: vertexShader,
            fs: fragmentShader,
            geometry: new Geometry({
                drawMode: GL.TRIANGLES,
                attributes: {
                    positions: { value: new Float32Array(vertexs), size: 3 },
                    colors: { value: new Float32Array(colors), size: 3 },
                    pie_index: { value: new Int32Array(pieInfoIndex), size: 1 },
                    mx: { value: new Float32Array(mx), size: 1 },
                    my: { value: new Float32Array(my), size: 1 },
                    do_scale: { value: new Float32Array(doScale), size: 1 },
                },
                vertexCount: vertexs.length / 3,
            }),

            modules: [project, picking],
            isInstanced: false, // This only works when set to false.
        });

        return { model, pieInfo };
    }

    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    draw(args: any): void {
        if (!this.state?.["model"]) {
            return;
        }

        const { context } = args;
        const { gl } = context;

        const npixels = 100;
        const p1 = [0, 0];
        const p2 = [npixels, 0];

        const p1_unproj = this.context.viewport.unproject(p1);
        const p2_unproj = this.context.viewport.unproject(p2);

        const v1 = new Vector2(p1_unproj[0], p1_unproj[1]);
        const v2 = new Vector2(p2_unproj[0], p2_unproj[1]);
        const d = v1.distance(v2);

        // Factor to convert a length in pixels to a length in world space.
        const pixels2world = d / npixels;
        const scale = pixels2world;

        const model = this.state["model"];

        if (!this.props.depthTest) {
            gl.disable(GL.DEPTH_TEST);
        }

        model.setUniforms({ scale }).draw();

        if (!this.props.depthTest) {
            gl.enable(GL.DEPTH_TEST);
        }
    }

    decodePickingColor(): number {
        return this.nullPickingColor() as unknown as number;
    }

    getPickingInfo({ info }: { info: PickingInfo }): LayerPickInfo {
        if (!info.color) {
            return info;
        }
        // Note these colors are in the  0-255 range.
        const r = info.color[0];
        const g = info.color[1];
        const b = info.color[2];

        const pieIndex = 256 * 256 * r + 256 * g + b;

        const [pie_label, pie_frac] = this.state["pieInfo"][pieIndex];
        const layer_properties: PropertyDataType[] = [];
        layer_properties.push(createPropertyData(pie_label, pie_frac));

        return {
            ...info,
            properties: layer_properties,
        };
    }
}

PieChartLayer.layerName = "PieChartLayer";
PieChartLayer.defaultProps = defaultProps;
