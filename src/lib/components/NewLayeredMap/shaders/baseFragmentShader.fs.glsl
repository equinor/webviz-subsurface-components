precision mediump float;

uniform sampler2D u_image;
uniform sampler2D u_colormap_frame;
uniform float u_colormap_length;

varying vec2 v_texCoord;

// Global min max: https://www.gamedev.net/forums/topic/559942-glsl--find-global-min-and-max-in-texture/

// Maps a value from a given interval to a target interval
float map(float value, float from1, float to1, float from2, float to2) {
    return ((value - from1)/(to1 - from1))*(to2 - from2) + from2;
}

// See: https://stackoverflow.com/questions/28125439/algorithm-to-map-values-to-unit-scale-with-logarithmic-spacing
float map_log(float value, float from1, float to1, float from2, float to2) {
    return (log(value/from1) / log(to1/from1))*(to1 - from2) + from2;
}

void main() {
    float color_value = texture2D(u_image, v_texCoord).r;
    float mapped_color_value = map(color_value, 0.0, 1.0, 0.0, u_colormap_length - 1.0);
    vec2 colormap_coord = vec2((mapped_color_value) / u_colormap_length, 0.0);
    gl_FragColor = texture2D(u_colormap_frame, colormap_coord);
}
