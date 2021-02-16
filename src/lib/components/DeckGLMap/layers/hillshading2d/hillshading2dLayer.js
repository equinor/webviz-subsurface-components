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
    valueDecoder: {
        type: "object",
        value: {
            rgbScaler: [1, 1, 1],
            // Scale [0, 256*256*256-1] to [0, 1]
            floatScaler: 1.0 / (256.0 * 256.0 * 256.0 - 1.0),
            offset: 0,
        },
    },
};

export default class Hillshading2DLayer extends BitmapLayer {
    draw({ moduleParameters, uniforms }) {
        if (this.state.bitmapTexture) {
            super.setModuleParameters(moduleParameters);
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
