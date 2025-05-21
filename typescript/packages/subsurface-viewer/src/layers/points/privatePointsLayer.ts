import type { LayerProps } from "@deck.gl/core";
import type { ScatterplotLayerProps } from "@deck.gl/layers";
import { ScatterplotLayer } from "@deck.gl/layers";

import { GL } from "@luma.gl/constants";

import type { ShaderModule } from "@luma.gl/shadertools";

import vs from "./point.vs.glsl";

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
        const superShaders = super.getShaders();
        // use object.assign to make sure we don't overwrite existing fields like `vs`, `modules`...
        return Object.assign({}, superShaders, {
            vs: vs,
            modules: [...superShaders.modules, pointsUniforms],
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    draw(args: any): void {
        let restoreDepthTest = false;
        if (
            typeof this.props.depthTest === "boolean" &&
            !this.props.depthTest
        ) {
            restoreDepthTest = true;
            this.context.gl.disable(GL.DEPTH_TEST);
        }
        // inject the local uniforms into the shader
        this.state.model?.shaderInputs.setProps({
            points: {
                opacity: this.props.opacity,
                ZIncreasingDownwards: this.props.ZIncreasingDownwards,
            },
        });
        super.draw(args.uniforms);
        if (restoreDepthTest) {
            this.context.gl.enable(GL.DEPTH_TEST);
        }
    }
}

PrivatePointsLayer.layerName = "PrivatePointsLayer";

const pointsUniformsBlock = /*glsl*/ `\
uniform pointsUniforms {
   float opacity;
   bool ZIncreasingDownwards;
} points;
`;

type PointsUniformsType = {
    opacity: number;
    ZIncreasingDownwards: boolean;
};

// NOTE: this must exactly the same name than in the uniform block
const pointsUniforms = {
    name: "points",
    vs: pointsUniformsBlock,
    fs: undefined,
    uniformTypes: {
        opacity: "f32",
        ZIncreasingDownwards: "u32",
    },
} as const satisfies ShaderModule<LayerProps, PointsUniformsType>;
