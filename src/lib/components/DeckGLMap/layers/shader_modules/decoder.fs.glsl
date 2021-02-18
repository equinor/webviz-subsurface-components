struct Decoder
{
  vec3 rgbScaler;
  float floatScaler;
  float offset;
  float step;
};

uniform Decoder decoder;

float decode_rgb2float(vec3 rgb, Decoder dec) {
  rgb *= dec.rgbScaler * vec3(16711680.0, 65280.0, 255.0); //255*256*256, 255*256, 255
  float value = (rgb.r + rgb.g + rgb.b + dec.offset) * dec.floatScaler;

  // Value must be in [0, 1] and step in (0, 1]
  value = floor(value / dec.step + 0.5) * dec.step;

  return value;
}

float decode_rgb2float(vec3 rgb) {
  return decode_rgb2float(rgb, decoder);
}
