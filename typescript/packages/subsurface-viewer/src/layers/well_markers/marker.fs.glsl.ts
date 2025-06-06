export default `#version 300 es
#define SHADER_NAME well-markers-fragment-shader

precision highp float;

in vec4 color;

out vec4 fragColor;

void main(void) {
   fragColor = vec4(color.rgb * (1.0 / 255.0), color.a * (1.0 / 255.0) * layer.opacity);
   DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
