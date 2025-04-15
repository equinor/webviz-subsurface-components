import { LayerExtension } from "@deck.gl/core";

/**
 * The `FixedSizeExtension` class is a custom Deck.gl layer extension that modifies the size of rendered objects
 * based on their clip-space position. This extension can be used to ensure that objects maintain a fixed size
 * relative to the viewport, regardless of their depth in the scene.
 *
 * @extends LayerExtension
 *
 * @remarks
 * The `getShaders` method injects a custom shader snippet into the vertex shader stage of Deck.gl's rendering pipeline.
 * Specifically, it modifies the `size` variable by scaling it with `gl_Position.w`, which represents the depth
 * component in clip space.
 *
 * @example
 * ```typescript
 * import { FixedSizeExtension } from './fixed-size-extension';
 * import { TextLayer } from '@deck.gl/layers';
 *
 * const layer = new TextLayer({
 *   data,
 *   getPosition: d => d.coordinates,
 *   getText: d => d.label,
 *   getSize: d => d.size,
 *   extensions: [new FixedSizeExtension()],
 * });
 * ```
 * @note See this discussion for more details: https://github.com/visgl/deck.gl/issues/7992
 */
export class FixedSizeExtension extends LayerExtension {
    getShaders() {
        return {
            inject: {
                "vs:DECKGL_FILTER_SIZE": "size *= gl_Position.w;",
            },
        };
    }
}
