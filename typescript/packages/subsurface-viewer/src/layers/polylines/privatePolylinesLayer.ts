import { PathLayer } from "@deck.gl/layers/typed";
import type { PathLayerProps } from "@deck.gl/layers/typed";

import type { NumericArray } from "@math.gl/types";
import GL from "@luma.gl/constants";

import type { LayerContext } from "@deck.gl/core/typed";
import { project32, picking } from "@deck.gl/core/typed";

import vs from "./path-layer-vertex.glsl";
import fs from "./path-layer-fragment.glsl";

type UniformValue = number | boolean | Readonly<NumericArray>;

export interface ExtendedPathLayerProps {
    depthTest?: boolean;
    ZIncreasingDownwards: boolean;
}

export class PrivatePolylinesLayer extends PathLayer<
    unknown,
    ExtendedPathLayerProps
> {
    constructor(props: PathLayerProps) {
        super(props);
    }

    getShaders() {
        return { vs, fs, modules: [project32, picking] };
    }

    draw(args: {
        moduleParameters?: unknown;
        uniforms: Record<string, UniformValue>;
        context: LayerContext;
    }): void {
        args.uniforms["ZIncreasingDownwards"] = this.props.ZIncreasingDownwards;

        let restoreDepthTest = false;
        if (
            typeof this.props.depthTest === "boolean" &&
            !this.props.depthTest
        ) {
            restoreDepthTest = true;
            this.context.gl.disable(GL.DEPTH_TEST);
        }
        super.draw({ uniforms: args.uniforms });
        if (restoreDepthTest) {
            this.context.gl.enable(GL.DEPTH_TEST);
        }
    }
}

PrivatePolylinesLayer.layerName = "PrivatePolylinesLayer";
