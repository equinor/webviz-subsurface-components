// DeckGL typescript declarations are not great, so for now it's just js.

import { BitmapLayer } from "@deck.gl/layers";

import { decoder } from "../shader_modules";
import fsHillshading from "./hillshading2d.fs.glsl";

const defaultProps = {
    valueRange: { type: "number" },
    lightDirection: { type: "array", value: [1, 1, 1] },
    ambientLightIntensity: { type: "number", value: 0.5 },
    diffuseLightIntensity: { type: "number", value: 0.5 },
    opacity: { type: "number", min: 0, max: 1, value: 1 },
};

export default class Hillshading2DLayer extends BitmapLayer {
    draw({ uniforms }) {
        if (this.state.bitmapTexture) {
            super.draw({
                uniforms: {
                    ...uniforms,
                    bitmapResolution: [
                        this.state.bitmapTexture.width,
                        this.state.bitmapTexture.height,
                    ],
                    valueRange: this.props.valueRange,
                    lightDirection: this.props.lightDirection,
                    ambientLightIntensity: this.props.ambientLightIntensity,
                    diffuseLightIntensity: this.props.diffuseLightIntensity,
                    opacity: this.props.opacity,
                },
            });
        }
    }

    getShaders() {
        let parentShaders = super.getShaders();
        parentShaders.fs = fsHillshading;
        parentShaders.modules.push(decoder);
        return parentShaders;
    }
}

Hillshading2DLayer.layerName = "Hillshading2DLayer";
Hillshading2DLayer.defaultProps = defaultProps;
