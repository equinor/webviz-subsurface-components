// DeckGL typescript declarations are not great, so for now it's just js.

import { BitmapLayer, BitmapLayerProps } from "@deck.gl/layers";

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
            step: 0,
        },
    },
};

export interface Hillshading2DProps<D> extends BitmapLayerProps<D> {
    valueRange: number;
    lightDirection: [number, number, number];
    ambientLightIntensity: number;
    diffuseLightIntensity: number;
    opacity: number;
    valueDecoder: ValueDecoder;
}

export default class Hillshading2DLayer extends BitmapLayer<
    unknown,
    Hillshading2DProps<unknown>
> {
    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    draw({ moduleParameters, uniforms }: any): void {
        if (this.props.image) {
            // The prop objects are not merged with the defaultProps by default.
            // See https://github.com/facebook/react/issues/2568
            const mergedDecoder: ValueDecoder = {
                ...defaultProps.valueDecoder.value,
                ...moduleParameters.valueDecoder,
            };
            super.setModuleParameters({
                ...moduleParameters,
                valueDecoder: mergedDecoder,
            });
            super.draw({
                uniforms: {
                    ...uniforms,
                    bitmapResolution: [
                        this.props.image.width,
                        this.props.image.height,
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

    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    getShaders(): any {
        const parentShaders = super.getShaders();
        parentShaders.fs = fsHillshading;
        parentShaders.modules.push(decoder);
        return parentShaders;
    }
}

Hillshading2DLayer.layerName = "Hillshading2DLayer";
Hillshading2DLayer.defaultProps = defaultProps;
