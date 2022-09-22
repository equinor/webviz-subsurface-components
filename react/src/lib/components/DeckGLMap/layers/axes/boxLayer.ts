import {
    COORDINATE_SYSTEM,
    Color,
    Layer,
    LayerProps,
    project,
    UpdateParameters,
} from "@deck.gl/core/typed";
import GL from "@luma.gl/constants";
import { Model, Geometry } from "@luma.gl/engine";
import fragmentShader from "./axes-fragment.glsl";
import gridVertex from "./grid-vertex.glsl";
import { DeckGLLayerContext } from "../../components/Map";
export interface BoxLayerProps<D> extends LayerProps<D> {
    lines: [number]; // from pt , to pt.
    color: Color;
}

const defaultProps = {
    name: "Box",
    id: "box-layer",
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    lines: [],
    color: [0, 0, 0, 1],
};

export default class BoxLayer extends Layer<BoxLayerProps<unknown>> {
    initializeState(context: DeckGLLayerContext): void {
        const { gl } = context;
        this.setState(this._getModels(gl));
    }

    updateState({ context }: UpdateParameters<this>): void {
        const { gl } = context;
        this.setState(this._getModels(gl));
    }

    //eslint-disable-next-line
    _getModels(gl: any) {
        const color = this.props.color.map((x) => (x ?? 0) / 255);
        const grids = new Model(gl, {
            id: `${this.props.id}-grids`,
            vs: gridVertex,
            fs: fragmentShader,
            uniforms: { uColor: color },
            geometry: new Geometry({
                drawMode: GL.LINES,
                attributes: {
                    positions: new Float32Array(this.props.lines),
                },
                vertexCount: this.props.lines.length / 3,
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

BoxLayer.layerName = "BoxLayer";
BoxLayer.defaultProps = defaultProps;
