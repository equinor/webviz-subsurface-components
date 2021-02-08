float decoder_rgb2float(vec3 rgb, vec3 rgbScale, float offset, float floatScale) {
    rgb *= rgbScale * vec3(16711680.0, 65280.0, 255.0); //255*256*256, 255*256, 255
    return (rgb.r + rgb.g + rgb.b + offset) * floatScale;
}