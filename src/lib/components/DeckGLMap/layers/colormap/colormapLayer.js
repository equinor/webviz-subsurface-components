// DeckGL typescript declarations are not great, so for now it's just js.

import { BitmapLayer } from "@deck.gl/layers";
import { picking, project32, gouraudLighting } from "@deck.gl/core";

import { Texture2D } from "@luma.gl/core";
import GL from "@luma.gl/constants";

import { decoder, colormap } from "../../webgl";

const DEFAULT_TEXTURE_PARAMETERS = {
    [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
    [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
    [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
    [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
};

const defaultProps = {
    colormap: { type: "object", value: null, async: true },
};

export default class ColormapLayer extends BitmapLayer {
    draw({ uniforms }) {
        const { gl } = this.context;
        super.draw({
            uniforms: {
                ...uniforms,
                u_colormap: new Texture2D(gl, {
                    data: this.props.colormap,
                    parameters: DEFAULT_TEXTURE_PARAMETERS,
                }),
            },
        });
    }

    getShaders() {
        return {
            ...super.getShaders(),
            inject: {
                "fs:#decl": `uniform sampler2D u_colormap;`,
                "fs:DECKGL_FILTER_COLOR": `
                    float val = decoder_rgb2float(color.rgb, vec3(1.0, 1.0, 1.0), 0.0, 1.0 / (256.0*256.0*256.0 - 1.0));
                    color = vec4(lin_colormap(u_colormap, val).rgb, color.a);
                `,
            },
            modules: [picking, project32, gouraudLighting, decoder, colormap],
        };
    }
}

ColormapLayer.layerName = "ColormapLayer";
ColormapLayer.defaultProps = defaultProps;
