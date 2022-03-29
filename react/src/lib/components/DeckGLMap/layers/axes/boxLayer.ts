import { Layer } from "@deck.gl/core";
import GL from "@luma.gl/constants";
import { Model, Geometry } from "@luma.gl/core";
import { LayerProps } from "@deck.gl/core/lib/layer";
import fragmentShader from "./axes-fragment.glsl";
import gridVertex from "./grid-vertex.glsl";
import { project } from "deck.gl";
import { COORDINATE_SYSTEM } from "deck.gl";
import { DeckGLLayerContext } from "../../components/Map";
import { UpdateStateInfo } from "@deck.gl/core/lib/layer";

export interface BoxLayerProps<D> extends LayerProps<D> {
    lines: [number]; // from pt , to pt.
}

const defaultProps = {
    name: "Box",
    id: "box-layer",
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    lines: [],
};

export default class BoxLayer extends Layer<unknown, BoxLayerProps<unknown>> {
    initializeState(context: DeckGLLayerContext): void {
        const { gl } = context;
        this.setState(this._getModels(gl));
    }

    shouldUpdateState(): boolean | string | null {
        return true;
    }

    updateState({ context }: UpdateStateInfo<BoxLayerProps<unknown>>): void {
        const { gl } = context;
        this.setState(this._getModels(gl));
    }

    //eslint-disable-next-line
    _getModels(gl: any) {
        const grids = new Model(gl, {
            id: `${this.props.id}-grids`,
            vs: gridVertex,
            fs: fragmentShader,
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
