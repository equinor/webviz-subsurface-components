import type { Color, UpdateParameters } from "@deck.gl/core";
import { COORDINATE_SYSTEM, Layer, project32 } from "@deck.gl/core";

import type { Device } from "@luma.gl/core";
import { Geometry, Model } from "@luma.gl/engine";

import type { DeckGLLayerContext } from "../../components/Map";
import type { ExtendedLayerProps } from "../utils/layerTools";
import fragmentShader from "./axes-fragment.glsl";
import gridVertex from "./grid-vertex.glsl";

export interface BoxLayerProps extends ExtendedLayerProps {
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

export default class BoxLayer extends Layer<BoxLayerProps> {
    initializeState(context: DeckGLLayerContext): void {
        this.setState(this._getModels(context.device));
    }

    shouldUpdateState(): boolean {
        return true;
    }

    updateState({ context }: UpdateParameters<this>): void {
        this.setState(this._getModels(context.device));
    }

    _getModels(device: Device) {
        const color = this.props.color.map((x) => (x ?? 0) / 255);
        const grids = new Model(device, {
            id: `${this.props.id}-grids`,
            vs: gridVertex,
            fs: fragmentShader,
            uniforms: { uColor: Array.from(color) },
            geometry: new Geometry({
                topology: "line-list",
                attributes: {
                    positions: new Float32Array(this.props.lines),
                },
                vertexCount: this.props.lines.length / 3,
            }),
            modules: [project32],
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
