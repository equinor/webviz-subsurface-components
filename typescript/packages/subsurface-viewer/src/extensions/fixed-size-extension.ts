import { LayerExtension } from "@deck.gl/core";

// Note: See this discussion for more details: https://github.com/visgl/deck.gl/issues/7992

export class FixedSizeExtension extends LayerExtension {
    getShaders() {
        return {
            inject: {
                "vs:DECKGL_FILTER_SIZE": "size *= 0.7 * gl_Position.w;",
            },
        };
    }
}
