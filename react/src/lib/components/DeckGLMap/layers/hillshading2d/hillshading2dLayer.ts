import { BitmapLayer, BitmapLayerProps } from "@deck.gl/layers";

import { decoder } from "../shader_modules";
import {
    decodeRGB,
    BitmapPickInfo,
    PropertyMapPickInfo,
    ValueDecoder,
} from "../utils/propertyMapTools";

import fsHillshading from "./hillshading2d.fs.glsl";

// Most props are inherited from DeckGL's BitmapLayer. For a full list, see
// https://deck.gl/docs/api-reference/layers/bitmap-layer
//
// The property map is encoded in an image and sent in the `image` prop of the BitmapLayer.
// For more details on the property map encoding, see colormapLayer.ts
export interface Hillshading2DProps<D> extends BitmapLayerProps<D> {
    // Min and max property values.
    valueRange: [number, number];

    // Direction the light comes from.
    lightDirection: [number, number, number];
    // Intensity of light that is applied to the whole map uniformly.
    ambientLightIntensity: number;
    // Intensity of light that is applied to the lightened potions of the map.
    diffuseLightIntensity: number;

    // By default, scale the [0, 256*256*256-1] decoded values to [0, 1]
    valueDecoder: ValueDecoder;
}

const defaultProps = {
    valueRange: { type: "array" },
    lightDirection: { type: "array", value: [1, 1, 1] },
    ambientLightIntensity: { type: "number", value: 0.5 },
    diffuseLightIntensity: { type: "number", value: 0.5 },
    valueDecoder: {
        type: "object",
        value: {
            rgbScaler: [1, 1, 1],
            // By default, scale the [0, 256*256*256-1] decoded values to [0, 1]
            floatScaler: 1.0 / (256.0 * 256.0 * 256.0 - 1.0),
            offset: 0,
            step: 0,
        },
    },
};

export default class Hillshading2DLayer extends BitmapLayer<
    unknown,
    Hillshading2DProps<unknown>
> {
    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    draw({ moduleParameters, uniforms }: any): void {
        if (this.props.image) {
            const mergedModuleParams = {
                ...moduleParameters,
                valueDecoder: {
                    // The prop objects are not merged with the defaultProps by default.
                    // See https://github.com/facebook/react/issues/2568
                    ...defaultProps.valueDecoder.value,
                    ...moduleParameters.valueDecoder,
                },
            };
            super.setModuleParameters(mergedModuleParams);

            const [minVal, maxVal] = this.props.valueRange;
            super.draw({
                uniforms: {
                    ...uniforms,
                    // Send extra uniforms to the shader.
                    bitmapResolution: [
                        this.props.image.width,
                        this.props.image.height,
                    ],
                    valueRangeSize: maxVal - minVal,
                    lightDirection: this.props.lightDirection,
                    ambientLightIntensity: this.props.ambientLightIntensity,
                    diffuseLightIntensity: this.props.diffuseLightIntensity,
                },
                moduleParameters: mergedModuleParams,
            });
        }
    }

    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    getShaders(): any {
        const parentShaders = super.getShaders();
        // Overwrite the BitmapLayer's default fragment shader with ours, that does hillshading.
        parentShaders.fs = fsHillshading;
        // Add the decoder shader module to our colormap shader, so we can use the decoder function from our shader.
        parentShaders.modules.push(decoder);
        return parentShaders;
    }

    getPickingInfo({ info }: { info: BitmapPickInfo }): PropertyMapPickInfo {
        if (this.state.pickingDisabled || !info.color) {
            return info;
        }

        const mergedDecoder = {
            ...defaultProps.valueDecoder.value,
            ...this.props.valueDecoder,
        };
        // The picked color is the one in raw image, not the one after hillshading.
        // We just need to decode that RGB color into a property float value.
        const val = decodeRGB(info.color, mergedDecoder, this.props.valueRange);

        return {
            ...info,
            // Picking color doesn't represent object index in this layer.
            // For more details, see https://deck.gl/docs/developer-guide/custom-layers/picking
            index: 0,
            propertyValue: val,
        };
    }
}

Hillshading2DLayer.layerName = "Hillshading2DLayer";
Hillshading2DLayer.defaultProps = defaultProps;
