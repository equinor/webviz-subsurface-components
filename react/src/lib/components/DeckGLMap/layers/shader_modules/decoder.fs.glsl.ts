// RGB to float decoder parameters.

const fs = `struct Decoder
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

export default fs;
