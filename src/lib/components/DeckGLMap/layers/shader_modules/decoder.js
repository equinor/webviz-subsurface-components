import fs from "./decoder.fs.glsl";

const DEFAULT_DECODER = {
    rgbScaler: [1, 1, 1],
    floatScaler: 1,
    offset: 0,
    step: 0,
};

function getUniforms(opts) {
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
