import type { PathLayerProps } from "@deck.gl/layers";
import { PathLayer } from "@deck.gl/layers";

import type { NumericArray } from "@math.gl/types";

import type { LayerContext } from "@deck.gl/core";
import { picking, project32 } from "@deck.gl/core";

import fs from "./path-layer-fragment.glsl";
import vs from "./path-layer-vertex.glsl";

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

        const { gl } = this.context;

        let restoreDepthTest = false;
        if (
            typeof this.props.depthTest === "boolean" &&
            !this.props.depthTest
        ) {
            restoreDepthTest = true;
            gl.disable(gl.DEPTH_TEST);
        }
        super.draw({ uniforms: args.uniforms });
        if (restoreDepthTest) {
            gl.enable(gl.DEPTH_TEST);
        }
    }
}

PrivatePolylinesLayer.layerName = "PrivatePolylinesLayer";
