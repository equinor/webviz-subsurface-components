float decoder_rgb2float(vec3 rgb, vec3 rgbScale, float offset, float floatScale) {
    rgb *= rgbScale * vec3(16711680.0, 65280.0, 255.0); //255*256*256, 255*256, 255
    return (rgb.r + rgb.g + rgb.b + offset) * floatScale;
}

// Decode value encoded in rgb channels and scaled to all cover the whole domain.
float decoder_rgb2float_256x3(vec3 rgb) {
    return decoder_rgb2float(rgb, vec3(1.0), 0.0, 1.0 / (256.0*256.0*256.0 - 1.0));
}

// Decode value encoded in one channel (grayscale image).
float decoder_rgb2float_grayscale(vec3 rgb) {
    return decoder_rgb2float(rgb, vec3(1.0, 0.0, 0.0), 0.0, 1.0);
}