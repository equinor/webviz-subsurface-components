import type { ScatterplotLayerProps } from "@deck.gl/layers/typed";
import { ScatterplotLayer } from "@deck.gl/layers/typed";
import GL from "@luma.gl/constants";

import type { LayerContext } from "@deck.gl/core/typed";
import { project32, picking } from "@deck.gl/core/typed";

import vs from "./vertex.glsl";
import fs from "./fragment.glsl";

export interface ExtendedScatterplotLayerProps {
    depthTest: boolean;
}

export class PrivatePointsLayer extends ScatterplotLayer<
    unknown,
    ExtendedScatterplotLayerProps
> {
    constructor(props: ScatterplotLayerProps) {
        super(props);
    }

    getShaders() {
        return { vs, fs, modules: [project32, picking] };
    }

    draw(args: {
        moduleParameters?: unknown;
        uniforms: number[];
        context: LayerContext;
    }): void {
        let restoreDepthTest = false;

        if (
            typeof this.props.depthTest === "boolean" &&
            !this.props.depthTest
        ) {
            restoreDepthTest = true;
            this.context.gl.disable(GL.DEPTH_TEST);
        }
        super.draw(args);
        if (restoreDepthTest) {
            this.context.gl.enable(GL.DEPTH_TEST);
        }
    }
}

PrivatePointsLayer.layerName = "PrivatePointsLayer";
