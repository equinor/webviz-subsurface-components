import type {
    Color,
    LayerContext,
    UpdateParameters,
    Viewport,
} from "@deck.gl/core";
import { Layer, OrthographicViewport, project } from "@deck.gl/core";
//import GL from "@luma.gl/constants";
import { Geometry, Model } from "@luma.gl/engine";
import { Vector3 } from "@math.gl/core";
import type { ExtendedLayerProps } from "../utils/layerTools";
import fragmentShader from "./northarrow-fragment.glsl";
import vertexShader from "./northarrow-vertex.glsl";

export interface NorthArrow3DLayerProps extends ExtendedLayerProps {
    color: Color;
}

const defaultProps = {
    "@@type": "NorthArrow3DLayer",
    name: "NorthArrow3D",
    id: "north-arrow-layer",
    visible: true,
    color: [0, 0, 0, 1],
};

export default class NorthArrow3DLayer extends Layer<NorthArrow3DLayerProps> {
    initializeState(context: LayerContext): void {
        const { gl } = context;
        this.setState(this._getModels(gl));
    }

    shouldUpdateState(): boolean {
        return true;
    }

    updateState({ context }: UpdateParameters<this>): void {
        if (context.gl) {
            this.setState(this._getModels(context.gl));
        }
    }

    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    draw({ moduleParameters, uniforms, context }: any): void {
        const { gl } = context;
        gl.disable(gl.DEPTH_TEST);
        super.draw({ moduleParameters, uniforms, context });
        gl.enable(gl.DEPTH_TEST);
    }

    //eslint-disable-next-line
    _getModels(gl: any) {
        const model_lines = GetArrowLines();

        const is_orthographic =
            this.context.viewport.constructor === OrthographicViewport;

        const view_at = new Vector3(this.unproject([100, 100, 0]));
        let view_from = new Vector3(this.context.viewport.cameraPosition);

        if (is_orthographic) {
            const cam_pos_z = new Vector3(
                (this.context.viewport as Viewport).cameraPosition
            )[2];
            view_from = new Vector3([view_at[0], view_at[1], cam_pos_z]);
        }

        const dir = new Vector3([
            view_at[0] - view_from[0],
            view_at[1] - view_from[1],
            view_at[2] - view_from[2],
        ]);
        dir.normalize();
        dir.scale(9999);

        // pos: World coordinate for north arrow. Will be fixed relative to camera.
        const pos = new Vector3([
            view_from[0] + dir[0],
            view_from[1] + dir[1],
            view_from[2] + dir[2],
        ]);

        const lines: number[] = [];

        const zoom = this.context.viewport.zoom;
        const zoom_scale = Math.pow(2, zoom);
        const scale = is_orthographic ? 15 / zoom_scale : 99;

        for (let i = 0; i < model_lines.length / 3; i = i + 1) {
            const x = model_lines[i * 3 + 0] * scale + pos[0];
            const y = model_lines[i * 3 + 1] * scale + pos[1];
            const z = model_lines[i * 3 + 2] * scale + pos[2];
            lines.push(x, y, z);
        }

        const color = this.props.color.map((x?: number) => (x ?? 0) / 255);
        color[3] = 1;

        const grids = new Model(gl, {
            id: `${this.props.id}-grids`,
            vs: vertexShader,
            fs: fragmentShader,
            uniforms: { uColor: color },
            geometry: new Geometry({
                topology: "line-list",
                attributes: {
                    positions: new Float32Array(lines),
                },
                vertexCount: lines.length / 3,
            }),

            modules: [project],
            isInstanced: false, // This only works when set to false.
        });

        return {
            model: grids,
            models: [grids].filter(Boolean),
            modelsByName: { grids },
        };
    }
}

NorthArrow3DLayer.layerName = "NorthArrow3DLayer";
NorthArrow3DLayer.defaultProps = defaultProps;

//-- Local functions. --------------------------------------

function GetArrowLines(): number[] {
    const lines: number[][] = [];

    let z = 0.5;
    lines.push([-1, -2, z]);
    lines.push([-1, 2, z]);

    lines.push([-1, 2, z]);
    lines.push([-1.5, 2, z]);

    lines.push([-1.5, 2, z]);
    lines.push([0, 4, z]);

    lines.push([0, 4, z]);
    lines.push([1.5, 2, z]);

    lines.push([1.5, 2, z]);
    lines.push([1, 2, z]);

    lines.push([1, 2, z]);
    lines.push([1, -2, z]);

    lines.push([1, -2, z]);
    lines.push([-1, -2, z]);

    z = -0.5;
    lines.push([-1, -2, z]);
    lines.push([-1, 2, z]);

    lines.push([-1, 2, z]);
    lines.push([-1.5, 2, z]);

    lines.push([-1.5, 2, z]);
    lines.push([0, 4, z]);

    lines.push([0, 4, z]);
    lines.push([1.5, 2, z]);

    lines.push([1.5, 2, z]);
    lines.push([1, 2, z]);

    lines.push([1, 2, z]);
    lines.push([1, -2, z]);

    lines.push([1, -2, z]);
    lines.push([-1, -2, z]);

    // stolper
    lines.push([-1, -2, -0.5]);
    lines.push([-1, -2, 0.5]);

    lines.push([-1, 2, -0.5]);
    lines.push([-1, 2, 0.5]);

    lines.push([-1.5, 2, -0.5]);
    lines.push([-1.5, 2, 0.5]);

    lines.push([0, 4, -0.5]);
    lines.push([0, 4, 0.5]);

    lines.push([1.5, 2, -0.5]);
    lines.push([1.5, 2, 0.5]);

    lines.push([1, 2, -0.5]);
    lines.push([1, 2, 0.5]);

    lines.push([1, -2, -0.5]);
    lines.push([1, -2, 0.5]);

    return lines.flat();
}
