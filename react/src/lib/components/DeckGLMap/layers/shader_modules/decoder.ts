import { ValueDecoder } from "../utils/propertyMapTools";
import fs from "./decoder.fs.glsl";

/*
// RGB to float decoder parameters.
const fs = `
struct Decoder
{
  vec3 rgbScaler; // r, g and b multipliers
  float floatScaler; // value multiplier
  float offset; // translation of the r, g, b sum
  float step; // discretize the value in a number of steps
};

uniform Decoder decoder;

uniform float valueRangeMin;
uniform float valueRangeMax;
uniform float colorMapRangeMin;
uniform float colorMapRangeMax;

// Decode the RGB value using the decoder parameter.
float decode_rgb2float(vec3 rgb, Decoder dec) {
  rgb *= dec.rgbScaler * vec3(16711680.0, 65280.0, 255.0); //255*256*256, 255*256, 255
  float value = (rgb.r + rgb.g + rgb.b + dec.offset) * dec.floatScaler;

  // Value must be in [0, 1] and step in (0, 1]
  value = floor(value / dec.step + 0.5) * dec.step;

  // If colorMapRangeMin/Max specified, color map will span this interval.
  float x  = value * (valueRangeMax - valueRangeMin) + valueRangeMin;
  x = (x - colorMapRangeMin) / (colorMapRangeMax - colorMapRangeMin);
  x = max(0.0, x);
  x = min(1.0, x);

  return x;
}

// Decode the RGB value using the decoder uniform.
float decode_rgb2float(vec3 rgb) {
  return decode_rgb2float(rgb, decoder);
}
`;
*/

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
