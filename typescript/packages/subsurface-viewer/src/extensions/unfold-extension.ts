import { LayerExtension } from "@deck.gl/core/typed";

import type { Layer, _ShaderModule as ShaderModule } from "@deck.gl/core/typed";
import { project32, project } from "@deck.gl/core";

const defaultProps = {
    sideViewIds: [],
};

export type UnfoldExtensionProps = {
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

/*
 * The vertex-shader version clips geometries by their anchor position
 * e.g. ScatterplotLayer - show if the center of a circle is within bounds
 */
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

export class UnfoldExtension extends LayerExtension {
    static defaultProps = defaultProps;
    static extensionName = "UnfoldExtension";

    getShaders(this: Layer<UnfoldExtensionProps>) {
        return {
            modules: [shaderModuleVs, project, project32],
            inject: injectionVs,
        };
    }

    /* eslint-disable camelcase */
    draw(
        this: Layer<Required<UnfoldExtensionProps>>,
        { uniforms }: {
            uniforms: {
                side_view: unknown;
            } }
    ): void {
        const { sideViewIds } = this.props;
        const isSideView = sideViewIds.includes(this.context.viewport.id);
        uniforms.side_view = isSideView ? 1.0 : 0.0;
    }
}
