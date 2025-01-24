import { LayerExtension } from "@deck.gl/core";
import type { Layer } from "@deck.gl/core";

const injectionVs = {
    "vs:DECKGL_FILTER_COLOR": `
    color.a = 1.0 / collision_fade;  // Note: this will counteract the fading of the labels caused by deck.gl's CollisionFilterExtension
    `,
};

export class CollisionModifierExtension extends LayerExtension {
    static defaultProps = {};
    static extensionName = "CollisionModifierExtension";

    getShaders(this: Layer) {
        return {
            modules: [],
            inject: injectionVs,
        };
    }
}
