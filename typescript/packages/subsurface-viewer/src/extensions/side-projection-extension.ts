import { LayerExtension } from "@deck.gl/core";

import type { ShaderModule } from "@luma.gl/shadertools";
import type { Layer, LayerProps } from "@deck.gl/core";
import { project32, project } from "@deck.gl/core";

const defaultProps = {
    sideViewIds: [],
};

type SideProjectionExtensionProps = {
    sideViewIds?: string[];
};

const injectionVs = {
    "vs:#decl": /*glsl*/ `
  vec3 new_position;
`,
    "vs:DECKGL_FILTER_GL_POSITION": /*glsl*/ `
  new_position = transform(position.xyz);
  position.xyz = new_position;
`,
};

export class SideProjectionExtension extends LayerExtension {
    static defaultProps = defaultProps;
    static extensionName = "SideProjectionExtension";

    getShaders(this: Layer<SideProjectionExtensionProps>) {
        return {
            modules: [project, project32, gridUniforms],
            inject: injectionVs,
        };
    }

    draw(this: Layer<Required<SideProjectionExtensionProps>>) {
        const { sideViewIds } = this.props;
        const isSideView = sideViewIds.includes(this.context.viewport.id);
        this.setShaderModuleProps({
            side: {
                side_view: isSideView,
            },
        });
    }
}

// local shader module for the uniforms
const uniformsBlock = /*glsl*/ `\
uniform sideUniforms {
    float side_view;
} side;

vec3 transform(vec3 clip_position) {
    if (side.side_view < 1.0) {
        return clip_position;
    }
    vec3 world_position = geometry.worldPosition.xyz;
    vec4 transformed = vec4(world_position.x, world_position.z, 0.0, 1.0);
    vec4 commonspace = project_position(transformed);
    vec4 clipspace = project_common_position_to_clipspace(commonspace);
    return clipspace.xyz;
}
`;

type uniformsType = {
    side_view: number;
};

const gridUniforms = {
    name: "side",
    vs: uniformsBlock,
    uniformTypes: {
        side_view: "f32",
    },
} as const satisfies ShaderModule<LayerProps, uniformsType>;
