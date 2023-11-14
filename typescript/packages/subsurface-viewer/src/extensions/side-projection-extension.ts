import { LayerExtension } from "@deck.gl/core/typed";

import type { Layer, _ShaderModule as ShaderModule } from "@deck.gl/core/typed";
import { project32, project } from "@deck.gl/core/typed";

const defaultProps = {
    sideViewIds: [],
};

type SideProjectionExtensionProps = {
    sideViewIds?: string[];
};

const shaderFunction = `
uniform float side_view;

vec3 transform(vec3 clip_position) {
    if (side_view < 1.0) {
        return clip_position;
    }
    vec3 world_position = geometry.worldPosition.xyz;
    vec4 transformed = vec4(world_position.x, world_position.z, 0.0, 1.0);

    vec4 commonspace = project_position(transformed);

    vec4 clipspace = project_common_position_to_clipspace(commonspace);

    return clipspace.xyz;
}
`;

const shaderModuleVs: ShaderModule = {
    name: "unfold-vs",
    vs: shaderFunction,
};

const injectionVs = {
    "vs:#decl": `
  varying vec3 new_position;
`,
    "vs:DECKGL_FILTER_GL_POSITION": `
  new_position = transform(position.xyz);
  position.xyz = new_position;
`,
};

export class SideProjectionExtension extends LayerExtension {
    static defaultProps = defaultProps;
    static extensionName = "SideProjectionExtension";

    getShaders(this: Layer<SideProjectionExtensionProps>) {
        return {
            modules: [shaderModuleVs, project, project32],
            inject: injectionVs,
        };
    }

    draw(
        this: Layer<Required<SideProjectionExtensionProps>>,
        {
            uniforms,
        }: {
            uniforms: {
                side_view: unknown;
            };
        }
    ): void {
        const { sideViewIds } = this.props;
        const isSideView = sideViewIds.includes(this.context.viewport.id);
        uniforms.side_view = isSideView ? 1.0 : 0.0;
    }
}
