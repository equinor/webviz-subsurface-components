import { BitmapLayer, BitmapLayerProps } from "@deck.gl/layers";

import GL from "@luma.gl/constants";
import { Texture2D } from "@luma.gl/core";

import { decoder } from "../shader_modules";
import {
    decodeRGB,
    BitmapPickInfo,
    PropertyMapPickInfo,
    ValueDecoder,
} from "../utils/propertyMapTools";

import fsColormap from "!!raw-loader!./colormap.fs.glsl";

const DEFAULT_TEXTURE_PARAMETERS = {
    [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
    [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
    [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
    [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
};

// Most props are inherited from DeckGL's BitmapLayer. For a full list, see
// https://deck.gl/docs/api-reference/layers/bitmap-layer
//
// The property map is encoded in an image and sent in the `image` prop of the BitmapLayer.
// The same approach is used in DeckGL's TerrainLayer: https://deck.gl/docs/api-reference/geo-layers/terrain-layer
//
// The image format is based on Tizen's terrain format and Mapbox's TerrainRGB:
// https://github.com/tilezen/joerd/blob/master/docs/formats.md
// https://docs.mapbox.com/help/troubleshooting/access-elevation-data/
//
// The main idea is that property values (floats) are encoded in the R G and B channels of an image.
// We parametrize decoding, so we can support both Tizen and Mapbox terrains by adapting
// the valueDecoder for each format.
// We also support and use by default a format that optimizes for precision.
// By default, the value decoder will map RGB(0, 0, 0) to the minimum value in valueRange
// and RGB(255, 255, 255) to the maximum value in valueRange, thus giving us the full
// > 16mil possible values for any property value range.
// We also support property maps with an alpha channel. See colormap.fs.glsl for more details.
export interface ColormapLayerProps<D> extends BitmapLayerProps<D> {
    // Image containing the colors that will be applied to te values.
    // e.g.: https://cdn.jsdelivr.net/gh/kylebarron/deck.gl-raster/assets/colormaps/plasma.png
    // No size requirements. Alpha channel (opacity) supported.
    colormap: unknown;

    // Min and max property values.
    valueRange: [number, number];

    // Use color map in this range.
    colorMapRange: [number, number];

    // See ValueDecoder in propertyMapTools.ts
    valueDecoder: ValueDecoder;
}

const defaultProps = {
    name: "Property map",
    colormap: { type: "object", value: null, async: true },
    valueRange: { type: "array" },
    colorMapRange: { type: "array" },
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

export default class ColormapLayer extends BitmapLayer<
    unknown,
    ColormapLayerProps<unknown>
> {
    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    draw({ moduleParameters, uniforms, context }: any): void {
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

        const valueRangeMin = this.props.valueRange[0] ?? 0.0;
        const valueRangeMax = this.props.valueRange[1] ?? 1.0;

        // If specified color map will extend from colorMapRangeMin to colorMapRangeMax.
        // Otherwise it will extend from valueRangeMin to valueRangeMax.
        const colorMapRangeMin = this.props.colorMapRange?.[0] ?? valueRangeMin;
        const colorMapRangeMax = this.props.colorMapRange?.[1] ?? valueRangeMax;

        super.draw({
            uniforms: {
                ...uniforms,
                // Send the colormap texture to the shader.
                colormap: new Texture2D(context.gl, {
                    data: this.props.colormap,
                    parameters: DEFAULT_TEXTURE_PARAMETERS,
                }),
                valueRangeMin,
                valueRangeMax,
                colorMapRangeMin,
                colorMapRangeMax,
            },
            moduleParameters: mergedModuleParams,
        });
    }

    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    getShaders(): any {
        const parentShaders = super.getShaders();
        // Overwrite the BitmapLayer's default fragment shader with ours, that does colormapping.
        parentShaders.fs = fsColormap;
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
        // The picked color is the one in raw image, not the one after colormapping.
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

ColormapLayer.layerName = "ColormapLayer";
ColormapLayer.defaultProps = defaultProps;
