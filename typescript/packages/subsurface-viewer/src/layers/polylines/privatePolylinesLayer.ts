import type { PathLayerProps } from "@deck.gl/layers";
import { PathLayer } from "@deck.gl/layers";

import type { LayerProps } from "@deck.gl/core";
import type { ShaderModule } from "@luma.gl/shadertools";

import fs from "./path-layer-fragment.glsl";
import vs from "./path-layer-vertex.glsl";

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
        const superShaders = super.getShaders();
        // use object.assign to make sure we don't overwrite existing fields like `vs`, `modules`...
        return Object.assign({}, superShaders, {
            vs: vs,
            fs: fs,
            modules: [...superShaders.modules, polylinesUniforms],
        });
    }

    // DrawOptions is not exported by deck.gl :/
    // DrawOptions = {
    //     renderPass: RenderPass;
    //     shaderModuleProps: any;
    //     uniforms: any;
    //     parameters: any;
    //     context: LayerContext;
    //   }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    draw(args: any): void {
        //conf g = context.device.getDefaultCanvasContext();
        const { gl } = this.context;

        let restoreDepthTest = false;
        if (
            typeof this.props.depthTest === "boolean" &&
            !this.props.depthTest
        ) {
            restoreDepthTest = true;
            gl.disable(gl.DEPTH_TEST);
        }
        // inject the local uniforms into the shader
        this.state.model?.shaderInputs.setProps({
            polylines: {
                opacity: this.props.opacity,
                ZIncreasingDownwards: this.props.ZIncreasingDownwards,
            },
        });
        super.draw(args.uniforms);
        if (restoreDepthTest) {
            gl.enable(gl.DEPTH_TEST);
        }
    }
}

PrivatePolylinesLayer.layerName = "PrivatePolylinesLayer";

const polylinesUniformsBlock = /*glsl*/ `\
uniform polylinesUniforms {
    float opacity;
    bool ZIncreasingDownwards;
} polylines;
`;

type PolylinesUniformsType = {
    opacity: number;
    ZIncreasingDownwards: boolean;
};

// NOTE: this must exactly the same name than in the uniform block
const polylinesUniforms = {
    name: "polylines",
    vs: polylinesUniformsBlock,
    fs: undefined,
    uniformTypes: {
        opacity: "f32",
        ZIncreasingDownwards: "u32",
    },
} as const satisfies ShaderModule<LayerProps, PolylinesUniformsType>;
