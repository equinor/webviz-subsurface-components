struct Decoder
{
  vec3 rgbScaler;
  float floatScaler;
  float offset;
};

uniform Decoder decoder;

float decode_rgb2float(vec3 rgb, Decoder dec) {
    rgb *= dec.rgbScaler * vec3(16711680.0, 65280.0, 255.0); //255*256*256, 255*256, 255
    return (rgb.r + rgb.g + rgb.b + dec.offset) * dec.floatScaler;
}

float decode_rgb2float(vec3 rgb) {
    return decode_rgb2float(rgb, decoder);
}