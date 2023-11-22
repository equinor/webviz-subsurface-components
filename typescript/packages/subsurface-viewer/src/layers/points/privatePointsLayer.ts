import type { ScatterplotLayerProps } from "@deck.gl/layers/typed";
import { ScatterplotLayer } from "@deck.gl/layers/typed";

import { project32, picking } from "@deck.gl/core/typed";

import vs from "./vertex.glsl";
import fs from "./fragment.glsl";

export class PrivatePointsLayer extends ScatterplotLayer {
    constructor(props: ScatterplotLayerProps) {
        super(props);
    }

    getShaders() {
        return { vs, fs, modules: [project32, picking] };
    }
}

PrivatePointsLayer.layerName = "PrivatePointsLayer";
