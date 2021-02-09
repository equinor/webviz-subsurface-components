// `value` must be in interval [0, 1]
vec4 lin_colormap(sampler2D color_map, float value) {
    return texture2D(color_map, vec2(value, 0.5));
}