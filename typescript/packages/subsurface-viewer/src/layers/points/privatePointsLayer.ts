import type { ScatterplotLayerProps } from "@deck.gl/layers";
import { ScatterplotLayer } from "@deck.gl/layers";

import { GL } from "@luma.gl/constants";
import type { NumericArray } from "@math.gl/types";

import type { LayerContext } from "@deck.gl/core";
import { picking, project32 } from "@deck.gl/core";

import fs from "./fragment.glsl";
import vs from "./vertex.glsl";

type UniformValue = number | boolean | Readonly<NumericArray>;

export interface ExtendedScatterplotLayerProps {
    depthTest: boolean;
    ZIncreasingDownwards: boolean;
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

PrivatePointsLayer.layerName = "PrivatePointsLayer";
