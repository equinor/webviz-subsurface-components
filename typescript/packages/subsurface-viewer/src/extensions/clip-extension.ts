import { LayerExtension } from "@deck.gl/core/typed";

import type { Layer, _ShaderModule as ShaderModule } from "@deck.gl/core/typed";

const defaultProps = {
    clipBounds: [0, 0, 1, 1],
    clipByInstance: undefined,
};

export type ClipExtensionProps = {
    /** Rectangular bounds to be used for clipping the rendered region, in `[left, bottom, right, top]`.
     * @default [0, 0, 1, 1]
     */
    clipBounds?: [number, number, number, number];
    /**
     * Controls whether an object is clipped by its anchor (e.g. icon, point) or by its geometry (e.g. path, polygon).
     * If not specified, it is automatically deduced from the layer.
     */
    clipByInstance?: boolean;
};

const shaderFunction = `
uniform vec4 clip_bounds;

bool clip_isInBounds(vec2 position) {
  return position.x >= clip_bounds[0] && position.y >= clip_bounds[1] && position.x < clip_bounds[2] && position.y < clip_bounds[3];
}
`;

/*
 * The vertex-shader version clips geometries by their anchor position
 * e.g. ScatterplotLayer - show if the center of a circle is within bounds
 */
const shaderModuleVs: ShaderModule = {
    name: "clip-vs",
    vs: shaderFunction,
};

const injectionVs = {
    "vs:#decl": `
varying float clip_isVisible;
`,
    "vs:DECKGL_FILTER_GL_POSITION": `
  clip_isVisible = float(clip_isInBounds(geometry.worldPosition.xy));
`,
    "fs:#decl": `
varying float clip_isVisible;
`,
    "fs:DECKGL_FILTER_COLOR": `
  if (clip_isVisible < 0.5) discard;
`,
};

/*
 * The fragment-shader version clips pixels at the bounds
 * e.g. PolygonLayer - show the part of the polygon that intersect with the bounds
 */
const shaderModuleFs: ShaderModule = {
    name: "clip-fs",
    fs: shaderFunction,
};

const injectionFs = {
    "vs:#decl": `
varying vec2 clip_commonPosition;
`,
    "vs:DECKGL_FILTER_GL_POSITION": `
  clip_commonPosition = geometry.position.xy;
`,
    "fs:#decl": `
varying vec2 clip_commonPosition;
`,
    "fs:DECKGL_FILTER_COLOR": `
  if (!clip_isInBounds(clip_commonPosition)) discard;
`,
};

/** Adds support for clipping rendered layers by rectangular bounds. */
export default class ClipExtension extends LayerExtension {
    static defaultProps = defaultProps;
    static extensionName = "ClipExtension";

    getShaders(this: Layer<ClipExtensionProps>) {
        // If `clipByInstance: true`, the entire object is shown/hidden based on its anchor position (done by vertex shader)
        // Otherwise, the object is trimmed by the clip bounds (done by fragment shader)

        // Default behavior: consider a layer instanced if it has attribute `instancePositions`
        let clipByInstance =
            "instancePositions" in this.getAttributeManager()!.attributes;
        // Users can override by setting the `clipByInstance` prop
        if (this.props.clipByInstance !== undefined) {
            clipByInstance = Boolean(this.props.clipByInstance);
        }
        this.state["clipByInstance"] = clipByInstance;

        return clipByInstance
            ? {
                  modules: [shaderModuleVs],
                  inject: injectionVs,
              }
            : {
                  modules: [shaderModuleFs],
                  inject: injectionFs,
              };
    }

    /* eslint-disable camelcase */
    draw(
        this: Layer<Required<ClipExtensionProps>>,
        { uniforms }: { uniforms: { clip_bounds: unknown } }
    ): void {
        const { clipBounds } = this.props;
        if (this.state["clipByInstance"]) {
            uniforms.clip_bounds = clipBounds;
        } else {
            const corner0 = this.projectPosition([
                clipBounds[0],
                clipBounds[1],
                0,
            ]);
            const corner1 = this.projectPosition([
                clipBounds[2],
                clipBounds[3],
                0,
            ]);

            uniforms.clip_bounds = [
                Math.min(corner0[0], corner1[0]),
                Math.min(corner0[1], corner1[1]),
                Math.max(corner0[0], corner1[0]),
                Math.max(corner0[1], corner1[1]),
            ];
        }
    }
}
