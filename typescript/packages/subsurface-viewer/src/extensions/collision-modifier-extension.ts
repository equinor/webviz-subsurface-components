import type { Layer } from "@deck.gl/core";
import { CollisionFilterExtension } from "@deck.gl/extensions";

const injectionVs = {
    "vs:DECKGL_FILTER_COLOR": `
    color.a = 1.0 / collision_fade;  // Note: this will counteract the fading of the labels caused by deck.gl's CollisionFilterExtension
    `,
};

export class CollisionModifierExtension extends CollisionFilterExtension {
    getShaders(this: Layer) {
        const superShaders = super.getShaders();
        return {
            ...superShaders,
            inject: injectionVs,
        };
    }
}
