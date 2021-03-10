// DeckGL typescript declarations are not great, so for now it's just js.

import { BitmapLayer, BitmapLayerProps } from "@deck.gl/layers";

import GL from "@luma.gl/constants";
import { Texture2D } from "@luma.gl/core";

import { decoder } from "../shader_modules";
import fsColormap from "./colormap.fs.glsl";

const DEFAULT_TEXTURE_PARAMETERS = {
    [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
    [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
    [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
    [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
};

export interface ColormapLayerProps<D> extends BitmapLayerProps<D> {
    colormap: unknown;
    valueDecoder: ValueDecoder;
}

const defaultProps = {
    colormap: { type: "object", value: null, async: true },
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

export default class ColormapLayer extends BitmapLayer<
    unknown,
    ColormapLayerProps<unknown>
> {
    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    draw({ moduleParameters, uniforms, context }: any): void {
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
                colormap: new Texture2D(context.gl, {
                    data: this.props.colormap,
                    parameters: DEFAULT_TEXTURE_PARAMETERS,
                }),
            },
        });
    }

    // Signature from the base class, eslint doesn't like the any type.
    // eslint-disable-next-line
    getShaders(): any {
        const parentShaders = super.getShaders();
        parentShaders.fs = fsColormap;
        parentShaders.modules.push(decoder);
        return parentShaders;
    }
}

ColormapLayer.layerName = "ColormapLayer";
ColormapLayer.defaultProps = defaultProps;
