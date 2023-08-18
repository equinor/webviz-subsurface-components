import type { ValueDecoder } from "../utils/propertyMapTools";
import fs from "./decoder.fs.glsl";

// Shader module for the property map value decoder.
// See https://luma.gl/docs/developer-guide/shader-modules

const DEFAULT_DECODER: ValueDecoder = {
    rgbScaler: [1, 1, 1],
    floatScaler: 1,
    offset: 0,
    step: 0,
};

interface DecoderUniforms {
    "decoder.rgbScaler": typeof DEFAULT_DECODER.rgbScaler;
    "decoder.floatScaler": typeof DEFAULT_DECODER.floatScaler;
    "decoder.offset": typeof DEFAULT_DECODER.offset;
    "decoder.step": typeof DEFAULT_DECODER.step;
}

// Disable complaint about `any`
// eslint-disable-next-line
function getUniforms(opts: any): DecoderUniforms | {} {
    if (opts && opts.valueDecoder) {
        const {
            rgbScaler = DEFAULT_DECODER.rgbScaler,
            floatScaler = DEFAULT_DECODER.floatScaler,
            offset = DEFAULT_DECODER.offset,
            step = DEFAULT_DECODER.step,
        } = opts.valueDecoder;
        return {
            "decoder.rgbScaler": rgbScaler,
            "decoder.floatScaler": floatScaler,
            "decoder.offset": offset,
            "decoder.step": Math.max(step, 0.0000001), // singularity at 0
        };
    }

    return {};
}

export default {
    name: "decoder",
    fs,
    getUniforms,
};
